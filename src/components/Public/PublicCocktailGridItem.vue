<template>
    <RouterLink :to="{name: 'public.cocktails.show', params: {barId: bar.slug, slug: cocktail.slug}}" class="public-cocktail-grid-item block-container">
        <h3 class="public-cocktail-grid-item__thumb">
            <img :src="mainImage.url" :alt="mainImage.copyright ?? cocktail.name" />
        </h3>
        <div class="public-cocktail-grid-item__content">
            <div class="public-cocktail-grid-item__title">
                {{ cocktail.name }}
            </div>
            <div class="public-cocktail-grid-item__ingredients">{{ cocktail.ingredients.map(i => i.name).join(', ') }}</div>
        </div>
    </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { components } from '@/api/api'

type Cocktail = components['schemas']['PublicCocktailResource']
type Bar = components['schemas']['PublicBarResource']

const props = defineProps<{
    cocktail: Cocktail,
    bar: Bar,
}>()

const mainImage = computed(() => {
    if (props.cocktail.images && props.cocktail.images.length > 0) {
        return  props.cocktail.images[0]
    }

    return {
        url: '/no-cocktail.jpg',
        copyright: 'Missing cocktail image',
    }
})
</script>

<style scoped>
.public-cocktail-grid-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    overflow: hidden;
    border-top: 0;
    text-decoration: none;
}

.public-cocktail-grid-item__thumb {
    width: 100%;
    aspect-ratio: 1 / 1;
    overflow: hidden;
}

.public-cocktail-grid-item__thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.public-cocktail-grid-item__content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
}

.public-cocktail-grid-item__title {
    line-height: 1.2;
    font-size: 1.25em;
    font-family: var(--font-heading);
    font-weight: bold;
}

.public-cocktail-grid-item__ingredients {
    color: var(--clr-gray-600);
    font-size: 0.875em;
    line-height: 1.4;
}
</style>
