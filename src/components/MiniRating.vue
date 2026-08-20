<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const { rating = 0 } = defineProps<{
    rating: number;
}>();

// Round to the nearest 0.5 and strip the trailing ".0" so 3.5 renders as "3.5"
// and 3.0 renders as "3", avoiding any float-arithmetic artifacts.
const display = computed(() => {
    const rounded = Math.round(rating * 2) / 2;
    return Number(rounded.toFixed(1)).toString();
});
</script>

<template>
    <span class="mini-rating" :title="t('your-rating')"> {{ display }} ★ </span>
</template>

<style scoped>
.mini-rating {
    display: inline;
    background-color: var(--clr-rating-bg);
    font-family: var(--font-primary);
    color: var(--clr-rating);
    font-size: 0.75rem;
    padding: 1px 5px;
    border-radius: var(--radius-2);
}

.dark-theme .mini-rating {
    background-color: rgb(167, 75, 22);
    color: rgb(255, 236, 207);
}
</style>
