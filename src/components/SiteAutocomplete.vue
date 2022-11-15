<template>
    <div class="site-autocomplete">
        <ais-instant-search :search-client="searchClient" index-name="site_search_index">
            <ais-configure :hitsPerPage="10" />
            <ais-autocomplete>
                <template v-slot="{ currentRefinement, indices, refine }">
                    <input type="text" :value="currentRefinement" placeholder="Search for a cocktail or ingredient..."
                        class="site-autocomplete__input" @input="refine($event.currentTarget.value)"
                        @focus="searchIsFocused = true" @blur="handleBlur">
                    <svg class="site-autocomplete__search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                        width="24" height="24">
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path
                            d="M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z" />
                    </svg>
                    <ul class="site-autocomplete__results" v-show="currentRefinement && searchIsFocused"
                        v-for="index in indices" :key="index.indexId">
                        <li v-for="hit in index.hits" :key="hit.key">
                            <RouterLink :to="generateRouterObject(hit)">
                                <div class="site-autocomplete__results__image"
                                    :style="{'background-image': 'url(' + getImageUrl(hit) + ')'}"></div>
                                <h4>
                                    <ais-highlight attribute="name" :hit="hit" />
                                    <small v-if="hit.type == 'cocktail'">Cocktail</small>
                                    <small v-else>Ingredient</small>
                                </h4>
                            </RouterLink>
                        </li>
                        <li v-show="index.hits.length <= 0">No results found for term: "{{ currentRefinement }}"</li>
                    </ul>
                </template>
            </ais-autocomplete>
            <ais-clear-refinements :included-attributes="['query']">
                <template v-slot="{ canRefine, refine, createURL }">
                    <button class="site-autocomplete__clear" @click.prevent="refine" v-if="canRefine">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path
                                d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0-9.414l2.828-2.829 1.415 1.415L13.414 12l2.829 2.828-1.415 1.415L12 13.414l-2.828 2.829-1.415-1.415L10.586 12 7.757 9.172l1.415-1.415L12 10.586z" />
                        </svg>
                    </button>
                </template>
                <template v-slot:resetLabel></template>
            </ais-clear-refinements>
        </ais-instant-search>
    </div>
</template>

<script>
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import Auth from '@/Auth.js';

export default {
    data() {
        return {
            searchIsFocused: false,
            searchClient: instantMeiliSearch(
                Auth.getUserSearchSettings().host,
                Auth.getUserSearchSettings().key,
            )
        }
    },
    methods: {
        generateRouterObject(hit) {
            if (hit.type == 'cocktail') {
                return { name: 'cocktails.show', params: { id: hit.slug } };
            }

            return { name: 'ingredients.show', params: { id: hit.slug } };
        },
        handleBlur() {
            setTimeout(() => {
                this.searchIsFocused = false;
            }, 200)
        },
        getImageUrl(hit) {
            if (!hit.image_url) {
                if (hit.type == 'cocktail') {
                    return '/no-cocktail.jpg';
                }

                return '/no-ingredient.png';
            }

            return hit.image_url;
        }
    }
}
</script>

<style>
.site-autocomplete {
    padding: 20px 10px 40px 10px;
    max-width: var(--site-width);
    margin: 0 auto;
}

@media (max-width: 450px) {
    .site-autocomplete {
        padding: 5px 10px 20px 10px;
    }
}

.site-autocomplete__input {
    width: 100%;
    border: 0;
    background: rgb(92, 101, 155);
    font-size: 1.3rem;
    color: #fff;
    padding: 12px 30px 12px 50px;
    border-radius: 30px;
    appearance: none;
    transition: all ease-in-out .06s;
}

.site-autocomplete__input::placeholder {
    color: #b4b8d1;
    opacity: 1;
}

.site-autocomplete__input:focus {
    background-color: #fff;
    color: var(--color-text);
    border: 0;
    outline: none;
}

@media (max-width: 450px) {
    .site-autocomplete__input {
        font-size: 1.1rem;
        padding: 8px 20px 8px 40px;
    }
}

.site-autocomplete__results {
    list-style: none;
    padding: 0;
    margin: 0;
    background: #fff;
    position: absolute;
    margin-top: 5px;
    width: 100%;
    z-index: 5;
    border-radius: 15px;
    padding: 10px;
}

.site-autocomplete__results li a {
    display: flex;
    width: 100%;
    padding: 10px;
    border-radius: 8px;
    text-decoration: none;
}

.site-autocomplete__results li a:hover {
    background-color: #eff7f6;
}

.site-autocomplete__results li a .site-autocomplete__results__image {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #eae4e9;
    background-position: center center;
    background-size: cover;
    background-repeat: no-repeat;
    margin-right: 10px;
}

.site-autocomplete__results li a h4 {
    font-weight: 700;
}

.site-autocomplete__results li a h4 small {
    display: block;
}

.site-autocomplete .ais-Highlight-highlighted {
    background-color: #fbf8cc;
}

.site-autocomplete__search-icon {
    position: absolute;
    top: 9px;
    left: 12px;
    width: 30px;
    height: 30px;
    fill: #373f6c;
}

.site-autocomplete__clear {
    background: none;
    border: 0;
    padding: 0;
    cursor: pointer;
}

.site-autocomplete__clear svg {
    width: 30px;
    height: 30px;
    fill: #373f6c;
}

.site-autocomplete .ais-ClearRefinements-button {
    display: none;
}

.site-autocomplete .ais-ClearRefinements {
    position: absolute;
    top: 10px;
    right: 15px;
}

@media (max-width: 450px) {
    .site-autocomplete__search-icon {
        top: 8px;
        left: 12px;
        width: 22px;
        height: 22px;
    }

    .site-autocomplete__clear svg {
        width: 22px;
        height: 22px;
    }

    .site-autocomplete .ais-ClearRefinements {
        top: 8px;
        right: 10px;
    }
}
</style>
