<template>
    <PageHeader>
        {{ $t('cocktails') }}
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
                            <input type="checkbox" :id="'global-' + filter.id" :value="filter.active" v-model="activeFilters[filter.id]">
                            <label :for="'global-' + filter.id">{{ filter.name }}</label>
                        </div>
                    </Refinement>
                    <Refinement :title="$t('ingredient.main')" :refinements="refineMainIngredients" id="main-ingredient" v-model="activeFilters.ingredients"></Refinement>
                    <Refinement :title="$t('method')" :refinements="refineMethods" id="method" v-model="activeFilters.methods"></Refinement>
                    <Refinement :title="$t('strength')" :refinements="refineABV" id="abv" v-model="activeFilters.abv" type="radio"></Refinement>
                    <Refinement :title="$t('tags')" :refinements="refineTags" id="tag" v-model="activeFilters.tags"></Refinement>
                    <Refinement :title="$t('glass-type')" :refinements="refineGlasses" id="glass" v-model="activeFilters.glasses"></Refinement>
                    <Refinement :title="$t('rating')" :refinements="refineRatings" id="user-rating" v-model="activeFilters.user_rating"></Refinement>
                    <button class="button button--dark sm-show" type="button" @click="showRefinements = false">{{ $t('cancel') }}</button>
                </div>
            </div>
            <div class="resource-search__content">
                <div class="resource-search__content__filter">
                    <button type="button" class="button button--input" @click.prevent="showRefinements = !showRefinements">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M6.17 18a3.001 3.001 0 0 1 5.66 0H22v2H11.83a3.001 3.001 0 0 1-5.66 0H2v-2h4.17zm6-7a3.001 3.001 0 0 1 5.66 0H22v2h-4.17a3.001 3.001 0 0 1-5.66 0H2v-2h10.17zm-6-7a3.001 3.001 0 0 1 5.66 0H22v2H11.83a3.001 3.001 0 0 1-5.66 0H2V4h4.17z" />
                        </svg>
                    </button>
                    <input class="form-input" type="text" :placeholder="$t('placeholder.search-cocktails')" v-model="searchQuery" @input="debounceQuery">
                    <select class="form-select" v-model="sort">
                        <option disabled>{{ $t('sort') }}:</option>
                        <option value="name">{{ $t('name') }}</option>
                        <option value="created_at">{{ $t('date-added') }}</option>
                        <option value="favorited_at">{{ $t('date-favorited') }}</option>
                        <option value="average_rating">{{ $t('average-rating') }}</option>
                        <option value="missing_ingredients">{{ $t('missing-ingredients') }}</option>
                        <option value="user_rating">{{ $t('user-rating') }}</option>
                        <option value="abv">{{ $t('ABV') }}</option>
                    </select>
                    <select class="form-select" v-model="sort_dir">
                        <option value="">{{ $t('sort-asc') }}</option>
                        <option value="-">{{ $t('sort-desc') }}</option>
                    </select>
                    <select class="form-select" v-model="per_page">
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                    <button type="button" class="button button--input" @click.prevent="clearRefinements">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 10.5858L14.8284 7.75736L16.2426 9.17157L13.4142 12L16.2426 14.8284L14.8284 16.2426L12 13.4142L9.17157 16.2426L7.75736 14.8284L10.5858 12L7.75736 9.17157L9.17157 7.75736L12 10.5858Z"></path></svg>
                    </button>
                </div>
                <CocktailGridContainer v-if="cocktails.length > 0" v-slot="observer">
                    <CocktailGridItem v-for="cocktail in cocktails" :cocktail="cocktail" :key="cocktail.id" :observer="observer" />
                </CocktailGridContainer>
                <div class="resource-search__content__pagination">
                    <div class="resource-search__content__pagination__page_info">
                        {{ $t('pagination.results', {'on_page_results': meta.to || 0, total_results: meta.total}) }}
                    </div>
                    <div class="resource-search__content__pagination__links">
                        <button type="button" class="button button--input" @click="changePage('prev')"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z"></path></svg></button> {{ $t('page') }} {{ meta.current_page }}/{{ meta.last_page }} <button type="button" class="button button--input" @click="changePage('next')"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M13.1714 12.0007L8.22168 7.05093L9.63589 5.63672L15.9999 12.0007L9.63589 18.3646L8.22168 16.9504L13.1714 12.0007Z"></path></svg></button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import OverlayLoader from '@/components/OverlayLoader.vue'
