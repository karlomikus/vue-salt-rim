<template>
    <div class="block-container block-container--inset cocktail-price">
        <div class="cocktail-price__price">
            <h4>
                {{ unitHandler.formatPrice(cocktailPrice.total_price.price, cocktailPrice.total_price.currency) }}
                <small>{{ cocktailPrice.price_category.name }}</small>
            </h4>
        </div>
        <ul class="cocktail-price__ingredients">
            <li v-for="ingredient in cocktailPrice.prices_per_ingredient" :key="ingredient.ingredient.id">
                {{ ingredient.ingredient.name }} &middot; {{ unitHandler.formatPrice(ingredient.price_per_use.price, ingredient.price_per_use.currency) }} <small>/{{ $t('price.per-use')}} ({{ ingredient.units }})</small>
            </li>
            <li class="cocktail-price__missing-note" v-if="cocktailPrice.missing_prices_count > 0">{{ $t('price.missing-prices') }}</li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { unitHandler } from '@/composables/useUnits'
import type { components } from '@/api/api'

type CocktailPrice = components["schemas"]["CocktailPrice"]

defineProps<{
    cocktailPrice: CocktailPrice
}>()
</script>

<style scoped>
.cocktail-price {
    padding: var(--gap-size-3);
    display: flex;
}

.cocktail-price__price h4 {
    font-size: 1.25rem;
    font-weight: var(--fw-bold);
}

.cocktail-price__price small {
    font-size: 1rem;
    font-weight: normal;
    display: block;
}

.cocktail-price__ingredients {
    list-style: none;
    text-align: right;
    margin-left: auto;
}

.cocktail-price__ingredients small {
    color: var(--clr-gray-600);
}

.cocktail-price__missing-note {
    font-size: 0.85rem;
    color: var(--clr-red-600);
}
</style>
