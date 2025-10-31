<script setup lang="ts">
import { ref, provide } from 'vue'
import { unitHandler } from '../../composables/useUnits'
import AppState from '../../AppState'

const emit = defineEmits<{
    unitChanged: [unit: 'ml' | 'oz' | 'cl']
}>()
const appState = new AppState()
const currentUnit = ref<'ml' | 'oz' | 'cl'>('ml')
if (appState.defaultUnit) {
    currentUnit.value = appState.defaultUnit
}

function updateCurrentUnit(unit: 'ml' | 'oz' | 'cl') {
    currentUnit.value = unit
    appState.setDefaultUnits(unit)
    emit('unitChanged', currentUnit.value)
}

function printIngredient(ingredient: any): string {
    return unitHandler.print(ingredient, currentUnit.value, 1)
}

provide('currentUnit', {
    currentUnit, updateCurrentUnit
})
</script>
<template>
    <slot :current-unit="currentUnit" :print-ingredient="printIngredient"></slot>
</template>
