<template>
    <div class="subscription-check" v-if="!appState.isSubscribed()">
        📢 <slot></slot> &middot; <RouterLink :to="{name: 'settings.billing'}">Find out more!</RouterLink>
    </div>
</template>

<script>
import AppState from '../AppState';

export default {
    data() {
        return {
            appState: new AppState()
        }
    }
}
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
