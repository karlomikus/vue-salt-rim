<template>
    <div class="tabs">
        <RouterLink :to="{name: 'ingredients'}">My ingredients</RouterLink>
        <RouterLink :to="{name: 'shelf-cocktails'}">My cocktails</RouterLink>
        <a href="#">My recipies</a>
        <a href="#">My collections</a>
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
    background: var(--color-btn-default);
    color: #fff;
    padding: 10px 30px;
    text-decoration: none;
    border-radius: 30px;
    margin: 0 10px;
}

.tabs a:hover,
.tabs a:focus,
.tabs a:active {
    background: var(--color-btn-default-hover);
}
</style>
