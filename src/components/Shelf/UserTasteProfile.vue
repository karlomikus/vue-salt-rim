<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { components } from '@/api/api'
import OverlayLoader from '../OverlayLoader.vue'
import {
    Chart,
    Filler,
    Legend,
    LineElement,
    PointElement,
    RadialLinearScale,
    RadarController,
    type ChartData,
    type ChartOptions,
} from 'chart.js'

Chart.register(RadialLinearScale, RadarController, PointElement, LineElement, Filler, Legend)

type UserTasteProfile = components["schemas"]["UserTasteProfile"]

const props = defineProps<{
    profile: UserTasteProfile | null;
}>()

const isLoading = ref(false)

const favoriteTags = computed(() => [...(props.profile?.favorite_tags ?? [])].sort((a, b) => b.weight - a.weight))

const averageAbv = computed(() => props.profile?.average_abv ?? 0)
const radarCanvas = ref<HTMLCanvasElement | null>(null)
const radarChart = ref<Chart<'radar'> | null>(null)

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
    const formatRadarLabel = (label: string) => (label.length > 14 ? `${label.slice(0, 14)}...` : label)

    const labels = Array.from(new Set(
        positive
            .map(item => item.name)
            .filter((name): name is string => typeof name === 'string' && name.length > 0),
    ))

    const positiveMap = new Map<string, number>()
    positive.forEach((item) => {
        if (typeof item.name === 'string' && item.name.length > 0) {
            positiveMap.set(item.name, item.weight)
        }
    })

    // Find max weight to normalize for radar chart display (0-1 scale)
    const maxWeight = Math.max(...Array.from(positiveMap.values()), 1)

    return {
        labels: labels.map(formatRadarLabel),
        positiveData: labels.map(label => (positiveMap.get(label) ?? 0) / maxWeight),
        rawData: labels.map(label => positiveMap.get(label) ?? 0),
    }
})

function formatPercent(ratio: number) {
    return `${(ratio * 100).toFixed(1)}%`
}

function bucketColor(bucket: string) {
    const palette: Record<string, string> = {
        low: 'var(--clr-chart-2, #2b9348)',
        medium: 'var(--clr-chart-6, #f8961e)',
        high: 'var(--clr-chart-8, #d00000)',
    }

    return palette[bucket] ?? 'var(--clr-gray-500, #7a869a)'
}

function renderRadarChart() {
    const canvas = radarCanvas.value

    if (!canvas) {
        return
    }

    const { labels, rawData } = radarSeries.value

    if (!labels.length) {
        radarChart.value?.destroy()
        radarChart.value = null
        return
    }

    const maxCount = Math.max(...rawData, 1)

    const data: ChartData<'radar'> = {
        labels,
        datasets: [
            {
                label: 'Favorite tags',
                data: rawData,
                backgroundColor: 'rgba(86, 70, 120, 0)',
                // pointBackgroundColor: 'rgba(86, 70, 120, 1)',
                // pointBorderColor: '#ffffff',
                borderColor: '#8f4277',
                pointRadius: 0,
                borderWidth: 3,
                tension: .1
            },
        ],
    }

    const shadowPlugin = {
        id: 'radarLineShadow',
        beforeDatasetDraw(chart: Chart) {
            chart.ctx.save()
            chart.ctx.shadowColor = 'rgba(143, 66, 119, 0.45)'
            chart.ctx.shadowBlur = 10
            chart.ctx.shadowOffsetX = 0
            chart.ctx.shadowOffsetY = 4
        },
        afterDatasetDraw(chart: Chart) {
            chart.ctx.restore()
        },
    }

    const options: ChartOptions<'radar'> = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                min: 0,
                max: maxCount,
                ticks: {
                    callback(value) {
                        return String(Number(value))
                    },
                },
                pointLabels: {
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
        type: 'radar',
        data,
        options,
        plugins: [shadowPlugin],
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
                <canvas ref="radarCanvas" aria-label="Taste profile tags radar" role="img"></canvas>
            </div>
            <small v-if="!radarSeries.labels.length" class="taste-empty">No tag data available for radar chart.</small>
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