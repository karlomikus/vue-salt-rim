<template>
    <div style="text-align: right;">
        <RouterLink class="button button--outline" :to="{ name: 'cocktails.form' }">Add cocktail</RouterLink>
    </div>
    <h2 class="page-subtitle" style="margin-top: 10px;">Cocktails</h2>
    <p class="page-description" style="margin-bottom: 20px;">
        This is a list of cocktails available in your Bar Assistant server. You can search for a specific cocktails by filtering them with the tags you added or by using a search term.
    </p>
    <ais-instant-search :search-client="searchClient" index-name="cocktails:name:asc" :routing="routing">
        <ais-configure :hitsPerPage="100" :stalledSearchDelay="200" />
        <!-- <ais-current-refinements></ais-current-refinements> -->
        <div class="cocktail-list-search-container">
            <ais-search-box placeholder="Type to filter cocktails..." :class-names="{ 'ais-SearchBox-input': 'form-input', 'ais-SearchBox-reset': 'cocktail-list-search-container__reset' }" />
            <ais-sort-by :items="[
                { value: 'cocktails:name:asc', label: 'Name asc.' },
                { value: 'cocktails:name:desc', label: 'Name desc.' },
                { value: 'cocktails:date:asc', label: 'Date modified asc.' },
                { value: 'cocktails:date:desc', label: 'Date modified desc.' },
            ]" :class-names="{ 'ais-SortBy-select': 'form-select' }" />
            <button type="button" class="button button--input" @click.prevent="showFilterContainer = !showFilterContainer">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M6.17 18a3.001 3.001 0 0 1 5.66 0H22v2H11.83a3.001 3.001 0 0 1-5.66 0H2v-2h4.17zm6-7a3.001 3.001 0 0 1 5.66 0H22v2h-4.17a3.001 3.001 0 0 1-5.66 0H2v-2h10.17zm-6-7a3.001 3.001 0 0 1 5.66 0H22v2H11.83a3.001 3.001 0 0 1-5.66 0H2V4h4.17z" />
                </svg>
            </button>
        </div>
        <ais-current-refinements>
            <template v-slot="{ items, createURL }">
                <div class="cocktail-current-refinements">
                    <template v-for="item in items">
                        <template v-if="item.label == 'id'">
                            <div class="cocktail-current-refinements__refinement">
                                <a href="#" :href="createURL(refinement)" @click.prevent="item.refinements.forEach(r => item.refine(r))">
                                    My favorites <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"/></svg>
                                </a>
                            </div>
                        </template>
                        <template v-else>
                            <div class="cocktail-current-refinements__refinement" v-for="refinement in item.refinements">
                                <a href="#" :href="createURL(refinement)" @click.prevent="item.refine(refinement)">
                                    {{ handleRefinementTag(refinement) }} <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"/></svg>
                                </a>
                            </div>
                        </template>
                    </template>
                </div>
            </template>
        </ais-current-refinements>
        <ais-panel>
            <template v-slot:default="{ hasRefinements }">
                <div class="cocktail-list-tags" style="margin-bottom: 10px;" v-show="showFilterContainer">
                    <h4>Filter by tags:</h4>
                    <ais-refinement-list attribute="tags" :sort-by="['name:asc']" :limit="30" operator="and">
                        <template v-slot:item="{ item, refine, createURL }">
                            <a :href="createURL(item.value)" class="tag tag--link" :class="{ 'tag--is-selected': item.isRefined }" @click.prevent="refine(item.value)">
                                {{ item.label }}
                            </a>
                        </template>
                    </ais-refinement-list>
                    <h4>Filter by glass type:</h4>
                    <ais-refinement-list attribute="glass" :sort-by="['name:asc']" :limit="30" operator="or">
                        <template v-slot:item="{ item, refine, createURL }">
                            <a :href="createURL(item.value)" class="tag tag--link" :class="{ 'tag--is-selected': item.isRefined }" @click.prevent="refine(item.value)">
                                {{ item.label }}
                            </a>
                        </template>
                    </ais-refinement-list>
                    <h4>User filters:</h4>
                    <ais-toggle-refinement attribute="user_id" :on="userId">
                        <template v-slot="{ value, refine, createURL }">
                            <a :href="createURL(value)" class="tag tag--link" :class="{ 'tag--is-selected': value.isRefined }" @click.prevent="refine(value)">
                                My cocktails
                                ({{ value.count || 0 }})
                            </a>
                        </template>
                    </ais-toggle-refinement>
                    <ais-toggle-refinement attribute="id" :on="favoritedCocktailsIds">
                        <template v-slot="{ value, refine, createURL }">
                            <a :href="createURL(value)" class="tag tag--link" :class="{ 'tag--is-selected': value.isRefined }" @click.prevent="refine(value)">
                                My favorites
                                ({{ value.count || 0 }})
                            </a>
                        </template>
                    </ais-toggle-refinement>
                </div>
            </template>
        </ais-panel>
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
import { singleIndex as singleIndexMapping } from 'instantsearch.js/es/lib/stateMappings';
import Auth from '@/Auth.js';
import ApiRequests from '@/ApiRequests.js'
import CocktailGridItem from './CocktailGridItem.vue'
import CocktailGridContainer from './CocktailGridContainer.vue'

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
                stateMapping: singleIndexMapping('cocktails:name:asc'),
            },
            userCocktails: [],
            userId: Auth.getUser().id,
            showFilterContainer: false,
        };
    },
    components: {
        CocktailGridItem,
        CocktailGridContainer
    },
    created() {
        document.title = `Cocktails \u22C5 Salt Rim`
        const userId = Auth.getUser().id
        ApiRequests.fetchUserCocktails(userId).then(data => {
            this.userCocktails = data
        })
    },
    computed: {
        userCocktailIds() {
            return this.userCocktails.map(c => c.id)
        },
        favoritedCocktailsIds() {
            const ids = Auth.getUser().favorite_cocktails;
            if (ids.length === 0) {
                return null;
            }

            return ids;
        }
    },
    methods: {
        handleRefinementTag(ref) {
            if (ref.attribute == 'user_id') {
                return `My cocktails`;
            }

            return `${ref.attribute}: ${ref.label}`;
        }
    }
}
</script>

<style scope>
.cocktail-list-tags {
    padding: 20px;
    background-color: rgba(255, 255, 255, .5);
    margin-top: 10px;
    border-radius: 10px;
    box-shadow: 0 3px 0 var(--color-bg-dark);
}

.cocktail-list-tags h4 {
    font-size: 0.9rem;
    font-weight: bold;
    margin-bottom: 6px;
}

.cocktail-list-tags .ais-RefinementList-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 15px;
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
    background: var(--color-text);
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
    background: var(--color-link-hover);
}
</style>
