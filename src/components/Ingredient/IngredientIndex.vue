<template>
    <PageHeader>
        {{ $t('ingredients') }}
        <template #actions>
            <Dropdown>
                <template v-slot:default="{ toggleDropdown }">
                    <button type="button" class="button button--outline" @click="toggleDropdown">{{ $t('your-shopping-list') }}</button>
                </template>
                <template #content>
                    <RouterLink class="dropdown-menu__item" target="_blank" :to="{ name: 'print.shopping-list' }">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M6 19H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h3V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v4h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-3v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-2zm0-2v-1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1h2V9H4v8h2zM8 4v3h8V4H8zm0 13v3h8v-3H8zm-3-7h3v2H5v-2z" />
                        </svg>
                        {{ $t('print') }}
                    </RouterLink>
                    <a class="dropdown-menu__item" href="#copy" @click.prevent="shareFromFormat('markdown')">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                            <path d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM4 5V19H20V5H4ZM7 15.5H5V8.5H7L9 10.5L11 8.5H13V15.5H11V11.5L9 13.5L7 11.5V15.5ZM18 12.5H20L17 15.5L14 12.5H16V8.5H18V12.5Z"></path>
                        </svg>
                        {{ $t('share-copy-md') }}
                    </a>
                </template>
            </Dropdown>
            <RouterLink class="button button--dark" :to="{ name: 'ingredients.form' }">{{ $t('ingredient.add') }}</RouterLink>
        </template>
    </PageHeader>
    <p class="page-description" style="margin-bottom: 1rem;">{{ $t('ingredients.page.description') }}</p>
    <div class="resource-search-wrapper">
        <OverlayLoader v-if="isLoading" />
        <div class="resource-search">
            <div class="resource-search__refinements" v-show="showRefinements" @click="handleClickAway">
                <div class="resource-search__refinements__body">
                    <h3 class="page-subtitle" style="margin-top: 0">{{ $t('filters') }}</h3>
                    <Refinement :title="$t('global')" id="global">
                        <div class="resource-search__refinements__refinement__item" v-for="filter in availableRefinements.global">
                            <input type="checkbox" :id="'global-' + filter.id" :value="filter.active" v-model="activeFilters[filter.id]" @change="updateRouterPath">
                            <label :for="'global-' + filter.id">{{ filter.name }}</label>
                        </div>
                    </Refinement>
                    <Refinement :title="$t('category')" :refinements="refineCategories" id="ingredient-category" v-model="activeFilters.category_id" @change="updateRouterPath"></Refinement>
                    <Refinement :title="$t('strength')" :refinements="refineStrength" id="strength" v-model="activeFilters.strength" type="radio" @change="updateRouterPath"></Refinement>
                </div>
            </div>
            <div class="resource-search__content">
                <div class="resource-search__content__filter" style="margin-bottom: 1rem;">
                    <button type="button" class="button button--outline button--icon" @click.prevent="showRefinements = !showRefinements">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M6.17 18a3.001 3.001 0 0 1 5.66 0H22v2H11.83a3.001 3.001 0 0 1-5.66 0H2v-2h4.17zm6-7a3.001 3.001 0 0 1 5.66 0H22v2h-4.17a3.001 3.001 0 0 1-5.66 0H2v-2h10.17zm-6-7a3.001 3.001 0 0 1 5.66 0H22v2H11.83a3.001 3.001 0 0 1-5.66 0H2V4h4.17z" />
                        </svg>
                    </button>
                    <input class="form-input" type="text" :placeholder="$t('placeholder.search-ingredients')" v-model="searchQuery" @input="debounceIngredientSearch" @keyup.enter="updateRouterPath">
                    <select class="form-select" v-model="sort" @change="updateRouterPath">
                        <option disabled>{{ $t('sort') }}:</option>
                        <option value="name">{{ $t('name') }}</option>
                        <option value="created_at">{{ $t('date-added') }}</option>
                        <option value="strength">{{ $t('strength') }}</option>
                        <option value="total_cocktails">{{ $t('total-cocktails') }}</option>
                    </select>
                    <select class="form-select" v-model="sort_dir" @change="updateRouterPath">
                        <option disabled>{{ $t('sort-direction') }}:</option>
                        <option value="">{{ $t('sort-asc') }}</option>
                        <option value="-">{{ $t('sort-desc') }}</option>
                    </select>
                    <select class="form-select" v-model="per_page" @change="updateRouterPath">
                        <option disabled>{{ $t('results-per-page') }}:</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                    <button type="button" class="button button--outline button--icon" @click.prevent="clearRefinements" :title="$t('clear-filters')">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 10.5858L14.8284 7.75736L16.2426 9.17157L13.4142 12L16.2426 14.8284L14.8284 16.2426L12 13.4142L9.17157 16.2426L7.75736 14.8284L10.5858 12L7.75736 9.17157L9.17157 7.75736L12 10.5858Z"></path></svg>
                    </button>
                </div>
                <IngredientGridContainer v-if="ingredients.length > 0">
                    <IngredientGridItem v-for="ingredient in ingredients" :ingredient="ingredient" :userIngredients="ingredientIdsOnShelf" :shoppingList="ingredientIdsOnShoppingList" :key="ingredient.id" />
                </IngredientGridContainer>
                <div v-else class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path d="M11 2C15.968 2 20 6.032 20 11C20 15.968 15.968 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2ZM11 18C14.8675 18 18 14.8675 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18ZM19.4853 18.0711L22.3137 20.8995L20.8995 22.3137L18.0711 19.4853L19.4853 18.0711Z"></path>
                    </svg>
                    <p>{{ $t('cocktails-not-found') }}</p>
                </div>
                <Pagination :meta="meta" @pageChanged="handlePageChange"></Pagination>
            </div>
        </div>
    </div>
