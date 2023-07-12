<template>
    <PageHeader>
        [SERVER] {{ $t('cocktails') }}
    </PageHeader>
    <div class="cocktails-search-wrapper">
        <OverlayLoader v-if="isLoading" />
        <div class="cocktails-search">
            <div class="cocktails-search__refinements" v-show="showRefinements">
                <h3 class="page-subtitle" style="margin-top: 0">{{ $t('filters') }}</h3>
                <Refinement :title="$t('global')" id="global">
                    <div class="cocktails-search__refinements__refinement__item" v-for="filter in availableRefinements.global">
                        <input type="checkbox" :id="'global-' + filter.id" :value="filter.active" v-model="filters[filter.id]">
                        <label :for="'global-' + filter.id">{{ filter.name }}</label>
                    </div>
                </Refinement>
                <Refinement :title="$t('method')" :refinements="refineMethods" id="method" v-model="filters.methods"></Refinement>
                <Refinement :title="$t('strength')" :refinements="refineABV" id="abv" v-model="filters.abv" type="radio"></Refinement>
                <Refinement :title="$t('tags')" :refinements="refineTags" id="tag" v-model="filters.tags"></Refinement>
                <Refinement :title="$t('glass-type')" :refinements="refineGlasses" id="glass" v-model="filters.glasses"></Refinement>
                <Refinement :title="$t('rating')" :refinements="refineRatings" id="user-rating" v-model="filters.user_rating"></Refinement>
            </div>
            <div class="cocktails-search__content">
                <div class="cocktails-search__content__filter">
                    <button type="button" class="button button--input" @click.prevent="showRefinements = !showRefinements">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M6.17 18a3.001 3.001 0 0 1 5.66 0H22v2H11.83a3.001 3.001 0 0 1-5.66 0H2v-2h4.17zm6-7a3.001 3.001 0 0 1 5.66 0H22v2h-4.17a3.001 3.001 0 0 1-5.66 0H2v-2h10.17zm-6-7a3.001 3.001 0 0 1 5.66 0H22v2H11.83a3.001 3.001 0 0 1-5.66 0H2V4h4.17z" />
                        </svg>
                    </button>
                    <input class="form-input" type="text" :placeholder="$t('placeholder.search-cocktails')" v-model="searchQuery" style="flex-basis: 100%;" @input="debounceQuery">
                    <select class="form-select" v-model="sort">
                        <option value="name">{{ $t('name') }}</option>
                        <option value="created_at">Date added</option>
                        <option value="favorited_at">Date favorited</option>
                        <option value="average_rating">Average rating</option>
                        <option value="missing_ingredients">Missing ingredients</option>
                        <option value="user_rating">User rating</option>
                        <option value="abv">ABV</option>
                    </select>
                    <select class="form-select" v-model="sort_dir">
                        <option value="">Ascending</option>
                        <option value="-">Descending</option>
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
                <div class="cocktails-search__content__pagination">
                    <div class="cocktails-search__content__pagination__page_info">
                        Showing {{ meta.to || 0 }}/{{ meta.total }} results
                    </div>
                    <div class="cocktails-search__content__pagination__links">
                        <button type="button" class="button button--outline" @click="changePage('prev')">Prev</button> Page {{ meta.current_page }}/{{ meta.last_page }} <button type="button" class="button button--outline" @click="changePage('next')">Next</button>
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
            },
            per_page: 25,
            filters: {
                global: [],
                on_shelf: false,
                favorites: false,
                is_public: false,
                user_id: false,
                tags: [],
                glasses: [],
                methods: [],
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
        filters: {
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
                this.filters.tags = state.filter.tag_id ? state.filter.tag_id.split(',') : []
                this.filters.methods = state.filter.cocktail_method_id ? state.filter.cocktail_method_id.split(',') : []
                this.filters.glasses = state.filter.glass_id ? state.filter.glass_id.split(',') : []
                this.filters.on_shelf = state.filter.on_shelf ? state.filter.on_shelf : null
                this.filters.favorites = state.filter.favorites ? state.filter.favorites : null
                this.filters.is_public = state.filter.is_public ? state.filter.is_public : null
                this.filters.user_id = state.filter.user_id ? true : null
                this.filters.user_rating = state.filter.user_rating_min ? state.filter.user_rating_min : null
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
                on_shelf: this.filters.on_shelf,
                favorites: this.filters.favorites,
                is_public: this.filters.is_public,
                user_id: this.filters.user_id ? Auth.getUser().id : null,
                user_rating_min: this.filters.user_rating ? this.filters.user_rating : null,
                tag_id: this.filters.tags.length > 0 ? this.filters.tags.join(',') : null,
                glass_id: this.filters.glasses.length > 0 ? this.filters.glasses.join(',') : null,
                cocktail_method_id: this.filters.methods.length > 0 ? this.filters.methods.join(',') : null,
                abv_min: this.filters.abv ? this.filters.abv.min : null,
                abv_max: this.filters.abv ? this.filters.abv.max : null,
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
            this.filters = {
                on_shelf: false,
                favorites: false,
                is_public: false,
                user: false,
                tags: [],
                glasses: [],
                methods: [],
                user_rating: null,
                abv: null
            };
        }
    }
}
</script>
<style scoped>
.cocktails-search {
    display: flex;
    gap: 1rem;
}

.cocktails-search__refinements {
    width: 300px;
}

.cocktails-search__content {
    width: 100%;
}

.cocktails-search__content__filter {
    display: flex;
    gap: 0.5rem;
}

.cocktails-search__content__pagination {
    margin-top: 1rem;
    display: flex;
    align-items: center;
}

.cocktails-search__content__pagination__links {
    margin-left: auto;
}
</style>
