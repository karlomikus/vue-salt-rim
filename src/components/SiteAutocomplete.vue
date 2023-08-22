<template>
    <form class="site-autocomplete" novalidate @keyup.esc="close">
        <ais-instant-search :search-client="searchClient" index-name="cocktails">
            <ais-configure :hitsPerPage="5" />
            <ais-search-box autofocus>
                <template v-slot="{ currentRefinement, refine }">
                    <input ref="siteSearchInput" class="form-input" type="search" :placeholder="$t('placeholder.site-search')" :value="currentRefinement" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" maxlength="512" @input="refine($event.currentTarget.value)">
                </template>
            </ais-search-box>
            <ais-hits>
                <template v-slot="{ items }">
                    <h4 class="site-autocomplete__index-name" v-show="items.length > 0">{{ $t('cocktails') }}</h4>
                    <ul class="site-autocomplete__results" v-show="items.length > 0">
                        <li v-for="hit in items">
                            <RouterLink :to="{ name: 'cocktails.show', params: { id: hit.slug } }" @click="close">
                                <div class="site-autocomplete__results__image" :style="{ 'background-image': 'url(' + getImageUrl(hit, 'cocktail') + ')' }"></div>
                                <div class="site-autocomplete__results__content">
                                    <ais-highlight attribute="name" :hit="hit" />
                                    <small>{{ hit.short_ingredients.join(', ') }}</small>
                                </div>
                            </RouterLink>
                        </li>
                    </ul>
                </template>
            </ais-hits>
            <ais-index index-name="ingredients">
                <ais-hits>
                    <template v-slot="{ items }">
                        <h4 class="site-autocomplete__index-name" v-show="items.length > 0">{{ $t('ingredients') }}</h4>
                        <ul class="site-autocomplete__results" v-show="items.length > 0">
                            <li v-for="hit in items">
                                <RouterLink :to="{ name: 'ingredients.show', params: { id: hit.slug } }" @click="close">
                                    <div class="site-autocomplete__results__image" :style="{ 'background-image': 'url(' + getImageUrl(hit, 'ingredient') + ')' }"></div>
                                    <div class="site-autocomplete__results__content">
                                        <ais-highlight attribute="name" :hit="hit" />
                                        <small>{{ hit.category }}</small>
                                    </div>
                                </RouterLink>
                            </li>
                        </ul>
                    </template>
                </ais-hits>
            </ais-index>
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
import AppState from './../AppState';

const appState = new AppState();

export default {
    data() {
        return {
            searchClient: null
        }
    },
    emits: ['closeAutocomplete'],
    created() {
        this.searchClient = instantMeiliSearch(
            appState.bar.search_driver_host,
            appState.bar.search_driver_api_key,
        );
    },
    mounted() {
        this.$nextTick(() => {
            setTimeout(() => {
                this.$refs.siteSearchInput.focus();
            }, 200)
        })
    },
    methods: {
        close() {
            this.$emit('closeAutocomplete');
        },
        getImageUrl(hit, type) {
            if (!hit.image_url) {
                if (type == 'cocktail') {
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
.site-autocomplete {
    --clr-sa-results-bg: rgba(255, 255, 255, .5);
}

.dark-theme .site-autocomplete {
    --clr-sa-results-bg: var(--clr-dark-main-900);
}

.site-autocomplete .form-input {
    width: 100%;
}

.site-autocomplete__results {
    list-style: none;
    margin: 0;
    padding: 0.5rem;
    border-radius: 0.5rem;
    background: var(--clr-sa-results-bg);
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

.dark-theme .site-autocomplete__results li a:hover {
    background-color: var(--clr-dark-main-800);
    color: var(--clr-gray-50);
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

.site-autocomplete__results__content span,
:deep(.site-autocomplete__results__content span .ais-Highlight-highlighted) {
    font-weight: var(--fw-bold);
}

.site-autocomplete__results__content small {
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
    --clr-bg: var(--clr-gray-100);
    --clr-key-bg: #fff;
    --clr-key-border: var(--clr-gray-200);
    background: var(--clr-bg);
    padding: 0.5rem 1rem;
    border-radius: 0.125rem;
    font-size: 0.9rem;
    margin-top: 1rem;
}

.dark-theme .site-autocomplete__footer {
    --clr-bg: var(--clr-dark-main-900);
    --clr-key-bg: var(--clr-dark-main-700);
    --clr-key-border: var(--clr-dark-main-700);
}

.site-autocomplete__footer span {
    border-radius: 3px;
    font-size: 0.8rem;
    border: 1px solid var(--clr-key-border);
    background-color: var(--clr-key-bg);
    padding: 1px 4px;
}

.site-autocomplete__index-name {
    font-size: 0.7rem;
    letter-spacing: 1px;
    text-transform: uppercase;
    font-weight: bold;
    margin: 0.75rem 0;
}
</style>
