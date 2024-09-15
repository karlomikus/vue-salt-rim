<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTitle } from '@/composables/title'
import { useI18n } from 'vue-i18n'
import PageHeader from './../PageHeader.vue'
import OverlayLoader from './../OverlayLoader.vue'
import UnitConverter from '../Units/UnitConverter.vue'
import UnitPicker from '../Units/UnitPicker.vue'
import ToggleIngredientShoppingCart from '../ToggleIngredientShoppingCart.vue'
import UnitHandler from '../../UnitHandler.js'
import BarAssistantClient from '@/api/BarAssistantClient'
import AppState from '@/AppState.js'
import CollectionDetailsWidget from '../Collections/CollectionDetailsWidget.vue'
import type { components } from '@/api/api'

type ShoppingList = components["schemas"]["ShoppingList"]
type Cocktail = components["schemas"]["Cocktail"]
type Collection = components["schemas"]["Collection"]
type Ingredient = components["schemas"]["Ingredient"]
type IngredientPrice = components["schemas"]["IngredientPrice"]
type CocktailWithCount = Cocktail & { count: number }
interface IngredientWithCalculatedAmount {
    id: number,
    slug: string,
    name: string,
    units: string,
    total_amount: number,
    amount: number
}

interface AmountByUnit {
    units: string;
    total_amount: number;
}

interface SavedState {
    i: number;
    c: number;
}

interface AccumulatedIngredient extends IngredientWithCalculatedAmount {
    by_amounts: {
        [unitType: string]: AmountByUnit;
    };
    total_cocktails: number;
}

interface IngredientAccumulator {
    [ingredientId: string]: AccumulatedIngredient;
}

interface IngredientPriceWithQuantity extends IngredientPrice {
    has_unit_price: boolean,
    needed_quantity: number,
    needed_quantity_price: number,
}

interface FinalIngredientObject extends IngredientPrice {
    id: number,
    slug: string,
    name: string,
    by_amounts: {
        [unitType: string]: AmountByUnit;
    },
    total_cocktails: number,
    prices: IngredientPriceWithQuantity[],
}

interface PriceAccumulator {
    [currency: string]: number[];
}

interface TotalsPerCurrency {
    [currency: string]: {
        min_total: number,
        max_total: number
    }
}

const { t } = useI18n()
const appState = new AppState()
const route = useRoute()
const collection = ref({} as Collection)
const cocktails = ref([] as CocktailWithCount[])
const ingredients = ref([] as Ingredient[])
const shoppingList = ref([] as ShoppingList[])
const isLoading = ref(false)
const selectedUnit = ref('ml')

watch(() => parseInt(route.params.id.toString()), refreshCollection, { immediate: true })
watch(cocktails, () => {
    saveState()
}, { deep: true })

useTitle(t('collections.quantitiy-calculator'))

const totalCocktailCount = computed(() => {
    return cocktails.value.reduce((acc, obj) => acc + obj.count, 0)
})

const ingredientsWithCalculatedAmounts = computed((): IngredientWithCalculatedAmount[] => {
    return cocktails.value.flatMap(cocktail =>
        cocktail?.ingredients?.map(ingredient => {
            const convertedAmount = UnitHandler.convertFromTo(ingredient.units, ingredient.amount, selectedUnit.value)
            const totalAmount = convertedAmount * cocktail.count
            const units = UnitHandler.isUnitConvertable(ingredient.units) ? selectedUnit.value : ingredient.units

            return {
                id: ingredient.ingredient.id,
                slug: ingredient.ingredient.slug,
                name: ingredient.ingredient.name,
                units: units,
                total_amount: totalAmount,
                amount: convertedAmount
            }
        }) ?? []
    )
})

const uniqueIngredients = computed(() => {
    const amountsByIngredients = ingredientsWithCalculatedAmounts.value.reduce((accumulator: IngredientAccumulator, ingredient: IngredientWithCalculatedAmount): IngredientAccumulator => {
        const ingredientId = ingredient.id
        const unitType = ingredient.units.toLowerCase()

        if (!accumulator[ingredientId]) {
            accumulator[ingredientId] = { ...ingredient, by_amounts: {}, total_cocktails: 0 }
        }

        if (!accumulator[ingredientId].by_amounts[unitType]) {
            accumulator[ingredientId].by_amounts[unitType] = { units: unitType, total_amount: 0 }
        }

        accumulator[ingredientId].total_cocktails++
        accumulator[ingredientId].by_amounts[unitType].total_amount += ingredient.total_amount

        return accumulator
    }, {})

    return Object.values(amountsByIngredients)
})

const state = computed((): SavedState[] => {
    return cocktails.value.map(c => {
        return { i: c.id, c: c.count }
    })
})

