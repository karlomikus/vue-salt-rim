<template>
    <div class="site-autocomplete-wrapper">
        <form class="site-autocomplete" novalidate>
            <ais-instant-search :search-client="searchClient" index-name="site_search_index">
                <ais-configure :hitsPerPage="10" />
                <ais-autocomplete>
                    <template v-slot="{ currentRefinement, indices, refine }">
                        <div class="site-autocomplete__input-wrapper">
                            <input type="text" ref="sinput" :value="currentRefinement" placeholder="Search for a cocktail or ingredient..." class="site-autocomplete__input" @input="refine($event.currentTarget.value)" autocorrect="off" autocapitalize="none" autocomplete="off" spellcheck="false" autofocus>
                            <a href="#" @click.prevent="$emit('closeAutocomplete')">Cancel</a>
                            <svg class="site-autocomplete__search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path fill="none" d="M0 0h24v24H0z" />
                                <path d="M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z" />
                            </svg>
                        </div>
                        <ul class="site-autocomplete__results" v-for="index in indices" :key="index.indexId" v-show="currentRefinement">
                            <li v-for="hit in index.hits" :key="hit.key">
                                <RouterLink :to="generateRouterObject(hit)">
                                    <div class="site-autocomplete__results__image" :style="{ 'background-image': 'url(' + getImageUrl(hit) + ')' }"></div>
                                    <h4>
                                        <ais-highlight attribute="name" :hit="hit" />
                                        <small v-if="hit.type == 'cocktail'">Cocktail</small>
                                        <small v-else>Ingredient</small>
                                    </h4>
                                    <svg v-if="hit.type == 'ingredient'" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                                        <path d="M 15 3 C 13.90625 3 13 3.90625 13 5 L 13 6.6875 C 12.941406 6.882813 12.941406 7.085938 13 7.28125 L 13 10.4375 L 12.21875 10.96875 C 10.828125 11.894531 10 13.484375 10 15.15625 L 10 15.6875 C 9.941406 15.882813 9.941406 16.085938 10 16.28125 L 10 22.6875 C 9.941406 22.882813 9.941406 23.085938 10 23.28125 L 10 29 L 22 29 L 22 23.1875 C 22.027344 23.054688 22.027344 22.914063 22 22.78125 L 22 16.1875 C 22.027344 16.054688 22.027344 15.914063 22 15.78125 L 22 15.15625 C 22 13.484375 21.171875 11.894531 19.78125 10.96875 L 19 10.4375 L 19 7.1875 C 19.027344 7.054688 19.027344 6.914063 19 6.78125 L 19 5 C 19 3.90625 18.09375 3 17 3 Z M 15 5 L 17 5 L 17 6 L 15 6 Z M 15 8 L 17 8 L 17 11.53125 L 17.4375 11.84375 L 18.65625 12.65625 C 19.449219 13.183594 19.917969 14.054688 19.96875 15 L 12.03125 15 C 12.082031 14.054688 12.550781 13.183594 13.34375 12.65625 L 14.5625 11.84375 L 15 11.53125 Z M 12 17 L 20 17 L 20 22 L 12 22 Z M 12 24 L 20 24 L 20 27 L 12 27 Z" />
                                    </svg>
                                    <svg v-else-if="hit.type == 'cocktail'" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                                        <path d="M 8.5 4 C 5.464844 4 3 6.464844 3 9.5 C 3 12.535156 5.464844 15 8.5 15 C 9.3125 15 10.078125 14.796875 10.78125 14.46875 L 16 21.34375 L 16 27 L 12 27 L 12 29 L 22 29 L 22 27 L 18 27 L 18 21.34375 L 26.8125 9.71875 L 27 9.4375 L 27 8 L 13.75 8 C 13.144531 5.679688 10.984375 4 8.5 4 Z M 8.5 6 C 9.890625 6 11.089844 6.839844 11.625 8 L 7 8 L 7 9.4375 L 7.1875 9.71875 L 9.53125 12.8125 C 9.1875 12.933594 8.835938 13 8.5 13 C 6.535156 13 5 11.464844 5 9.5 C 5 7.535156 6.535156 6 8.5 6 Z M 9.9375 10 L 24.0625 10 L 22.5625 12 L 13.5 12 L 15 14 L 21.03125 14 L 17 19.34375 Z" />
                                    </svg>
                                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                        <polyline points="15 3 21 3 21 9"></polyline>
                                        <line x1="10" y1="14" x2="21" y2="3"></line>
                                    </svg>
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
                                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0-9.414l2.828-2.829 1.415 1.415L13.414 12l2.829 2.828-1.415 1.415L12 13.414l-2.828 2.829-1.415-1.415L10.586 12 7.757 9.172l1.415-1.415L12 10.586z" />
                            </svg>
                        </button>
                    </template>
                    <template v-slot:resetLabel></template>
                </ais-clear-refinements>
            </ais-instant-search>
            <footer class="site-autocomplete__footer">
                <span>Esc</span> to close, <span>CTRL+K</span> to toggle
            </footer>
        </form>
    </div>
