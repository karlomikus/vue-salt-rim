<script setup lang="ts">
import {ref, computed} from 'vue'
import {useFloating, offset, flip, shift, autoUpdate} from '@floating-ui/vue'
import { useRecommendedAmounts } from '@/composables/useRecommendedAmounts';
import AppState from './../AppState'
import { unitHandler } from './../composables/useUnits'
import { onClickOutside } from '@vueuse/core'

const appState = new AppState()
const reference = ref(null)
const floating = ref(null)
const { floatingStyles } = useFloating(reference, floating, {
    placement: 'bottom-start',
    middleware: [offset(2), flip(), shift()],
    whileElementsMounted: autoUpdate,
})
const showRecommendedAmounts = ref(false)

const model = defineModel<string | number | null>({ required: true });
const defaultAmountsInMl = ['7.5', '15', '22.5', '30', '37.5', '45', '52.5', '60']
const { defaultAmounts } = useRecommendedAmounts(appState.defaultUnit);
if (appState.defaultUnit == 'cl') {
    defaultAmounts.value = defaultAmountsInMl.map(amount => (parseFloat(amount) / 10).toString())
}
if (appState.defaultUnit == 'oz') {
    defaultAmounts.value = defaultAmountsInMl.map(amount => unitHandler.asFraction(unitHandler.ml2oz(parseFloat(amount))))
}

function selectRecommendedAmount(amount: string) {
    model.value = amount
    showRecommendedAmounts.value = false
}

const normalizedModel = computed({
    get() {
        return model.value
    },
    set(newValue) {
        if (!newValue) {
            model.value = null
            return
        }

        if (newValue.toString().startsWith('.')) {
            model.value = '0' + newValue
        } else {
            model.value = newValue
        }
    }
})

onClickOutside(reference, () => {
    showRecommendedAmounts.value = false
})
</script>

<template>
    <input v-bind="$attrs" ref="reference" v-model="normalizedModel" class="form-input" type="text" @focus="showRecommendedAmounts = true">
    <div v-show="showRecommendedAmounts" ref="floating" class="recommended-amounts" :style="floatingStyles">
        <button v-for="recommendedAmount in defaultAmounts" :key="recommendedAmount" class="recommended-amounts__amount" type="button" @click.prevent="selectRecommendedAmount(recommendedAmount)">{{ recommendedAmount }}</button>
    </div>
</template>

<style scoped>
.form-input {
    width: 100%;
}

.recommended-amounts {
    display: flex;
    gap: var(--gap-size-1);
    padding: var(--gap-size-1);
    background: var(--clr-gray-600);
    z-index: var(--z-dropdown);
    border-radius: 5px;
}

.recommended-amounts__amount {
    /* font-feature-settings: "frac"; */
    background: var(--clr-gray-200);
    color: var(--clr-gray-800);
    border: 0;
    border-top: 1px solid var(--clr-gray-50);
    border-radius: 2px;
    font-weight: var(--fw-bold);
    font-size: 0.85rem;
    cursor: pointer;
    transition: transform 50ms ease-in-out;
    min-width: 30px;
    white-space: nowrap;
}

.recommended-amounts__amount:hover {
    background: var(--clr-gray-100);
    transform: translateY(-2px);
}
</style>
