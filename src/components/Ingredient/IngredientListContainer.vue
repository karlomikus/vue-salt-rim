<template>
    <div class="shopping-list-container">
        <slot />
    </div>
</template>

<style scoped>
.shopping-list-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
    gap: 10px;
}

@media (max-width: 450px) {
    .shopping-list-container {
        grid-template-columns: 100%;
    }
}
</style>
