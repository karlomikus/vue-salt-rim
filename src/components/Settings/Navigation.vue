<template>
    <nav class="settings-nav">
        <RouterLink :to="{name: 'settings.profile'}">{{ $t('profile') }}</RouterLink>
        <template v-if="isAdmin">
            <RouterLink :to="{name: 'settings.users'}">{{ $t('users') }}</RouterLink>
            <RouterLink :to="{name: 'settings.categories'}">{{ $t('ingredient.categories') }}</RouterLink>
            <RouterLink :to="{name: 'settings.glasses'}">{{ $t('glass-types') }}</RouterLink>
            <RouterLink :to="{name: 'settings.tags'}">{{ $t('tags') }}</RouterLink>
            <RouterLink :to="{name: 'settings.utensils'}">{{ $t('utensils.title') }}</RouterLink>
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
    --sn-clr-bg: rgba(255, 255, 255, .5);
    --sn-clr-bg-hover: var(--clr-gray-800);
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.dark-theme .settings-nav {
    --sn-clr-bg: rgba(0, 0, 0, .5);
    --sn-clr-bg-hover: var(--clr-dark-main-800);
}

.settings-nav a {
    padding: 5px 10px;
    background-color: var(--sn-clr-bg);
    text-decoration: none;
    border-radius: 5px;
}

.settings-nav a.router-link-exact-active {
    background-color: var(--sn-clr-bg-hover);
    color: #fff;
}
</style>
