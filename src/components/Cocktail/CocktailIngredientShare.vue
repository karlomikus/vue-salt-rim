<template>
    <div class="cocktail-ingredient-share" itemprop="recipeIngredient" :content="name + ' - ' + amount">
        <div class="cocktail-ingredient-share__ingredient-name">
            <span>{{ name }} <template v-if="cocktailIngredient.optional">({{ $t('optional') }})</template></span>
            <span v-if="cocktailIngredient.substitutes.length > 0" class="cocktail-ingredient-share__ingredient-substitutes">
                {{ $t('substitutes') }}: {{ substitutes }}
            </span>
        </div>
        <div class="cocktail-ingredient-share__ingredient-amount">{{ amount }}</div>
    </div>
</template>

<script setup lang="ts">
import { unitHandler } from '@/composables/useUnits'
import { computed } from 'vue';

export interface CocktailIngredientShare {
    ingredient: {
        name: string,
    },
    amount: number|string|null;
    amount_max?: number|string|null;
    units?: string|null;
    note: string|null,
    optional: boolean,
    substitutes: {
        ingredient: {
            name: string,
        },
        amount: number|null,
        unit: string|null,
        note: string|null,
    }[],
}

const {
    cocktailIngredient,
    scaleFactor = 1,
    units = 'ml',
} = defineProps<{
    cocktailIngredient: CocktailIngredientShare,
    scaleFactor: number,
    units: string,
}>()

const name = computed(() => {
    let name = cocktailIngredient.ingredient.name
    if (cocktailIngredient.note) {
        name += ` · ${cocktailIngredient.note}`
    }

    return name
})

const amount = computed(() => {
    return unitHandler.print(cocktailIngredient, units, scaleFactor)
})

const substitutes = computed(() => {
    return cocktailIngredient.substitutes.map(sub => {
        return new String(sub.ingredient.name + ' ' + unitHandler.print(sub, units, scaleFactor)).trim()
    }).join(', ')
})
</script>

<style scoped>
.cocktail-ingredient-share {
    padding: var(--gap-size-1) 0;
    border-bottom: 1px dotted var(--clr-gray-300);
    margin-bottom: var(--gap-size-1);
    display: flex;
}

.cocktail-ingredient-share__ingredient-name {
    display: flex;
    flex-direction: column;
}

.cocktail-ingredient-share__ingredient-substitutes {
    font-size: 0.75rem;
    color: var(--clr-gray-500);
}

.cocktail-ingredient-share__ingredient-amount {
    font-weight: var(--fw-bold);
    margin-left: auto;
    flex-shrink: 0;
    text-align: right;
}
</style>
