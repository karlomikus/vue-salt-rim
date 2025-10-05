<template>
    <div class="public-bar-details">
        <div class="public-bar-details__header">
            <h2>{{ bar.name }}</h2>
            <h3>{{ bar.subtitle }}</h3>
        </div>
        <div class="bar-cocktail-recipe__content block-container block-container--padded">
            {{ parsedDescription }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { components } from '@/api/api'
import { micromark } from 'micromark'

type Bar = components['schemas']['PublicBarResource']

const {
    bar,
} = defineProps<{
    bar: Bar
}>()

const parsedDescription = computed(() => {
    return bar.description ? micromark(bar.description) : ''
})
</script>

<style scoped>
.public-bar-details {
    --bcr-default-gap: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 800px;
    margin: 0 auto;
}

</style>