const finalIngredients = computed((): FinalIngredientObject[] => {
    return ingredients.value.map(i => {
        const collectionIngredientData = uniqueIngredients.value.find(val => val.id == i.id)

        if (!collectionIngredientData) {
            return null
        }

        return {
            id: i.id,
            slug: i.slug,
            name: i.name,
            by_amounts: collectionIngredientData.by_amounts,
            total_cocktails: collectionIngredientData.total_cocktails,
            prices: i?.prices?.map(p => {
                const units = !UnitHandler.isUnitConvertable(p.units) ? p.units : selectedUnit.value

                return { ...p, amount: UnitHandler.toFixedWithTruncate(UnitHandler.convertFromTo(p.units, p.amount, selectedUnit.value), 2), units: units }
            }).map(p => {
                let bestUnitForPrice = {} as { total_amount: number }
                if (collectionIngredientData.by_amounts[p.units]) {
                    bestUnitForPrice = collectionIngredientData.by_amounts[p.units]
                }

                const needed_quantity = Math.ceil(bestUnitForPrice.total_amount / p.amount)

                return {
                    ...p,
                    has_unit_price: Object.keys(bestUnitForPrice).length > 0,
                    needed_quantity: needed_quantity,
                    needed_quantity_price: needed_quantity * p.price.price
                }
            })
        } as FinalIngredientObject
    }).filter(i => i !== null)
})

const totalsPerCurrency = computed((): TotalsPerCurrency => {
    const result = {} as TotalsPerCurrency

    finalIngredients.value.forEach(ingredient => {
        const pricesByCurrency = ingredient.prices.reduce((acc: PriceAccumulator, price) => {
            const currency = price.price_category.currency
            if (!acc[currency]) acc[currency] = []
            if (price.needed_quantity_price !== null && !Number.isNaN(price.needed_quantity_price)) {
                acc[currency].push(price.needed_quantity_price)
            }
            return acc
        }, {})

        for (const currency in pricesByCurrency) {
            if (pricesByCurrency[currency].length === 0) continue

            const minPrice = Math.min(...pricesByCurrency[currency])
            const maxPrice = Math.max(...pricesByCurrency[currency])

            if (!result[currency]) {
                result[currency] = { min_total: 0, max_total: 0 }
            }

            result[currency].min_total += minPrice
            result[currency].max_total += maxPrice
        }
    })

    return result
})

async function refreshCollection(id: number) {
    isLoading.value = true
    collection.value = (await BarAssistantClient.getCollection(id))?.data ?? {} as Collection
    const existingState = localStorage.getItem('collection_' + collection.value.id)
    if (collection.value.cocktails?.length ?? 0 > 0) {
        cocktails.value = (await BarAssistantClient.getCocktails({ 'filter[id]': collection.value?.cocktails?.map(c => c.id).join(','), include: 'ingredients.ingredient' }))?.data as CocktailWithCount[] ?? []
    } else {
        cocktails.value = []
    }
    shoppingList.value = (await BarAssistantClient.getShoppingList(appState.user.id))?.data ?? []
    cocktails.value.map(c => {
        if (existingState) {
            const stateObj = JSON.parse(existingState) as SavedState[]
            const existingCocktailState = stateObj.find(o => o.i == c.id)
            if (existingCocktailState) {
                c.count = existingCocktailState.c ?? 0
            } else {
                c.count = 0
            }
        } else {
            c.count = 0
        }
    })

    ingredients.value = (await BarAssistantClient.getIngredients({ 'filter[id]': uniqueIngredients.value.map(i => i.id).join(','), 'include': 'prices', 'per_page': uniqueIngredients.value.length }))?.data ?? []

    isLoading.value = false
}

/**
 * Calculate price per unit, with unit conversion
 */
function calculatePricePerUnits(price: IngredientPriceWithQuantity, newUnits: string) {
    const result = price.price.price / UnitHandler.convertFromTo(price.units, price.amount, newUnits)
    const curr = price.price_category.currency
    const unit = !UnitHandler.isUnitConvertable(price.units) ? price.units : newUnits
    let pricePerUnit = `${UnitHandler.formatPrice(result, curr)}/${unit}`

    if (result < 0.01) {
        pricePerUnit = `${UnitHandler.formatPrice(0.01, curr)}/${unit}`
    }

    if (price.has_unit_price) {
        return `${pricePerUnit} - x${price.needed_quantity} (${price.amount}${price.units}) · ${UnitHandler.formatPrice(price.needed_quantity_price, price.price_category.currency)}`
    }

    // return `${pricePerUnit} - ${t('price.no-matching-units')}`
    return `${pricePerUnit}`
}

function saveState() {
    localStorage.setItem('collection_' + collection.value.id, JSON.stringify(state.value))
}
</script>

