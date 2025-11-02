<template>
    <PageHeader>
        {{ $t('ingredient.ingredients') }}
        <template #actions>
            <RouterLink class="button button--outline" :to="{ name: 'ingredients.import' }">{{ $t('ingredient.import') }}</RouterLink>
            <template v-if="appState.isAdmin() || appState.isModerator() || appState.isGeneral()">
                <RouterLink class="button button--dark" :to="{ name: 'ingredients.form' }">{{ $t('ingredient.add') }}</RouterLink>
            </template>
        </template>
    </PageHeader>
    <div class="resource-search-wrapper">
        <div class="resource-search">
            <div v-show="showRefinements" class="resource-search__refinements" @click="handleClickAway">
                <div class="resource-search__refinements__body">
                    <h3 class="page-subtitle" style="margin-top: 0">{{ $t('filters') }}</h3>
                    <Refinement id="global" :title="$t('global')" :collapsable="false">
                        <div v-for="filter in availableRefinements.global" :key="filter.id" class="resource-search__refinements__refinement__item">
                            <input :id="'global-' + filter.id" v-model="activeFilters.filter[filter.id as keyof typeof activeFilters.filter]" type="checkbox" :value="filter.active" @change="updateRouterPath">
                            <label :for="'global-' + filter.id">{{ filter.name }}</label>
                        </div>
                    </Refinement>
                    <Refinement id="ingredient-category" v-model="activeFilters.filter.descendants_of" :title="$t('category.title')" :refinements="refineCategories" @change="updateRouterPath" :collapsable="false"></Refinement>
                    <Refinement id="strength" v-model="activeFilters.filter.strength" :title="$t('strength')" :refinements="refineStrength" type="radio" @change="updateRouterPath"></Refinement>
                </div>
            </div>
            <div class="resource-search__content">
                <div class="resource-search__content__filter" style="margin-bottom: 1rem;">
                    <button type="button" class="button button--icon" @click.prevent="showRefinements = !showRefinements">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M6.17 18a3.001 3.001 0 0 1 5.66 0H22v2H11.83a3.001 3.001 0 0 1-5.66 0H2v-2h4.17zm6-7a3.001 3.001 0 0 1 5.66 0H22v2h-4.17a3.001 3.001 0 0 1-5.66 0H2v-2h10.17zm-6-7a3.001 3.001 0 0 1 5.66 0H22v2H11.83a3.001 3.001 0 0 1-5.66 0H2V4h4.17z" />
                        </svg>
                        <div v-show="totalActiveRefinements > 0" class="resource-search__content__filter__count">{{ totalActiveRefinements }}</div>
                    </button>
                    <input v-model="activeFilters.filter.name" class="form-input" type="text" :placeholder="$t('placeholder.search-ingredients')" @input="debounceIngredientSearch" @keyup.enter="updateRouterPath">
                    <select v-model="activeFilters.sort" class="form-select" @change="updateRouterPath">
                        <option disabled>{{ $t('sort') }}:</option>
                        <option value="name">{{ $t('name') }}</option>
                        <option value="created_at">{{ $t('date-added') }}</option>
                        <option value="strength">{{ $t('strength') }}</option>
                        <option value="total_cocktails">{{ $t('total.cocktails') }}</option>
                    </select>
                    <select v-model="sortDir" class="form-select" @change="updateRouterPath">
                        <option disabled>{{ $t('sort-direction') }}:</option>
                        <option value="">{{ $t('sort-asc') }}</option>
                        <option value="-">{{ $t('sort-desc') }}</option>
                    </select>
                    <select v-model="activeFilters.per_page" class="form-select" @change="updateRouterPath">
                        <option disabled>{{ $t('search.results-per-page') }}:</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                    <button v-show="totalActiveRefinements > 0" type="button" class="button button--icon" :title="$t('clear-filters')" @click.prevent="clearRefinements">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 10.5858L14.8284 7.75736L16.2426 9.17157L13.4142 12L16.2426 14.8284L14.8284 16.2426L12 13.4142L9.17157 16.2426L7.75736 14.8284L10.5858 12L7.75736 9.17157L9.17157 7.75736L12 10.5858Z"></path></svg>
                    </button>
                </div>
                <div>
                    <OverlayLoader v-if="isLoading" />
                    <IngredientGridContainer v-if="ingredients.length > 0">
                        <IngredientGridItem v-for="ingredient in ingredients" :key="ingredient.id" :ingredient="ingredient" />
                    </IngredientGridContainer>
                    <EmptyState v-else style="margin-top: 1rem;">
                        <template #icon>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
                                <path d="M11 2C15.968 2 20 6.032 20 11C20 15.968 15.968 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2ZM11 18C14.8675 18 18 14.8675 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18ZM19.4853 18.0711L22.3137 20.8995L20.8995 22.3137L18.0711 19.4853L19.4853 18.0711Z"></path>
                            </svg>
                        </template>
                        {{ $t('ingredients-not-found') }}
                    </EmptyState>
                </div>
                <Pagination :meta="meta" @page-changed="handlePageChange"></Pagination>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import OverlayLoader from './../OverlayLoader.vue'
