<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
// import { useI18n } from 'vue-i18n'
import ApiRequests from './../../ApiRequests.js'
import PageHeader from './../PageHeader.vue'
import OverlayLoader from './../OverlayLoader.vue'
import UnitConverter from '../Units/UnitConverter.vue'
import UnitPicker from '../Units/UnitPicker.vue'
import ToggleIngredientShoppingCart from '../ToggleIngredientShoppingCart.vue'
import UnitHandler from '../../UnitHandler.js'

// const { t } = useI18n()
const route = useRoute()
const collection = ref({})
const cocktails = ref([])
const ingredients = ref([])
const shoppingList = ref([])
const isLoading = ref(false)
const selectedUnit = ref('ml')

watch(() => route.params.id, refreshCollection, { immediate: true })
watch(cocktails, () => {
    saveState()
}, { deep: true })

// document.title = 'TODO'

const totalCocktailCount = computed(() => {
    return cocktails.value.reduce((acc, obj) => parseInt(acc + obj.count), 0)
})

const ingredientsWithCalculatedAmounts = computed(() => {
    return cocktails.value.flatMap((c) => {
        return c.ingredients.map(i => {
            const convertedAmount = UnitHandler.convertFromTo(i.units, i.amount, selectedUnit.value)
            const totalAmount = convertedAmount * c.count

            let units = i.units
            if (UnitHandler.isUnitConvertable(i.units)) {
                units = selectedUnit.value
            }

            return {id: i.ingredient_id, slug: i.ingredient_slug, name: i.name, units: units, total_amount: totalAmount, amount: convertedAmount}
        })
    })
})

const uniqueCollectionIngredients = computed(() => {
    const amountsByIngredients = ingredientsWithCalculatedAmounts.value.reduce((acc, ingredient) => {
        const id = ingredient.id
        if (!acc[id]) {
            acc[id] = { ...ingredient, by_amounts: {}, total_cocktails: 0 }
        }

        const units = ingredient.units.toLowerCase()
        if (!acc[id].by_amounts[units]) {
            acc[id].by_amounts[units] = { units: units, total_amount: 0 }
        }

        acc[id].total_cocktails++
        acc[id].by_amounts[units].total_amount += ingredient.total_amount

        return acc
    }, {})

    return Object.values(amountsByIngredients)
})

const state = computed(() => {
    return cocktails.value.map(c => {
        return { i: c.id, c: c.count }
    })
})

const finalIngredients = computed(() => {
    return ingredients.value.map(i => {
        const collectionIngredientData = uniqueCollectionIngredients.value.find(val => val.id == i.id)

        return {
            id: i.id,
            ingredient_slug: i.slug,
            name: i.name,
            by_amounts: collectionIngredientData.by_amounts,
            total_cocktails: collectionIngredientData.total_cocktails,
            prices: i.prices.map(p => {
                const units = !UnitHandler.isUnitConvertable(p.units) ? p.units : selectedUnit.value

                return {...p, amount: UnitHandler.convertFromTo(p.units, p.amount, selectedUnit.value).toFixed(2), units: units}
            }).map(p => {
                let bestUnitForPrice = {}
                if (collectionIngredientData.by_amounts[p.units]) {
                    bestUnitForPrice = collectionIngredientData.by_amounts[p.units]
                }

                const needed_quantity = Math.ceil(bestUnitForPrice.total_amount / p.amount)

                return {
                    ...p,
                    has_unit_price: Object.keys(bestUnitForPrice).length > 0,
                    needed_quantity: needed_quantity,
                    needed_quantity_price: needed_quantity * p.price
                }
            })
        }
    })
})

