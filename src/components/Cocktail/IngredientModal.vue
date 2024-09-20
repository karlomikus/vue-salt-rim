<script setup lang="ts">
import OverlayLoader from './../OverlayLoader.vue'
import IngredientFinder from './../IngredientFinder.vue'
import AmountInput from './../AmountInput.vue'
import { ref } from 'vue'
import type { components } from '@/api/api'
import { useI18n } from 'vue-i18n'
import AppState from '@/AppState'
import UnitHandler from '@/UnitHandler'

const appState = new AppState()
const { t } = useI18n()
type CocktailIngredient = components["schemas"]["CocktailIngredient"]
interface FinderIngredient {
    id: number,
    slug: string,
    name: string,
}

const emit = defineEmits(['close', 'ingredient-changed'])
const props = defineProps<{
    cocktailIngredient: CocktailIngredient,
}>()

const originalCocktailingredient = JSON.parse(JSON.stringify(props.cocktailIngredient)) as CocktailIngredient
const localCocktailingredient = ref(props.cocktailIngredient)
const isLoading = ref(false)
const hasVariableAmount = ref(props.cocktailIngredient.amount_max != null)

localCocktailingredient.value.amount = UnitHandler.convertFromTo(localCocktailingredient.value.units, localCocktailingredient.value.amount, appState.defaultUnit)
if (localCocktailingredient.value.amount_max) {
    localCocktailingredient.value.amount_max = UnitHandler.convertFromTo(localCocktailingredient.value.units, localCocktailingredient.value.amount_max, appState.defaultUnit)
}

if (UnitHandler.isUnitConvertable(localCocktailingredient.value.units)) {
    localCocktailingredient.value.units = appState.defaultUnit
}

function save(): void {
    emit('close')
}

function cancel(): void {
    localCocktailingredient.value = Object.assign(localCocktailingredient.value, originalCocktailingredient)
    emit('close')
}

function selectIngredient(item: FinderIngredient): void {
    localCocktailingredient.value.ingredient = {
        id: item.id,
        slug: item.slug,
        name: item.name,
    }
}
</script>
<template>
    <form @submit.prevent="save">
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ t('ingredient.title') }}</div>
        <IngredientFinder :cocktail-ingredient="localCocktailingredient" @ingredient-selected="selectIngredient"></IngredientFinder>
        <div class="selected-ingredient">
            <small>{{ t('ingredient.dialog.current') }}:</small>
            <p>{{ localCocktailingredient.ingredient.name }}</p>
        </div>
        <label class="form-checkbox">
            <input v-model="localCocktailingredient.optional" type="checkbox">
            <span>{{ t('ingredient.dialog.optional-checkbox') }}</span>
        </label>
        <label class="form-checkbox">
            <input v-model="hasVariableAmount" type="checkbox">
            <span>{{ t('ingredient.has-variable-amount') }}</span>
        </label>
        <div class="ingredient-form-group">
            <div class="form-group">
                <label class="form-label form-label--required" for="ingredient-amount">{{ t('amount') }}:</label>
                <AmountInput id="ingredient-amount" v-model="localCocktailingredient.amount" required></AmountInput>
            </div>
            <div v-if="hasVariableAmount" class="form-group">
                <label class="form-label" for="ingredient-amount-max">{{ t('amount') }} max:</label>
                <AmountInput id="ingredient-amount-max" v-model="localCocktailingredient.amount_max"></AmountInput>
            </div>
            <div class="form-group">
                <label class="form-label form-label--required" for="ingredient-units">{{ t('units') }}:</label>
                <input id="ingredient-units" v-model="localCocktailingredient.units" class="form-input" type="text" list="common-units" required>
                <datalist id="common-units">
                    <option>ml</option>
                    <option>oz</option>
                    <option>cl</option>
                    <option>dashes</option>
                    <option>barspoon</option>
                    <option>drops</option>
                </datalist>
            </div>
        </div>
        <div class="form-group">
            <label class="form-label" for="ingredient-note">{{ t('note.title') }}:</label>
            <input id="ingredient-note" v-model="localCocktailingredient.note" class="form-input" type="text">
        </div>
        <div class="dialog-actions">
            <button type="button" class="button button--outline" @click="cancel">{{ t('cancel') }}</button>
            <button type="submit" class="button button--dark" :disabled="isLoading">{{ t('save') }}</button>
        </div>
    </form>
</template>

<style scoped>
.selected-ingredient {
    margin: 1rem 0;
    line-height: 1.3;
}

.selected-ingredient small {
    color: var(--clr-gray-500);
}

.selected-ingredient p {
    font-weight: var(--fw-bold);
    font-size: 1.5rem;
}

.ingredient-form-group {
    margin-top: 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-size-1);
}

.ingredient-form-group .form-group {
    flex-basis: 150px;
}

.ingredient-form-group .form-group:last-child {
    flex-basis: 100px;
    flex-grow: 1;
}

.ingredient-form-group input {
    width: 100%;
}
</style>
