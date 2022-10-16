<template>
    <div class="cocktail-grid-container">
        <slot />
    </div>
</template>

<style scoped>
.cocktail-grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(var(--cocktail-card-width), 1fr));
    column-gap: 20px;
    row-gap: 20px;
}
</style>
