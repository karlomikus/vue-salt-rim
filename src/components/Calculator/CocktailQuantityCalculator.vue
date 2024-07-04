<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import ApiRequests from './../../ApiRequests.js'
import PageHeader from './../PageHeader.vue'
import OverlayLoader from './../OverlayLoader.vue'
import UnitConverter from '../Units/UnitConverter.vue'
import UnitPicker from '../Units/UnitPicker.vue'

const route = useRoute()
const collection = ref({})
const cocktails = ref([])
const isLoading = ref(false)

watch(() => route.params.id, refreshCollection, { immediate: true })

const totalCocktailCount = computed(() => {
    return cocktails.value.reduce((acc, obj) => acc + obj.count, 0)
})

const uniqueCollectionIngredients = computed(() => {
    const ingredientsWithCalculatedAmounts = cocktails.value.flatMap((c) => {
        return c.ingredients.map(i => {
            i.calculated_amount = i.amount * c.count

            return i
        })
    })

    const amountsByIngredients = ingredientsWithCalculatedAmounts.reduce((acc, ingredient) => {
        const id = ingredient.ingredient_id
        const units = ingredient.units
        if (!acc[id]) {
            acc[id] = { ...ingredient, by_amounts: {}, total_cocktails: 0 }
        }

        if (!acc[id].by_amounts[units]) {
            acc[id].by_amounts[units] = { units: units, calculated_amount: 0 }
        }

        acc[id].total_cocktails++
        acc[id].by_amounts[units].calculated_amount += ingredient.calculated_amount

        return acc
    }, {})

    return Object.values(amountsByIngredients)
})

async function refreshCollection(id) {
    isLoading.value = true
    collection.value = await ApiRequests.fetchCollection(id)
    cocktails.value = (await ApiRequests.fetchCocktails({ 'filter[id]': collection.value.cocktails.join(',') })).data
    cocktails.value.map(c => c.count = 0)
    isLoading.value = false
}
</script>

<template>
    <PageHeader>
        {{ $t('collections.quantitiy-calculator') }}
    </PageHeader>
    <div>
        <OverlayLoader v-if="isLoading" />
        <div class="block-container block-container--padded cocktail-quantity-grid">
            <div v-for="cocktail in cocktails" :key="cocktail.id" class="cocktail-quantity">
                <div class="form-group">
                    <input v-model="cocktail.count" type="number" class="form-input">
                </div>
                <div class="cocktail-quantity__cocktail">
                    <h5>{{ cocktail.name }}</h5>
                    <span>{{ cocktail.ingredients.map(i => i.name).join(', ') }}</span>
                </div>
            </div>
        </div>
        <h3 class="form-section-title">{{ $t('ingredient.ingredients') }}</h3>
        <UnitConverter v-slot="units">
            <div class="block-container block-container--padded">
                <p>
                    Ingredient breakdown for {{ totalCocktailCount }} cocktails
                </p>
                <UnitPicker></UnitPicker>
                <table class="table">
                    <thead>
                        <tr>
                            <th>{{ $t('name') }}</th>
                            <th>{{ $t('cocktail.cocktails') }}</th>
                            <th>{{ $t('amount') }}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="ingredient in uniqueCollectionIngredients" :key="ingredient.ingredient_id">
                            <td><RouterLink :to="{ name: 'ingredients.show', params: { id: ingredient.ingredient_slug } }">{{ ingredient.name }}</RouterLink></td>
                            <td>{{ ingredient.total_cocktails }}</td>
                            <td>
                                <template v-for="amount in ingredient.by_amounts" :key="amount.units">
                                    {{ units.printIngredient({amount: amount.calculated_amount, units: amount.units}) }}<br>
                                </template>
                            </td>
                            <td style="text-align: right;">
                                <a href="#">{{ $t('ingredient.add-to-list') }}</a>
                            </td>
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

.cocktail-quantity__cocktail h5 {
    font-size: 1rem;
    font-weight: var(--fw-bold);
    line-height: 1.2;
}

.cocktail-quantity__cocktail span {
    font-size: 0.85rem;
}
</style>