<script setup lang="ts">
import { computed, ref } from "vue";
import type { components } from "@/api/api";
import OverlayLoader from "../OverlayLoader.vue";

type UserTasteProfile = components["schemas"]["UserTasteProfile"];

const props = defineProps<{
    profile: UserTasteProfile | null;
}>();

const isLoading = ref(false);

const favoriteTags = computed(() => [...(props.profile?.favorite_tags ?? [])]);
const dislikedTags = computed(() => [...(props.profile?.disliked_tags ?? [])]);

const averageAbv = computed(() => props.profile?.average_abv ?? 0);

const abvDistribution = computed(() => {
    const buckets = props.profile?.abv_distribution ?? [];
    const order = { low: 0, medium: 1, high: 2 };

    return [...buckets].sort((a, b) => {
        const aOrder = order[a.bucket as keyof typeof order] ?? 99;
        const bOrder = order[b.bucket as keyof typeof order] ?? 99;

        return aOrder - bOrder;
    });
});

const sortedDislikedTags = computed(() => {
    return [...dislikedTags.value].sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
});

const sortedFavoriteTags = computed(() => {
    return [...favoriteTags.value].sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
});

const maxDislikedWeight = computed(() => {
    const weights = sortedDislikedTags.value.map((t) => t.weight ?? 0);
    return weights.length > 0 ? Math.max(...weights) : 1;
});

const maxFavoriteWeight = computed(() => {
    const weights = sortedFavoriteTags.value.map((t) => t.weight ?? 0);
    return weights.length > 0 ? Math.max(...weights) : 1;
});

function barWidth(weight: number | undefined, side: "negative" | "positive"): string {
    const max = side === "negative" ? maxDislikedWeight.value : maxFavoriteWeight.value;
    return `${((weight ?? 0) / max) * 100}%`;
}

function formatPercent(ratio: number) {
    return `${(ratio * 100).toFixed(1)}%`;
}

function bucketColor(bucket: string) {
    const palette: Record<string, string> = {
        low: "var(--clr-chart-3)",
        medium: "var(--clr-chart-6)",
        high: "var(--clr-chart-9)",
    };

    return palette[bucket] ?? "var(--clr-gray-500)";
}
</script>

<template>
    <div class="block-container block-taste-profile">
        <OverlayLoader v-if="isLoading"></OverlayLoader>

        <div class="taste-header">
            <p class="taste-subtitle">A snapshot of total cocktails in your disliked tags, favorite tags and alcohol strength mix.</p>
        </div>

        <section class="taste-section">
            <div v-if="sortedDislikedTags.length > 0 || sortedFavoriteTags.length > 0" class="bar-chart" role="img" aria-label="Taste profile tags bar chart">
                <div class="bar-chart__negative">
                    <h4 class="bar-chart__title">Disliked tags</h4>
                    <div v-for="tag in sortedDislikedTags" :key="tag.name" class="bar-row">
                        <span class="bar-row__label bar-row__label--negative">{{ tag.name }} ({{ tag.weight }})</span>
                        <div class="bar-row__bar bar-row__bar--negative" :style="{ width: barWidth(tag.weight, 'negative') }"></div>
                    </div>
                </div>
                <div class="bar-chart__divider"></div>
                <div class="bar-chart__positive">
                    <h4 class="bar-chart__title">Liked tags</h4>
                    <div v-for="tag in sortedFavoriteTags" :key="tag.name" class="bar-row">
                        <span class="bar-row__label bar-row__label--positive">{{ tag.name }} ({{ tag.weight }})</span>
                        <div class="bar-row__bar bar-row__bar--positive" :style="{ width: barWidth(tag.weight, 'positive') }"></div>
                    </div>
                </div>
            </div>
            <small class="taste-empty" v-else>No tag data available.</small>
        </section>

        <section class="taste-section">
            <div class="taste-section__stat">
                <h2>{{ averageAbv.toFixed(1) }}%</h2>
                Preferred ABV
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

.bar-chart {
    display: flex;
    align-items: stretch;
    gap: 0;
}

.bar-chart__negative,
.bar-chart__positive {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 0;
}

.bar-chart__title {
    margin: 0 0 0.25rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--clr-gray-700);
    .dark-theme & {
        color: var(--clr-gray-300);
    }
}

.bar-chart__negative .bar-chart__title {
    text-align: right;
}

.bar-chart__positive .bar-chart__title {
    text-align: left;
}

.bar-chart__divider {
    width: 1px;
    background: var(--clr-gray-300);
    border-radius: 1px;
    margin: 0 var(--gap-size-2);
    flex-shrink: 0;
}

.bar-row {
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-1);
}

.bar-row__label {
    font-size: 0.75rem;
    line-height: 1.2;
    color: var(--clr-gray-800);
    white-space: nowrap;
    flex-shrink: 0;
    .dark-theme & {
        color: var(--clr-gray-200);
    }
}

.bar-row__label--negative {
    text-align: right;
    order: -1;
}

.bar-row__bar {
    height: 1.25rem;
    border-radius: 0 3px 3px 0;
    transition: width 0.3s ease;
    min-width: 0;
}

.bar-chart__negative .bar-row__bar,
.bar-row__bar--negative {
    border-radius: 3px 0 0 3px;
    background: #e76f51;
    align-self: flex-end;
}

.bar-row__bar--positive {
    background: #2a9d8f;
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
