<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
    defineProps<{
        name: string;
        imageUrl: string;
        ingredients?: string[];
    }>(),
    {
        ingredients: () => [],
    },
);

const ingredientsText = computed(() => {
    if (props.ingredients.length <= 8) {
        return props.ingredients.join(", ");
    }

    return `${props.ingredients.slice(0, 8).join(", ")}...`;
});
</script>

<template>
    <article class="cocktail-recipe-card">
        <img class="cocktail-recipe-card__image" :src="imageUrl" :alt="`${props.name} cocktail`" loading="lazy" />
        <div class="cocktail-recipe-card__gradient" aria-hidden="true"></div>

        <div class="cocktail-recipe-card__content">
            <h3 class="cocktail-recipe-card__title">{{ name }}</h3>
            <p v-if="ingredientsText" class="cocktail-recipe-card__ingredients">{{ ingredientsText }}</p>
        </div>
    </article>
</template>

<style scoped>
.cocktail-recipe-card {
    /*aspect-ratio: 4 / 5;*/
    min-height: 14rem;
    border-radius: var(--radius-2);
    overflow: hidden;
    display: flex;
    align-items: flex-end;
    isolation: isolate;
    background-color: var(--clr-gray-900);
    box-shadow: var(--shadow-elevation-medium);
}

.dark-theme .cocktail-recipe-card {
    box-shadow: var(--shadow-elevation-medium-dark);
}

.cocktail-recipe-card__image,
.cocktail-recipe-card__gradient {
    position: absolute;
    inset: 0;
}

.cocktail-recipe-card__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.85);
}

.cocktail-recipe-card__gradient {
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 35%, rgba(0, 0, 0, 0.88) 100%);
}

.cocktail-recipe-card__content {
    width: 100%;
    z-index: 1;
    padding: var(--gap-size-3);
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-1);
    color: #fff;
}

.cocktail-recipe-card__title {
    font-family: var(--font-heading);
    font-size: 1.25em;
    font-weight: var(--fw-bold);
    line-height: 1.2;
    text-wrap: balance;
}

.cocktail-recipe-card__ingredients {
    font-size: 0.85em;
    line-height: 1.4;
    color: rgba(255, 255, 255, 0.88);
}

.cocktail-recipe-card__title,
.cocktail-recipe-card__ingredients {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.cocktail-recipe-card__title {
    -webkit-line-clamp: 2;
}

.cocktail-recipe-card__ingredients {
    -webkit-line-clamp: 3;
}

@media (max-width: 545px) {
    .cocktail-recipe-card {
        min-height: 14rem;
        border-radius: var(--radius-2);
    }

    .cocktail-recipe-card__content {
        padding: var(--gap-size-3);
    }

    .cocktail-recipe-card__title {
        font-size: 1.25rem;
    }
}
</style>
