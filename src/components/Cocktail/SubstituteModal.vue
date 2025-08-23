<template>
    <form @submit.prevent="save">
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ $t('ingredient.dialog.select-substitutes') }}</div>
        <p style="margin-bottom: 1rem;">{{ $t('ingredient.dialog.select-substitutes-for', {name: cocktailIngredient.ingredient.name}) }}</p>
        <IngredientFinderBasic v-if="shouldUseBasicSearch" :selected-ingredients="selectedSubstitutes.map(s => s.ingredient.id)" @ingredient-selected="selectIngredient"></IngredientFinderBasic>
        <IngredientFinder v-else-if="!shouldUseBasicSearch && appState.bar.search_token" :search-token="appState.bar.search_token" :selected-ingredients="selectedSubstitutes.map(s => s.ingredient.id)" @ingredient-selected="selectIngredient"></IngredientFinder>
        <div class="substitutes">
            <h4>{{ $t('substitutes') }}:</h4>
            <div v-for="(substitute, index) in selectedSubstitutes" :key="substitute.ingredient.id" class="substitutes__substitute">
                <div class="substitutes__substitute__name">
                    <h5>{{ substitute.ingredient.name }}</h5>
                    <div class="substitutes__substitute__actions">
                        <a href="#" @click.prevent="toggleAmountDisplay(substitute)">{{ $t('edit-amounts') }}</a>
                        &middot;
                        <a href="#" @click.prevent="removeIngredient(substitute)">{{ $t('remove') }}</a>
                    </div>
                </div>
                <div v-show="amountDisplayTracker.includes(substitute.ingredient.id)" class="substitutes__substitute__input">
                    <div class="form-group">
                        <label class="form-label" :for="'sub-ingredient-amount-' + substitute.ingredient.id">{{ $t('amount') }}:</label>
                        <AmountInput :id="'sub-ingredient-amount-' + substitute.ingredient.id" v-model="substitute.amount"></AmountInput>
                    </div>
                    <div class="form-group">
                        <label class="form-label" :for="'sub-ingredient-amount-max-' + substitute.ingredient.id">{{ $t('amount-max') }}:</label>
                        <AmountInput :id="'sub-ingredient-amount-max-' + substitute.ingredient.id" v-model="substitute.amount_max"></AmountInput>
                    </div>
                    <div class="form-group">
                        <label class="form-label" :for="'sub-ingredient-units-' + substitute.ingredient.id">{{ $t('units') }}:</label>
                        <input :id="'sub-ingredient-units-' + substitute.ingredient.id" v-model="substitute.units" class="form-input" type="text" list="common-units">
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
                <div v-if="index != selectedSubstitutes.length - 1" class="substitutes__substitute__separator">{{ $t('or') }}</div>
            </div>
            <div v-if="selectedSubstitutes.length == 0">
                {{ $t('no-substitutes') }}
            </div>
        </div>
        <div class="dialog-actions">
            <button type="submit" class="button button--dark" :disabled="isLoading">{{ $t('save') }}</button>
        </div>
    </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import OverlayLoader from './../OverlayLoader.vue'
import IngredientFinder from './../IngredientFinder.vue'
import AmountInput from './../AmountInput.vue'
import type { SearchResults } from '@/api/SearchResults';
import type { components } from '@/api/api'
import IngredientFinderBasic from '../IngredientFinderBasic.vue';
import { useBasicSearch } from '@/composables/useBasicSearch'
import AppState from '@/AppState';

type CocktailIngredient = components['schemas']['CocktailIngredient']
type CocktailIngredientSubstitute = components['schemas']['CocktailIngredientSubstitute']
type IngredientSearchResult = SearchResults['ingredient']

const shouldUseBasicSearch = useBasicSearch()
const props = defineProps<{
    value: CocktailIngredient;
}>()
const appState = new AppState()
const isLoading = ref(false)
const amountDisplayTracker = ref<number[]>([])
const cocktailIngredient = ref<CocktailIngredient>(props.value)
const selectedSubstitutes = ref<CocktailIngredientSubstitute[]>(props.value.substitutes ?? [])
const emit = defineEmits<{
    close: [type: {type: string}]
}>()

function selectIngredient(item: IngredientSearchResult) {
    if (selectedSubstitutes.value.some(sub => sub.ingredient.id == item.id) || cocktailIngredient.value.ingredient.id == item.id) {
        return
    }

    selectedSubstitutes.value.push({
        ingredient: {
            name: item.name,
            id: item.id,
            slug: item.slug,
        },
        amount: null,
        amount_max: null,
        units: null,
        in_bar_shelf: false,
        in_shelf: false,
    })
}

function removeIngredient(item: CocktailIngredientSubstitute) {
    selectedSubstitutes.value.splice(
        selectedSubstitutes.value.findIndex(i => i == item),
        1
    )
}

function toggleAmountDisplay(sub: CocktailIngredientSubstitute) {
    if (amountDisplayTracker.value.includes(sub.ingredient.id)) {
        amountDisplayTracker.value.splice(
            amountDisplayTracker.value.findIndex(i => i == sub.ingredient.id),
            1
        )
    } else {
        amountDisplayTracker.value.push(sub.ingredient.id)
    }
}

function save() {
    emit('close', {type: 'save'})
}
</script>

<style scoped>
.substitutes {
    display: flex;
    flex-direction: column;
    margin-top: 1rem;
}

.substitutes > h4 {
    font-weight: var(--fw-bold);
}

.substitutes__substitute__name {
    display: flex;
    align-items: baseline;
}

.substitutes__substitute__name h5 {
    font-size: 1.25rem;
}

.substitutes__substitute__name .substitutes__substitute__actions {
    margin-left: auto;
}

.substitutes__substitute__input {
    display: flex;
    gap: var(--gap-size-1);
}

.substitutes__substitute__input input {
    width: 100%;
}

.substitutes__substitute__input .form-group {
    flex-basis: 150px;
}

.substitutes__substitute__input .form-group:last-child {
    flex-basis: 100px;
    flex-grow: 1;
}

.substitutes__substitute__separator {
    text-align: center;
    text-transform: uppercase;
    font-size: 0.75rem;
    font-weight: var(--fw-bold);
    letter-spacing: 1px;
    margin-bottom: 5px;
    background: var(--clr-gray-100);
    color: var(--clr-gray-400);
    padding: 2px 0;
}
</style>
