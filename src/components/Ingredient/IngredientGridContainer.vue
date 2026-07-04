<template>
    <div class="ingredient-grid-container">
        <slot :observer="observer" />
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const observer = ref<IntersectionObserver | null>(null);
</script>

<style scoped>
.ingredient-grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: var(--gap-size-3);
}

@media (max-width: 450px) {
    .ingredient-grid-container {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    }
}
</style>