</template>

<script>
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import Auth from '@/Auth.js';

export default {
    props: ['shown'],
    data() {
        return {
            searchClient: instantMeiliSearch(
                Auth.getUserSearchSettings().host,
                Auth.getUserSearchSettings().key,
            )
        }
    },
    created() {
        this.bindShortcuts();
    },
    mounted() {
        this.$el.addEventListener('click', e => {
            if (e.target.classList[0] == 'site-autocomplete-wrapper') {
                this.$emit('closeAutocomplete');
            }
        })
    },
    watch: {
        shown(newVal) {
            if (newVal == true) {
                setTimeout(() => {
                    this.$refs.sinput.focus()
                }, 100)
            }
        }
    },
    methods: {
        close() {
            document.querySelector('form.site-autocomplete').reset();
            this.$emit('closeAutocomplete');
        },
        bindShortcuts() {
            document.addEventListener('keyup', evt => {
                if (evt.key === "Escape") {
                    this.close();
                }
            })
        },
        generateRouterObject(hit) {
            if (hit.type == 'cocktail') {
                return { name: 'cocktails.show', params: { id: hit.slug } };
            }

            return { name: 'ingredients.show', params: { id: hit.slug } };
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
.site-autocomplete-wrapper {
    background: #21263bc4;
    height: 100vh;
    left: 0;
    position: fixed;
    top: 0;
    width: 100vw;
    z-index: 200;
}

.site-autocomplete {
    --shadow-color: 0deg 0% 0%;
    max-width: 560px;
    margin: 60px auto auto;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0px 0.3px 0.3px hsl(var(--shadow-color) / 0.1),
    0px 1.6px 1.8px -0.4px hsl(var(--shadow-color) / 0.1),
    0px 3px 3.4px -0.7px hsl(var(--shadow-color) / 0.1),
    0px 5px 5.6px -1.1px hsl(var(--shadow-color) / 0.1),
    0px 8px 9px -1.4px hsl(var(--shadow-color) / 0.1),
    0px 12.5px 14.1px -1.8px hsl(var(--shadow-color) / 0.1),
    0.1px 19px 21.4px -2.1px hsl(var(--shadow-color) / 0.1),
    0.1px 27.9px 31.4px -2.5px hsl(var(--shadow-color) / 0.1);
}

.site-autocomplete__input {
    width: 100%;
    border: 0;
    border-bottom: 2px solid var(--color-text);
    font-size: 1.3rem;
    opacity: 0.4;
    padding: 12px 30px 12px 50px;
    appearance: none;
    transition: all ease-in-out .06s;
    background: transparent;
    height: 60px;
}

.site-autocomplete__input::placeholder {
    color: #b4b8d1;
    opacity: 1;
}

.site-autocomplete__input:focus {
    outline: none;
    opacity: 1;
}

.site-autocomplete__results {
    list-style: none;
    padding: 10px;
    margin: 0;
    background: #fff;
    margin-top: 5px;
    border-radius: 15px;
    /* padding: 10px; */
}

.site-autocomplete__results li a {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 10px;
    border-radius: 8px;
    text-decoration: none;
}

.site-autocomplete__results li a:hover {
    background-color: rgba(0, 0, 0, .05);
    color: var(--color-text);
}

.site-autocomplete__results li a .site-autocomplete__results__image {
    width: 45px;
    height: 45px;
    border-radius: 5px;
    background-color: #eae4e9;
    background-position: center center;
    background-size: cover;
    background-repeat: no-repeat;
    margin-right: 10px;
}

.site-autocomplete__results li a h4 span,
.site-autocomplete__results li a h4 span>mark {
    font-weight: 700;
}

.site-autocomplete__results li a h4 small {
    display: block;
}

.site-autocomplete__results li a svg {
    margin-left: auto;
}

.site-autocomplete .ais-Highlight-highlighted {
    background-color: #ffdf93;
    border-radius: 2px;
}

.site-autocomplete__search-icon {
    position: absolute;
    top: 16px;
    left: 15px;
    width: 24px;
    height: 24px;
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
    top: 15px;
    right: 10px;
    display: none;
}

.site-autocomplete__footer {
    background: var(--color-var-4);
    padding: 8px 10px;
    border-radius: 10px;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    font-size: 0.9rem;
}

.site-autocomplete__footer span {
    border-radius: 3px;
    font-size: 0.8rem;
    border: 1px solid rgb(197, 197, 197);
    background-color: #fff;
    padding: 1px 4px;
}

.site-autocomplete__input-wrapper {
    display: flex;
    align-items: center;
}

.site-autocomplete__input-wrapper a {
    display: none;
    padding: 3px 10px;
    margin: 0 10px;
    border: 2px solid var(--color-text);
    border-radius: 4px;
}

@media (max-width: 750px) {
    .site-autocomplete {
        margin: 0;
        border-radius: 0;
        width: 100%;
        max-width: 100%;
    }
    .site-autocomplete__footer {
        display: none;
    }
    .site-autocomplete__input-wrapper a {
        display: inline;
    }
}
</style>
