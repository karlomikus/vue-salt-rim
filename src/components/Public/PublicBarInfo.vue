<template>
    <div class="public-layout-logo">
        <div class="public-layout-logo__image">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 512 512"><path fill="#fff" fill-rule="evenodd" d="M20 0h472c11.046 0 20 8.954 20 20v472c0 11.046-8.954 20-20 20H20c-11.046 0-20-8.954-20-20V20C0 8.954 8.954 0 20 0Zm365.643 234.638H287.62L117.146 354.345H78.789V84.995h38.357L287.62 204.703h98.023V129.89H424v179.561h-38.357v-74.813Zm-230.14 52.523V152.179l-38.357-26.935v188.852l38.357-26.935Zm99.727 113.798H78.79v40.062h176.44v-40.062Z" clip-rule="evenodd"/></svg>
        </div>
        <div class="public-layout-logo__logotype">
            <h1>{{ props.bar.name }}</h1>
            <span>{{ props.bar.subtitle || 'Your personal bar assistant' }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { components } from '@/api/api'

type Bar = components['schemas']['PublicBarResource']

const props = defineProps<{
    bar: Bar
}>()
</script>

<style scoped>
.public-layout-logo {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
}

.public-layout-logo__image {
    width: 40px;
    height: 40px;
    margin-bottom: 0.5rem;
}

.public-layout-logo__logotype h1 {
    font-size: 1.25em;
    font-weight: bold;
    margin: 0;
    line-height: 1;
}

.public-layout-logo__logotype span {
    font-size: 0.75em;
    display: block;
}
</style>
