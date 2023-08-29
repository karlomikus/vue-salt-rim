<script setup>
import Spinner from './Spinner.vue'
</script>

<template>
    <div class="overlay-loader">
        <Spinner :size="50" />
    </div>
</template>

<style scope>
.overlay-loader {
    --ol-clr-bg: rgba(255, 255, 255, 0.7);
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    background: var(--ol-clr-bg);
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

.dark-theme .overlay-loader {
    --ol-clr-bg: rgba(0, 0, 0, 0.7);
}
</style>
