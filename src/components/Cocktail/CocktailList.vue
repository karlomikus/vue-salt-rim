<template>
    <PageHeader>
        Cocktails
        <template #actions>
            <RouterLink class="button button--outline" :to="{ name: 'cocktails.scrape' }">Add cocktail from URL</RouterLink>
            <RouterLink class="button button--dark" :to="{ name: 'cocktails.form' }">Add cocktail</RouterLink>
        </template>
    </PageHeader>
    <p class="page-description" style="margin-bottom: 20px;">
        This is a list of cocktails available in your Bar Assistant server. You can search for a specific cocktails by filtering them with the tags you added or by using a search term.
    </p>
    <ais-instant-search :search-client="searchClient" index-name="cocktails:name:asc" :routing="routing">
        <ais-configure :hitsPerPage="100" :stalledSearchDelay="200" :filters="filters" />
        <div class="inpage-search inpage-search--hide-filters">
            <div class="inpage-search__filter">
                <div class="inpage-search__filter__body">
                    <h3>Filters</h3>
                    <button class="button button--dark button--small inpage-search__filter__close" @click.prevent="toggleShow">X</button>
                    <ais-clear-refinements />
                    <h4>Sort:</h4>
                    <ais-sort-by :items="[
                        { value: 'cocktails', label: 'Relevency' },
                        { value: 'cocktails:name:asc', label: 'Name asc.' },
                        { value: 'cocktails:name:desc', label: 'Name desc.' },
                        { value: 'cocktails:average_rating:asc', label: 'Rating asc.' },
                        { value: 'cocktails:average_rating:desc', label: 'Rating desc.' },
                        { value: 'cocktails:date:asc', label: 'Date modified asc.' },
                        { value: 'cocktails:date:desc', label: 'Date modified desc.' },
                    ]" :class-names="{ 'ais-SortBy-select': 'form-select' }" />
                    <h4>Cocktail filters:</h4>
                    <ais-toggle-refinement label="My cocktails" attribute="user_id" :on="userId">
                        <template v-slot="{ value, refine, createURL, sendEvent }">
                            <div class="ais-ToggleRefinement">
                                <label class="ais-ToggleRefinement-label">
                                    <span class="ais-ToggleRefinement-labelText">My cocktails</span>
                                    <span class="ais-ToggleRefinement-count">{{ value.count ?? 0 }}</span>
                                    <input class="ais-ToggleRefinement-checkbox" type="checkbox" @change.prevent="refine(value)" />
                                </label>
                            </div>
                        </template>
                    </ais-toggle-refinement>
                    <ais-panel>
                        <div class="ais-ToggleRefinement" v-for="(customFilter, index) in filtersConfig">
                            <label class="ais-ToggleRefinement-label">
                                <span class="ais-ToggleRefinement-labelText">{{ customFilter.label }}</span>
                                <span class="ais-ToggleRefinement-count">{{ customFilter.values.length }}</span>
                                <input class="ais-ToggleRefinement-checkbox" type="checkbox" :checked="filtersConfig[index].isActive" @change.prevent="toggleArrayFiltersConfig(index)" />
                            </label>
                        </div>
                    </ais-panel>
                    <h4>Main ingredient:</h4>
                    <ais-refinement-list attribute="main_ingredient_name" :sort-by="['name:asc']" :limit="10" :show-more-limit="50" show-more />
                    <h4>Method:</h4>
                    <ais-refinement-list attribute="method" :sort-by="['name:asc']" />
                    <h4>Strength:</h4>
                    <ais-numeric-menu attribute="calculated_abv" :items="[
                        { label: 'All' },
                        { label: 'Non alcoholic', start: 0, end: 0 },
                        { label: 'Weak', start: 1, end: 18 },
                        { label: 'Medium', start: 18, end: 28 },
                        { label: 'Strong', start: 28 },
                    ]" />
                    <h4>Tags:</h4>
                    <ais-refinement-list attribute="tags" :sort-by="['name:asc']" :limit="10" operator="and" :show-more-limit="50" show-more />
                    <h4>Glass type:</h4>
                    <ais-refinement-list attribute="glass" :sort-by="['name:asc']" :limit="10" :show-more-limit="50" show-more />
                    <h4>Rating:</h4>
                    <ais-rating-menu attribute="average_rating" />
                    <!-- <button class="button button--dark button--small" @click.prevent="toggleShow">Apply filters</button> -->
                </div>
            </div>
            <div class="inpage-search__results">
                <div class="inpage-search__searchbox">
                    <button type="button" class="button button--input" @click.prevent="toggleShow">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M6.17 18a3.001 3.001 0 0 1 5.66 0H22v2H11.83a3.001 3.001 0 0 1-5.66 0H2v-2h4.17zm6-7a3.001 3.001 0 0 1 5.66 0H22v2h-4.17a3.001 3.001 0 0 1-5.66 0H2v-2h10.17zm-6-7a3.001 3.001 0 0 1 5.66 0H22v2H11.83a3.001 3.001 0 0 1-5.66 0H2V4h4.17z" />
                        </svg>
                    </button>
                    <ais-search-box placeholder="Type to filter cocktails..." />
                </div>
                <ais-current-refinements :transform-items="transformCurrentRefinements" />
                <ais-infinite-hits>
                    <template v-slot="{ items, refineNext, isLastPage }">
                        <CocktailGridContainer v-slot="observer">
                            <CocktailGridItem v-for="(cocktail, i) in items" :cocktail="cocktail" :key="cocktail.id" :observer="observer" />
                        </CocktailGridContainer>
                        <div style="text-align: center; margin: 20px 0;" v-if="!isLastPage">
                            <button class="button button--dark" @click="refineNext">
                                Show more results
                            </button>
                        </div>
                    </template>
                </ais-infinite-hits>
            </div>
        </div>
    </ais-instant-search>
