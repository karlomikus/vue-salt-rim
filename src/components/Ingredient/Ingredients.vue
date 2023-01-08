<template>
    <PageHeader>
        Ingredients
        <template #actions>
            <RouterLink class="button button--outline" :to="{ name: 'ingredients.form' }">Add ingredient</RouterLink>
        </template>
    </PageHeader>
    <p class="page-description">
        This is a list of ingredients available in your Bar Assistant server. You can add specific ingredients to your shelf and this will update what cocktails you can make.
        You can also add ingredient to your shopping list.
    </p>
    <ais-instant-search :search-client="searchClient" index-name="ingredients:name:asc" :routing="routing">
        <ais-configure :hitsPerPage="60" :stalledSearchDelay="200" />
        <div class="inpage-search" :class="{'inpage-search--hide-filters': !showFilters}">
            <div class="inpage-search__filter" v-show="showFilters">
                <h3>Filters</h3>
                <button class="inpage-search__filter__close">Close</button>
                <h4>Sort:</h4>
                <ais-sort-by :items="[
                    { value: 'ingredients', label: 'Relevancy' },
                    { value: 'ingredients:name:asc', label: 'Name asc.' },
                    { value: 'ingredients:name:desc', label: 'Name desc.' },
                ]" :class-names="{ 'ais-SortBy-select': 'form-select' }" />
                <h4>Category:</h4>
                <ais-refinement-list attribute="category" :sort-by="['name']" :limit="20" :show-more-limit="50" :class-names="{
                    'ais-RefinementList-showMore': 'button button--outline button--small'
                }" show-more></ais-refinement-list>
                <h4>ABV:</h4>
                <ais-numeric-menu attribute="strength_abv" :items="[
                    { label: 'All' },
                    { label: 'Not Alcoholic', start: 0, end: 0 },
                    { label: '<= 20%', start: 1, end: 20 },
                    { label: '20% - 40%', start: 20, end: 40 },
                    { label: '>= 40', start: 40 },
                ]" />
                <h4>Origin:</h4>
                <ais-refinement-list attribute="origin" :sort-by="['name']" :limit="10" :show-more-limit="50" :class-names="{
                    'ais-RefinementList-showMore': 'button button--outline button--small'
                }" show-more></ais-refinement-list>
            </div>
            <div class="inpage-search__results">
                <div class="inpage-search__searchbox">
                    <button type="button" class="button button--input" @click.prevent="showFilters = !showFilters">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M6.17 18a3.001 3.001 0 0 1 5.66 0H22v2H11.83a3.001 3.001 0 0 1-5.66 0H2v-2h4.17zm6-7a3.001 3.001 0 0 1 5.66 0H22v2h-4.17a3.001 3.001 0 0 1-5.66 0H2v-2h10.17zm-6-7a3.001 3.001 0 0 1 5.66 0H22v2H11.83a3.001 3.001 0 0 1-5.66 0H2V4h4.17z" />
                        </svg>
                    </button>
                    <ais-search-box placeholder="Search for ingredients..." :class-names="{ 'ais-SearchBox-input': 'form-input', 'ais-SearchBox-reset': 'cocktail-list-search-container__reset' }" />
                </div>
                <ais-infinite-hits>
                    <template v-slot="{ items, refineNext, isLastPage }">
                        <IngredientGridContainer>
                            <IngredientGridItem v-for="ingredient in items" :ingredient="ingredient" :user-ingredients="userIngredientIds" :shopping-list="shoppingListIds" :key="ingredient.id" />
                        </IngredientGridContainer>
                    </template>
                </ais-infinite-hits>
            </div>
        </div>
    </ais-instant-search>
</template>

