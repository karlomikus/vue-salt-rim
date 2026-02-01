<template>
    <li class="public-cocktail-recipe__ingredients__ingredient">
        <div class="public-cocktail-recipe__ingredients__ingredient__name">
            <div>
                {{ cocktailIngredient.name }}
                <template v-if="cocktailIngredient.optional">({{ $t('optional') }})</template>
            </div>
            <div v-if="cocktailIngredient.note" class="public-cocktail-recipe__ingredients__secondary">
                {{ cocktailIngredient.note }}
            </div>
            <div v-if="cocktailIngredient.substitutes.length > 0" class="public-cocktail-recipe__ingredients__secondary">
                {{ $t('substitutes') }}: {{ substitutes }}
            </div>
        </div>
        <div class="public-cocktail-recipe__ingredients__ingredient__amount">{{ amount }}</div>
    </li>
</template>

<script setup lang="ts">
import { unitHandler } from '@/composables/useUnits'
import { computed } from 'vue';
import type { components } from '@/api/api'

type CocktailIngredient = components['schemas']['PublicCocktailResource']['ingredients'][0]

const {
    cocktailIngredient,
    scaleFactor = 1,
    units = 'ml',
} = defineProps<{
    cocktailIngredient: CocktailIngredient,
    scaleFactor?: number,
    units?: string,
}>()

const amount = computed(() => {
    return unitHandler.print(cocktailIngredient, units, scaleFactor)
})

const substitutes = computed(() => {
    return cocktailIngredient.substitutes.map(sub => {
        return `${sub.name} ${unitHandler.print(sub, units, scaleFactor)}`.trim()
    }).join(', ')
})
</script>

<style scoped>
.public-cocktail-recipe__ingredients__ingredient {
    border-bottom: 1px dotted var(--clr-gray-300);
    display: flex;
    gap: .25rem;
    padding: .15rem 0;
}

.public-cocktail-recipe__ingredients__secondary {
    font-size: 0.75em;
    color: var(--clr-gray-500);
}

.public-cocktail-recipe__ingredients__ingredient__amount {
    margin-left: auto;
    font-weight: var(--fw-bold);
    flex-shrink: 0;
}
</style>
