<script setup>
import {ref, computed} from 'vue'
import {useFloating, offset, flip, shift, autoUpdate} from '@floating-ui/vue'
import AppState from './../AppState'
import UnitHandler from './../UnitHandler'

const appState = new AppState()
const reference = ref(null)
const floating = ref(null)
const { floatingStyles } = useFloating(reference, floating, {
    placement: 'bottom-start',
    middleware: [offset(2), flip(), shift()],
    whileElementsMounted: autoUpdate,
})
const showRecommendedAmounts = ref(false)

const model = defineModel({ type: null, required: true })
const defaultAmountsInMl = ['7.5', '15', '22.5', '30', '45', '60']
const defaultAmounts = ref(defaultAmountsInMl)
if (appState.defaultUnit == 'cl') {
    defaultAmounts.value = defaultAmountsInMl.map(amount => (parseFloat(amount) / 10).toString())
}
if (appState.defaultUnit == 'oz') {
    defaultAmounts.value = defaultAmountsInMl.map(amount => UnitHandler.asFraction(UnitHandler.ml2oz(parseFloat(amount))))
}

function selectRecommendedAmount(amount) {
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

document.addEventListener('click', e => {
    var dw = reference.value || null
    if (dw && !dw.contains(e.target)) {
        showRecommendedAmounts.value = false
    }
}, false)
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
    background: rgba(0, 0, 0, .7);
    z-index: var(--z-dropdown);
    border-radius: 5px;
}

.recommended-amounts__amount {
    /* font-feature-settings: "frac"; */
    background: var(--clr-gray-200);
    color: var(--clr-gray-800);
    border: 0;
    border-top: 1px solid rgba(255, 255, 255, .5);
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