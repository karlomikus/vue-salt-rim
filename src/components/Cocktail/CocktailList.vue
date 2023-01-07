<template>
    <PageHeader>
        Cocktails
        <template #actions>
            <RouterLink class="button button--outline" :to="{ name: 'cocktails.form' }">Add cocktail</RouterLink>
        </template>
    </PageHeader>
    <p class="page-description" style="margin-bottom: 20px;">
        This is a list of cocktails available in your Bar Assistant server. You can search for a specific cocktails by filtering them with the tags you added or by using a search term.
    </p>
    <ais-instant-search :search-client="searchClient" index-name="cocktails:name:asc" :routing="routing">
        <ais-configure :hitsPerPage="100" :stalledSearchDelay="200" :filters="filters" />
        <div class="cocktail-list-search-container">
            <ais-search-box placeholder="Type to filter cocktails..." :class-names="{ 'ais-SearchBox-input': 'form-input', 'ais-SearchBox-reset': 'cocktail-list-search-container__reset' }" />
            <ais-sort-by :items="[
                { value: 'cocktails', label: 'Relevency' },
                { value: 'cocktails:name:asc', label: 'Name asc.' },
                { value: 'cocktails:name:desc', label: 'Name desc.' },
                { value: 'cocktails:average_rating:asc', label: 'Rating asc.' },
                { value: 'cocktails:average_rating:desc', label: 'Rating desc.' },
                { value: 'cocktails:date:asc', label: 'Date modified asc.' },
                { value: 'cocktails:date:desc', label: 'Date modified desc.' },
            ]" :class-names="{ 'ais-SortBy-select': 'form-select' }" />
            <button type="button" class="button button--input" @click.prevent="toggleShow">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M6.17 18a3.001 3.001 0 0 1 5.66 0H22v2H11.83a3.001 3.001 0 0 1-5.66 0H2v-2h4.17zm6-7a3.001 3.001 0 0 1 5.66 0H22v2h-4.17a3.001 3.001 0 0 1-5.66 0H2v-2h10.17zm-6-7a3.001 3.001 0 0 1 5.66 0H22v2H11.83a3.001 3.001 0 0 1-5.66 0H2V4h4.17z" />
                </svg>
            </button>
        </div>
        <ais-current-refinements :transform-items="transformCurrentRefinements">
            <template v-slot="{ items, createURL }">
                <div class="cocktail-current-refinements">
                    <template v-for="item in items">
                        <div class="cocktail-current-refinements__refinement" v-for="refinement in item.refinements">
                            <a href="#" :href="createURL(refinement)" @click.prevent="item.refine(refinement)">
                                {{ handleRefinementTag(refinement) }} <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                                    <path fill="none" d="M0 0h24v24H0z" />
                                    <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" />
                                </svg>
                            </a>
                        </div>
                    </template>
                </div>
            </template>
        </ais-current-refinements>
        <div class="cocktail-list-filter-panel hidden">
            <h4>Cocktail filters:</h4>
            <div class="cocktail-list-filter-panel__toggle-refinements">
                <ais-toggle-refinement attribute="user_id" :on="userId">
                    <template v-slot="{ value, refine, createURL }">
                        <a :href="createURL(value)" class="tag tag--link" :class="{ 'tag--is-selected': value.isRefined }" @click.prevent="refine(value)">
                            My cocktails
                            ({{ value.count || 0 }})
                        </a>
                    </template>
                </ais-toggle-refinement>
                <a v-for="(customFilter, index) in filtersConfig" href="#" class="tag tag--link" :class="{ 'tag--is-selected': customFilter.isActive }" @click.prevent="toggleArrayFiltersConfig(index)">
                    {{ customFilter.label }} ({{ customFilter.values.length }})
                </a>
            </div>
            <h4>Filter by tags:</h4>
            <ais-refinement-list attribute="tags" :sort-by="['name:asc']" :limit="30" operator="and">
                <template v-slot:item="{ item, refine, createURL }">
                    <a :href="createURL(item.value)" class="tag tag--link" :class="{ 'tag--is-selected': item.isRefined }" @click.prevent="refine(item.value)">
                        {{ item.label }} ({{ item.count }})
                    </a>
                </template>
            </ais-refinement-list>
            <h4>Filter by glass type:</h4>
            <ais-refinement-list attribute="glass" :sort-by="['name:asc']" :limit="30" operator="or">
                <template v-slot:item="{ item, refine, createURL }">
                    <a :href="createURL(item.value)" class="tag tag--link" :class="{ 'tag--is-selected': item.isRefined }" @click.prevent="refine(item.value)">
                        {{ item.label }} ({{ item.count }})
                    </a>
                </template>
            </ais-refinement-list>
            <h4>Rating</h4>
            <ais-rating-menu attribute="average_rating">
                <template v-slot="{ items, refine, createURL }">
                    <a v-for="item in items" :key="item.value" :href="createURL(item.value)" class="tag tag--link" :class="{ 'tag--is-selected': item.isRefined }" @click.prevent="refine(item.value)">
                        <span v-for="(full, index) in item.stars" :key="index">
                            {{ full? '★': '☆' }}
                        </span>
                        & up ({{ item.count }})
                    </a>
                </template>
            </ais-rating-menu>
        </div>
        <ais-infinite-hits>
            <template v-slot="{ items, refineNext, isLastPage }">
                <CocktailGridContainer v-slot="observer">
                    <CocktailGridItem v-for="(cocktail, i) in items" :cocktail="cocktail" :key="cocktail.id" :observer="observer" />
                </CocktailGridContainer>
                <div style="text-align: center; margin: 20px 0;">
                    <button class="button button--dark" v-if="!isLastPage" @click="refineNext">
                        Show more results
                    </button>
                </div>
            </template>
        </ais-infinite-hits>
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
                            my_cocktails: indexUiState.toggle && indexUiState.toggle.user_id != null,
                            avg_rating: indexUiState.ratingMenu && indexUiState.ratingMenu.average_rating
                        }
                    },
                    routeToState(routeState) {
                        return {
                            ['cocktails:name:asc']: {
                                query: routeState.q,
                                refinementList: {
                                    tags: routeState.tags,
                                    glass: routeState.glass,
                                },
                                ratingMenu: {
                                    average_rating: routeState.avg_rating
                                },
                                toggle: {
                                    user_id: routeState.my_cocktails
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
                    isActive: false,
                    label: "Cocktails I can make",
                    values: []
                },
                favorites: {
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

        this.setupFilters()
    },
    computed: {
        filters() {
            const activeFilters = Object.values(this.filtersConfig).filter(c => c.isActive);

            if (activeFilters.length == 0) {
                return '';
            }

            const values = activeFilters.map(filter => filter.values).reduce((arr1, arr2) => [...arr1, ...arr2])

            return `id IN [${values.join(', ')}]`;
        }
    },
    methods: {
        toggleShow() {
            // Instantsearch has some weird issues with refinements if using v-show
            document.querySelector('.cocktail-list-filter-panel').classList.toggle('hidden')
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
        handleRefinementTag(ref) {
            if (ref.attribute == 'user_id') {
                return `My cocktails`;
            }

            return `${ref.attribute.toUpperCase()}: ${ref.label}`;
        }
    }
}
</script>

<style scope>
.cocktail-list-filter-panel {
    padding: 20px;
    background-color: rgba(255, 255, 255, .5);
    margin-top: 10px;
    margin-bottom: 10px;
    border-radius: 10px;
    box-shadow: 0 3px 0 var(--clr-red-300);
}

.cocktail-list-filter-panel h4 {
    font-size: 0.9rem;
    font-weight: bold;
    margin-bottom: 6px;
}

.cocktail-list-filter-panel .ais-RefinementList-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 15px;
}

.cocktail-list-filter-panel .cocktail-list-filter-panel__toggle-refinements {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 10px;
}

.cocktail-list-search-container {
    display: flex;
    margin-top: 20px;
    gap: 10px;
    align-items: flex-end;
    flex-wrap: wrap;
}

.cocktail-list-search-container .ais-SearchBox {
    flex-grow: 3;
    flex-basis: 400px;
}

.cocktail-list-search-container .ais-SortBy {
    flex-grow: 1;
    flex-basis: 200px;
}

.cocktail-list-search-container .ais-SearchBox-submit {
    display: none;
}

.cocktail-list-search-container__reset {
    background: none;
    border: 0;
    padding: 0;
    margin: 0;
    position: absolute;
    top: 9px;
    right: 5px;
    cursor: pointer;
    width: 30px;
    height: 30px;
}

.cocktail-current-refinements {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 8px;
}

.cocktail-current-refinements__refinement a {
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--clr-gray-800);
    color: #fff;
    padding: 2px 10px;
    font-size: 0.7rem;
    border-radius: 20px;
    text-decoration: none;
}

.cocktail-current-refinements__refinement a svg {
    fill: #fff;
}

.cocktail-current-refinements__refinement a:hover,
.cocktail-current-refinements__refinement a:active,
.cocktail-current-refinements__refinement a:focus {
    background: var(--clr-red-800);
}

.cocktail-list-filter-panel .ais-RatingMenu {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 15px;
}

.hidden {
    visibility: hidden;
    display: none;
}
</style>
