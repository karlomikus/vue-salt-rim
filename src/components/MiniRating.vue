<template>
    <span class="mini-rating" title="Your rating">
        {{ rating }} ★
    </span>
</template>

<script>
export default {
    props: {
        rating: {
            type: Number,
            default: 0
        }
    }
}
</script>

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

.mini-rating.mini-rating--user {
    background-color: rgb(215, 235, 252);
    color: rgb(0, 99, 180);
}
</style>
