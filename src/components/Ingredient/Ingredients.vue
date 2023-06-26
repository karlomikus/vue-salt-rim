<template>
    <PageHeader>
        {{ $t('ingredients') }}
        <template #actions>
            <RouterLink class="button button--dark" :to="{ name: 'ingredients.form' }">{{ $t('ingredient.add') }}</RouterLink>
        </template>
    </PageHeader>
    <p class="page-description">{{ $t('ingredients.page.description') }}</p>
    <ais-instant-search :search-client="searchClient" index-name="ingredients:name:asc" :routing="routing">
        <ais-configure :hitsPerPage="60" :stalledSearchDelay="200" :filters="filterQuery" />
        <div class="inpage-search inpage-search--hide-filters">
            <div class="inpage-search__filter">
                <div class="inpage-search__filter__body">
                    <div class="inpage-search__filter__mobile-header">
                        <h3>{{ $t('filters') }}</h3>
                        <button class="button button--dark button--small inpage-search__filter__close" @click.prevent="toggleFiltersShown">X</button>
                    </div>
                    <ais-panel>
                        <div class="ais-ToggleRefinement" v-for="(customFilter, index) in filtersConfig">
                            <label class="ais-ToggleRefinement-label">
                                <span class="ais-ToggleRefinement-labelText">{{ customFilter.label }}</span>
                                <span class="ais-ToggleRefinement-count">{{ customFilter.values.length }}</span>
                                <input class="ais-ToggleRefinement-checkbox" type="checkbox" :checked="filtersConfig[index].isActive" @change.prevent="toggleArrayFiltersConfig(index)" />
                            </label>
                        </div>
                    </ais-panel>
                    <h4>{{ $t('sort') }}</h4>
                    <ais-sort-by :items="[
                        { value: 'ingredients', label: $t('sort.relevancy') },
                        { value: 'ingredients:name:asc', label: $t('sort.name-asc') },
                        { value: 'ingredients:name:desc', label: $t('sort.name-desc') },
                    ]" :class-names="{ 'ais-SortBy-select': 'ais-SortBy-select form-select' }" />
                    <h4>{{ $t('category') }}</h4>
                    <ais-refinement-list attribute="category" :sort-by="['name']" :limit="20" :show-more-limit="50" show-more>
                        <template v-slot:showMoreLabel="{ isShowingMore }">
                            {{ !isShowingMore ? $t('show-more') : $t('show-less') }}
                        </template>
                    </ais-refinement-list>
                    <h4>{{ $t('ABV') }}</h4>
                    <ais-numeric-menu attribute="strength_abv" :items="[
                        { label: $t('all') },
                        { label: $t('non-alcoholic'), start: 0, end: 0 },
                        { label: '<= 20%', start: 1, end: 20 },
                        { label: '20% - 40%', start: 20, end: 40 },
                        { label: '>= 40', start: 40 },
                    ]" />
                    <h4>{{ $t('origin') }}</h4>
                    <ais-refinement-list attribute="origin" :sort-by="['name']" :limit="10" :show-more-limit="50" show-more>
                        <template v-slot:showMoreLabel="{ isShowingMore }">
                            {{ !isShowingMore ? $t('show-more') : $t('show-less') }}
                        </template>
                    </ais-refinement-list>
                    <div class="inpage-search__filter__body__actions">
                        <ais-clear-refinements>
                            <template #default="{ canRefine, refine }">
                                <button type="reset" class="button button--outline" @click.prevent="refine" :disabled="!canRefine">
                                    {{ $t('clear-filters') }}
                                </button>
                            </template>
                        </ais-clear-refinements>
                        <button class="button button--dark" @click.prevent="toggleFiltersShown">{{ $t('apply-filters') }}</button>
                    </div>
                </div>
            </div>
            <div class="inpage-search__results">
                <div class="inpage-search__searchbox">
                    <button type="button" class="button button--input" @click.prevent="toggleFiltersShown">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M6.17 18a3.001 3.001 0 0 1 5.66 0H22v2H11.83a3.001 3.001 0 0 1-5.66 0H2v-2h4.17zm6-7a3.001 3.001 0 0 1 5.66 0H22v2h-4.17a3.001 3.001 0 0 1-5.66 0H2v-2h10.17zm-6-7a3.001 3.001 0 0 1 5.66 0H22v2H11.83a3.001 3.001 0 0 1-5.66 0H2V4h4.17z" />
                        </svg>
                    </button>
                    <ais-search-box :placeholder="$t('placeholder.search-ingredients')" :class-names="{'ais-SearchBox-input': 'ais-SearchBox-input form-input form-input--red'}" />
                </div>
                <ais-current-refinements :transform-items="transformCurrentRefinements" />
                <ais-infinite-hits>
                    <template v-slot="{ items, refineNext, isLastPage }">
                        <IngredientGridContainer style="margin-top: 1rem;">
                            <IngredientGridItem v-for="ingredient in items" :ingredient="ingredient" :user-ingredients="userIngredientIds" :shopping-list="shoppingListIds" :key="ingredient.id" />
                        </IngredientGridContainer>
                        <div style="text-align: center; margin: 20px 0;">
                            <button class="button button--dark" v-if="!isLastPage" @click="refineNext">
                                {{ $t('show-more') }}
                            </button>
                        </div>
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
import qs from 'qs';

export default {
    data() {
        const vueRouter = this.$router
        return {
            searchClient: instantMeiliSearch(
                Auth.getUserSearchSettings().host,
                Auth.getUserSearchSettings().key,
                {
                    keepZeroFacets: true,
                    paginationTotalHits: 2000
                }
            ),
            routing: {
                router: historyRouter({
                    push(url) {
                        vueRouter.push({
                            query: qs.parse((new URL(url)).searchParams.toString())
                        })
                    }
                }),
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
            userIngredients: [],
            loadingIngredients: [],
            filtersConfig: {
                shelf: {
                    attribute: 'shelf',
                    isActive: false,
                    label: this.$t('shelf-ingredients'),
                    values: []
                },
                shoppingList: {
                    attribute: 'shopping-list',
                    isActive: false,
                    label: this.$t('shopping-list-ingredients'),
                    values: []
                },
            },
        }
    },
    components: {
        IngredientGridItem,
        IngredientGridContainer,
        PageHeader
    },
    created() {
        document.title = `${this.$t('ingredients')} \u22C5 Salt Rim`

        ApiRequests.fetchMyShelf().then(data => {
            this.userIngredients = data

            this.filtersConfig.shelf.values = this.userIngredientIds;
        });

        this.filtersConfig.shoppingList.values = this.shoppingListIds;
    },
    computed: {
        userIngredientIds() {
            return this.userIngredients.map(ui => ui.ingredient_id)
        },
        shoppingListIds() {
            return Auth.getUser().shopping_lists;
        },
        filterQuery() {
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
        toggleArrayFiltersConfig(key) {
            this.filtersConfig[key].isActive = !this.filtersConfig[key].isActive
        },
        toggleFiltersShown() {
            document.querySelector('.inpage-search').classList.toggle('inpage-search--hide-filters')
        },
        transformCurrentRefinements(items) {
            const labelMap = {
                'category': this.$t('category'),
                'strength_abv': this.$t('ABV'),
                'origin': this.$t('origin'),
            };

            items.map(item => {
                if (labelMap[item.label]) {
                    item.label = labelMap[item.label]
                }
            });

            return items;
        }
    }
}
</script>

<style scoped>

</style>
