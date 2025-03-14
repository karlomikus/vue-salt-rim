<template>
    <div class="block-container block-container--hover ingredient-grid-item">
        <div class="ingredient-grid-item__image">
            <IngredientImage :image-url="defaultImage" :color="ingredient.color"></IngredientImage>
        </div>
        <div class="ingredient-grid-item__content">
            <RouterLink class="ingredient-grid-item__title sr-grid-title" :to="{ name: 'ingredients.show', params: { id: ingredient.slug } }">
                <small v-if="ingredient.hierarchy.path_to_self">{{ ingredient.hierarchy.path_to_self }}</small>
                {{ ingredient.name }}
            </RouterLink>
            <p v-html="cleanDescription"></p>
            <div class="ingredient-grid-item__actions">
                <template v-if="showBarShelf">
                    <ToggleIngredientBarShelf :ingredient="ingredient" :status="ingredient.in_bar_shelf ?? false"></ToggleIngredientBarShelf>
                    &middot;
                </template>
                <ToggleIngredientShelf :ingredient="ingredient" :status="ingredient.in_shelf ?? false"></ToggleIngredientShelf>
                &middot;
                <ToggleIngredientShoppingCart :ingredient="ingredient" :status="ingredient.in_shopping_list ?? false"></ToggleIngredientShoppingCart>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import IngredientImage from './IngredientImage.vue'
import removeMd from 'remove-markdown'
import ToggleIngredientShoppingCart from '@/components/ToggleIngredientShoppingCart.vue'
import ToggleIngredientShelf from '@/components/ToggleIngredientShelf.vue'
import ToggleIngredientBarShelf from '@/components/ToggleIngredientBarShelf.vue'
import AppState from '@/AppState'
import type { components } from '@/api/api'

type Ingredient = components['schemas']['Ingredient']

const props = defineProps<{
    ingredient: Ingredient
}>()

const showBarShelf = computed(() => {
    const appState = new AppState();

    return appState.isAdmin() || appState.isModerator()
})

const cleanDescription = computed(() => {
    if (!props.ingredient.description) {
        return ''
    }

    const text = removeMd(props.ingredient.description)

    return text.length > 100 ? text.substring(0, 100) : text
})

const defaultImage = computed(() => {
    if (!props.ingredient.images || props.ingredient.images.length === 0) {
        return null
    }

    return props.ingredient.images[0]?.url ?? null
})
</script>

<style scoped>
.ingredient-grid-item {
    --_clr-content: var(--clr-gray-500);
    display: flex;
    width: 100%;
    padding: var(--gap-size-3);
}

.dark-theme .ingredient-grid-item {
    --_clr-content: var(--clr-gray-400);
}

.ingredient-grid-item__image {
    margin-right: var(--gap-size-3);
}

.ingredient-grid-item__title {
    text-decoration: none;
}

.ingredient-grid-item__title small {
    display: block;
    font-size: 0.7rem;
    color: var(--clr-gray-500);
    font-family: var(--font-primary);
}

.ingredient-grid-item__content {
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-2);
}

.ingredient-grid-item__content p {
    color: var(--_clr-content);
    overflow: hidden;
    line-height: 1.4;
    text-wrap: balance;
}
</style>
