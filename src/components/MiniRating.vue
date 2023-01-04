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
    background-color: rgb(252, 242, 215);
    color: rgb(180, 108, 0);
    font-size: 0.7rem;
    padding: 1px 5px;
    border-radius: 4px;
}
</style>
