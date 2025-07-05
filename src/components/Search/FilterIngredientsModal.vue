<template>
    <form @submit.prevent="filter">
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ title }}</div>
        <p v-if="description">{{ description }}</p>
        <IngredientFinder :search-token="searchToken" :selected-ingredients="selectedIngredients.map(s => s.id)" @ingredient-selected="selectIngredient"></IngredientFinder>
        <div class="search-ingredients-modal-ingredients">
            <div v-for="ing in selectedIngredients" :key="ing.id" class="search-ingredients-modal-ingredients__ingredient">
                {{ ing.name }} <button type="button" @click.prevent="removeIngredient(ing)"><IconClose></IconClose></button>
            </div>
        </div>
        <div class="dialog-actions">
            <button type="submit" class="button button--dark" :disabled="isLoading">{{ $t('filter') }}</button>
        </div>
    </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import OverlayLoader from './../OverlayLoader.vue'
import IngredientFinder from './../IngredientFinder.vue'
import BarAssistantClient from '@/api/BarAssistantClient';
import IconClose from './../Icons/IconClose.vue';
import type { SearchResults } from '@/api/SearchResults';
import type { components } from '@/api/api'

type Ingredient = components['schemas']['Ingredient']

type IngredientSearchResult = SearchResults['ingredient']
const emit = defineEmits(['close'])
const props = defineProps<{
    searchToken: string
    title: string
    value: number[]
    description?: string
}>()
const isLoading = ref(false)
const selectedIngredients = ref<IngredientSearchResult[]>([])

const matchIngredients = async () => {
    if (props.value.length > 0) {
        isLoading.value = true
        try {
            const resp = (await BarAssistantClient.getIngredients({'filter[id]': props.value.join(',')}))?.data ?? []
            selectedIngredients.value = resp.map((i: Ingredient) => {
                return {
                    id: i.id,
                    name: i.name,
                    slug: i.slug,
                    image_url: null,
                    description: null,
                    category: null,
                    bar_id: 0,
                }
            })
        } catch (error) {
            selectedIngredients.value = []
        } finally {
            isLoading.value = false
        }
    }
}

const selectIngredient = (item: IngredientSearchResult) => {
    if (!selectedIngredients.value.some(sub => sub.id == item.id)) {
        selectedIngredients.value.push(item)
    }
}

const removeIngredient = (item: IngredientSearchResult) => {
    selectedIngredients.value.splice(
        selectedIngredients.value.findIndex(i => i == item),
        1
    )
}

const filter = () => {
    emit('close', { newFilters: selectedIngredients.value.map(i => i.id) })
}

matchIngredients()
</script>

<style scoped>
.search-ingredients-modal-ingredients {
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-size-1);
    margin-top: var(--gap-size-3);
}

.search-ingredients-modal-ingredients__ingredient {
    background-color: var(--clr-gray-800);
    color: var(--clr-gray-100);
    padding: 3px 8px;
    border-radius: 3px;
    display: flex;
    gap: var(--gap-size-1);
    align-items: center;
}

.search-ingredients-modal-ingredients__ingredient button {
    color: var(--clr-gray-100);
    padding: 0;
    margin: 0;
    border: 0;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    cursor: pointer;
    background-color: var(--clr-gray-500);
    display: flex;
    align-items: center;
    justify-content: center;
}

.search-ingredients-modal-ingredients__ingredient button:hover {
    background-color: rgb(168, 20, 9);
}
</style>
