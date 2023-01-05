<template>
    <nav class="settings-nav">
        <RouterLink :to="{name: 'settings.profile'}">Profile</RouterLink>
        <template v-if="isAdmin">
            <RouterLink :to="{name: 'settings.users'}">Users</RouterLink>
            <RouterLink :to="{name: 'settings.categories'}">Ingredient categories</RouterLink>
            <RouterLink :to="{name: 'settings.glasses'}">Glass types</RouterLink>
        </template>
    </nav>
</template>
<script>
import Auth from "@/Auth";

export default {
    data() {
        return {
            isAdmin: Auth.isAdmin()
        };
    }
}
</script>
<style scoped>
.settings-nav {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.settings-nav a {
    padding: 5px 10px;
    background-color: rgba(255, 255, 255, .5);
    text-decoration: none;
    border-radius: 5px;
}

.settings-nav a.router-link-exact-active {
    background-color: var(--clr-gray-800);
    color: #fff;
}
</style>
