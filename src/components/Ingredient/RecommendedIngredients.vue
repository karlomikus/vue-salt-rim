<script setup lang="ts">
import { ref, computed } from 'vue'
import OverlayLoader from '../OverlayLoader.vue';
import BarAssistantClient from '@/api/BarAssistantClient';
import AppState from '@/AppState';
import type { components } from '@/api/api'

type IngredientRecommend = components["schemas"]["IngredientRecommend"]

const props = defineProps<{
    stats: components["schemas"]["BarTotals"]
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

const shelfProgressValue = computed(() => {
    if (!props.stats.total_cocktails) {
        return 0
    }

    return Math.round((props.stats.total_bar_shelf_cocktails / props.stats.total_cocktails) * 100)
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
        <div>
            <h2>{{ shelfPercent }}</h2>
            Bar cocktail availability
        </div>
        <div
            class="recommended-progress"
            role="progressbar"
            aria-label="Bar shelf completeness"
            :aria-valuenow="shelfProgressValue"
            aria-valuemin="0"
            aria-valuemax="100"
        >
            <div class="recommended-progress__value" :style="{ width: `${shelfProgressValue}%` }"></div>
        </div>
        <div>
            You are a few bottles away from unlocking extra recipes.
            <br>
            <template v-for="(ing, index) in recommendedIngredients" :key="ing.id">
                <RouterLink :to="{ name: 'ingredients.show', params: { id: ing.slug } }">{{ ing.name }} (+{{ ing.potential_cocktails }})</RouterLink>
                <template v-if="index + 1 !== recommendedIngredients.length"> &middot; </template>
            </template>
        </div>
        <!--<template v-if="stats.total_cocktails > 0">
            <i18n-t keypath="ingredient.recommended-next">
                <template #totalPercent>
                    <strong>{{ shelfPercent }}</strong>
                </template>
                <template #ingredients>
                    <template v-for="(ing, index) in recommendedIngredients" :key="ing.id">
                        <RouterLink :to="{ name: 'ingredients.show', params: { id: ing.slug } }">{{ ing.name }} (+{{ ing.potential_cocktails }})</RouterLink>
                        <template v-if="index + 1 !== recommendedIngredients.length"> &middot; </template>
                    </template>
                </template>
            </i18n-t>
        </template>
        -->
    </div>
</template>

<style scoped>
.block-recommended {
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-2);
    padding: var(--gap-size-3);
}

.block-recommended h2 {
    font-family: var(--font-heading);
    line-height: 1;
    font-size: 2.25rem;
}

.recommended-progress {
    width: 100%;
    height: 5px;
    background-color: var(--clr-gray-200);
    border-radius: 999px;
    overflow: hidden;
}

.recommended-progress__value {
    height: 100%;
    background: linear-gradient(90deg, var(--clr-chart-1) 0%, var(--clr-chart-7) 100%);
    border-radius: 999px;
}
</style>