</template>

<script>
import OverlayLoader from './../OverlayLoader.vue'
import ApiRequests from './../../ApiRequests.js'
import Auth from './../../Auth.js'
import IngredientGridContainer from './../Ingredient/IngredientGridContainer.vue'
import IngredientGridItem from './../Ingredient/IngredientGridItem.vue'
import PageHeader from './../PageHeader.vue'
import Refinement from './../Search/Refinement.vue';
import Pagination from './../Search/Pagination.vue';
import qs from 'qs';
import Dropdown from './../Dropdown.vue';

export default {
    data() {
        return {
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
            availableRefinements: {
                categories: [],
                userIngredients: [],
                global: [
                    { name: this.$t('shelf-ingredients'), active: false, id: 'on_shelf' },
                    { name: this.$t('shopping-list-ingredients'), active: false, id: 'on_shopping_list' },
                    { name: this.$t('used-as-main-ingredient'), active: false, id: 'main_ingredients' },
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
                strength: null
            }
        }
    },
    components: {
        OverlayLoader,
        IngredientGridItem,
        IngredientGridContainer,
        PageHeader,
        Refinement,
        Pagination,
        Dropdown
    },
    created() {
        document.title = `${this.$t('ingredients')} \u22C5 ${this.site_title}`

        this.fetchRefinements();

        this.$watch(
            () => this.$route.query,
            () => {
                this.queryToState();
                this.refreshIngredients()
                this.refreshShoppingListIngredients()
            },
            { immediate: true }
        )
    },
    computed: {
        sortWithDir: {
            set(val) {
                if (!val) {
                    return
                }
                if (val.startsWith('-')) {
                    this.sort_dir = '-';
                    this.sort = val.substring(1)
                } else {
                    this.sort_dir = '';
                    this.sort = val
                }
            },
            get() {
                return (this.sort != null && this.sort != '') ? this.sort_dir + this.sort : null;
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
        ingredientIdsOnShelf() {
            return this.availableRefinements.userIngredients.map(ui => ui.ingredient_id)
        },
        ingredientIdsOnShoppingList() {
            return this.shoppingListIngredients.map(i => i.ingredient.id);
        },
    },
    methods: {
        fetchRefinements() {
            ApiRequests.fetchIngredientCategories().then(data => {
                this.availableRefinements.categories = data
            })

            ApiRequests.fetchMyShelf().then(data => {
                this.availableRefinements.userIngredients = data
            });
        },
        queryToState() {
            const state = qs.parse(this.$route.query);

            this.activeFilters.category_id = state.filter && state.filter.category_id ? String(state.filter.category_id).split(',') : []

            this.activeFilters.on_shelf = state.filter && state.filter.on_shelf ? state.filter.on_shelf : null
            this.activeFilters.main_ingredients = state.filter && state.filter.main_ingredients ? state.filter.main_ingredients : null
            this.activeFilters.on_shopping_list = state.filter && state.filter.on_shopping_list ? state.filter.on_shopping_list : null
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
            };

            const filters = {
                name: (this.searchQuery != null && this.searchQuery != '') ? this.searchQuery : null,
                category_id: this.activeFilters.category_id.length > 0 ? this.activeFilters.category_id.join(',') : null,
                on_shelf: this.activeFilters.on_shelf,
                main_ingredients: this.activeFilters.main_ingredients,
                on_shopping_list: this.activeFilters.on_shopping_list,
                strength_min: this.activeFilters.strength ? this.activeFilters.strength.min : null,
                strength_max: this.activeFilters.strength ? this.activeFilters.strength.max : null,
            };

            // Remove null values
            query.filter = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== null && v !== false));

            return query;
        },
        updateRouterPath() {
            const query = this.stateToQuery();

            this.$router.push({
                query: query
            })
        },
        refreshIngredients() {
            const query = this.stateToQuery();

            this.isLoading = true;
            ApiRequests.fetchIngredientsTODO(query).then(resp => {
                this.ingredients = resp.data
                this.meta = resp.meta
                this.isLoading = false;
            }).catch(e => {
                this.$toast.error(e.message);
                this.isLoading = false;
            })
        },
        debounceIngredientSearch() {
            clearTimeout(this.queryTimer)

            this.queryTimer = setTimeout(() => {
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
            };

            this.updateRouterPath();
        },
        handleClickAway(e) {
            if (e && e.target && e.target.classList.contains('resource-search__refinements')) {
                this.showRefinements = !this.showRefinements
            }
        },
        shareFromFormat(format) {
            ApiRequests.shareShoppingList({ type: format }).then(data => {
                navigator.clipboard.writeText(data).then(() => {
                    this.$toast.default(this.$t('share-format-copied'));
                }, () => {
                    this.$toast.error(this.$t('share-format-copy-failed'));
                });
            })
        },
        refreshShoppingListIngredients() {
            ApiRequests.fetchShoppingList().then(data => {
                this.shoppingListIngredients = data
            })
        }
    }
}
</script>

<style scoped>

</style>
