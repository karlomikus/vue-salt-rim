<template>
    <form class="site-autocomplete" novalidate>
        <ais-instant-search :search-client="searchClient" index-name="site_search_index">
            <ais-configure :hitsPerPage="10" />
            <ais-autocomplete>
                <template v-slot="{ currentRefinement, indices, refine }">
                    <input type="text" ref="sinput" :value="currentRefinement" placeholder="Search for a cocktail or ingredient..." class="form-input" @input="refine($event.currentTarget.value)" autocorrect="off" autocapitalize="none" autocomplete="off" spellcheck="false" autofocus>
                    <ul class="site-autocomplete__results" v-for="index in indices" :key="index.indexId" v-show="currentRefinement">
                        <li v-for="hit in index.hits" :key="hit.key">
                            <a href="#" @click.prevent="goTo(hit)">
                                <div class="site-autocomplete__results__image" :style="{ 'background-image': 'url(' + getImageUrl(hit) + ')' }"></div>
                                <h4>
                                    <ais-highlight attribute="name" :hit="hit" />
                                    <small v-if="hit.type == 'cocktail'">Cocktail</small>
                                    <small v-else>Ingredient</small>
                                </h4>
                            </a>
                        </li>
                        <li v-show="index.hits.length <= 0">No results found for term: "{{ currentRefinement }}"</li>
                    </ul>
                </template>
            </ais-autocomplete>
            <ais-clear-refinements :included-attributes="['query']">
                <template v-slot="{ canRefine, refine }">
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
            this.$emit('closeAutocomplete');
        },
        bindShortcuts() {
            document.addEventListener('keyup', evt => {
                if (evt.key === "Escape") {
                    this.close();
                }
            })
        },
        goTo(hit) {
            this.close();

            if (hit.type == 'cocktail') {
                this.$router.push({ name: 'cocktails.show', params: { id: hit.slug } })
                return;
            }

            this.$router.push({ name: 'ingredients.show', params: { id: hit.slug } })
            return;
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

<style scoped>
.site-autocomplete .form-input {
    width: 100%;
}

.site-autocomplete__results {
    list-style: none;
    margin: 1rem 0 0 0;
    padding: 0;
}

.site-autocomplete__results li a {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0.5rem;
    border-radius: 0.25rem;
    text-decoration: none;
}

.site-autocomplete__results li a:hover {
    background-color: var(--clr-gray-100);
    color: var(--clr-gray-800);
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

.site-autocomplete__results li a h4 small {
    display: block;
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
    background: var(--clr-gray-100);
    padding: 0.5rem 1rem;
    border-radius: 0.125rem;
    font-size: 0.9rem;
    margin-top: 1rem;
}

.site-autocomplete__footer span {
    border-radius: 3px;
    font-size: 0.8rem;
    border: 1px solid rgb(197, 197, 197);
    background-color: #fff;
    padding: 1px 4px;
}
</style>
