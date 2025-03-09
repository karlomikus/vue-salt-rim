<template>
    <form class="site-autocomplete" novalidate @keyup.esc="close">
        <div class="dialog-title">{{ $t('search.title') }}</div>
        <OverlayLoader v-if="isLoading"></OverlayLoader>
        <ais-instant-search v-if="searchClient" :search-client="searchClient" index-name="cocktails">
            <ais-configure :hits-per-page.camel="5" :restrict-searchable-attributes.camel="['name']" />
            <ais-search-box autofocus>
                <template #default="{ currentRefinement, refine }">
                    {{ doFocus() }}
                    <input ref="siteSearchInput" class="form-input" type="search" :placeholder="$t('placeholder.site-search')" :value="currentRefinement" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" maxlength="512" @input="refine($event.currentTarget.value)">
                </template>
            </ais-search-box>
            <ais-index index-name="cocktails">
                <ais-hits>
                    <template #default="{ items }">
                        <h4 class="site-autocomplete__index-name">&mdash; {{ $t('cocktail.cocktails') }} ({{ items.length }})</h4>
                        <ul v-show="items.length > 0" class="site-autocomplete__results block-container block-container--inset">
                            <li v-for="hit in items" :key="hit.slug">
                                <RouterLink class="block-container block-container--hover" :to="{ name: 'cocktails.show', params: { id: hit.slug } }" @click="close">
                                    <div class="site-autocomplete__results__image" :style="{ 'background-image': 'url(' + getImageUrl(hit, 'cocktail') + ')' }"></div>
                                    <div class="site-autocomplete__results__content">
                                        <ais-highlight attribute="name" :hit="hit" />
                                        <small>{{ hit.short_ingredients.join(', ') }}</small>
                                    </div>
                                </RouterLink>
                            </li>
                        </ul>
                        <div v-show="items.length <= 0" class="block-container block-container--padded block-container--inset">
                            {{ $t('cocktails-not-found') }}
                        </div>
                    </template>
                </ais-hits>
            </ais-index>
            <ais-index index-name="ingredients">
                <ais-hits>
                    <template #default="{ items }">
                        <h4 class="site-autocomplete__index-name">&mdash; {{ $t('ingredient.ingredients') }} ({{ items.length }})</h4>
                        <ul v-show="items.length > 0" class="site-autocomplete__results block-container block-container--inset">
                            <li v-for="hit in items" :key="hit.slug">
                                <RouterLink class="block-container block-container--hover" :to="{ name: 'ingredients.show', params: { id: hit.slug } }" @click="close">
                                    <div class="site-autocomplete__results__image" :style="{ 'background-image': 'url(' + getImageUrl(hit, 'ingredient') + ')' }"></div>
                                    <div class="site-autocomplete__results__content">
                                        <ais-highlight attribute="name" :hit="hit" />
                                        <small>{{ hit.category }}</small>
                                    </div>
                                </RouterLink>
                            </li>
                        </ul>
                        <div v-show="items.length <= 0" class="block-container block-container--padded block-container--inset">
                            {{ $t('ingredients-not-found') }}
                        </div>
                    </template>
                </ais-hits>
            </ais-index>
        </ais-instant-search>
        <footer class="site-autocomplete__footer block-container block-container--inset">
            <span>Esc</span> to close, <span>CTRL+K</span> to toggle
        </footer>
    </form>
</template>

<script>
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch'
import BarAssistantClient from '@/api/BarAssistantClient'
import OverlayLoader from './OverlayLoader.vue'
import AppState from '../AppState'

export default {
    emits: ['closeAutocomplete'],
    components: {
        OverlayLoader,
    },
    data() {
        return {
            searchClient: null,
            isLoading: false,
        }
    },
    created() {
        const appState = new AppState()

        this.isLoading = true
        BarAssistantClient.getBar(appState.bar.id).then(resp => {
            this.isLoading = false
            this.searchClient = instantMeiliSearch(
                appState.bar.search_host,
                resp.data.search_token,
            ).searchClient
        }).catch(e => {
            this.isLoading = false
            this.$toast.error(e.message)
        })
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
.site-autocomplete .form-input {
    width: 100%;
}

.site-autocomplete__results {
    list-style: none;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-1);
    padding: var(--gap-size-1);
}

.site-autocomplete__results li a {
    display: flex;
    width: 100%;
    padding: 0.5rem;
    text-decoration: none;
}

.site-autocomplete__results li a .site-autocomplete__results__image {
    width: 30px;
    height: 30px;
    border-radius: var(--radius-2);
    background-color: #eae4e9;
    background-position: center center;
    background-size: cover;
    background-repeat: no-repeat;
    margin-right: 0.5rem;
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
    padding: 0.5rem 1rem;
    border-radius: var(--radius-1);
    font-size: 0.85rem;
    margin-top: var(--gap-size-2);
}

.site-autocomplete__footer span {
    border-radius: var(--radius-1);
    font-size: 0.75rem;
    border: 1px solid var(--clr-gray-400);
    font-weight: bold;
    background-color: none;
    padding: 1px 4px;
}

.site-autocomplete__index-name {
    font-size: 0.7rem;
    letter-spacing: 1px;
    text-transform: uppercase;
    font-weight: var(--fw-bold);
    color: var(--clr-gray-500);
    margin: 0.5rem 0;
}
</style>
