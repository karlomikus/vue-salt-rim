<script setup lang="ts">
import type { components } from '@/api/api'

type Collection = components["schemas"]["Collection"]

const props = defineProps<{
    collection: Collection
}>()
</script>

<template>
    <div class="block-container block-container--padded">
        <h2 class="details-block-container__title">{{ props.collection.name }}</h2>
        <p>{{ props.collection.description ?? 'n/a' }}</p>
    </div>
</template>