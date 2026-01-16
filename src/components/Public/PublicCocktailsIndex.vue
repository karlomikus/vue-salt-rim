<template>
    <div>
        <div class="public-cocktail-grid-filters">
            <SaltRimDialog v-model="showFiltersDialog">
                <template #trigger>
                    <button class="button button--dark" @click="showFiltersDialog = !showFiltersDialog">
                        <svg class="public-cocktail-grid-filter-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 7C5 6.17157 5.67157 5.5 6.5 5.5C7.32843 5.5 8 6.17157 8 7C8 7.82843 7.32843 8.5 6.5 8.5C5.67157 8.5 5 7.82843 5 7ZM6.5 3.5C4.567 3.5 3 5.067 3 7C3 8.933 4.567 10.5 6.5 10.5C8.433 10.5 10 8.933 10 7C10 5.067 8.433 3.5 6.5 3.5ZM12 8H20V6H12V8ZM16 17C16 16.1716 16.6716 15.5 17.5 15.5C18.3284 15.5 19 16.1716 19 17C19 17.8284 18.3284 18.5 17.5 18.5C16.6716 18.5 16 17.8284 16 17ZM17.5 13.5C15.567 13.5 14 15.067 14 17C14 18.933 15.567 20.5 17.5 20.5C19.433 20.5 21 18.933 21 17C21 15.067 19.433 13.5 17.5 13.5ZM4 16V18H12V16H4Z"></path></svg>
                    </button>
                </template>
                <template #dialog>
                    <div class="dialog-title">{{ $t('public-bar.filter-title') }}</div>
                    <div class="dialog-content">
                        <div class="form-group">
                            <label class="form-label" for="year">{{ $t('public-bar.filters-sort-label') }}:</label>
                            <select id="year" class="form-select" v-model="activeFilters.sort">
                                <option v-for="sort in availableSorts" :key="sort.value" :value="sort.value">{{ sort.label }}</option>
                            </select>
                        </div>
                        <label class="form-label" for="year">{{ $t('public-bar.filters-global-label') }}:</label>
                        <div class="form-group form-group--checkbox">
                            <label class="form-label" for="filter-bar-shelf">
                                <input id="filter-bar-shelf" type="checkbox" v-model="activeFilters.filter.bar_shelf">
                                <div class="form-group-checkbox-content">
                                    <div class="form-group-checkbox-content__label">{{ $t('public-bar.filters-bar-shelf-label') }}</div>
                                    <div class="form-group-checkbox-content__help">{{ $t('public-bar.filters-bar-shelf-help') }}</div>
                                </div>
                            </label>
                        </div>
                        <label class="form-label" for="year">{{ $t('public-bar.filters-collections-label') }}:</label>
                        <div class="form-group form-group--checkbox">
                            <label class="form-label" :for="'filter-bar-collections-' + collection.id" v-for="collection in meta?.filters?.collections || []" :key="collection.id">
                                <input :id="'filter-bar-collections-' + collection.id" type="checkbox" :name="'filter-bar-collections-' + collection.id" v-model="activeFilters.filter.collection_id" :value="collection.id">
                                <div class="form-group-checkbox-content">
                                    <div class="form-group-checkbox-content__label">{{ collection.name }}</div>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div class="dialog-actions">
                        <button type="submit" class="button button--outline" @click="showFiltersDialog = false">{{ $t('cancel') }}</button>
                        <button type="submit" class="button button--dark" @click="applyFilters">{{ $t('filter') }}</button>
                    </div>
                </template>
            </SaltRimDialog>
            <input class="form-input" type="search" :placeholder="$t('public-bar.filters-search-placeholder')" v-model="activeFilters.filter.name" @input="debounceSearch">
            <button class="button button--dark" @click="resetFilters">
                <svg class="public-cocktail-grid-filter-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"></path></svg>
            </button>
        </div>
        <div class="public-cocktail-grid">
            <CocktailItem v-for="cocktail in cocktails" :key="cocktail.slug" :cocktail="cocktail" :bar="bar"></CocktailItem>
            <div v-if="cocktails.length === 0">{{ $t('no-cocktails') }}</div>
        </div>
        <Pagination :meta="meta" @page-changed="handlePageChange"></Pagination>
    </div>
</template>

<script setup lang="ts">
import qs from 'qs'
import { ref, watch, computed } from 'vue'
import BarAssistantClient from '@/api/BarAssistantClient'
import CocktailItem from './PublicCocktailGridItem.vue'
import type { components, operations } from '@/api/api'
import { useRoute, useRouter, type LocationQueryRaw } from 'vue-router'
import SaltRimDialog from '../Dialog/SaltRimDialog.vue'
import Pagination from './../Search/SearchPagination.vue'
import { useI18n } from 'vue-i18n'

