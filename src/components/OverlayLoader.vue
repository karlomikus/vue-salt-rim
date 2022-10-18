<script setup>
import Spinner from './Spinner.vue'
</script>

<template>
    <div class="overlay-loader">
        <Spinner size="50" />
    </div>
</template>

<style scope>
.overlay-loader {
    position: absolute;
    display: flex;
    background: rgba(255, 255, 255, 0.7);
    width: 100%;
    height: 100%;
    min-height: 200px;
    min-width: 200px;
    align-items: center;
    justify-content: center;
    z-index: 10;
}
</style>
