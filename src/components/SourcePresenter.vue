<template>
    <a v-if="isLink" :href="source" target="_blank">{{ $t('source') }}</a>
    <span v-else>{{ $t('source') }}: {{ source }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    source: string;
}>()

const isLink = computed(() => {
    let url

    try {
        url = new URL(props.source)
    } catch (_) {
        return false
    }

    return url.protocol === 'http:' || url.protocol === 'https:'
})
</script>