type Cocktail = components['schemas']['PublicCocktailResource']
type Bar = components['schemas']['PublicBarResource']
type Meta = operations['listPublicBarCocktails']['responses']['200']['content']['application/json']['meta'];

defineProps<{
    bar: Bar
}>()

const showFiltersDialog = ref(false)
const cocktails = ref<Cocktail[]>([])
const queryTimer = ref<number | null>(null)
const route = useRoute()
const meta = ref({} as Meta)
const router = useRouter()
const { t } = useI18n()
const availableSorts = computed(() => [
    { value: 'name', label: t('public-bar.sort-name-asc') },
    { value: '-name', label: t('public-bar.sort-name-desc') },
    { value: 'created_at', label: t('public-bar.sort-created-asc') },
    { value: '-created_at', label: t('public-bar.sort-created-desc') },
])
const barId = route.params.barId.toString()

const defaultRefinements = {
    sort: '-created_at',
    page: 1,
    filter: {
        name: null as string | null,
        bar_shelf: false,
        collection_id: [] as number[],
    }
}
const activeFilters = ref({...defaultRefinements, filter: { ...defaultRefinements.filter }})

const stateToQuery = () => {
    const query: any = {}

    query.page = activeFilters.value.page
    query.sort = activeFilters.value.sort
    query.filter = {
        name: activeFilters.value.filter.name || undefined,
        bar_shelf: activeFilters.value.filter.bar_shelf || undefined,
        collection_id: activeFilters.value.filter.collection_id.length > 0 ? activeFilters.value.filter.collection_id.join(',') : undefined,
    }

    return query
}

const queryToState = () => {
    const queryString = qs.parse(window.location.search.replace(/^\?/, ''))
    if (!queryString) {
        return
    }

    activeFilters.value.page = route.query.page ? parseInt(route.query.page as string) : defaultRefinements.page
    activeFilters.value.sort = route.query.sort ? (route.query.sort as string) : defaultRefinements.sort
    activeFilters.value.filter.name = (queryString.filter as any)?.name || defaultRefinements.filter.name
    activeFilters.value.filter.bar_shelf = (queryString.filter as any)?.bar_shelf || defaultRefinements.filter.bar_shelf
    activeFilters.value.filter.collection_id = (queryString.filter as any)?.collection_id ? String((queryString.filter as any)?.collection_id).split(',').map((id: string) => parseInt(id)) : defaultRefinements.filter.collection_id
}

const fetchCocktails = async () => {
    const query = {
        ...stateToQuery(),
    }

    try {
        const response = await BarAssistantClient.getPublicBarCocktails(barId, query)
        cocktails.value = response?.data || []
        meta.value = response?.meta || {}
    } catch (error) {
        console.error('Error fetching cocktails:', error)
    }
}

const debounceSearch = () => {
    if (queryTimer.value) {
        clearTimeout(queryTimer.value)
    }

    queryTimer.value = setTimeout(() => {
        activeFilters.value.page = 1
        updateRouterPath()
    }, 300)
}

const updateRouterPath = () => {
    const query = stateToQuery()

    router.push({
        query: query as LocationQueryRaw
    })
}

const resetFilters = () => {
    activeFilters.value = {...defaultRefinements, filter: { ...defaultRefinements.filter }}
    updateRouterPath()
}

const handlePageChange = (toPage: number) => {
    activeFilters.value.page = toPage
    updateRouterPath()
}

const applyFilters = () => {
    showFiltersDialog.value = false
    updateRouterPath()
}

watch(
    () => route.query,
    () => {
        if (route.name === 'public.cocktails.index') {
            queryToState()
            fetchCocktails()
        }
    },
    { immediate: true }
)
</script>

<style scoped>
.public-cocktail-grid-filters {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.public-cocktail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
    gap: 1rem;
}

@media (max-width: 545px) {
    .public-cocktail-grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    }
}

.public-cocktail-grid-filter-icon {
    width: 1.5rem;
    height: 1.5rem;
}

.form-group--checkbox {
    background: #fff;
    border: 2px solid #ece6ea;
    padding: 0.75rem 0.75rem;
    border-radius: var(--radius-2);
}

.form-group--checkbox .form-label {
    display: flex;
    flex-direction: row;
    gap: .5rem;
}

.form-group-checkbox-content {
    display: flex;
    flex-direction: column;
    gap: .25rem;
}

.form-group-checkbox-content__label {
    font-weight: bold;
}

.form-group-checkbox-content__help {
    font-size: 0.75em;
}
</style>