<script>
import { history as historyRouter } from 'instantsearch.js/es/lib/routers';
import ApiRequests from '@/ApiRequests';
import PageHeader from '@/components/PageHeader.vue'
import IngredientGridContainer from '@/components/Ingredient/IngredientGridContainer.vue'
import IngredientGridItem from '@/components/Ingredient/IngredientGridItem.vue'
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import Auth from '@/Auth.js';

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
                        const indexUiState = uiState['ingredients:name:asc'];

                        return {
                            q: indexUiState.query,
                            category: indexUiState.refinementList && indexUiState.refinementList.category,
                            origin: indexUiState.refinementList && indexUiState.refinementList.origin,
                            abv: indexUiState.numericMenu && indexUiState.numericMenu.strength_abv,
                            sort: indexUiState.sortBy
                        }
                    },
                    routeToState(routeState) {
                        return {
                            ['ingredients:name:asc']: {
                                query: routeState.q,
                                sortBy: routeState.sort,
                                refinementList: {
                                    category: routeState.category,
                                    origin: routeState.origin,
                                },
                                numericMenu: {
                                    strength_abv: routeState.abv
                                }
                            }
                        }
                    }
                }
            },
            showFilters: true,
            ingredients: [],
            userIngredients: [],
            loadingIngredients: []
        }
    },
    components: {
        IngredientGridItem,
        IngredientGridContainer,
        PageHeader
    },
    created() {
        document.title = `Ingredients \u22C5 Salt Rim`

        ApiRequests.fetchIngredients().then(data => {
            this.ingredients = data
        });

        ApiRequests.fetchMyShelf().then(data => {
            this.userIngredients = data
        });
    },
    computed: {
        userIngredientIds() {
            return this.userIngredients.map(ui => ui.ingredient_id)
        },
        shoppingListIds() {
            return Auth.getUser().shopping_lists;
        }
    },
    methods: {
        setupColor(hex) {
            var c;
            if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
                c = hex.substring(1).split('');
                if (c.length == 3) {
                    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
                }
                c = '0x' + c.join('');
                return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',.13)';
            }

            return hex;
        },
        getImageUrl(ing) {
            if (!ing.main_image_id) {
                return '/no-ingredient.png';
            }

            return ing.images.filter((img) => img.id == ing.main_image_id)[0].url;
        }
    }
}
</script>

<style scoped>
.inpage-search {
    display: grid;
    grid-template-columns: 1fr 4fr;
    gap: 20px;
    margin-top: 1rem;
}

.inpage-search.inpage-search--hide-filters {
    grid-template-columns: 1fr;
}

.inpage-search__filter h4 {
    font-weight: var(--fw-bold);
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 0.715rem;
    margin-bottom: 0.5rem;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 3px double var(--clr-red-300);
}

.inpage-search__filter__close,.inpage-search__filter h3 {
    display: none;
}

.ais-RefinementList, .ais-NumericMenu {
    margin-bottom: 0.5rem;
}

:deep(.ais-RefinementList-list),
:deep(.ais-NumericMenu-list) {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
}

:deep(.ais-RefinementList-label),
:deep(.ais-NumericMenu-label) {
    display: flex;
    gap: 0.215rem;
}

:deep(.ais-RefinementList-count) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: var(--clr-red-300);
    padding: 1px 6px;
    border-radius: 2px;
    font-size: 0.8rem;
    margin-left: auto;
}

:deep(.ais-RefinementList-item:hover) {
    color: var(--clr-gray-900);
}

:deep(.ais-RefinementList-item:hover .ais-RefinementList-count) {
    background-color: var(--clr-red-400);
}

.inpage-search__searchbox {
    margin-bottom: 1rem;
    gap: 10px;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
}

.inpage-search__searchbox .ais-SearchBox {
    flex-grow: 3;
    flex-basis: 400px;
}

:deep(.inpage-search__searchbox .ais-SearchBox-reset),
:deep(.inpage-search__searchbox .ais-SearchBox-submit) {
    display: none;
}

@media (max-width: 750px) {
    .inpage-search {
        grid-template-columns: 1fr;
    }

    .inpage-search__filter {
        position: fixed;
        display: none;
        top: 0;
        left: 0;
        background: #fff5f5;
        width: 85%;
        z-index: 99;
        height: 100%;
        padding: 1.5rem;
        overflow: scroll;
    }

    .inpage-search__filter h3 {
        display: block;
        font-family: var(--font-heading);
        font-weight: var(--fw-bold);
        font-size: 1.3rem;
    }

    .inpage-search__filter__close {
        display: inline-block;
    }
}
</style>
