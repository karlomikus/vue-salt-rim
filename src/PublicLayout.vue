<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
    <div class="public-layout-navigation">
        <main>
            Bar Name
            <div class="public-layout-navigation__links">
                <a href="#">Menu</a>
                <a href="#">Cocktails</a>
            </div>
        </main>
    </div>
    <div class="public-layout-content">
        <RouterView />
    </div>
</template>

<style>
.public-layout-navigation {
    background-color: var(--clr-gray-900);
    color: #fff;
    padding: 1rem 0;
    margin-bottom: 2rem;
}

.public-layout-navigation__links {
    display: flex;
    gap: 1rem;
}

.public-layout-navigation__links a {
    color: #fff;
}

.public-layout-content {
    margin: 1rem 0;
}
</style>
