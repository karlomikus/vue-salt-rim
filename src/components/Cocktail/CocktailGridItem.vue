<template>
    <RouterLink class="cocktail-grid-item" :to="{ name: 'cocktails.show', params: { id: cocktail.slug } }" ref="observeElement">
        <div class="cocktail-grid-item__graphic">
            <div class="cocktail-grid-item__badges">
                <div v-if="cocktail.is_favorited" class="cocktail-badge" :title="$t('is_favorited')">
                    <IconFavorite></IconFavorite>
                </div>
                <div v-if="cocktail.in_bar_shelf" class="cocktail-badge" :title="$t('in_bar_shelf')">
                    <IconBarShelf></IconBarShelf>
                </div>
                <div v-if="cocktail.in_shelf" class="cocktail-badge" :title="$t('in_your_shelf')">
                    <IconUserShelf></IconUserShelf>
                </div>
                <div v-if="cocktail.public_id" class="cocktail-badge" :title="$t('is_public')">
                    <IconPublicLink></IconPublicLink>
                </div>
            </div>
            <img class="cocktail-grid-item__graphic__image" :data-img-src="mainCocktailImageUrl" :src="placeholderImage" alt="Main image of the cocktail">
        </div>
        <div class="block-container cocktail-grid-item__content">
            <h2 class="cocktail-grid-item__title sr-grid-title">{{ cocktail.name }}</h2>
            <div class="cocktail-grid-item__rating" v-if="cocktail.rating">
                <CocktailRating :user-rating="cocktail.rating.user ?? undefined" :average-rating="cocktail.rating.average" />
            </div>
            <p v-if="shortIngredients.length > 0" class="cocktail-grid-item__ingredients">{{ shortIngredients.join(', ') }}</p>
            <ul class="cocktail-tags" v-if="cocktail.tags && cocktail.tags.length > 0">
                <li v-for="tag in cocktail.tags.slice(0, maxTags)" :key="tag.id" class="chip">{{ tag.name }}</li>
                <li v-if="cocktail.tags.length - maxTags > 0" class="chip" style="opacity: 0.6;">+ {{ cocktail.tags.length - maxTags }} more</li>
            </ul>
        </div>
    </RouterLink>
</template>

<script setup lang="ts">
import BarAssistantClient from '@/api/BarAssistantClient';
import { thumbHashToDataURL } from 'thumbhash'
import CocktailRating from './CocktailRating.vue'
import IconFavorite from '../Icons/IconFavorite.vue';
import IconBarShelf from '../Icons/IconBarShelf.vue';
import IconUserShelf from '../Icons/IconUserShelf.vue';
import IconPublicLink from '../Icons/IconPublicLink.vue';
import type { components } from '@/api/api';
import { computed, onMounted, useTemplateRef, type ComponentPublicInstance } from 'vue';

type Cocktail = components['schemas']['Cocktail']

const props = defineProps<{
    cocktail: Cocktail,
    observer: IntersectionObserver,
}>()
const maxTags = 4
const el = useTemplateRef<ComponentPublicInstance>('observeElement')

const mainImage = computed(() => {
    const images = props.cocktail.images ?? []

    return images.sort((a, b) => a.sort - b.sort)[0]
})

const placeholderImage = computed(() => {
    if (mainImage.value && mainImage.value.placeholder_hash) {
        return thumbHashToDataURL(
            Uint8Array.from(atob(mainImage.value.placeholder_hash), c => c.charCodeAt(0))
        )
    }

    return ''
})

const mainCocktailImageUrl = computed(() => {
    if (mainImage.value) {
        return BarAssistantClient.getImageThumbUrl(mainImage.value.id)
    }

    return '/no-cocktail.jpg'
})

const shortIngredients = computed(() => {
    return props.cocktail.ingredients?.map(i => i.ingredient.name) ?? []
})

onMounted(() => {
    if (el.value) {
        props.observer.observe(el.value.$el)
    }
})
</script>
<style scoped>
.cocktail-grid-item {
    --_image-size: 325px;
    --_clr-content: var(--clr-gray-600);
    text-align: center;
    border-width: 3px;
    cursor: pointer;
    text-decoration: none;
    display: flex;
    flex-direction: column;
}

.cocktail-grid-item:hover .block-container {
    border-bottom-color: var(--clr-accent-500);
}

.dark-theme .cocktail-grid-item {
    --_clr-content: var(--clr-gray-400);
}

.cocktail-grid-item__title {
    text-wrap: balance;
}

.cocktail-grid-item__content {
    padding: 1.5rem;
    border-radius: var(--radius-3);
    margin-top: -2.25rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-2);
}

.cocktail-grid-item:hover .cocktail-grid-item__title {
    color: var(--clr-link-color-hover);
}

.cocktail-grid-item__ingredients {
    color: var(--_clr-content);
    font-size: 0.85rem;
}

.cocktail-grid-item__graphic {
    isolation: isolate;
}

.cocktail-grid-item__graphic img {
    width: 100%;
    height: var(--_image-size);
    border-top-left-radius: var(--radius-3);
    border-top-right-radius: var(--radius-3);
    object-fit: cover;
}

.cocktail-tags {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    list-style: none;
    padding: 0;
    gap: var(--gap-size-1);
}

.cocktail-grid-item__badges {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
    display: flex;
    gap: var(--gap-size-1);
    z-index: 1;
}

.cocktail-badge {
    background-color: rgba(0, 0, 0, .5);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: var(--radius-round);
}

.cocktail-badge svg {
    fill: rgba(255, 255, 255, .9);
    width: 16px;
    height: 16px;
}

@media (max-width: 545px) {
    .cocktail-grid-item {
        --_image-size: 250px;
    }

    .cocktail-grid-item__content {
        padding: var(--gap-size-3);
        border-radius: var(--radius-2);
        gap: var(--gap-size-1);
    }

    .cocktail-grid-item__graphic img {
        border-top-left-radius: var(--radius-2);
        border-top-right-radius: var(--radius-2);
    }

    .cocktail-tags .chip {
        padding: 1px 5px;
        font-size: 0.65rem;
    }
}
</style>
