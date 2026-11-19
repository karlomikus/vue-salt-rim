<script setup lang="ts">
const emit = defineEmits<{ dismiss: [] }>();
</script>

<template>
    <div class="overlay-scrim" aria-hidden="true" @click="emit('dismiss')"></div>
</template>

<style scoped>
.overlay-scrim {
    position: fixed;
    inset: 0;
    z-index: var(--scrim-z-index, 0);
    pointer-events: auto;
    background-color: var(--scrim-color, rgba(180, 175, 189, 0.8));
    backdrop-filter: var(--scrim-blur, blur(5px));
}

.dark-theme .overlay-scrim {
    background-color: var(--scrim-color-dark, rgba(11, 5, 21, 0.8));
}
</style>
