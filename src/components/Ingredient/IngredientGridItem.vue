<template>
    <div class="block-container block-container--hover ingredient-grid-item" :class="{ 'ingredient-grid-item--shelf': inShelf }">
        <div class="ingredient-grid-item__image">
            <IngredientImage :ingredient="ingredient"></IngredientImage>
        </div>
        <div class="ingredient-grid-item__content">
            <RouterLink class="ingredient-grid-item__title" :to="{ name: 'ingredients.show', params: { id: ingredient.slug } }">
                <small v-if="ingredient.category">{{ ingredient.category.name }}</small>
                {{ ingredient.name }}
            </RouterLink>
            <p v-html="cleanDescription"></p>
            <div class="ingredient-grid-item__actions">
                <ToggleIngredientShelf :ingredient="ingredient" :status="inShelf"></ToggleIngredientShelf>
                &middot;
                <ToggleIngredientShoppingCart :ingredient="ingredient" :status="inList"></ToggleIngredientShoppingCart>
            </div>
        </div>
    </div>
</template>

<script>
import IngredientImage from './IngredientImage.vue'
import removeMd from 'remove-markdown'
import ToggleIngredientShoppingCart from '@/components/ToggleIngredientShoppingCart.vue'
import ToggleIngredientShelf from '@/components/ToggleIngredientShelf.vue'

export default {
    components: {
        IngredientImage,
        ToggleIngredientShoppingCart,
        ToggleIngredientShelf,
    },
    props: {
        ingredient: {
            type: Object,
            default() {
                return {}
            }
        },
        userIngredients: {
            type: Array,
            default() {
                return []
            }
        },
        shoppingList: {
            type: Array,
            default() {
                return []
            }
        }
    },
    computed: {
        inShelf() {
            return this.userIngredients.map(i => i.id).includes(this.ingredient.id)
        },
        inList() {
            return this.shoppingList.map(i => i.ingredient.id).includes(this.ingredient.id)
        },
        cleanDescription() {
            return removeMd(this.ingredient.description)
        }
    },
}
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
    font-family: var(--font-heading);
    font-weight: var(--fw-bold);
    font-size: 1.3rem;
    line-height: 1.3;
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
    gap: var(--gap-size-1);
}

.ingredient-grid-item__content p {
    color: var(--_clr-content);
    overflow: hidden;
    font-size: 0.815rem;
    max-height: calc(3 * 1.3rem);
}
</style>
