<template>
    <div class="ingredient-cocktails block-container block-container--padded">
        <div class="ingredient-cocktails__header">
            <div>
                <h2 class="block-container__title">{{ t("ingredient.cocktails-with", { name: ingredientName }) }}</h2>
                <p class="ingredient-cocktails__hint">
                    {{ t("ingredient.you-can-make", { count: makeableTotal }) }}
                </p>
            </div>
            <RouterLink
                v-if="cocktailsTotal > 0"
                class="ingredient-cocktails__see-all"
                :to="{
                    name: 'cocktails',
                    query: {
                        'filter[specific_ingredients]': ingredientId,
                    },
                }"
            >
                {{ t("ingredient.see-all", { total: cocktailsTotal }) }} →
            </RouterLink>
        </div>
        <OverlayLoader v-if="isLoading" />
        <div v-else-if="cocktails.length > 0" class="ingredient-cocktails__grid">
            <RouterLink
                v-for="cocktail in cocktails"
                :key="cocktail.id"
                class="ingredient-cocktails__cocktail"
                :to="{ name: 'cocktails.show', params: { id: cocktail.slug } }"
            >
                <div class="ingredient-cocktails__cocktail__image">
                    <img :src="cocktailImage(cocktail)" :alt="cocktail.name" />
                </div>
                <h3>{{ cocktail.name }}</h3>
                <p v-if="cocktailIngredients(cocktail).length">
                    {{ cocktailIngredients(cocktail).join(", ") }}
                </p>
            </RouterLink>
        </div>
        <p v-else class="ingredient-cocktails__empty">
            {{ t("ingredient.no-cocktails-with") }}
        </p>
    </div>
</template>

<script setup lang="ts">
import { watch, withDefaults } from "vue";
import { useI18n } from "vue-i18n";
import BarAssistantClient from "@/api/BarAssistantClient";
import OverlayLoader from "@/components/OverlayLoader.vue";
import { useIngredientCocktails } from "@/composables/ingredient/useIngredientCocktails";

const props = withDefaults(
    defineProps<{
        ingredientId: number;
        ingredientName: string;
        inBarShelf?: boolean;
        maxCocktails?: number;
    }>(),
    {
        inBarShelf: undefined,
        maxCocktails: 5,
    },
);

const { t } = useI18n();
const { cocktails, cocktailsTotal, makeableTotal, isLoading, refresh } = useIngredientCocktails();

function cocktailImage(cocktail: {
    images?: readonly {
        id: number;
        thumb_url?: string | null;
        url?: string | null;
    }[];
}) {
    const image = cocktail.images?.[0];

    if (!image) {
        return "/no-cocktail.jpg";
    }

    if (image.thumb_url) {
        return image.thumb_url.startsWith("http") ? image.thumb_url : `${window.srConfig.API_URL}${image.thumb_url}`;
    }

    if (image.url) {
        return image.url.startsWith("http") ? image.url : `${window.srConfig.API_URL}${image.url}`;
    }

    return BarAssistantClient.getImageThumbUrl(image.id);
}

function cocktailIngredients(cocktail: {
    ingredients?: readonly {
        ingredient: {
            name: string;
        };
    }[];
}) {
    return (cocktail.ingredients ?? []).slice(0, 3).map((item) => item.ingredient.name);
}

watch(
    () => [props.ingredientId, props.maxCocktails, props.inBarShelf],
    () => refresh(props.ingredientId, props.maxCocktails),
    { immediate: true },
);
</script>

<style scoped>
.ingredient-cocktails__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--gap-size-3);
    margin-bottom: var(--gap-size-2);
}

.ingredient-cocktails__header .block-container__title {
    margin-bottom: 0.25rem;
}

.ingredient-cocktails__hint {
    margin: 0;
    color: var(--clr-gray-600);
}

.dark-theme .ingredient-cocktails__hint {
    color: var(--clr-gray-300);
}

.ingredient-cocktails__see-all {
    flex-shrink: 0;
    font-weight: 600;
    white-space: nowrap;
}

.ingredient-cocktails__grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: var(--gap-size-2);
}

.ingredient-cocktails__cocktail {
    min-width: 0;
    color: inherit;
    text-decoration: none;
}

.ingredient-cocktails__cocktail__image {
    aspect-ratio: 4 / 3;
    overflow: hidden;
    border-radius: var(--radius-2);
    background: var(--clr-gray-100);
}

.dark-theme .ingredient-cocktails__cocktail__image {
    background: var(--clr-gray-800);
}

.ingredient-cocktails__cocktail__image img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.ingredient-cocktails__cocktail h3 {
    margin: var(--gap-size-1) 0 0;
    font-size: 0.9rem;
    line-height: 1.2;
}

.ingredient-cocktails__cocktail p {
    margin: 0.25rem 0 0;
    color: var(--clr-gray-600);
    font-size: 0.75rem;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.dark-theme .ingredient-cocktails__cocktail p {
    color: var(--clr-gray-300);
}

.ingredient-cocktails__cocktail:hover h3 {
    color: var(--clr-link-color-hover);
}

.ingredient-cocktails__empty {
    margin: 0;
    color: var(--clr-gray-600);
}

.dark-theme .ingredient-cocktails__empty {
    color: var(--clr-gray-300);
}

@media (max-width: 900px) {
    .ingredient-cocktails__grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

@media (max-width: 600px) {
    .ingredient-cocktails__header {
        flex-direction: column;
        gap: var(--gap-size-1);
    }

    .ingredient-cocktails__grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
</style>
