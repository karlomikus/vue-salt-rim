<template>
    <div class="ingredient-grid-container">
        <slot :observer="observer" />
    </div>
</template>

<script>
export default {
    data() {
        return {
            observer: null,
        }
    },
}
</script>

<style scoped>
.ingredient-grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 10px;
}

@media (max-width: 450px) {
    .ingredient-grid-container {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    }
}
</style>
