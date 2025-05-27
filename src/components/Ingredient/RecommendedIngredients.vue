<script setup lang="ts">
import { ref, computed } from 'vue'
import OverlayLoader from '../OverlayLoader.vue';
import BarAssistantClient from '@/api/BarAssistantClient';
import AppState from '@/AppState';
import type { components } from '@/api/api'

type IngredientRecommend = components["schemas"]["IngredientRecommend"]

const props = defineProps<{
    stats: components["schemas"]["BarStats"]
}>()
const isLoading = ref(false)
const appState = new AppState()
const recommendedIngredients = ref<IngredientRecommend[]>([])

fetchRecommendedIngredients()

const shelfPercent = computed(() => {
    if (!props.stats.total_cocktails) {
        return Number(0).toLocaleString(undefined, {style: 'percent', minimumFractionDigits:2})
    }

    return Number(props.stats.total_bar_shelf_cocktails / props.stats.total_cocktails).toLocaleString(undefined, {style: 'percent', minimumFractionDigits:2})
})

async function fetchRecommendedIngredients() {
    isLoading.value = true
    recommendedIngredients.value = (await BarAssistantClient.getBarRecommendedIngredients(appState.bar.id))?.data ?? []
    isLoading.value = false
}
</script>

<template>
    <div class="block-container block-recommended">
        <OverlayLoader v-if="isLoading"></OverlayLoader>
        <template v-if="stats.total_cocktails > 0">
            <i18n-t keypath="ingredient.recommended-next">
                <template #totalPercent>
                    <strong>{{ shelfPercent }}</strong>
                </template>
                <template #ingredients>
                    <template v-for="(ing, index) in recommendedIngredients" :key="ing.id">
                        <RouterLink :to="{ name: 'ingredients.show', params: { id: ing.slug } }">{{ ing.name }}</RouterLink>
                        <template v-if="index + 1 !== recommendedIngredients.length"> &middot; </template>
                    </template>
                </template>
            </i18n-t>
        </template>
    </div>
</template>