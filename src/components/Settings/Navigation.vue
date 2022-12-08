<template>
    <nav class="settings-nav">
        <RouterLink :to="{name: 'settings.profile'}">Profile</RouterLink>
        <RouterLink :to="{name: 'settings.categories'}">Ingredient categories</RouterLink>
        <RouterLink :to="{name: 'settings.glasses'}">Glass types</RouterLink>
    </nav>
</template>
<style scoped>
.settings-nav {
    display: flex;
    flex-direction: column;
    gap: 10px;
    /* margin-top: 40px; */
}

.settings-nav a {
    padding: 5px 10px;
    background-color: rgba(255, 255, 255, .5);
    text-decoration: none;
}
</style>
