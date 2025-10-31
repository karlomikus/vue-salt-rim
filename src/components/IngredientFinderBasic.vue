<template>
    <div class="ingredient-finder">
        {{ focusInput() }}
        <input v-model="currentQuery" ref="searchInput" class="form-input ingredient-finder__search-input" type="search" :placeholder="t('placeholder.search-ingredients')" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" @keyup.enter="search" @input="debounceIngredientSearch">
        <div class="ingredient-finder__hits">
            <div class="ingredient-finder__options block-container block-container--inset">
                <OverlayLoader v-if="isLoading"></OverlayLoader>
                <a v-for="item in items" :key="item.id" class="block-container block-container--hover" href="#" @click.prevent="selectIngredient(item)" :class="{ 'ingredient-finder__options--disabled': disabledIngredients.includes(item.id) }">
                    <IngredientImage class="ingredient__image--small" :image-url="item.image_url"></IngredientImage>
                    <div class="ingredient-finder__options__content">
                        <span class="sr-list-item-title">{{ item.name }}</span>
                        <small>{{ item.category }}</small>
                    </div>
                    <svg v-show="isSelected(item)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11.0026 16L18.0737 8.92893L16.6595 7.51472L11.0026 13.1716L8.17421 10.3431L6.75999 11.7574L11.0026 16Z" fill="currentColor"></path>
                    </svg>
                </a>
                <a v-show="currentQuery" href="#" class="ingredient-finder__options__create" @click.prevent="newIngredient">
                    {{ t('ingredient.dialog.search-not-found') }} {{ t('ingredient.dialog.create-ingredient', { name: currentQuery }) }}
                </a>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import OverlayLoader from './OverlayLoader.vue'
import IngredientImage from './Ingredient/IngredientImage.vue'
import BarAssistantClient from '@/api/BarAssistantClient'
import AppState from '@/AppState';
import type { SearchResults } from '@/api/SearchResults'
import { useSaltRimToast } from '@/composables/toast'
import { useI18n } from 'vue-i18n'

type SearchResult = SearchResults['ingredient']

interface Props {
    selectedIngredients?: number[];
    initialQuery?: string | null;
    maxHits?: number;
    disabledIngredients?: number[];
}

const appState = new AppState()
const {
    selectedIngredients = [],
    initialQuery = null,
    maxHits = 15,
    disabledIngredients = [],
} = defineProps<Props>()

const emit = defineEmits<{
    ingredientSelected: [ing: SearchResult]
}>()
const toast = useSaltRimToast()
const { t } = useI18n()
const isLoading = ref(false)
const currentQuery = ref(initialQuery)
const items = ref<SearchResult[]>([])
const searchInput = useTemplateRef<HTMLInputElement>('searchInput')

let queryTimer: number = 0;
function debounceIngredientSearch() {
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

    await queryIngredients(query)
}

async function queryIngredients(query: string) {
    isLoading.value = true

    try {
        const results = (await BarAssistantClient.getIngredients({
            'filter[name]': query,
            per_page: maxHits,
            include: 'images,ancestors',
        }))?.data ?? []

        items.value = results.map(ing => ({
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
    } finally {
        isLoading.value = false
    }
}

async function newIngredient() {
    if (currentQuery.value === null || currentQuery.value === '') {
        return
    }

    const postData = {
        name: currentQuery.value,
    };

    isLoading.value = true

    try {
        const ing = (await BarAssistantClient.saveIngredient(postData))?.data ?? null
        if (!ing) {
            isLoading.value = false
            return
        }

        toast.default(t('ingredient.dialog.new-ingredient-success', { name: ing.name }))
        selectIngredient({
            id: ing.id,
            slug: ing.slug,
            name: ing.name,
            image_url: null,
            description: null,
            category: null,
            bar_id: appState.bar.id,
            units: null,
        })
    } catch (error) {
        toast.error(t('server-error'))
    } finally {
        isLoading.value = false
    }
}

function selectIngredient(ing: SearchResult) {
    if (ing && disabledIngredients.includes(ing.id)) {
        return false
    }

    emit('ingredientSelected', ing)
}

function focusInput() {
    searchInput.value?.focus()
}

function isSelected(ing: SearchResult) {
    return selectedIngredients.includes(ing.id)
}

if (currentQuery.value !== null && currentQuery.value !== '') {
    search()
} else {
    queryIngredients('')
}
</script>
