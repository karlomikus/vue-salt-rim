<template>
    <PageHeader>
        {{ $t('cocktails') }}
        <template #actions>
            <RouterLink class="button button--outline" :to="{ name: 'cocktails.scrape' }">{{ $t('cocktails.import') }}</RouterLink>
            <RouterLink class="button button--dark" :to="{ name: 'cocktails.form' }">{{ $t('cocktails.add') }}</RouterLink>
        </template>
    </PageHeader>
    <p class="page-description" style="margin-bottom: 2rem;">{{ $t('cocktails.page.description') }}</p>
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
                    <Refinement :title="$t('your-collections')" :refinements="refineCollections" id="collection" v-model="activeFilters.collections" v-if="refineCollections.length > 0" @change="updateRouterPath"></Refinement>
                    <Refinement :title="$t('ingredient.main')" :refinements="refineMainIngredients" id="main-ingredient" v-model="activeFilters.main_ingredients" @change="updateRouterPath"></Refinement>
                    <Refinement :title="$t('method')" :refinements="refineMethods" id="method" v-model="activeFilters.methods" @change="updateRouterPath"></Refinement>
                    <Refinement :title="$t('strength')" :refinements="refineABV" id="abv" v-model="activeFilters.abv" type="radio" @change="updateRouterPath"></Refinement>
                    <Refinement :title="$t('tags')" :refinements="refineTags" id="tag" v-model="activeFilters.tags" @change="updateRouterPath"></Refinement>
                    <Refinement :title="$t('glass-type')" :refinements="refineGlasses" id="glass" v-model="activeFilters.glasses" @change="updateRouterPath"></Refinement>
                    <Refinement :title="$t('your-rating')" :refinements="refineRatings" id="user-rating" v-model="activeFilters.user_rating" type="radio" @change="updateRouterPath"></Refinement>
                    <Refinement :title="$t('total-ingredients')" :refinements="refineIngredientsCount" id="total-ingredients" v-model="activeFilters.total_ingredients" type="radio" @change="updateRouterPath"></Refinement>
                    <button class="button button--dark sm-show" type="button" @click="showRefinements = false">{{ $t('cancel') }}</button>
                </div>
            </div>
            <div class="resource-search__content">
                <div class="resource-search__content__filter">
                    <button type="button" class="button button--outline button--icon" @click.prevent="showRefinements = !showRefinements">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M6.17 18a3.001 3.001 0 0 1 5.66 0H22v2H11.83a3.001 3.001 0 0 1-5.66 0H2v-2h4.17zm6-7a3.001 3.001 0 0 1 5.66 0H22v2h-4.17a3.001 3.001 0 0 1-5.66 0H2v-2h10.17zm-6-7a3.001 3.001 0 0 1 5.66 0H22v2H11.83a3.001 3.001 0 0 1-5.66 0H2V4h4.17z" />
                        </svg>
                    </button>
                    <input class="form-input" type="text" :placeholder="$t('placeholder.search-cocktails')" v-model="searchQuery" @input="debounceCocktailNameSearch" @keyup.enter="updateRouterPath">
                    <select class="form-select" v-model="sort" @change="updateRouterPath">
                        <option disabled>{{ $t('sort') }}:</option>
                        <option value="name">{{ $t('name') }}</option>
                        <option value="created_at">{{ $t('date-added') }}</option>
                        <option value="favorited_at">{{ $t('date-favorited') }}</option>
                        <option value="missing_ingredients">{{ $t('missing-ingredients') }}</option>
                        <option value="total_ingredients">{{ $t('total-ingredients') }}</option>
                        <option value="average_rating">{{ $t('average-rating') }}</option>
                        <option value="user_rating">{{ $t('user-rating') }}</option>
                        <option value="abv">{{ $t('ABV') }}</option>
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
                    <SaltRimDialog v-model="showCreateNewCollectionDialog">
                        <template #trigger>
                            <button type="button" class="button button--outline button--icon" @click.prevent="showCreateNewCollectionDialog = !showCreateNewCollectionDialog" :title="$t('collections.add')">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                    <path fill="none" d="M0 0h24v24H0z" />
                                    <path d="M12.414 5H21a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7.414l2 2zM4 5v14h16V7h-8.414l-2-2H4zm7 7V9h2v3h3v2h-3v3h-2v-3H8v-2h3z" />
                                </svg>
                            </button>
                        </template>
                        <template #dialog>
                            <CollectionDialog title="collections.add-from-query" :cocktails="currentCocktailIds" @collectionDialogClosed="handleCollectionsDialogClosed" />
                        </template>
                    </SaltRimDialog>
                    <button type="button" class="button button--outline button--icon" @click.prevent="clearRefinements" :title="$t('clear-filters')">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 10.5858L14.8284 7.75736L16.2426 9.17157L13.4142 12L16.2426 14.8284L14.8284 16.2426L12 13.4142L9.17157 16.2426L7.75736 14.8284L10.5858 12L7.75736 9.17157L9.17157 7.75736L12 10.5858Z"></path></svg>
                    </button>
                </div>
                <CocktailGridContainer v-if="cocktails.length > 0" v-slot="observer">
                    <CocktailGridItem v-for="cocktail in cocktails" :cocktail="cocktail" :key="cocktail.id" :observer="observer" />
                </CocktailGridContainer>
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
import CocktailGridItem from './CocktailGridItem.vue'
import CocktailGridContainer from './CocktailGridContainer.vue'
import PageHeader from './../PageHeader.vue'
import Refinement from './../Search/SearchRefinement.vue';
import Pagination from './../Search/SearchPagination.vue';
import CollectionDialog from './../Collections/CollectionDialog.vue';
import SaltRimDialog from './../Dialog/SaltRimDialog.vue'
import qs from 'qs';

