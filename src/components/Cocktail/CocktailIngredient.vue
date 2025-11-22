<script setup lang="ts">
import type { components } from '@/api/api'
import { unitHandler } from '@/composables/useUnits'
import { useI18n } from 'vue-i18n'
import CocktailIngredientStatus from '@/components/Cocktail/CocktailIngredientStatus.vue'

type CocktailIngredient = components['schemas']['CocktailIngredient'];
type CocktailIngredientSubstitute = components['schemas']['CocktailIngredientSubstitute'];
type ShoppingList = components['schemas']['ShoppingList'];

interface Props {
    cocktailIngredient: CocktailIngredient;
    currentShelf: string;
    scaleFactor: number;
    units: string;
    shoppingList: ShoppingList[];
}

const { t } = useI18n()
const {
    cocktailIngredient,
    currentShelf = 'bar',
    scaleFactor = 1,
    units = 'ml',
    shoppingList = [],
} = defineProps<Props>();

function showComplexStatus(ing: CocktailIngredient) {
    if (currentShelf === 'bar') {
        return !ing.in_bar_shelf && !ing.in_bar_shelf_as_substitute && !ing.in_bar_shelf_as_complex_ingredient
    }

    return !ing.in_shelf && !ing.in_shelf_as_substitute && !ing.in_shelf_as_complex_ingredient
}

function showSubstituteStatus(ing: CocktailIngredient) {
    if (currentShelf === 'bar') {
        return !ing.in_bar_shelf && ing.in_bar_shelf_as_substitute
    }

    return !ing.in_shelf && ing.in_shelf_as_substitute
}

function showComplexCanBeMadeStatus(ing: CocktailIngredient) {
    if (currentShelf === 'bar') {
        return !ing.in_bar_shelf && ing.in_bar_shelf_as_complex_ingredient
    }

    return !ing.in_shelf && ing.in_shelf_as_complex_ingredient
}

function buildSubstituteString(sub: CocktailIngredientSubstitute) {
    return new String(sub.ingredient.name + ' ' + unitHandler.print(sub, units, scaleFactor)).trim()
}
</script>

<template>
    <div>
        <div class="cocktail-ingredients__ingredient">
            <CocktailIngredientStatus :ingredient="cocktailIngredient" :currentShelf="currentShelf" />
            <RouterLink class="cocktail-ingredients__ingredient__name" :to="{ name: 'ingredients.show', params: { id: cocktailIngredient.ingredient.slug } }" data-ingredient="preferred">
                {{ cocktailIngredient.ingredient.name }} <span v-if="cocktailIngredient.note" class="cocktail-ingredients__flags__flag">&ndash; {{ cocktailIngredient.note }}</span> <small v-if="cocktailIngredient.optional">({{ t('optional') }})</small>
            </RouterLink>
            <div class="cocktail-ingredients__ingredient__amount">{{ unitHandler.print(cocktailIngredient, units, scaleFactor) }}</div>
        </div>
        <div class="cocktail-ingredients__flags">
            <div v-if="cocktailIngredient.substitutes && cocktailIngredient.substitutes.length > 0" class="cocktail-ingredients__flags__flag">
                <div v-if="showSubstituteStatus(cocktailIngredient)" class="cocktail-ingredients__flags__flag">&middot; {{ t('cocktail.missing-ing-sub-available') }}</div>
                &middot; {{ t('substitutes') }}:
                <template v-for="(sub, index) in cocktailIngredient.substitutes" :key="index">
                    <RouterLink :style="{'font-weight': (currentShelf === 'bar' ? sub.in_bar_shelf : sub.in_shelf) ? 'bold' : 'normal'}" :to="{ name: 'ingredients.show', params: { id: sub.ingredient.slug } }" data-ingredient="substitute">
                        {{ buildSubstituteString(sub) }}
                    </RouterLink>
                    <template v-if="index + 1 !== cocktailIngredient.substitutes.length">, </template>
                </template>
            </div>
            <div v-if="showComplexStatus(cocktailIngredient)" class="cocktail-ingredients__flags__flag">&middot; {{ t('cocktail.missing-ing') }}</div>
            <div v-if="showComplexCanBeMadeStatus(cocktailIngredient)" class="cocktail-ingredients__flags__flag">&middot; {{ t('cocktail.missing-ing-complex') }}</div>
            <div v-if="shoppingList.map(i => i.ingredient.id).includes(cocktailIngredient.ingredient.id)" class="cocktail-ingredients__flags__flag">&middot; {{ t('ingredient.on-shopping-list') }}</div>
            <div v-if="!cocktailIngredient.in_bar_shelf && cocktailIngredient.in_bar_shelf_as_variant && cocktailIngredient.variants_in_shelf">
                &middot; {{ t('available-variants') }}:
                <template v-for="(variant, index) in cocktailIngredient.variants_in_shelf" :key="variant.id">
                    <RouterLink :to="{ name: 'ingredients.show', params: { id: variant.slug } }" data-ingredient="variant">
                        {{ variant.name }}
                    </RouterLink>
                    <template v-if="index + 1 !== cocktailIngredient.variants_in_shelf.length">, </template>
                </template>
            </div>
        </div>
    </div>
</template>


<style scoped>
.cocktail-ingredients__ingredient {
    display: flex;
}

.cocktail-ingredients__flags {
    font-size: 0.7rem;
}

.cocktail-ingredients__ingredient__name {
    font-weight: var(--fw-bold);
    text-decoration: none;
}

.cocktail-ingredients__ingredient__name small {
    font-size: 0.70rem;
}

.cocktail-ingredients__ingredient__amount {
    font-weight: var(--fw-bold);
    margin-left: auto;
    text-align: right;
}

@media (max-width: 450px) {
    .cocktail-ingredients__ingredient__amount {
        font-size: 1rem;
    }
}

.bold {
    font-weight: var(--fw-bold);
}
</style>
