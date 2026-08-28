<template>
    <div class="rating" :title="t('your-rating')" @pointerleave="clearPreview">
        <OverlayLoader v-if="isLoading" :size="25" />
        <span v-for="val in max" :key="val" class="rating__star">
            <span class="rating__empty" aria-hidden="true">☆</span>
            <span class="rating__filled" :style="{ width: `${fillPercent(val)}%` }" aria-hidden="true">★</span>
            <button
                class="rating__half rating__half--left"
                type="button"
                :aria-label="`Rate ${val - 0.5} stars`"
                :disabled="isLoading"
                @pointerenter="previewRating = val - 0.5"
                @focus="previewRating = val - 0.5"
                @blur="clearPreview"
                @click="rate(val - 0.5)"
            ></button>
            <button
                class="rating__half rating__half--right"
                type="button"
                :aria-label="`Rate ${val} stars`"
                :disabled="isLoading"
                @pointerenter="previewRating = val"
                @focus="previewRating = val"
                @blur="clearPreview"
                @click="rate(val)"
            ></button>
        </span>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import BarAssistantClient from "@/api/BarAssistantClient";
import OverlayLoader from "./OverlayLoader.vue";
import { useSaltRimToast } from "@/composables/toast";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const toast = useSaltRimToast();
const isLoading = ref(false);
const max = 5;
const min = 1;
const props = defineProps<{
    rating: number;
    id: number;
    type: string;
}>();
const emit = defineEmits<{
    (e: "rated", rating: number): void;
}>();
const currentRating = ref(props.rating);
const previewRating = ref<number | null>(null);
const displayedRating = computed(() => previewRating.value ?? currentRating.value);

function fillPercent(val: number): number {
    return Math.max(0, Math.min(100, (displayedRating.value - (val - 1)) * 100));
}

function clearPreview() {
    previewRating.value = null;
}

async function rate(rating: number) {
    if (isLoading.value || rating < min || rating > max) {
        return;
    }

    isLoading.value = true;

    try {
        if (currentRating.value == rating) {
            await BarAssistantClient.deleteCocktailRating(props.id);
            currentRating.value = 0;
            toast.default(t("rating-removed"));
            emit("rated", 0);
        } else {
            await BarAssistantClient.rateCocktail(props.id, { rating: rating });
            currentRating.value = rating;
            toast.default(t("rating-rated", { rating: rating }));
            emit("rated", rating);
        }
    } catch (e) {
        toast.error(t("server-error"));
    } finally {
        isLoading.value = false;
    }
}

watch(
    () => props.id,
    () => {
        currentRating.value = props.rating;
    },
    { immediate: true },
);
</script>

<style scoped>
.rating {
    --color-base: var(--clr-gray-400);
    --color-rated: var(--clr-rating);
    font-size: 1.5rem;
    display: inline-block;
}

.dark-theme .rating {
    --color-base: var(--clr-gray-50);
    --color-rated: var(--clr-rating);
}

.rating__star {
    position: relative;
    display: inline-block;
    width: 1em;
    height: 1em;
}

.rating__empty,
.rating__filled {
    position: absolute;
    inset: 0;
    display: block;
    line-height: 1;
}

.rating__empty {
    color: var(--color-base);
}

.rating__filled {
    color: var(--color-rated);
    overflow: hidden;
}

.rating__half {
    position: absolute;
    z-index: 1;
    top: 0;
    width: 50%;
    height: 100%;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
}

.rating__half--left {
    left: 0;
}

.rating__half--right {
    right: 0;
}

.rating__half:focus-visible {
    outline: 2px solid var(--color-rated);
    outline-offset: 2px;
}
</style>