import IngredientGridContainer from './../Ingredient/IngredientGridContainer.vue'
import IngredientGridItem from './../Ingredient/IngredientGridItem.vue'
import PageHeader from './../PageHeader.vue'
import Refinement, { type RefinementRange } from './../Search/SearchRefinement.vue'
import Pagination from './../Search/SearchPagination.vue'
import qs from 'qs'
import EmptyState from './../EmptyState.vue'
import AppState from '../../AppState'
import BarAssistantClient from '@/api/BarAssistantClient'
import { useTitle } from '@/composables/title'
import { computed, ref, watch } from 'vue'
import type { components, operations } from '@/api/api'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter, type LocationQueryRaw } from 'vue-router'

type IngredientQuery = operations['listIngredients']['parameters']['query']
type Ingredient = components['schemas']['Ingredient']

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const appState = new AppState()
const isLoading = ref(false)
const showRefinements = ref(false)
const sortDir = ref('')
const meta = ref({})
const ingredients = ref<Ingredient[]>([])
const queryTimer = ref<number | null>(null)
const availableRefinements = ref({
    categories: [] as Ingredient[],
    global: [
        { name: t('bar-shelf-ingredients'), active: false, id: 'bar_shelf' },
        { name: t('shelf-ingredients'), active: false, id: 'on_shelf' },
        { name: t('shopping-list-ingredients'), active: false, id: 'on_shopping_list' },
        { name: t('used-as-main-ingredient'), active: false, id: 'main_ingredients' },
        { name: t('ingredient.complex'), active: false, id: 'complex' },
    ],
    strength: [
        { name: t('non-alcoholic'), min: 0, max: 0, id: 'strength_non_alcoholic' },
        { name: '<= 20%', min: null, max: 20, id: 'strength_weak' },
        { name: '20% - 40%', min: 20, max: 40, id: 'strength_medium' },
        { name: '>= 40', min: 40, max: null, id: 'strength_strong' },
    ],
})
const defaultRefinements = {
    sort: 'name',
    per_page: 50,
    page: 1,
    filter: {
        name: null as string | null,
        descendants_of: [] as string[],
        parent_ingredient_id: null as string[] | null,
        on_shelf: false,
        bar_shelf: false,
        main_ingredients: false,
        on_shopping_list: false,
        complex: false,
        strength: null as {
            min: number | null,
            max: number | null
        } | null
    }
}
const activeFilters = ref(defaultRefinements)

watch(
    () => route.query,
    () => {
        if (route.name === 'ingredients') {
            queryToState()
            refreshIngredients()
        }
    },
    { immediate: true }
)

const refineCategories = computed(() => {
    return availableRefinements.value.categories.map(c => {
        return {
            id: c.id,
            value: c.id,
            name: c.name
        }
    })
})

const refineStrength = computed(() => {
    return availableRefinements.value.strength.map(m => {
        return {
            id: m.id,
            value: { min: m.min, max: m.max } as RefinementRange,
            name: m.name
        }
    })
})

const totalActiveRefinements = computed(() => {
    let total = 0

    Object.values(activeFilters.value.filter).forEach(element => {
        if (Array.isArray(element) && element.length > 0) {
            return total++
        }

        if (typeof element == 'boolean' && element == true) {
            return total++
        }

        if (element !== null && !Array.isArray(element) && element !== false) {
            Object.values(element).forEach(value => {
                if (value !== null && value !== false) {
                    return total++
                }
            })
        }
    })

    return total
})

