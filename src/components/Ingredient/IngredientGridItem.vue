<template>
    <div class="block-container block-container--hover ingredient-grid-item">
        <div class="ingredient-grid-item__header">
            <IngredientImage :image-url="defaultImage" :color="localIngredient.color" class="ingredient__image--small"></IngredientImage>
            <RouterLink class="ingredient-grid-item__title sr-grid-title" :to="{ name: 'ingredients.show', params: { id: localIngredient.slug } }">
                <small v-if="localIngredient.hierarchy.path_to_self">{{ localIngredient.hierarchy.path_to_self }}</small>
                {{ localIngredient.name }}
            </RouterLink>
        </div>
        <div class="ingredient-grid-item__content">
            <p v-html="cleanDescription"></p>
            <template v-if="showBarShelf">
                <ToggleIngredientBarShelf
                    v-if="localIngredient.in_bar_shelf !== undefined"
                    :ingredient="localIngredient"
                    v-model="localIngredient.in_bar_shelf"
                ></ToggleIngredientBarShelf>
                &middot;
            </template>
            <ToggleIngredientShoppingCart
                v-if="localIngredient.in_shopping_list !== undefined"
                :ingredient="localIngredient"
                v-model="localIngredient.in_shopping_list"
            ></ToggleIngredientShoppingCart>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import IngredientImage from "./IngredientImage.vue";
import removeMd from "remove-markdown";
import ToggleIngredientShoppingCart from "@/components/ToggleIngredientShoppingCart.vue";
import ToggleIngredientBarShelf from "@/components/ToggleIngredientBarShelf.vue";
import AppState from "@/AppState";
import type { components } from "@/api/api";

type Ingredient = components["schemas"]["Ingredient"];

const props = defineProps<{
    ingredient: Ingredient;
}>();

const localIngredient = ref<Ingredient>(props.ingredient);

const showBarShelf = computed(() => {
    const appState = new AppState();

    return appState.isAdmin();
});

const cleanDescription = computed(() => {
    if (!localIngredient.value.description) {
        return "";
    }

    const text = removeMd(localIngredient.value.description);

    return text.length > 100 ? text.substring(0, 100) + "..." : text;
});

const defaultImage = computed(() => {
    if (!localIngredient.value.images || localIngredient.value.images.length === 0) {
        return null;
    }

    return localIngredient.value.images[0]?.url ?? null;
});
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

    .dark-theme & {
        color: var(--clr-gray-400);
    }
}

.ingredient-grid-item__content p {
    text-wrap: balance;
    color: var(--clr-gray-700);
}

.dark-theme .ingredient-grid-item__content p {
    color: var(--clr-gray-400);
}
</style>
