<script setup>
import { inject } from 'vue'

const { currentUnit, updateCurrentUnit } = inject('currentUnit')
</script>
<template>
    <div class="button-group" style="text-align:right">
        <h4>{{ $t('units') }}:</h4>
        <button type="button" :class="{ 'is-active': currentUnit == 'ml' }" @click="updateCurrentUnit('ml')">ml</button>
        <button type="button" :class="{ 'is-active': currentUnit == 'oz' }" @click="updateCurrentUnit('oz')">oz</button>
        <button type="button" :class="{ 'is-active': currentUnit == 'cl' }" @click="updateCurrentUnit('cl')">cl</button>
    </div>
</template>