export default {
    data() {
        return {
            showCreateNewCollectionDialog: false,
            isLoading: false,
            showRefinements: false,
            cocktails: [],
            searchQuery: null,
            sort: 'name',
            sort_dir: '',
            meta: {},
            queryTimer: null,
            currentPage: 1,
            per_page: 50,
            availableRefinements: {
                global: [
                    { name: this.$t('shelf.cocktails'), active: false, id: 'on_shelf' },
                    { name: this.$t('my.favorites'), active: false, id: 'favorites' },
                    { name: this.$t('cocktails.shared'), active: false, id: 'is_public' },
                    { name: this.$t('my.cocktails'), active: false, id: 'user_id' },
                ],
                abv: [
                    { name: this.$t('non-alcoholic'), min: null, max: 2, id: 'abv_non_alcoholic' },
                    { name: this.$t('weak'), min: 2, max: 18, id: 'abv_weak' },
                    { name: this.$t('medium'), min: 18, max: 28, id: 'abv_medium' },
                    { name: this.$t('strong'), min: 28, max: null, id: 'abv_strong' },
                ],
                total_ingredients: [
                    { name: '>= 3 ' + this.$t('ingredients'), active: false, id: '3' },
                    { name: '>= 5 ' + this.$t('ingredients'), active: false, id: '5' },
                    { name: '>= 7 ' + this.$t('ingredients'), active: false, id: '7' },
                ],
                tags: [],
                glasses: [],
                methods: [],
                main_ingredients: [],
                collections: [],
            },
            activeFilters: {
                on_shelf: false,
                favorites: false,
                is_public: false,
                user_id: false,
                tags: [],
                glasses: [],
                methods: [],
                main_ingredients: [],
                ingredients: [],
                collections: [],
                user_rating: null,
                abv: null,
                total_ingredients: null
            }
        }
    },
    components: {
        CocktailGridItem,
        CocktailGridContainer,
        PageHeader,
        OverlayLoader,
        Refinement,
        SaltRimDialog,
        CollectionDialog,
        Pagination
    },
    created() {
        document.title = `${this.$t('cocktails')} \u22C5 ${this.site_title}`

        this.fetchRefinements();

        this.$watch(
            () => this.$route.query,
            () => {
                if (this.$route.name == 'cocktails') {
                    this.queryToState();
                    this.refreshCocktails()
                }
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
        refineMethods() {
            return this.availableRefinements.methods.map(m => {
                return {
                    id: m.id,
                    value: m.id,
                    name: m.name
                }
            })
        },
        refineGlasses() {
            return this.availableRefinements.glasses.map(m => {
                return {
                    id: m.id,
                    value: m.id,
                    name: m.name
                }
            })
        },
        refineTags() {
            return this.availableRefinements.tags.map(m => {
                return {
                    id: m.id,
                    value: m.id,
                    name: m.name
                }
            })
        },
        refineABV() {
            return this.availableRefinements.abv.map(m => {
                return {
                    id: m.id,
                    value: {min: m.min, max: m.max},
                    name: m.name
                }
            })
        },
        refineRatings() {
            return [1, 2, 3, 4, 5].map(r => {
                return {
                    id: r,
                    value: parseInt(r),
                    name: '>= ' + '★'.repeat(r)
                }
            })
        },
        refineMainIngredients() {
            return this.availableRefinements.main_ingredients.map(i => {
                return {
                    id: i.id,
                    value: i.id,
                    name: i.name
                }
            })
        },
        refineCollections() {
            return this.availableRefinements.collections.map(m => {
                return {
                    id: m.id,
                    value: m.id,
                    name: m.name
                }
            })
        },
        refineIngredientsCount() {
            return this.availableRefinements.total_ingredients.map(m => {
                return {
                    id: m.id,
                    value: m.id,
                    name: m.name
                }
            })
        },
        currentCocktailIds() {
            return this.cocktails.map((c) => c.id);
        }
    },
    methods: {
        fetchRefinements() {
            ApiRequests.fetchTags().then(data => {
                this.availableRefinements.tags = data
            })

            ApiRequests.fetchGlasses().then(data => {
                this.availableRefinements.glasses = data
            })

            ApiRequests.fetchCocktailMethods().then(data => {
                this.availableRefinements.methods = data
            })

            ApiRequests.fetchIngredients({'filter[main_ingredients]': true, per_page: 100}).then(resp => {
                this.availableRefinements.main_ingredients = resp.data
            })

            ApiRequests.fetchCollections({per_page: 100}).then(data => {
                this.availableRefinements.collections = data
            })
        },
        updateRouterPath() {
            const query = this.stateToQuery();

            this.$router.push({
                query: query
            })
        },
        refreshCocktails() {
            const query = this.stateToQuery();

            this.isLoading = true;
            ApiRequests.fetchCocktails(query).then(resp => {
                this.cocktails = resp.data
                this.meta = resp.meta
                this.isLoading = false;
            }).catch(e => {
                this.$toast.error(e.message);
                this.isLoading = false;
            })
        },
        handlePageChange(toPage) {
            this.currentPage = toPage
            this.updateRouterPath()
        },
        queryToState() {
            const state = qs.parse(this.$route.query);

            this.activeFilters.tags = state.filter && state.filter.tag_id ? String(state.filter.tag_id).split(',') : []
            this.activeFilters.methods = state.filter && state.filter.cocktail_method_id ? String(state.filter.cocktail_method_id).split(',') : []
            this.activeFilters.glasses = state.filter && state.filter.glass_id ? String(state.filter.glass_id).split(',') : []
            this.activeFilters.main_ingredients = state.filter && state.filter.main_ingredient_id ? String(state.filter.main_ingredient_id).split(',') : []
            this.activeFilters.collections = state.filter && state.filter.collection_id ? String(state.filter.collection_id).split(',') : []
            this.activeFilters.ingredients = state.filter && state.filter.ingredient_id ? String(state.filter.ingredient_id).split(',') : []
            this.activeFilters.on_shelf = state.filter && state.filter.on_shelf ? state.filter.on_shelf : null
            this.activeFilters.favorites = state.filter && state.filter.favorites ? state.filter.favorites : null
            this.activeFilters.is_public = state.filter && state.filter.is_public ? state.filter.is_public : null
            this.activeFilters.total_ingredients = state.filter && state.filter.total_ingredients ? state.filter.total_ingredients : null
            this.activeFilters.user_id = state.filter && state.filter.user_id ? true : null
            this.activeFilters.user_rating = state.filter && state.filter.user_rating_min ? state.filter.user_rating_min : null
            this.searchQuery = state.filter && state.filter.name ? state.filter.name : null
            if (state.filter && (state.filter.abv_min || state.filter.abv_max)) {
                this.activeFilters.abv = { min: state.filter.abv_min ? state.filter.abv_min : null, max: state.filter.abv_max ? state.filter.abv_max : null }
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
                on_shelf: this.activeFilters.on_shelf,
                favorites: this.activeFilters.favorites,
                is_public: this.activeFilters.is_public,
                // user_id: this.activeFilters.user_id ? Auth.getUser().id : null, // TODO
                user_rating_min: this.activeFilters.user_rating ? this.activeFilters.user_rating : null,
                total_ingredients: this.activeFilters.total_ingredients ? this.activeFilters.total_ingredients : null,
                tag_id: this.activeFilters.tags.length > 0 ? this.activeFilters.tags.join(',') : null,
                glass_id: this.activeFilters.glasses.length > 0 ? this.activeFilters.glasses.join(',') : null,
                cocktail_method_id: this.activeFilters.methods.length > 0 ? this.activeFilters.methods.join(',') : null,
                main_ingredient_id: this.activeFilters.main_ingredients.length > 0 ? this.activeFilters.main_ingredients.join(',') : null,
                ingredient_id: this.activeFilters.ingredients.length > 0 ? this.activeFilters.ingredients.join(',') : null,
                collection_id: this.activeFilters.collections.length > 0 ? this.activeFilters.collections.join(',') : null,
                abv_min: this.activeFilters.abv ? this.activeFilters.abv.min : null,
                abv_max: this.activeFilters.abv ? this.activeFilters.abv.max : null,
            };

            // Remove null values
            query.filter = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== null && v !== false));

            return query;
        },
        handleCollectionsDialogClosed() {
            this.showCreateNewCollectionDialog = false
            this.fetchRefinements()
            this.refreshCocktails()
        },
        debounceCocktailNameSearch() {
            clearTimeout(this.queryTimer)

            this.queryTimer = setTimeout(() => {
                this.updateRouterPath()
            }, 300)
        },
        clearRefinements() {
            this.searchQuery = null
            this.sort = 'name'
            this.sort_dir = '',
            this.currentPage = 1,
            this.per_page = 50,
            this.activeFilters = {
                on_shelf: false,
                favorites: false,
                is_public: false,
                user_id: false,
                tags: [],
                glasses: [],
                methods: [],
                ingredients: [],
                collections: [],
                user_rating: null,
                abv: null,
                total_ingredients: null
            };

            this.updateRouterPath();
        },
        handleClickAway(e) {
            if (e && e.target && e.target.classList.contains('resource-search__refinements')) {
                this.showRefinements = !this.showRefinements
            }
        }
    }
}
</script>
