<template>
    <div class="shopping-list-container">
        <slot />
    </div>
</template>

<style scoped>
.shopping-list-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
    column-gap: 20px;
    row-gap: 20px;
}

@media (max-width: 450px) {
    .shopping-list-container {
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        column-gap: 10px;
        row-gap: 10px;
    }
}
</style>
