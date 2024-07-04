<script setup>
import { ref, provide } from 'vue'
import UnitHandler from '../../UnitHandler'
import AppState from '../../AppState'

const appState = new AppState()
const currentUnit = ref('ml')
if (appState.defaultUnit) {
    currentUnit.value = appState.defaultUnit
}

function updateCurrentUnit(unit) {
    currentUnit.value = unit
}

function printIngredient(ingredient) {
    return UnitHandler.print(ingredient, currentUnit.value, 1)
}

provide('currentUnit', {
    currentUnit, updateCurrentUnit
})
</script>
<template>
    <slot :current-unit="currentUnit" :print-ingredient="printIngredient"></slot>
</template>