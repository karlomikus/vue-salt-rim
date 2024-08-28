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

<script>
import UnitHandler from '../../UnitHandler'

export default {
    props: {
        cocktailIngredient: {
            type: Object,
            default() {
                return {}
            }
        },
        servings: {
            type: Number,
            default: 1
        },
        units: {
            type: String,
            default: 'ml'
        }
    },
    computed: {
        name() {
            let name = this.cocktailIngredient.ingredient.name
            if (this.cocktailIngredient.note) {
                name += ` · ${this.cocktailIngredient.note}`
            }

            return name
        },
        amount() {
            return UnitHandler.print(this.cocktailIngredient, this.units)
        },
        substitutes() {
            return this.cocktailIngredient.substitutes.map(sub => {
                return new String(sub.ingredient.name + ' ' + UnitHandler.print(sub, this.units, this.servings)).trim()
            }).join(', ')
        }
    }
}
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
