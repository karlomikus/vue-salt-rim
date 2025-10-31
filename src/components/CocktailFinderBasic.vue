<template>
    <div>
        <div class="dialog-title">{{ $t('cocktail.cocktails') }}</div>
        <div class="cocktail-finder">
            <OverlayLoader v-if="isLoading"></OverlayLoader>
            {{ focusInput() }}
            <input v-model="currentQuery" ref="searchInput" class="form-input cocktail-finder__search-input" type="search" :placeholder="t('placeholder.search-cocktails')" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" @input="debounceSearch">
            <div class="cocktail-finder__hits">
                <a v-for="item in items" :key="item.id" class="cocktail-finder__option block-container block-container--hover" href="#" @click.prevent="select(item)">
                    <CocktailThumb :cocktail="item"></CocktailThumb>
                    <div>
                        <h4 class="sr-list-item-title">{{ item.name }}</h4>
                        <p>{{ item.short_ingredients.join(', ') }}</p>
                    </div>
                </a>
            </div>
        </div>
        <div class="dialog-actions">
            <button type="submit" class="button button--dark" @click="$emit('closed')">{{ $t('close') }}</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import OverlayLoader from './OverlayLoader.vue'
import CocktailThumb from './Cocktail/CocktailThumb.vue'
import BarAssistantClient from '@/api/BarAssistantClient'
import AppState from '@/AppState';
import type { SearchResults } from '@/api/SearchResults'
import { useI18n } from 'vue-i18n'

type SearchResult = SearchResults['cocktail']

interface Props {
    initialQuery?: string | null;
    maxHits?: number;
}

const appState = new AppState()
const {
    initialQuery = null,
    maxHits = 10,
} = defineProps<Props>()

const emit = defineEmits<{
    cocktailSelected: [cocktail: SearchResult],
    closed: []
}>()
const searchInput = useTemplateRef<HTMLInputElement>('searchInput')
const { t } = useI18n()
const isLoading = ref(false)
const currentQuery = ref(initialQuery)
const items = ref<SearchResult[]>([])

let queryTimer: number = 0;
function debounceSearch() {
    clearTimeout(queryTimer)

    queryTimer = setTimeout(() => {
        search()
    }, 300)
}

async function search() {
    const query = currentQuery.value?.trim() ?? ''
    if (!query || query.length < 2) {
        items.value = []
        return
    }

    await queryCocktails(query)
}

async function queryCocktails(query: string) {
    isLoading.value = true

    try {
        const results = (await BarAssistantClient.getCocktails({
            'filter[name]': query,
            per_page: maxHits,
            include: 'images',
        }))?.data ?? []

        items.value = results.map(cocktail => ({
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
        console.error('Error searching cocktails:', error)
    } finally {
        isLoading.value = false
    }
}

function select(cocktail: SearchResult) {
    emit('cocktailSelected', cocktail)
}

function focusInput() {
    searchInput.value?.focus()
}

if (currentQuery.value !== null && currentQuery.value !== '') {
    search()
} else {
    queryCocktails('')
}
</script>

<style scoped>
.cocktail-finder__search-input {
    width: 100%;
    margin-bottom: 1rem;
}
.cocktail-finder__hits {
    padding: var(--gap-size-1);
    background-color: #f4edf2;
    border-radius: var(--radius-2);
    border-bottom: 1px solid #fff;
    box-shadow: inset 0px 0.4px 0.5px hsl(var(--shadow-color) / 0.25), inset 0px 1.1px 1.2px -0.8px hsl(var(--shadow-color) / 0.25), inset 0px 2.6px 2.9px -1.7px hsl(var(--shadow-color) / 0.25), inset 0px 6.3px 7.1px -2.5px hsl(var(--shadow-color) / 0.25);
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-1);
    height: 400px;
    overflow-x: auto;
}

.dark-theme .cocktail-finder__hits {
    background-color: rgba(0, 0, 0, .15);
    border-bottom: 1px solid rgba(255, 255, 255, .1);
    box-shadow:
        inset 0px 0.4px 0.5px hsl(var(--shadow-color-dark) / 0.25),
        inset 0px 1.1px 1.2px -0.8px hsl(var(--shadow-color-dark) / 0.25),
        inset 0px 2.6px 2.9px -1.7px hsl(var(--shadow-color-dark) / 0.25),
        inset 0px 6.3px 7.1px -2.5px hsl(var(--shadow-color-dark) / 0.25);
}

.cocktail-finder__option {
    display: flex;
    flex-direction: row;
    gap: var(--gap-size-2);
    text-decoration: none;
    padding: var(--gap-size-2);
}

:deep(.cocktail-finder__option h4 span .ais-Highlight-highlighted) {
    background-color: var(--clr-accent-200);
    font-weight: var(--fw-bold);
}

.cocktail-finder__option p {
    font-size: 0.85em;
    line-height: 1.6;
    color: var(--clr-gray-600);
}

.dark-theme .cocktail-finder__option p {
    color: var(--clr-gray-400);
}
</style>
