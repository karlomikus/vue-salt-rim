<script setup lang="ts">
import dayjs from 'dayjs'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { d } = useI18n()
const {
    date = dayjs().toString(),
    format = 'short'
} = defineProps<{
    date: string;
    format: string;
}>()

const formattedDate = computed(() => {
    const parsedDate = dayjs(date).toDate()

    return d(parsedDate, format)
})
</script>

<template>
    {{ formattedDate }}
</template>
