<template>
    <nav class="settings-nav">
        <RouterLink :to="{name: 'settings.profile'}">{{ $t('profile') }}</RouterLink>
        <RouterLink :to="{name: 'settings.tokens'}">{{ $t('api.tokens') }}</RouterLink>
        <RouterLink :to="{name: 'settings.oauth'}">{{ $t('api.oauth') }}</RouterLink>
        <RouterLink :to="{name: 'settings.exports'}">{{ $t('exports.title') }}</RouterLink>
        <template v-if="showBilling === true">
            <RouterLink :to="{name: 'settings.billing'}">{{ $t('billing.title') }}</RouterLink>
        </template>
        <template v-if="appState.isAdmin() || appState.isModerator()">
            <RouterLink :to="{name: 'settings.users'}">{{ $t('users.title') }}</RouterLink>
            <RouterLink :to="{name: 'settings.categories'}">{{ $t('ingredient.categories') }}</RouterLink>
            <RouterLink :to="{name: 'settings.glasses'}">{{ $t('glass-type.types') }}</RouterLink>
            <RouterLink :to="{name: 'settings.tags'}">{{ $t('tag.tags') }}</RouterLink>
            <RouterLink :to="{name: 'settings.utensils'}">{{ $t('utensils.title') }}</RouterLink>
            <RouterLink :to="{name: 'settings.price-categories'}">{{ $t('prices.price-categories') }}</RouterLink>
        </template>
    </nav>
</template>
<script>
import AppState from './../../AppState.js'

export default {
    data() {
        return {
            appState: new AppState(),
            showBilling: window.srConfig.BILLING_ENABLED
        }
    }
}
</script>
<style scoped>
.settings-nav {
    --sn-clr-bg-hover: var(--clr-gray-800);
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-2);
}

.dark-theme .settings-nav {
    --sn-clr-bg-hover: var(--clr-dark-main-800);
}

.settings-nav a {
    padding: 5px 10px;
    text-decoration: none;
    border-radius: var(--radius-2);
}

.settings-nav a.router-link-exact-active {
    background-color: var(--sn-clr-bg-hover);
    color: #fff;
}
</style>