function queryToState() {
    const queryString = qs.parse(window.location.search.replace(/^\?/, '')) as IngredientQuery
    if (!queryString) {
        return
    }

    if (queryString.sort) {
        sortDir.value = queryString.sort.startsWith('-') ? '-' : ''
    }

    activeFilters.value = {
        sort: queryString.sort?.replace(/^-/, '') || defaultRefinements.sort,
        per_page: queryString.per_page || defaultRefinements.per_page,
        page: queryString.page || defaultRefinements.page,
        filter: {
            name: queryString.filter?.name || null,
            descendants_of: queryString.filter?.descendants_of?.split(',') || [],
            parent_ingredient_id: queryString.filter?.parent_ingredient_id?.split(',') || [],
            on_shelf: Boolean(queryString.filter?.on_shelf),
            bar_shelf: Boolean(queryString.filter?.bar_shelf),
            main_ingredients: Boolean(queryString.filter?.main_ingredients),
            on_shopping_list: Boolean(queryString.filter?.on_shopping_list),
            complex: Boolean(queryString.filter?.complex),
            strength: queryString.filter?.strength_min || queryString.filter?.strength_max
                ? {
                    min: queryString.filter.strength_min ? Number(queryString.filter.strength_min) : null,
                    max: queryString.filter.strength_max ? Number(queryString.filter.strength_max) : null
                }
                : null
        }
    }
}

function stateToQuery(): IngredientQuery {
    const query: IngredientQuery = {}

    query.per_page = activeFilters.value.per_page
    query.page = activeFilters.value.page
    query.sort = `${sortDir.value}${activeFilters.value.sort}`
    query.filter = {
        name: activeFilters.value.filter.name || undefined,
        descendants_of: activeFilters.value.filter.descendants_of.length > 0 ? activeFilters.value.filter.descendants_of.join(',') : undefined,
        parent_ingredient_id: (activeFilters.value.filter.parent_ingredient_id?.length ?? 0) > 0 ? activeFilters.value.filter.parent_ingredient_id?.join(',') : undefined,
        on_shelf: activeFilters.value.filter.on_shelf || undefined,
        bar_shelf: activeFilters.value.filter.bar_shelf || undefined,
        main_ingredients: activeFilters.value.filter.main_ingredients || undefined,
        on_shopping_list: activeFilters.value.filter.on_shopping_list || undefined,
        complex: activeFilters.value.filter.complex || undefined,
        strength_min: activeFilters.value.filter.strength?.min || undefined,
        strength_max: activeFilters.value.filter.strength?.max || undefined
    }

    return query
}

async function refreshIngredients() {
    const query = {
        ...stateToQuery(),
        include: 'images,ancestors'
    }

    isLoading.value = true
    const resp = await BarAssistantClient.getIngredients(query)
    if (resp) {
        ingredients.value = resp.data ?? []
        meta.value = resp.meta ?? {}
    }
    isLoading.value = false
}

function handleClickAway(e: any) {
    if (e && e.target && e.target.classList.contains('resource-search__refinements')) {
        showRefinements.value = !showRefinements.value
    }
}

function updateRouterPath() {
    const query = stateToQuery()

    router.push({
        query: query as LocationQueryRaw
    })
}

function handlePageChange(toPage: number) {
    activeFilters.value.page = toPage
    updateRouterPath()
}

function debounceIngredientSearch() {
    if (queryTimer.value) {
        clearTimeout(queryTimer.value)
    }

    queryTimer.value = setTimeout(() => {
        activeFilters.value.page = 1
        updateRouterPath()
    }, 300)
}

function clearRefinements() {
    activeFilters.value = { ...defaultRefinements }
    sortDir.value = ''
    meta.value = {}
    updateRouterPath()
}

async function fetchRefinements() {
    availableRefinements.value.categories = (await BarAssistantClient.getIngredients({ 'filter[parent_ingredient_id]': 'null' }))?.data ?? []
}

function init() {
    useTitle(t('ingredient.ingredients'))

    fetchRefinements()
}

init()
</script>