<template>
    <PageHeader>
        {{ t('collections.quantitiy-calculator') }}
    </PageHeader>
    <div>
        <OverlayLoader v-if="isLoading" />
        <CollectionDetailsWidget :collection="collection"></CollectionDetailsWidget>
        <h3 class="form-section-title">{{ t('collections.cocktail-quantities') }}</h3>
        <div class="block-container block-container--padded cocktail-quantity-grid">
            <div v-for="cocktail in cocktails" :key="cocktail.id" class="cocktail-quantity">
                <div class="form-group">
                    <input v-model="cocktail.count" type="number" class="form-input">
                </div>
                <div class="cocktail-quantity__cocktail">
                    <RouterLink :to="{ name: 'cocktails.show', params: { id: cocktail.slug } }">{{ cocktail.name }}</RouterLink>
                    <span>{{ cocktail?.ingredients?.map(i => i.ingredient.name).join(', ') }}</span>
                </div>
            </div>
        </div>
        <h3 class="form-section-title">{{ t('ingredient.ingredients') }}</h3>
        <UnitConverter v-slot="units" @unit-changed="(u) => selectedUnit = u">
            <div class="block-container block-container--padded">
                <div class="cocktail-quantity__header">
                    <div>{{ t('collections.ingredient-breakdown', { total: totalCocktailCount }) }}.</div>
                    <UnitPicker></UnitPicker>
                </div>
                <div class="responsive-table">
                    <table class="table table--compact">
                        <thead>
                            <tr>
                                <th>{{ t('name') }}</th>
                                <th>{{ t('amount') }}</th>
                                <th>{{ t('price.prices') }}</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="ingredient in finalIngredients" :key="ingredient.id">
                                <td>
                                    <RouterLink :to="{ name: 'ingredients.show', params: { id: ingredient.slug } }">{{ ingredient.name }}</RouterLink>
                                    <br>
                                    <small>{{ t('cocktail.cocktails') }}: {{ ingredient.total_cocktails }}</small>
                                </td>
                                <td>
                                    <template v-for="amount in ingredient.by_amounts" :key="amount.units">
                                        {{ units.printIngredient({ amount: amount.total_amount, units: amount.units }) }}<br>
                                    </template>
                                </td>
                                <td>
                                    <div v-for="(price, idx) in ingredient.prices" :key="idx" class="price_per_units">
                                        <small>{{ price.price_category.name }}:</small>
                                        <p>
                                            {{ calculatePricePerUnits(price, units.currentUnit) }}
                                        </p>
                                    </div>
                                </td>
                                <td style="text-align: right;">
                                    <ToggleIngredientShoppingCart :ingredient="{ id: ingredient.id, name: ingredient.name, slug: ingredient.slug }" :status="shoppingList.map(l => l.ingredient.id).includes(ingredient.id)"></ToggleIngredientShoppingCart>
                                </td>
                            </tr>
                            <tr style="border-top-width: 3px;">
                                <td colspan="2" style="text-align: right; vertical-align: top;">
                                    <strong>{{ t('total.approx') }}:</strong>
                                </td>
                                <td colspan="2">
                                    <template v-for="(total, curr) in totalsPerCurrency" :key="curr">
                                        <template v-if="total.min_total == total.max_total">
                                            {{ UnitHandler.formatPrice(total.min_total, curr.toString()) }}<br>
                                        </template>
                                        <template v-else>
                                            {{ UnitHandler.formatPrice(total.min_total, curr.toString()) }} - {{ UnitHandler.formatPrice(total.max_total, curr.toString()) }}<br>
                                        </template>
                                    </template>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </UnitConverter>
    </div>
</template>

<style scoped>
.cocktail-quantity-grid {
    display: grid;
    gap: var(--gap-size-2);
    grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
}

.cocktail-quantity {
    display: flex;
    gap: var(--gap-size-2);
}

.cocktail-quantity .form-group {
    max-width: 130px;
    margin: 0;
}

.cocktail-quantity__cocktail a {
    display: block;
    font-size: 1rem;
    font-weight: var(--fw-bold);
    line-height: 1.2;
}

.cocktail-quantity__cocktail span {
    font-size: 0.85rem;
    color: var(--clr-gray-600);
}

.cocktail-quantity__header {
    display: flex;
    justify-content: space-between;
}

.price_per_units {
    line-height: 1.2;
}

.price_per_units small {
    font-size: 0.75rem;
}

.price_per_units.price_per_units--best p {
    font-weight: var(--fw-bold);
}

.price_per_units__no-units {
    font-size: 0.85rem;
    font-style: italic;
    color: var(--clr-gray-400);
}

@media (max-width: 450px) {
    .cocktail-quantity-grid {
        grid-template-columns: 1fr;
    }

    .cocktail-quantity .form-group {
        max-width: 90px;
    }

    .cocktail-quantity__header {
        flex-direction: column;
    }

    .responsive-table {
        overflow-y: scroll;
    }

    .table--compact td {
        padding: var(--gap-size-1);
    }
}
</style>