<template>
    <form class="site-autocomplete" novalidate @keyup.esc="close">
        <div class="dialog-title">{{ t('search.title') }}</div>
        <OverlayLoader v-if="isLoading"></OverlayLoader>
        {{ doFocus() }}
        <input ref="siteSearchInput" class="form-input" type="search" :placeholder="t('placeholder.site-search')" v-model="currentQuery" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" maxlength="512" @input="debounceSearch">
        <h4 class="site-autocomplete__index-name">&mdash; {{ t('cocktail.cocktails') }} ({{ cocktailResults.length }})</h4>
        <ul v-show="cocktailResults.length > 0" class="site-autocomplete__results block-container block-container--inset">
            <li v-for="hit in cocktailResults" :key="hit.slug">
                <RouterLink class="block-container block-container--hover" :to="{ name: 'cocktails.show', params: { id: hit.slug } }" @click="close">
                    <CocktailThumb :cocktail="hit"></CocktailThumb>
                    <div class="site-autocomplete__results__content">
                        <span>{{ hit.name }}</span>
                        <small>{{ hit.short_ingredients.join(', ') }}</small>
                    </div>
                </RouterLink>
            </li>
        </ul>
        <div v-show="cocktailResults.length <= 0" class="block-container block-container--padded block-container--inset">
            {{ t('cocktails-not-found') }}
        </div>
        <h4 class="site-autocomplete__index-name">&mdash; {{ t('ingredient.ingredients') }} ({{ ingredientResults.length }})</h4>
        <ul v-show="ingredientResults.length > 0" class="site-autocomplete__results block-container block-container--inset">
            <li v-for="hit in ingredientResults" :key="hit.slug">
                <RouterLink class="block-container block-container--hover" :to="{ name: 'ingredients.show', params: { id: hit.slug } }" @click="close">
                    <IngredientImage class="ingredient__image--small" :image-url="hit.image_url"></IngredientImage>
                    <div class="site-autocomplete__results__content">
                        <span>{{ hit.name }}</span>
                        <small>{{ hit.category }}</small>
                    </div>
                </RouterLink>
            </li>
        </ul>
        <div v-show="ingredientResults.length <= 0" class="block-container block-container--padded block-container--inset">
            {{ t('ingredients-not-found') }}
        </div>
        <footer class="site-autocomplete__footer block-container block-container--inset">
            <span>Esc</span> to close, <span>CTRL+K</span> to toggle
        </footer>
    </form>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import IngredientImage from './Ingredient/IngredientImage.vue'
import CocktailThumb from './Cocktail/CocktailThumb.vue'
import BarAssistantClient from '@/api/BarAssistantClient'
import OverlayLoader from './OverlayLoader.vue'
import AppState from '../AppState'
import type { SearchResults } from '@/api/SearchResults'
import { useI18n } from 'vue-i18n'
import { templateRef } from '@vueuse/core'

const maxHits = 5
const currentQuery = ref<string>('')
const { t } = useI18n()
const isLoading = ref(false)
const appState = new AppState()
const emit = defineEmits<{
    closeAutocomplete: []
}>()
const ingredientResults = ref<SearchResults['ingredient'][]>([])
const cocktailResults = ref<SearchResults['cocktail'][]>([])
const searchInputRef = templateRef<HTMLInputElement>('siteSearchInput')

let queryTimer: number = 0;
function debounceSearch() {
    clearTimeout(queryTimer)

    queryTimer = setTimeout(() => {
        searchCocktails()
        searchIngredients()
    }, 300)
}

async function searchIngredients() {
    const query = currentQuery.value?.trim() ?? ''
    if (!query || query.length < 2) {
        ingredientResults.value = []
        return
    }

    isLoading.value = true

    try {
        const results = (await BarAssistantClient.getIngredients({
            'filter[name]': query,
            per_page: maxHits,
            include: 'images,ancestors',
        }))?.data ?? []

        ingredientResults.value = results.map(ing => ({
            id: ing.id,
            slug: ing.slug,
            name: ing.name,
            image_url: ing.images?.[0]?.url ?? null,
            description: ing.description,
            category: ing.hierarchy.path_to_self ?? null,
            bar_id: appState.bar.id,
            units: ing.units,
        }));
    } catch (error) {
        // toast.error(t('ingredient.dialog.search-fail'))
    } finally {
        isLoading.value = false
    }
}

async function searchCocktails() {
    const query = currentQuery.value?.trim() ?? ''
    if (!query || query.length < 2) {
        cocktailResults.value = []
        return
    }

    isLoading.value = true

    try {
        const results = (await BarAssistantClient.getCocktails({
            'filter[name]': query,
            per_page: maxHits,
            include: 'images',
        }))?.data ?? []

        cocktailResults.value = results.map(cocktail => ({
            id: cocktail.id,
            name: cocktail.name,
            slug: cocktail.slug,
            description: cocktail.description,
            image_url: cocktail.images?.[0]?.url ?? null,
            short_ingredients: cocktail.ingredients?.map(ing => ing.ingredient.name) ?? [],
            tags: [],
            bar_id: appState.bar.id,
        }));
    } catch (error) {
        // console.error('Error searching cocktails:', error)
    } finally {
        isLoading.value = false
    }
}

function close() {
    emit('closeAutocomplete')
}

function getImageUrl(hit: any, type: string) {
    if (!hit.image_url) {
        if (type == 'cocktail') {
            return '/no-cocktail.jpg'
        }

        return '/no-ingredient.png'
    }

    return hit.image_url
}

function doFocus() {
    nextTick(() => {
        if (searchInputRef) {
            searchInputRef.value.focus()
        }
    })
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

.site-autocomplete__results__content {
    margin-left: var(--gap-size-2);
}

.site-autocomplete__results__content span {
    font-weight: var(--fw-bold);
    font-size: 1.25em;
    font-family: var(--font-heading);
    line-height: 1.2;
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
