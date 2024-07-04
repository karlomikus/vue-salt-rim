<script setup>
import { inject } from 'vue'

const { currentUnit, updateCurrentUnit } = inject('currentUnit')
</script>
<template>
    <div class="cocktail-button-group" style="text-align:right">
        <h4>{{ $t('units') }}:</h4>
        <button type="button" :class="{ 'active-serving': currentUnit == 'ml' }" @click="updateCurrentUnit('ml')">ml</button>
        <button type="button" :class="{ 'active-serving': currentUnit == 'oz' }" @click="updateCurrentUnit('oz')">oz</button>
        <button type="button" :class="{ 'active-serving': currentUnit == 'cl' }" @click="updateCurrentUnit('cl')">cl</button>
    </div>
</template>
<style scoped>
.cocktail-button-group {
    --cbg-clr-content: var(--clr-gray-800);
    --cbg-clr-bg: var(--clr-gray-100);
    --cbg-clr-bg-hover: var(--clr-gray-300);
    --cbg-clr-bg-active: var(--clr-gray-200);
}

.dark-theme .cocktail-button-group {
    --cbg-clr-content: var(--clr-gray-200);
    --cbg-clr-bg: rgba(0, 0, 0, .2);
    --cbg-clr-bg-hover: rgb(0, 0, 0, .4);
    --cbg-clr-bg-active: rgb(0, 0, 0, .6);
}

.cocktail-button-group h4 {
    font-size: 0.7rem;
}

.cocktail-button-group button {
    background: none;
    border: none;
    font-size: 0.85rem;
    font-weight: var(--fw-bold);
    margin: 0;
    padding: 0.15rem 0.5rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    cursor: pointer;
    color: var(--cbg-clr-content);
    background-color: var(--cbg-clr-bg);
}

.cocktail-button-group button.active-serving {
    background-color: var(--cbg-clr-bg-active);
}

.cocktail-button-group button:hover {
    background-color: var(--cbg-clr-bg-hover);
}
</style>