<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { d } = useI18n()
const {
    date,
    format = 'short'
} = defineProps<{
    date: string;
    format?: string;
}>()

const formattedDate = computed(() => {
    const parsedDate = new Date(date)

    return d(parsedDate, format)
})
</script>

<template>
    {{ formattedDate }}
</template>