import ApiRequests from '@/ApiRequests.js'
import Checkbox from '@/components/Checkbox.vue'
import CocktailGridItem from './CocktailGridItem.vue'
import CocktailGridContainer from './CocktailGridContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import Auth from '@/Auth.js';
import Refinement from './Search/Refinement.vue';
import qs from 'qs';

export default {
    data() {
        return {
            isLoading: false,
            showRefinements: false,
            cocktails: [],
            searchQuery: null,
            sort: 'name',
            sort_dir: '',
            meta: {},
            queryTimer: null,
            currentPage: 1,
            availableRefinements: {
                global: [
                    { name: this.$t('shelf.cocktails'), active: false, id: 'on_shelf' },
                    { name: this.$t('my.favorites'), active: false, id: 'favorites' },
                    { name: this.$t('cocktails.shared'), active: false, id: 'is_public' },
                    { name: this.$t('my.cocktails'), active: false, id: 'user_id' },
                ],
                abv: [
                    { name: this.$t('all'), min: null, max: null, id: 'abv_all' },
                    { name: this.$t('non-alcoholic'), min: null, max: 2, id: 'abv_non_alcoholic' },
                    { name: this.$t('weak'), min: 1, max: 18, id: 'abv_weak' },
                    { name: this.$t('medium'), min: 18, max: 28, id: 'abv_medium' },
                    { name: this.$t('strong'), min: 28, max: null, id: 'abv_strong' },
                ],
                tags: [],
                glasses: [],
                methods: [],
                main_ingredients: [],
            },
            per_page: 25,
            activeFilters: {
                on_shelf: false,
                favorites: false,
                is_public: false,
                user_id: false,
                tags: [],
                glasses: [],
                methods: [],
                ingredients: [],
                user_rating: null,
                abv: null
            }
        }
    },
    components: {
        CocktailGridItem,
        CocktailGridContainer,
        PageHeader,
        Checkbox,
        OverlayLoader,
        Refinement
    },
    watch: {
        activeFilters: {
            handler() {
                this.refreshRouteQuery()
            },
            deep: true
        },
        sort() {
            this.refreshRouteQuery()
        },
        sort_dir() {
            this.refreshRouteQuery()
        },
        per_page() {
            this.refreshRouteQuery()
        }
    },
    created() {
        document.title = `${this.$t('cocktails')} \u22C5 ${this.site_title}`
        this.fetchRefinements();

        this.$watch(
            () => this.$route.query,
            (newVal, oldVal) => {
                this.queryToState();
                if (JSON.stringify(newVal) != JSON.stringify(oldVal)) {
                    this.refreshCocktails(qs.parse(this.$route.query))
                }
            },
            { immediate: true }
        )
    },
    computed: {
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
                    value: r,
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

            ApiRequests.fetchIngredients({'filter[main_ingredients]': true}).then(data => {
                this.availableRefinements.main_ingredients = data
            })
        },
        refreshRouteQuery() {
            const query = this.stateToQuery();

            this.$router.push({
                query: query
            })
        },
        refreshCocktails(query = {}) {
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
        changePage(dir) {
            if (dir == 'prev') {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.refreshRouteQuery();
                }
            }

            if (dir == 'next') {
                if (this.currentPage < this.meta.last_page) {
                    this.currentPage++;
                    this.refreshRouteQuery();
                }
            }
        },
        queryToState() {
            const state = qs.parse(this.$route.query);

            if (state.filter) {
                this.activeFilters.tags = state.filter.tag_id ? state.filter.tag_id.split(',') : []
                this.activeFilters.methods = state.filter.cocktail_method_id ? state.filter.cocktail_method_id.split(',') : []
                this.activeFilters.glasses = state.filter.glass_id ? state.filter.glass_id.split(',') : []
                this.activeFilters.ingredients = state.filter.main_ingredient_id ? state.filter.main_ingredient_id.split(',') : []
                this.activeFilters.on_shelf = state.filter.on_shelf ? state.filter.on_shelf : null
                this.activeFilters.favorites = state.filter.favorites ? state.filter.favorites : null
                this.activeFilters.is_public = state.filter.is_public ? state.filter.is_public : null
                this.activeFilters.user_id = state.filter.user_id ? true : null
                this.activeFilters.user_rating = state.filter.user_rating_min ? state.filter.user_rating_min : null
                this.searchQuery = state.filter.name ? state.filter.name : null
            }

            if (state.per_page) {
                this.per_page = state.per_page
            }

            if (state.page) {
                this.currentPage = state.page
            }

            if (state.sort) {
                if (state.sort.startsWith('-')) {
                    this.sort_dir = '-';
                    this.sort = state.sort.substring(1)
                } else {
                    this.sort_dir = '';
                    this.sort = state.sort
                }
            }
        },
        stateToQuery() {
            const query = {
                per_page: this.per_page,
                page: this.currentPage,
                sort: (this.sort != null && this.sort != '') ? this.sort_dir + this.sort : null,
            };

            const filters = {
                name: (this.searchQuery != null && this.searchQuery != '') ? this.searchQuery : null,
                on_shelf: this.activeFilters.on_shelf,
                favorites: this.activeFilters.favorites,
                is_public: this.activeFilters.is_public,
                user_id: this.activeFilters.user_id ? Auth.getUser().id : null,
                user_rating_min: this.activeFilters.user_rating ? this.activeFilters.user_rating : null,
                tag_id: this.activeFilters.tags.length > 0 ? this.activeFilters.tags.join(',') : null,
                glass_id: this.activeFilters.glasses.length > 0 ? this.activeFilters.glasses.join(',') : null,
                cocktail_method_id: this.activeFilters.methods.length > 0 ? this.activeFilters.methods.join(',') : null,
                main_ingredient_id: this.activeFilters.ingredients.length > 0 ? this.activeFilters.ingredients.join(',') : null,
                abv_min: this.activeFilters.abv ? this.activeFilters.abv.min : null,
                abv_max: this.activeFilters.abv ? this.activeFilters.abv.max : null,
            };

            query.filter = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== null && v !== false));

            return query;
        },
        debounceQuery() {
            clearTimeout(this.queryTimer)

            this.queryTimer = setTimeout(() => {
                this.refreshRouteQuery()
            }, 300)
        },
        clearRefinements() {
            this.searchQuery = null
            this.sort = 'name'
            this.sort_dir = '',
            this.currentPage = 1,
            this.activeFilters = {
                on_shelf: false,
                favorites: false,
                is_public: false,
                user_id: false,
                tags: [],
                glasses: [],
                methods: [],
                ingredients: [],
                user_rating: null,
                abv: null
            };
        },
        handleClickAway(e) {
            if (e && e.target && e.target.classList.contains('resource-search__refinements')) {
                this.showRefinements = !this.showRefinements
            }
        }
    }
}
</script>
<style scoped>
.sm-show {
    display: none;
}

.resource-search {
    display: flex;
    gap: 1rem;
}

.resource-search__refinements {
    width: 300px;
}

.resource-search__content {
    width: 100%;
}

.resource-search__content__filter {
    display: flex;
    gap: 0.5rem;
}

.resource-search__content__filter .form-input {
    flex-basis: 100%;
}

@media (max-width: 850px) {
    .resource-search__content__filter {
        flex-wrap: wrap;
    }

    .resource-search__content__filter .form-input {
        flex-basis: auto;
    }
}

.resource-search__content__pagination {
    margin-top: 1rem;
    display: flex;
    align-items: center;
}

.resource-search__content__pagination__links {
    margin-left: auto;
}

@media (max-width: 750px) {
    .sm-show {
        display: block;
    }

    .resource-search__refinements {
        position: fixed;
        top: 0;
        left: 0;
        background-color: rgba(21, 13, 34, 0.5);
        width: 100%;
        z-index: 99;
        height: 100%;
    }

    .resource-search__refinements__body {
        background: #fff5f5;
        width: 80%;
        height: 100%;
        padding: 1.5rem;
        overflow-y: scroll;
    }
}
</style>
