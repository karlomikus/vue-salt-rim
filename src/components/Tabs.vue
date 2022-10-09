<template>
    <div class="tabs">
        <a href="#">My ingredients</a>
        <RouterLink :to="{name: 'shelf-cocktails'}">My cocktails</RouterLink>
        <a href="#">My recipies</a>
    </div>
</template>

<style scoped>
.tabs {
    width: 100%;
    display: flex;
}

.tabs a {
    display: block;
    width: 100%;
    text-align: center;
}
</style>
