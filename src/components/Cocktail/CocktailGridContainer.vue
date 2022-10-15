<template>
    <div class="cocktail-grid-container">
        <slot />
    </div>
</template>

<style scoped>
.cocktail-grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    column-gap: 20px;
    row-gap: 20px;
}
</style>
