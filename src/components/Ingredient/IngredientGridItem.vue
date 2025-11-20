<template>
    <div class="block-container block-container--hover ingredient-grid-item">
        <div class="ingredient-grid-item__header">
            <IngredientImage :image-url="defaultImage" :color="ingredient.color" class="ingredient__image--small"></IngredientImage>
            <RouterLink class="ingredient-grid-item__title sr-grid-title" :to="{ name: 'ingredients.show', params: { id: ingredient.slug } }">
                <small v-if="ingredient.hierarchy.path_to_self">{{ ingredient.hierarchy.path_to_self }}</small>
                {{ ingredient.name }}
            </RouterLink>
        </div>
        <div class="ingredient-grid-item__content">
            <p v-html="cleanDescription"></p>
            <template v-if="showBarShelf">
                <ToggleIngredientBarShelf v-if="ingredient.in_bar_shelf !== undefined" :ingredient="ingredient" v-model="ingredient.in_bar_shelf"></ToggleIngredientBarShelf>
                &middot;
            </template>
            <template v-else>
                <ToggleIngredientShelf v-if="ingredient.in_shelf !== undefined" :ingredient="ingredient" v-model="ingredient.in_shelf"></ToggleIngredientShelf>
                &middot;
            </template>
            <ToggleIngredientShoppingCart v-if="ingredient.in_shopping_list !== undefined" :ingredient="ingredient" v-model="ingredient.in_shopping_list"></ToggleIngredientShoppingCart>
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
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-3);
    padding: var(--gap-size-3);
}

.ingredient-grid-item__header {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--gap-size-2);
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
    color: var(--clr-gray-600);
    font-family: var(--font-primary);
}

.ingredient-grid-item__content p {
    text-wrap: balance;
    color: var(--clr-gray-700);
}

.dark-theme .ingredient-grid-item__content p {
    color: var(--clr-gray-400);
}
</style>