</template>

<script>
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import { history as historyRouter } from 'instantsearch.js/es/lib/routers';
import Auth from '@/Auth.js';
import ApiRequests from '@/ApiRequests.js'
import CocktailGridItem from './CocktailGridItem.vue'
import CocktailGridContainer from './CocktailGridContainer.vue'
import PageHeader from '@/components/PageHeader.vue'

export default {
    data() {
        return {
            searchClient: instantMeiliSearch(
                Auth.getUserSearchSettings().host,
                Auth.getUserSearchSettings().key,
                {
                    keepZeroFacets: true
                }
            ),
            routing: {
                router: historyRouter(),
                stateMapping: {
                    stateToRoute(uiState) {
                        const indexUiState = uiState['cocktails:name:asc'];

                        return {
                            q: indexUiState.query,
                            tags: indexUiState.refinementList && indexUiState.refinementList.tags,
                            glass: indexUiState.refinementList && indexUiState.refinementList.glass,
                            method: indexUiState.refinementList && indexUiState.refinementList.method,
                            ingredient: indexUiState.refinementList && indexUiState.refinementList.main_ingredient_name,
                            strength: indexUiState.numericMenu && indexUiState.numericMenu.calculated_abv,
                            my_cocktails: indexUiState.toggle && indexUiState.toggle.user_id != null,
                            avg_rating: indexUiState.ratingMenu && indexUiState.ratingMenu.average_rating,
                            sort: indexUiState.sortBy,
                        }
                    },
                    routeToState(routeState) {
                        return {
                            ['cocktails:name:asc']: {
                                query: routeState.q,
                                sortBy: routeState.sort,
                                bar_favorites: routeState.favorites,
                                bar_shelf: routeState.shelf,
                                refinementList: {
                                    tags: routeState.tags,
                                    glass: routeState.glass,
                                    main_ingredient_name: routeState.ingredient,
                                    method: routeState.method,
                                },
                                ratingMenu: {
                                    average_rating: routeState.avg_rating
                                },
                                toggle: {
                                    user_id: routeState.my_cocktails
                                },
                                numericMenu: {
                                    calculated_abv: routeState.strength
                                }
                            }
                        }
                    }
                }
            },
            userId: Auth.getUser().id,
            showFilterContainer: false,
            filtersConfig: {
                shelf: {
                    attribute: 'shelf',
                    isActive: false,
                    label: "Cocktails I can make",
                    values: []
                },
                favorites: {
                    attribute: 'favorites',
                    isActive: false,
                    label: "My favorites",
                    values: []
                },
            },
        };
    },
    components: {
        CocktailGridItem,
        CocktailGridContainer,
        PageHeader
    },
    created() {
        document.title = `Cocktails \u22C5 Salt Rim`

        if (this.$route.query.favorites) {
            this.toggleArrayFiltersConfig('favorites');
        }

        if (this.$route.query.shelf) {
            this.toggleArrayFiltersConfig('shelf');
        }

        this.setupFilters()
    },
    computed: {
        filters() {
            const activeFilters = this.activeFilters;

            if (activeFilters.length == 0) {
                return '';
            }

            const values = activeFilters.map(filter => filter.values).reduce((arr1, arr2) => [...arr1, ...arr2])

            return `id IN [${values.join(', ')}]`;
        },
        activeFilters() {
            return Object.values(this.filtersConfig).filter(c => c.isActive);
        }
    },
    methods: {
        toggleShow() {
            // Instantsearch has some weird issues with refinements if using v-show
            document.querySelector('.inpage-search').classList.toggle('inpage-search--hide-filters')
        },
        setupFilters() {
            ApiRequests.fetchShelfCocktails(true).then(data => {
                this.filtersConfig.shelf.values = data;
            });

            this.filtersConfig.favorites.values = Auth.getUser().favorite_cocktails;
        },
        toggleArrayFiltersConfig(key) {
            this.filtersConfig[key].isActive = !this.filtersConfig[key].isActive
        },
        transformCurrentRefinements(items) {
            const labelMap = {
                'main_ingredient_name': 'Main ingredient',
                'method': 'Method',
                'tags': 'Tags',
                'user_id': 'My cocktails',
                'calculated_abv': 'Strength (ABV)',
                'glass': 'Glass type',
            };

            items.map(item => {
                if (labelMap[item.label]) {
                    item.label = labelMap[item.label]
                }
            });

            if (this.activeFilters.length > 0) {
                let customRefinement = {
                    attribute: null,
                    label: 'Cocktail filters',
                    refinements: [],
                    refine: (refinement) => {
                        this.toggleArrayFiltersConfig(refinement.value)
                    }
                };

                this.activeFilters.forEach(filter => {
                    customRefinement.refinements.push({
                        label: filter.label,
                        value: filter.attribute
                    })
                })

                items.push(customRefinement);
            }

            return items;
        }
    }
}
</script>

<style scoped>
</style>
