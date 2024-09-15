<template>
    <PageHeader>
        {{ $t('ingredient.ingredients') }}
        <template #actions>
            <RouterLink class="button button--outline" :to="{ name: 'shopping-list.index' }">{{ $t('your-shopping-list') }}</RouterLink>
            <template v-if="appState.isAdmin() || appState.isModerator() || appState.isGeneral()">
                <RouterLink class="button button--dark" :to="{ name: 'ingredients.form' }">{{ $t('ingredient.add') }}</RouterLink>
            </template>
        </template>
    </PageHeader>
    <div class="resource-search-wrapper">
        <OverlayLoader v-if="isLoading" />
        <div class="resource-search">
            <div v-show="showRefinements" class="resource-search__refinements" @click="handleClickAway">
                <div class="resource-search__refinements__body">
                    <h3 class="page-subtitle" style="margin-top: 0">{{ $t('filters') }}</h3>
                    <Refinement id="global" :title="$t('global')" :collapsable="false">
                        <div v-for="filter in availableRefinements.global" :key="filter.id" class="resource-search__refinements__refinement__item">
                            <input :id="'global-' + filter.id" v-model="activeFilters[filter.id]" type="checkbox" :value="filter.active" @change="updateRouterPath">
                            <label :for="'global-' + filter.id">{{ filter.name }}</label>
                        </div>
                    </Refinement>
                    <Refinement id="ingredient-category" v-model="activeFilters.category_id" :title="$t('category.title')" :refinements="refineCategories" @change="updateRouterPath"></Refinement>
                    <Refinement id="strength" v-model="activeFilters.strength" :title="$t('strength')" :refinements="refineStrength" type="radio" @change="updateRouterPath"></Refinement>
                </div>
            </div>
            <div class="resource-search__content">
                <div class="resource-search__content__filter" style="margin-bottom: 1rem;">
                    <button type="button" class="button button--outline button--icon" @click.prevent="showRefinements = !showRefinements">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M6.17 18a3.001 3.001 0 0 1 5.66 0H22v2H11.83a3.001 3.001 0 0 1-5.66 0H2v-2h4.17zm6-7a3.001 3.001 0 0 1 5.66 0H22v2h-4.17a3.001 3.001 0 0 1-5.66 0H2v-2h10.17zm-6-7a3.001 3.001 0 0 1 5.66 0H22v2H11.83a3.001 3.001 0 0 1-5.66 0H2V4h4.17z" />
                        </svg>
                        <div v-show="totalActiveRefinements > 0" class="resource-search__content__filter__count">{{ totalActiveRefinements }}</div>
                    </button>
                    <input v-model="searchQuery" class="form-input" type="text" :placeholder="$t('placeholder.search-ingredients')" @input="debounceIngredientSearch" @keyup.enter="updateRouterPath">
                    <select v-model="sort" class="form-select" @change="updateRouterPath">
                        <option disabled>{{ $t('sort') }}:</option>
                        <option value="name">{{ $t('name') }}</option>
                        <option value="created_at">{{ $t('date-added') }}</option>
                        <option value="strength">{{ $t('strength') }}</option>
                        <option value="total_cocktails">{{ $t('total.cocktails') }}</option>
                    </select>
                    <select v-model="sort_dir" class="form-select" @change="updateRouterPath">
                        <option disabled>{{ $t('sort-direction') }}:</option>
                        <option value="">{{ $t('sort-asc') }}</option>
                        <option value="-">{{ $t('sort-desc') }}</option>
                    </select>
                    <select v-model="per_page" class="form-select" @change="updateRouterPath">
                        <option disabled>{{ $t('search.results-per-page') }}:</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                    <button v-show="totalActiveRefinements > 0" type="button" class="button button--outline button--icon" :title="$t('clear-filters')" @click.prevent="clearRefinements">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 10.5858L14.8284 7.75736L16.2426 9.17157L13.4142 12L16.2426 14.8284L14.8284 16.2426L12 13.4142L9.17157 16.2426L7.75736 14.8284L10.5858 12L7.75736 9.17157L9.17157 7.75736L12 10.5858Z"></path></svg>
                    </button>
                </div>
                <IngredientGridContainer v-if="ingredients.length > 0">
                    <IngredientGridItem v-for="ingredient in ingredients" :key="ingredient.id" :ingredient="ingredient" :user-ingredients="userIngredients" :shopping-list="shoppingListIngredients" />
                </IngredientGridContainer>
                <EmptyState v-else style="margin-top: 1rem;">
                    <template #icon>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
                            <path d="M11 2C15.968 2 20 6.032 20 11C20 15.968 15.968 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2ZM11 18C14.8675 18 18 14.8675 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18ZM19.4853 18.0711L22.3137 20.8995L20.8995 22.3137L18.0711 19.4853L19.4853 18.0711Z"></path>
                        </svg>
                    </template>
                    {{ $t('ingredients-not-found') }}
                </EmptyState>
                <Pagination :meta="meta" @page-changed="handlePageChange"></Pagination>
            </div>
        </div>
    </div>
