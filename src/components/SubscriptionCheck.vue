<template>
    <div v-if="!appState.isSubscribed()" class="subscription-check">
        📢 <slot></slot> &middot; <RouterLink :to="{name: 'settings.billing'}">Find out more!</RouterLink>
    </div>
</template>

<script setup lang="ts">
import AppState from '../AppState'

const appState = new AppState()
</script>

<style scoped>
.subscription-check {
    padding: 2px 5px;
    border-radius: 2px;
    background-color: var(--clr-accent-100);
    color: var(--clr-accent-800);
    margin-bottom: var(--gap-size-2);
}

.subscription-check a {
    color: var(--clr-gray-800);
}
</style>
