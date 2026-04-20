<script setup lang="ts">
import { computed, ref } from 'vue'
import OverlayLoader from '../OverlayLoader.vue'
import type { components } from '@/api/api'

type BarIngredientDistribution = components["schemas"]["BarIngredientDistribution"]

const props = defineProps<{
    stats: BarIngredientDistribution;
}>()

const isLoading = ref(false)
const minRelevantPercent = 3

const distributionColors = ["#797d62","#9b9b7a","#baa587","#d9ae94","#f1dca7","#ffcb69","#e8ac65","#d08c60","#b58463","#997b66"]

const distribution = computed(() => {
    const items = [...(props.stats.main_category_ingredient_distribution ?? [])]
        .sort((a, b) => b.ingredients_count - a.ingredients_count)
    const totalCount = items.reduce((sum, item) => sum + item.ingredients_count, 0)

    if (!totalCount) {
        return []
    }

    const relevantItems = []
    let otherIngredientsCount = 0

    for (const item of items) {
        const percent = (item.ingredients_count / totalCount) * 100

        if (percent < minRelevantPercent) {
            otherIngredientsCount += item.ingredients_count
            continue
        }

        relevantItems.push(item)
    }

    if (otherIngredientsCount > 0) {
        relevantItems.push({
            id: -1,
            slug: 'other',
            name: 'Other',
            ingredients_count: otherIngredientsCount,
        })
    }

    return relevantItems.map((item, index) => {
        const percent = (item.ingredients_count / totalCount) * 100

        return {
            ...item,
            percent,
            color: getSegmentColor(index),
        }
    })
})

const percentFormatter = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
})

function getSegmentColor(index: number) {
    return distributionColors[index % distributionColors.length]
}

</script>

<template>
    <div class="block-container block-distribution">
        <OverlayLoader v-if="isLoading"></OverlayLoader>
        <p class="distribution-description">
            This chart shows the distribution of ingredients across different main categories. Categories with less than {{ minRelevantPercent }}% contribution are grouped into "Other" for clarity.
        </p>
        <div
            v-if="distribution.length"
            class="distribution-bar"
            role="img"
            aria-label="Ingredient distribution by category"
        >
            <div
                v-for="item in distribution"
                :key="item.id"
                class="distribution-segment"
                :style="{ width: `${item.percent}%`, backgroundColor: item.color }"
                :title="`${item.name}: ${percentFormatter.format(item.percent)}%`"
            ></div>
        </div>

        <ul v-if="distribution.length" class="distribution-list">
            <li v-for="item in distribution" :key="`label-${item.id}`" class="distribution-item">
                <span class="distribution-dot" :style="{ backgroundColor: item.color }"></span>
                <span class="distribution-name">{{ item.name }}</span>
                <span class="distribution-value">{{ percentFormatter.format(item.percent) }}%</span>
            </li>
        </ul>
        <small v-else class="distribution-empty">No ingredient category distribution data available yet.</small>
    </div>
</template>

<style scoped>
.block-distribution {
    display: grid;
    gap: 0.75rem;
    padding: var(--gap-size-3);
}

.distribution-title {
    margin: 0;
}

.distribution-description {
    margin: 0;
}

.distribution-empty {
    color: var(--clr-gray-700);
}

.distribution-bar {
    display: flex;
    width: 100%;
    height: 20px;
    overflow: hidden;
    border-radius: 3px;
    background: var(--clr-gray-100);
}

.distribution-segment {
    height: 100%;
    min-width: 0;
}

.distribution-list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-size-2);
}

.distribution-item {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: var(--gap-size-2);
}

.distribution-dot {
    width: 0.65rem;
    height: 0.65rem;
    border-radius: 50%;
}

.distribution-name {
    font-size: 0.95rem;
}

.distribution-value {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
}
</style>