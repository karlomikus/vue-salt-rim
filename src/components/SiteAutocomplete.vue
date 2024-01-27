<template>
    <form class="site-autocomplete" novalidate @keyup.esc="close">
        <ais-instant-search :search-client="searchClient" index-name="cocktails">
            <ais-configure :hits-per-page.camel="5" />
            <ais-search-box autofocus>
                <template #default="{ currentRefinement, refine }">
                    {{ doFocus() }}
                    <input ref="siteSearchInput" class="form-input" type="search" :placeholder="$t('placeholder.site-search')" :value="currentRefinement" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" maxlength="512" @input="refine($event.currentTarget.value)">
                </template>
            </ais-search-box>
            <ais-index index-name="cocktails">
                <ais-hits>
                    <template #default="{ items }">
                        <h4 v-show="items.length > 0" class="site-autocomplete__index-name">{{ $t('cocktails.title') }}</h4>
                        <ul v-show="items.length > 0" class="site-autocomplete__results">
                            <li v-for="hit in items" :key="hit.slug">
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
            </ais-index>
            <ais-index index-name="ingredients">
                <ais-hits>
                    <template #default="{ items }">
                        <h4 v-show="items.length > 0" class="site-autocomplete__index-name">{{ $t('ingredients.title') }}</h4>
                        <ul v-show="items.length > 0" class="site-autocomplete__results">
                            <li v-for="hit in items" :key="hit.slug">
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
        </ais-instant-search>
        <footer class="site-autocomplete__footer">
            <span>Esc</span> to close, <span>CTRL+K</span> to toggle
        </footer>
    </form>
</template>

<script>
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch'
import AppState from './../AppState'

const appState = new AppState()

export default {
    emits: ['closeAutocomplete'],
    data() {
        return {
            searchClient: null
        }
    },
    created() {
        this.searchClient = instantMeiliSearch(
            appState.bar.search_driver_host,
            appState.bar.search_driver_api_key,
        ).searchClient
    },
    methods: {
        close() {
            this.$emit('closeAutocomplete')
        },
        getImageUrl(hit, type) {
            if (!hit.image_url) {
                if (type == 'cocktail') {
                    return '/no-cocktail.jpg'
                }

                return '/no-ingredient.png'
            }

            return hit.image_url
        },
        doFocus() {
            this.$nextTick(() => {
                if (this.$refs.siteSearchInput) {
                    this.$refs.siteSearchInput.focus()
                }
            })
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
    border-radius: var(--radius-2);
    background: var(--clr-sa-results-bg);
}

.site-autocomplete__results li a {
    display: flex;
    width: 100%;
    padding: 0.5rem;
    border-radius: var(--radius-1);
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
    border-radius: var(--radius-2);
    background-color: #eae4e9;
    background-position: center center;
    background-size: cover;
    background-repeat: no-repeat;
    margin-right: 10px;
    flex-shrink: 0;
}

.site-autocomplete__results__content span,
:deep(.site-autocomplete__results__content span .ais-Highlight-highlighted) {
    font-weight: var(--fw-bold);
}

.site-autocomplete__results__content small {
    display: block;
}

.site-autocomplete__footer {
    --clr-bg: var(--clr-gray-100);
    --clr-key-bg: #fff;
    --clr-key-border: var(--clr-gray-200);
    background: var(--clr-bg);
    padding: 0.5rem 1rem;
    border-radius: var(--radius-1);
    font-size: 0.9rem;
    margin-top: 1rem;
}

.dark-theme .site-autocomplete__footer {
    --clr-bg: var(--clr-dark-main-900);
    --clr-key-bg: var(--clr-dark-main-700);
    --clr-key-border: var(--clr-dark-main-700);
}

.site-autocomplete__footer span {
    border-radius: var(--radius-1);
    font-size: 0.8rem;
    border: 1px solid var(--clr-key-border);
    background-color: var(--clr-key-bg);
    padding: 1px 4px;
}

.site-autocomplete__index-name {
    font-size: 0.7rem;
    letter-spacing: 1px;
    text-transform: uppercase;
    font-weight: var(--fw-bold);
    margin: 0.75rem 0;
}
</style>
