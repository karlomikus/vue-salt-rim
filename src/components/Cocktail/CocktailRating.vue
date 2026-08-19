<template>
    <div class="resource-rating">
        <span v-for="val in 5" :key="val" class="resource-rating__star" aria-hidden="true">
            <svg class="resource-rating__empty" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                    d="M12.0006 18.26L4.94715 22.2082L6.52248 14.2799L0.587891 8.7918L8.61493 7.84006L12.0006 0.5L15.3862 7.84006L23.4132 8.7918L17.4787 14.2799L19.054 22.2082L12.0006 18.26ZM12.0006 15.968L16.2473 18.3451L15.2988 13.5717L18.8719 10.2674L14.039 9.69434L12.0006 5.27502L9.96214 9.69434L5.12921 10.2674L8.70231 13.5717L7.75383 18.3451L12.0006 15.968Z"
                ></path>
            </svg>
            <span class="resource-rating__filled" :style="{ width: `${fillPercent(val)}%` }">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                        d="M12.0006 18.26L4.94715 22.2082L6.52248 14.2799L0.587891 8.7918L8.61493 7.84006L12.0006 0.5L15.3862 7.84006L23.4132 8.7918L17.4787 14.2799L19.054 22.2082L12.0006 18.26Z"
                    ></path>
                </svg>
            </span>
        </span>
        <span v-if="userRating" class="resource-rating__alt" :title="$t('your-rating')">{{ userRating }}</span>
    </div>
</template>
<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{ userRating?: number | null; averageRating?: number | null }>(), {
    userRating: null,
    averageRating: null,
});

const averageRating = computed(() => props.averageRating ?? 0);

function fillPercent(val: number): number {
    return Math.max(0, Math.min(100, (averageRating.value - (val - 1)) * 100));
}
</script>
<style scoped>
.resource-rating {
    display: flex;
    gap: 1px;
    align-items: center;
    justify-content: center;
}

.resource-rating__star {
    position: relative;
    display: inline-block;
    width: 16px;
    height: 16px;
}

.resource-rating__star svg {
    position: absolute;
    top: 0;
    left: 0;
    fill: var(--clr-rating);
    height: 100%;
}

.resource-rating__empty {
    width: 100%;
    opacity: 0.75;
}

.resource-rating__filled {
    position: absolute;
    inset: 0 auto 0 0;
    display: block;
    overflow: hidden;
    height: 100%;
}

.resource-rating__filled svg {
    width: 16px;
}

.resource-rating__alt {
    color: var(--clr-rating);
    background-color: var(--clr-rating-bg);
    display: block;
    padding: 0 5px;
    border-radius: var(--radius-1);
    font-size: 0.7rem;
    font-weight: var(--fw-bold);
}

@media (max-width: 450px) {
    .resource-rating__star {
        width: 12px;
        height: 12px;
    }

    .resource-rating__filled svg {
        width: 12px;
    }

    .resource-rating__alt {
        padding: 0 4px;
        font-size: 0.65rem;
    }
}
</style>
