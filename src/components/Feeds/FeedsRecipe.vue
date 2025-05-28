<template>
    <div class="block-container block-container--padded feeds-recipe">
        <div class="feeds-recipe__image" v-if="recipe.image">
            <img :src="recipe.image" alt="">
        </div>
        <div class="feeds-recipe__content">
            <a :href="recipe.link" target="_blank"><h5 class="sr-list-item-title">{{ recipe.title }} <IconExternal width="14" height="14" /></h5></a>
            <small>{{ recipe.source }} <template v-if="recipe.date">&middot; {{ d(recipe.date, 'short') }}</template></small>
            <p v-html="recipe.description"></p>
            <p v-if="recipe.supports_recipe_import">
                <RouterLink :to="{ name: 'cocktails.scrape', query: { 'url': encodeURI(recipe.link) } }">Import recipe</RouterLink>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { components } from '@/api/api'
import IconExternal from '../Icons/IconExternal.vue';

type FeedsRecipe = components["schemas"]["FeedsRecipe"]

interface Props {
    recipe: FeedsRecipe
}

const { d } = useI18n()

defineProps<Props>()
</script>

<style scoped>
.feeds-recipe {
    display: flex;
    gap: var(--gap-size-3);
}

.feeds-recipe__image {
    width: 100px;
    display: flex;
    flex-shrink: 0;
    flex-grow: 0;
}

.feeds-recipe__image img {
    object-fit: cover;
    display: block;
    width: 100%;
    border-radius: var(--radius-2);
}

.feeds-recipe__content small {
    color: var(--clr-gray-500);
}

@media (max-width: 450px) {
    .feeds-recipe {
        flex-direction: column;
    }
}
</style>