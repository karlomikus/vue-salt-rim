<script setup>
const props = defineProps({
    rating: {
        type: Number,
        default: 0
    }
})
</script>

<template>
    <span class="mini-rating" :title="$t('your-rating')">
        {{ rating }} ★
    </span>
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
