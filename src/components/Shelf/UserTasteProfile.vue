<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { components } from '@/api/api'
import OverlayLoader from '../OverlayLoader.vue'
import {
    ArcElement,
    Chart,
    Legend,
    PolarAreaController,
    RadialLinearScale,
    type ChartData,
    type ChartOptions,
} from 'chart.js'

Chart.register(RadialLinearScale, PolarAreaController, ArcElement, Legend)

type UserTasteProfile = components["schemas"]["UserTasteProfile"]

const props = defineProps<{
    profile: UserTasteProfile | null;
}>()

const isLoading = ref(false)

const favoriteTags = computed(() => [...(props.profile?.favorite_tags ?? [])])
const dislikedTags = computed(() => [...(props.profile?.disliked_tags ?? [])])

const averageAbv = computed(() => props.profile?.average_abv ?? 0)
const radarCanvas = ref<HTMLCanvasElement | null>(null)
const radarChart = ref<Chart<'polarArea'> | null>(null)

const abvDistribution = computed(() => {
    const buckets = props.profile?.abv_distribution ?? []
    const order = { low: 0, medium: 1, high: 2 }

    return [...buckets].sort((a, b) => {
        const aOrder = order[a.bucket as keyof typeof order] ?? 99
        const bOrder = order[b.bucket as keyof typeof order] ?? 99

        return aOrder - bOrder
    })
})

const radarSeries = computed(() => {
    const positive = favoriteTags.value
    const negative = dislikedTags.value
    const formatRadarLabel = (label: string) => (label.length > 14 ? `${label.slice(0, 14)}...` : label)

    const positiveItems = positive.filter((item) => typeof item.name === 'string' && item.name.length > 0)
    const negativeItems = negative.filter((item) => typeof item.name === 'string' && item.name.length > 0)

    return {
        labels: [
            ...positiveItems.map((item) => formatRadarLabel(item.name)),
            ...negativeItems.map((item) => formatRadarLabel(item.name)),
        ],
        rawData: [
            ...positiveItems.map((item) => item.weight),
            ...negativeItems.map((item) => item.weight),
        ],
        backgroundColors: [
            ...positiveItems.map(() => '#2a9d8fff'),
            ...negativeItems.map(() => '#e76f51ff'),
        ],
    }
})

function formatPercent(ratio: number) {
    return `${(ratio * 100).toFixed(1)}%`
}

function bucketColor(bucket: string) {
    const palette: Record<string, string> = {
        low: 'var(--clr-chart-3)',
        medium: 'var(--clr-chart-6)',
        high: 'var(--clr-chart-9)',
    }

    return palette[bucket] ?? 'var(--clr-gray-500, #7a869a)'
}

function renderRadarChart() {
    const canvas = radarCanvas.value

    if (!canvas) {
        return
    }

    const { labels, rawData, backgroundColors } = radarSeries.value

    if (!labels.length) {
        radarChart.value?.destroy()
        radarChart.value = null
        return
    }

    const data: ChartData<'polarArea'> = {
        labels,
        datasets: [
            {
                label: 'Taste tags',
                data: rawData,
                backgroundColor: backgroundColors,
                borderColor: '#ffffff',
                borderWidth: 2,
            },
        ],
    }

    const options: ChartOptions<'polarArea'> = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                beginAtZero: true,
                pointLabels: {
                    centerPointLabels: true,
                    display: true,
                    color: '#2a213f',
                    font: {
                        size: 14,
                        family: 'Inter, sans-serif',
                    },
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: false,
            },
        },
    }

    radarChart.value?.destroy()
    radarChart.value = new Chart(canvas, {
        type: 'polarArea',
        data,
        options,
    })
}

watch(radarSeries, () => {
    renderRadarChart()
}, { deep: true })

onMounted(() => {
    renderRadarChart()
})

onBeforeUnmount(() => {
    radarChart.value?.destroy()
    radarChart.value = null
})

</script>

<template>
    <div class="block-container block-taste-profile">
        <OverlayLoader v-if="isLoading"></OverlayLoader>

        <div class="taste-header">
            <p class="taste-subtitle">A snapshot of your preferred tags and alcohol strength mix.</p>
        </div>

        <section class="taste-section">
            <div class="radar-chart-wrapper">
                <canvas ref="radarCanvas" aria-label="Taste profile tags polar chart" role="img"></canvas>
            </div>
            <small v-if="!radarSeries.labels.length" class="taste-empty">No tag data available for polar chart.</small>
        </section>

        <section class="taste-section">
            <div class="taste-section__stat">
                <h2>{{ averageAbv.toFixed(1) }}%</h2>
                ABV Distribution
            </div>
            <h4 class="taste-section__title"></h4>
            <div v-if="abvDistribution.length" class="abv-bar" role="img" aria-label="ABV distribution">
                <div
                    v-for="bucket in abvDistribution"
                    :key="bucket.bucket"
                    class="abv-bar__segment"
                    :style="{ width: `${bucket.ratio * 100}%`, backgroundColor: bucketColor(bucket.bucket) }"
                    :title="`${bucket.bucket}: ${formatPercent(bucket.ratio)} (${bucket.count})`"
                ></div>
            </div>
            <ul v-if="abvDistribution.length" class="distribution-list">
                <li v-for="bucket in abvDistribution" :key="`abv-${bucket.bucket}`" class="distribution-item">
                    <span class="distribution-dot" :style="{ backgroundColor: bucketColor(bucket.bucket) }"></span>
                    <span class="distribution-name">{{ bucket.bucket }}</span>
                    <span class="distribution-value">{{ formatPercent(bucket.ratio) }}</span>
                </li>
            </ul>
        </section>

    </div>
</template>

<style scoped>
.block-taste-profile {
    display: grid;
    gap: var(--gap-size-3);
    padding: var(--gap-size-3);
}

.taste-header {
    display: grid;
    gap: 0.25rem;
}

.taste-title {
    margin: 0;
    line-height: 1.2;
}

.taste-stat {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding: 0.75rem;
    border-radius: 0.75rem;
    background: var(--clr-gray-100, #f3f5f8);
}

.taste-stat__label {
    color: var(--clr-gray-700);
}

.taste-stat__value {
    font-size: 1.3rem;
    line-height: 1;
}

.taste-section {
    display: grid;
    gap: 0.5rem;
}

.taste-section__title {
    margin: 0;
    font-size: 1rem;
}

.taste-empty {
    color: var(--clr-gray-700);
}

.radar-chart-wrapper {
    position: relative;
    height: 330px;
    width: 100%;
}

.abv-bar {
    display: flex;
    width: 100%;
    height: 20px;
    overflow: hidden;
    border-radius: 3px;
    background: var(--clr-gray-100);
}

.abv-bar__segment {
    height: 100%;
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

.taste-section__stat h2 {
    font-family: var(--font-heading);
    line-height: 1;
    font-size: 2.25rem;
}
</style>