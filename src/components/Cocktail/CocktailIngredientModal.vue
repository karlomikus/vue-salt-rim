<script setup lang="ts">
import OverlayLoader from './../OverlayLoader.vue'
import IngredientFinder from './../IngredientFinder.vue'
import AmountInput from './../AmountInput.vue'
import { ref } from 'vue'
import type { components } from '@/api/api'
import { useI18n } from 'vue-i18n'
import AppState from '@/AppState'
import type { SearchResults } from '@/api/SearchResults'
import { unitHandler } from '@/composables/useUnits'
import { useBasicSearch } from '@/composables/useBasicSearch'
import IngredientFinderBasic from '../IngredientFinderBasic.vue'

const shouldUseBasicSearch = useBasicSearch()
const appState = new AppState()
const { t } = useI18n()
type CocktailIngredient = components["schemas"]["CocktailIngredient"]
type SearchResultIngredient = SearchResults['ingredient']
const isLoading = ref(false)
const emit = defineEmits(['close'])
const model = defineModel<CocktailIngredient>({
    required: true,
})

const localCocktailIngredient = ref({...model.value})
if (!localCocktailIngredient.value.amount_max) {
    localCocktailIngredient.value.amount_max = null
}

localCocktailIngredient.value.amount = unitHandler.convertFromTo(localCocktailIngredient.value.units, localCocktailIngredient.value.amount, appState.defaultUnit)
if (localCocktailIngredient.value.amount_max) {
    localCocktailIngredient.value.amount_max = unitHandler.convertFromTo(localCocktailIngredient.value.units, localCocktailIngredient.value.amount_max, appState.defaultUnit)
}

if (unitHandler.isUnitConvertable(localCocktailIngredient.value.units)) {
    localCocktailIngredient.value.units = appState.defaultUnit
}

function save(): void {
    model.value = localCocktailIngredient.value
    emit('close')
}

function cancel(): void {
    emit('close')
}

function selectIngredient(item: SearchResultIngredient): void {
    localCocktailIngredient.value.units = item.units ?? appState.defaultUnit
    localCocktailIngredient.value.ingredient = {
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
        <p style="margin: 0 0 1rem 0;">
            {{ t('ingredient.units-help') }}
        </p>
        <IngredientFinderBasic v-if="shouldUseBasicSearch" :selected-ingredients="[localCocktailIngredient.ingredient.id]" @ingredient-selected="selectIngredient"></IngredientFinderBasic>
        <IngredientFinder v-else-if="!shouldUseBasicSearch && appState.bar.search_token" :search-token="appState.bar.search_token" :selected-ingredients="[localCocktailIngredient.ingredient.id]" @ingredient-selected="selectIngredient"></IngredientFinder>
        <div class="selected-ingredient">
            <small>{{ t('ingredient.dialog.current') }}:</small>
            <p>{{ localCocktailIngredient.ingredient.name }}</p>
        </div>
        <label class="form-checkbox">
            <input v-model="localCocktailIngredient.optional" type="checkbox">
            <span>{{ t('ingredient.dialog.optional-checkbox') }}</span>
        </label>
        <label class="form-checkbox">
            <input v-model="localCocktailIngredient.is_specified" type="checkbox">
            <span>{{ t('ingredient.dialog.is-specified-checkbox') }}</span>
        </label>
        <div class="ingredient-form-group">
            <div class="form-group">
                <label class="form-label form-label--required" for="ingredient-amount">{{ t('amount') }}:</label>
                <AmountInput id="ingredient-amount" v-model="localCocktailIngredient.amount" required></AmountInput>
            </div>
            <div class="form-group" v-if="localCocktailIngredient.amount_max !== undefined">
                <label class="form-label" for="ingredient-amount-max">{{ t('amount') }} max:</label>
                <AmountInput id="ingredient-amount-max" v-model="localCocktailIngredient.amount_max"></AmountInput>
            </div>
            <div class="form-group">
                <label class="form-label form-label--required" for="ingredient-units">{{ t('units') }}:</label>
                <input id="ingredient-units" v-model="localCocktailIngredient.units" class="form-input" type="text" list="common-units" required>
                <datalist id="common-units">
                    <option>ml</option>
                    <option>oz</option>
                    <option>cl</option>
                    <option>dashes</option>
                    <option>barspoon</option>
                    <option>drops</option>
                    <option>topup</option>
                    <option>leaves</option>
                </datalist>
            </div>
        </div>
        <div class="form-group">
            <label class="form-label" for="ingredient-note">{{ t('note.title') }}:</label>
            <input id="ingredient-note" v-model="localCocktailIngredient.note" class="form-input" type="text">
        </div>
        <div class="dialog-actions">
            <button type="button" class="button button--outline" @click="cancel">{{ t('cancel') }}</button>
            <button type="submit" class="button button--dark" :disabled="isLoading || !localCocktailIngredient.ingredient.id">{{ t('save') }}</button>
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
    margin-bottom: 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-size-1);
}

.ingredient-form-group .form-group {
    flex-basis: 150px;
    margin: 0;
}

.ingredient-form-group .form-group:last-child {
    flex-basis: 100px;
    flex-grow: 1;
}

.ingredient-form-group input {
    width: 100%;
}
</style>
