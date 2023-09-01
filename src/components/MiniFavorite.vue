<template>
    <span class="mini-favorite" title="You favorited this resource">
        ♥
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
.mini-favorite {
    display: inline;
    background-color: rgb(252, 215, 215);
    font-family: var(--font-primary);
    color: rgb(180, 12, 0);
    font-size: 0.85rem;
    padding: 1px 5px;
    border-radius: 4px;
}

.dark-theme .mini-favorite {
    background-color: rgb(94, 52, 5);
    color: rgb(255, 236, 207);
}
</style>
