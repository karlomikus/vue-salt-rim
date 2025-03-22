<template>
    <ais-instant-search :search-client="searchClient" :index-name="index" class="ingredient-finder" :initial-ui-state="initialUiState">
        <ais-configure :hits-per-page="maxHits" />
        <ais-search-box autofocus>
            <template #default="{ refine }">
                <input v-model="currentQuery" class="form-input ingredient-finder__search-input" type="search" :placeholder="t('placeholder.search-ingredients')" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" maxlength="512" @input="refine(currentQuery)">
            </template>
        </ais-search-box>
        <ais-hits class="ingredient-finder__hits">
            <template #default="{ items }: { items: SearchResult[] }">
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
            </template>
        </ais-hits>
    </ais-instant-search>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch'
import OverlayLoader from './OverlayLoader.vue'
import IngredientImage from './Ingredient/IngredientImage.vue'
import BarAssistantClient from '@/api/BarAssistantClient'
import AppState from '@/AppState';
import type { SearchResults } from '@/api/SearchResults'
import { useSaltRimToast } from '@/composables/toast'
import { useI18n } from 'vue-i18n'

type SearchResult = SearchResults['ingredient']

interface Props {
    searchToken: string;
    selectedIngredients?: number[];
    initialQuery?: string | null;
    maxHits?: number;
    disabledIngredients?: number[];
}

const {
    searchToken,
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
const index = 'ingredients:name:asc'
const initialUiState = {
    'ingredients:name:asc': {
        query: initialQuery,
    },
}
const appState = new AppState()
const searchClient = instantMeiliSearch(
    appState.bar.search_host ?? '',
    searchToken,
).searchClient

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
        })
    } catch (error) {
        toast.error(t('ingredient.dialog.new-ingredient-fail'))
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

function isSelected(ing: SearchResult) {
    return selectedIngredients.includes(ing.id)
}
</script>

<style scoped>
.ingredient-finder__search-input {
    width: 100%;
    margin-bottom: 0.5rem;
}

.ingredient-finder__options {
    display: flex;
    gap: var(--gap-size-1);
    flex-direction: column;
    height: 18rem;
    overflow-y: auto;
    padding: var(--gap-size-1);
}

.ingredient-finder__options a {
    display: flex;
    gap: var(--gap-size-2);
    padding: 0.25rem 0.5rem;
    text-decoration: none;
    align-items: center;
}

.ingredient-finder__options a.ingredient-finder__options--disabled {
    opacity: .3;
}

.ingredient-finder__options a svg {
    width: 24px;
    height: 24px;
    margin-left: auto;
    flex-shrink: 0;
}

.ingredient-finder__options__content {
    display: flex;
    flex-direction: column;
}

.ingredient-finder__options__content small {
    font-size: 0.75rem;
    color: var(--clr-gray-500);
}

a.ingredient-finder__options__create {
    text-decoration: underline;
}
</style>