const totalsPerCurrency = computed(() => {
    const result = {}

    finalIngredients.value.forEach(ingredient => {
        const pricesByCurrency = ingredient.prices.reduce((acc, price) => {
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

async function refreshCollection(id) {
    isLoading.value = true
    collection.value = await ApiRequests.fetchCollection(id)
    const existingState = localStorage.getItem('collection_' + collection.value.id)
    cocktails.value = (await ApiRequests.fetchCocktails({ 'filter[id]': collection.value.cocktails.join(',') })).data ?? []
    shoppingList.value = (await ApiRequests.fetchShoppingList()) ?? []
    cocktails.value.map(c => {
        if (existingState) {
            const stateObj = JSON.parse(existingState)
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

    ingredients.value = (await ApiRequests.fetchIngredients({ 'filter[id]': uniqueCollectionIngredients.value.map(i => i.id).join(','), 'include': 'prices', 'per_page': uniqueCollectionIngredients.value.length })).data ?? []

    isLoading.value = false
}

/**
 * Calculate price per unit, with unit conversion
 * @param {{price: number, units: string, amount: number}} price
 * @param {string} newUnits
 * @return {number}
 */
function calculatePricePerUnits(price, newUnits) {
    const result = price.price / UnitHandler.convertFromTo(price.units, price.amount, newUnits)
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

function handleShoppingListUpdate(e) {
    if (e.on_list === false) {
        shoppingList.value.splice(shoppingList.value.map(s => s.ingredient_id).indexOf(e.ingredient.id), 1)
    } else {
        shoppingList.value.push({ingredient_id: e.ingredient.id})
    }
}
</script>

<template>
    <PageHeader>
        {{ $t('collections.quantitiy-calculator') }}
    </PageHeader>
    <div>
        <OverlayLoader v-if="isLoading" />
        <h3 class="form-section-title">{{ $t('collections.cocktail-quantities') }}</h3>
        <div class="block-container block-container--padded cocktail-quantity-grid">
            <div v-for="cocktail in cocktails" :key="cocktail.id" class="cocktail-quantity">
                <div class="form-group">
                    <input v-model="cocktail.count" type="number" class="form-input">
                </div>
                <div class="cocktail-quantity__cocktail">
                    <RouterLink :to="{name: 'cocktails.show', params: {id: cocktail.slug}}">{{ cocktail.name }}</RouterLink>
                    <span>{{ cocktail.ingredients.map(i => i.name).join(', ') }}</span>
                </div>
            </div>
        </div>
        <h3 class="form-section-title">{{ $t('ingredient.ingredients') }}</h3>
        <UnitConverter v-slot="units" @unit-changed="(u) => selectedUnit = u">
            <div class="block-container block-container--padded">
                <div class="cocktail-quantity__header">
                    <div>{{ $t('collections.ingredient-breakdown', {total: totalCocktailCount}) }}.</div>
                    <UnitPicker></UnitPicker>
                </div>
                <!-- <pre>
                    {{ uniqueCollectionIngredients }}
                </pre> -->
                <table class="table">
                    <thead>
                        <tr>
                            <th>{{ $t('name') }}</th>
                            <th>{{ $t('cocktail.cocktails') }}</th>
                            <th>{{ $t('amount') }}</th>
                            <th>{{ $t('price.prices') }}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="ingredient in finalIngredients" :key="ingredient.id">
                            <td><RouterLink :to="{ name: 'ingredients.show', params: { id: ingredient.ingredient_slug } }">{{ ingredient.name }}</RouterLink></td>
                            <td>{{ ingredient.total_cocktails }}</td>
                            <td>
                                <template v-for="amount in ingredient.by_amounts" :key="amount.units">
                                    {{ units.printIngredient({amount: amount.total_amount, units: amount.units}) }}<br>
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
                                <ToggleIngredientShoppingCart :ingredient="{id: ingredient.ingredient_id, name: ingredient.name}" :shopping-list="shoppingList.map(l => l.ingredient_id)" @list-updated="handleShoppingListUpdate"></ToggleIngredientShoppingCart>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="4" style="text-align: right;">
                                <template v-for="(total, curr) in totalsPerCurrency" :key="curr">
                                    Approx: {{ UnitHandler.formatPrice(total.min_total, curr) }} - {{ UnitHandler.formatPrice(total.max_total, curr) }}<br>
                                </template>
                            </td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
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
</style>