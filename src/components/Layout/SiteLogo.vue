<template>
    <component :is="element" to="/" class="site-logo">
        <div class="site-logo__image">
            <img v-if="image" :src="image" alt="">
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 512 512"><path fill="#fff" fill-rule="evenodd" d="M20 0h472c11.046 0 20 8.954 20 20v472c0 11.046-8.954 20-20 20H20c-11.046 0-20-8.954-20-20V20C0 8.954 8.954 0 20 0Zm365.643 234.638H287.62L117.146 354.345H78.789V84.995h38.357L287.62 204.703h98.023V129.89H424v179.561h-38.357v-74.813Zm-230.14 52.523V152.179l-38.357-26.935v188.852l38.357-26.935Zm99.727 113.798H78.79v40.062h176.44v-40.062Z" clip-rule="evenodd"/></svg>
        </div>
        <h1 class="site-logo__title">
            {{ name }}
            <span>{{ subtitle }}</span>
        </h1>
    </component>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { barBus } from '@/composables/eventBus'
import type { components } from '@/api/api'

type Bar = components["schemas"]["Bar"]

const {
    bar = {} as Bar,
    element = 'RouterLink'
} = defineProps<{
    bar?: Bar;
    element?: string;
}>()

const barRef = ref<Bar>(bar)

const name = computed(() => {
    return barRef.value.name || 'Bar Assistant'
})

const subtitle = computed(() => {
    return barRef.value.subtitle || 'Your personal bar assistant'
})

const image = computed(() => {
    return barRef.value.images && barRef.value.images.length > 0 ? barRef.value.images[0].url : ''
})

onMounted(() => {
    barBus.on((e, payload) => {
        if (e === 'barUpdated') {
            barRef.value = payload as Bar;
        }
    })
})
</script>