</template>

<script>
import OverlayLoader from './../OverlayLoader.vue'
import ApiRequests from './../../ApiRequests.js'
import IngredientGridContainer from './../Ingredient/IngredientGridContainer.vue'
import IngredientGridItem from './../Ingredient/IngredientGridItem.vue'
import PageHeader from './../PageHeader.vue'
import Refinement from './../Search/SearchRefinement.vue'
import Pagination from './../Search/SearchPagination.vue'
import qs from 'qs'
import Dropdown from './../SaltRimDropdown.vue'
import EmptyState from './../EmptyState.vue'
import AppState from '../../AppState'
import BarAssistantClient from '@/api/BarAssistantClient'
import { useTitle } from '@/composables/title'

export default {
    components: {
        OverlayLoader,
        IngredientGridItem,
        IngredientGridContainer,
        PageHeader,
        Refinement,
        Pagination,
        Dropdown,
        EmptyState
    },
    data() {
        return {
            appState: new AppState(),
            isLoading: false,
            showRefinements: false,
            meta: {},
            sort: 'name',
            sort_dir: '',
            per_page: 50,
            currentPage: 1,
            searchQuery: null,
            ingredients: [],
            shoppingListIngredients: [],
            userIngredients: [],
            availableRefinements: {
                categories: [],
                global: [
                    { name: this.$t('shelf-ingredients'), active: false, id: 'on_shelf' },
                    { name: this.$t('shopping-list-ingredients'), active: false, id: 'on_shopping_list' },
                    { name: this.$t('used-as-main-ingredient'), active: false, id: 'main_ingredients' },
                    { name: this.$t('ingredient.complex'), active: false, id: 'complex' },
                ],
                strength: [
                    { name: this.$t('non-alcoholic'), min: 0, max: 0, id: 'strength_non_alcoholic' },
                    { name: '<= 20%', min: null, max: 20, id: 'strength_weak' },
                    { name: '20% - 40%', min: 20, max: 40, id: 'strength_medium' },
                    { name: '>= 40', min: 40, max: null, id: 'strength_strong' },
                ],
            },
            activeFilters: {
                category_id: [],
                on_shelf: false,
                main_ingredients: false,
                on_shopping_list: false,
                complex: false,
                strength: null
            }
        }
    },
    computed: {
        sortWithDir: {
            set(val) {
                if (!val) {
                    return
                }
                if (val.startsWith('-')) {
                    this.sort_dir = '-'
                    this.sort = val.substring(1)
                } else {
                    this.sort_dir = ''
                    this.sort = val
                }
            },
            get() {
                return (this.sort != null && this.sort != '') ? this.sort_dir + this.sort : null
            }
        },
        refineCategories() {
            return this.availableRefinements.categories.map(c => {
                return {
                    id: c.id,
                    value: c.id,
                    name: c.name
                }
            })
        },
        refineStrength() {
            return this.availableRefinements.strength.map(m => {
                return {
                    id: m.id,
                    value: {min: m.min, max: m.max},
                    name: m.name
                }
            })
        },
        totalActiveRefinements() {
            let total = 0

            Object.values(this.activeFilters).forEach(element => {
                if (Array.isArray(element) && element.length > 0) {
                    return total++
                }

                if (typeof element == 'boolean' && element == true) {
                    return total++
                }

                if (element !== null && !Array.isArray(element) && element !== false) {
                    return total++
                }
            })

            return total
        },
    },
    created() {
        useTitle(this.$t('ingredient.ingredients'))

        this.fetchRefinements()

        this.$watch(
            () => this.$route.query,
            () => {
                if (this.$route.name == 'ingredients') {
                    this.queryToState()
                    this.refreshIngredients()
                    this.refreshShoppingListIngredients()
                    this.refreshShelfIngredients()
                }
            },
            { immediate: true }
        )
    },
    methods: {
        fetchRefinements() {
            ApiRequests.fetchIngredientCategories().then(data => {
                this.availableRefinements.categories = data
            })
        },
        queryToState() {
            const state = qs.parse(this.$route.query)

            this.activeFilters.category_id = state.filter && state.filter.category_id ? String(state.filter.category_id).split(',') : []

            this.activeFilters.on_shelf = state.filter && state.filter.on_shelf ? state.filter.on_shelf : null
            this.activeFilters.main_ingredients = state.filter && state.filter.main_ingredients ? state.filter.main_ingredients : null
            this.activeFilters.on_shopping_list = state.filter && state.filter.on_shopping_list ? state.filter.on_shopping_list : null
            this.activeFilters.complex = state.filter && state.filter.complex ? state.filter.complex : null
            this.searchQuery = state.filter && state.filter.name ? state.filter.name : null
            if (state.filter && (state.filter.strength_min || state.filter.strength_max)) {
                this.activeFilters.strength = { min: state.filter.strength_min ? state.filter.strength_min : null, max: state.filter.strength_max ? state.filter.strength_max : null }
            }

            if (state.per_page) {
                this.per_page = state.per_page
            }

            if (state.page) {
                this.currentPage = state.page
            }

            if (state.sort) {
                this.sortWithDir = state.sort
            }
        },
        stateToQuery() {
            const query = {
                per_page: this.per_page,
                page: this.currentPage,
                sort: this.sortWithDir
            }

            const filters = {
                name: (this.searchQuery != null && this.searchQuery != '') ? this.searchQuery : null,
                category_id: this.activeFilters.category_id.length > 0 ? this.activeFilters.category_id.join(',') : null,
                on_shelf: this.activeFilters.on_shelf,
                complex: this.activeFilters.complex,
                main_ingredients: this.activeFilters.main_ingredients,
                on_shopping_list: this.activeFilters.on_shopping_list,
                strength_min: this.activeFilters.strength ? this.activeFilters.strength.min : null,
                strength_max: this.activeFilters.strength ? this.activeFilters.strength.max : null,
            }

            // Remove null values
            // query.filter = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== null && v !== false));
            query.filter = Object.entries(filters).reduce((a,[k,v]) => (v === null || v === false ? a : (a[k]=v, a)), {})

            return query
        },
        updateRouterPath() {
            const query = this.stateToQuery()

            this.$router.push({
                query: query
            })
        },
        refreshIngredients() {
            const query = this.stateToQuery()
            query.include = 'images,category'

            this.isLoading = true
            ApiRequests.fetchIngredients(query).then(resp => {
                this.ingredients = resp.data
                this.meta = resp.meta
                this.isLoading = false
            }).catch(e => {
                this.$toast.error(e.message)
                this.isLoading = false
            })
        },
        debounceIngredientSearch() {
            clearTimeout(this.queryTimer)

            this.queryTimer = setTimeout(() => {
                this.currentPage = 1
                this.updateRouterPath()
            }, 300)
        },
        handlePageChange(toPage) {
            this.currentPage = toPage
            this.updateRouterPath()
        },
        clearRefinements() {
            this.searchQuery = null
            this.sort = 'name'
            this.sort_dir = '',
            this.currentPage = 1,
            this.per_page = 50,
            this.activeFilters = {
                category_id: [],
                on_shelf: false,
                main_ingredients: false,
                on_shopping_list: false,
                complex: false,
                strength: null
            }

            this.updateRouterPath()
        },
        handleClickAway(e) {
            if (e && e.target && e.target.classList.contains('resource-search__refinements')) {
                this.showRefinements = !this.showRefinements
            }
        },
        shareFromFormat(format) {
            ApiRequests.shareShoppingList({ type: format }).then(data => {
                navigator.clipboard.writeText(data).then(() => {
                    this.$toast.default(this.$t('share.format-copied'))
                }, () => {
                    this.$toast.error(this.$t('share.format-copy-failed'))
                })
            })
        },
        refreshShoppingListIngredients() {
            BarAssistantClient.getShoppingList(this.appState.user.id).then(resp => {
                this.shoppingListIngredients = resp.data
            })
        },
        refreshShelfIngredients() {
            BarAssistantClient.getUserIngredientShelf(this.appState.user.id).then(resp => {
                this.userIngredients = resp.data
            })
        },
    }
}
</script>

<style scoped>

</style>
