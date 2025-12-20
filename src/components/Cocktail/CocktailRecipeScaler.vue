<template>
    <div class="block-container block-container--inset block-container--padded">
        <div>
            <input type="radio" name="scale-type" value="quantity" id="bar-public-recipe-scale-quantity" v-model="scaleType">
            <label for="bar-public-recipe-scale-quantity">
                Scale to target quantity
            </label>
            <div class="scaler-inline-group">
                <button class="button button--dark" @click="modifyQuantity(-1)">-</button>
                <input type="text" class="form-input form-input--small" v-model="quantity">
                <button class="button button--dark" @click="modifyQuantity(1)">+</button>
            </div>
        </div>
        <div>
            <input type="radio" name="scale-type" value="volume" id="bar-public-recipe-scale-volume" v-model="scaleType">
            <label for="bar-public-recipe-scale-volume">
                Scale to target volume ({{ currentUnit }}) and dilution (%)
            </label>
            <div class="scaler-inline-group">
                <input type="text" class="form-input form-input--small" v-model="targetVolumeToScaleTo" placeholder="Target volume">
                <input type="text" class="form-input form-input--small" style="width: 120px;" v-model="targetVolumeDilution" placeholder="Optional dilution (%)">
            </div>
            <div class="volume-scaling__water" v-if="waterDilution && targetVolumeDilution > 0">
                {{ $t('target-volume-dilution-help', {total: unitHandler.toFixedWithTruncate(parseFloat(waterDilution), 2) + ' ' + currentUnit}) }}
            </div>
            <p class="form-input-hint">Inspired by Jeffrey Morgenthaler's <a href="https://www.batchcalc.com/" target="_blank">The Batch Cocktail Calculator</a></p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import { unitHandler } from '@/composables/useUnits'

const {
    currentUnit = 'ml',
    cocktailVolumeMl = 0,
    methodDilution = 0,
} = defineProps<{
    currentUnit?: 'ml' | 'oz' | 'cl',
    cocktailVolumeMl?: number,
    methodDilution?: number,
}>()

const quantity = ref(1);
const targetVolumeDilution = ref(methodDilution);
const targetVolumeToScaleTo = ref(0);
const scaleType = ref<'quantity' | 'volume'>('quantity');

const model = defineModel<number>({
    type: Number,
    required: false,
    default: 1,
})

const volumeScaleFactor = computed(() => {
    const totalVolume = unitHandler.convertFromTo('ml', cocktailVolumeMl, currentUnit)

    if (!targetVolumeToScaleTo.value) {
        return null
    }

    const dilutionVolume = (targetVolumeDilution.value / 100) * totalVolume;
    const finalTotalVolume = totalVolume + dilutionVolume;

    return targetVolumeToScaleTo.value / finalTotalVolume
})

const waterDilution = computed(() => {
    const totalVolume = unitHandler.convertFromTo('ml', cocktailVolumeMl, currentUnit)

    if (!targetVolumeToScaleTo.value || !totalVolume || !volumeScaleFactor.value) {
        return null
    }

    const dilutionVolume = (targetVolumeDilution.value / 100) * totalVolume

    return unitHandler.print({ amount: dilutionVolume * volumeScaleFactor.value }, currentUnit, 1)
})

const scaleFactor = computed(() => {
    if (scaleType.value === 'quantity') {
        return Number(quantity.value) || 1
    } else {
        return volumeScaleFactor.value || 1
    }
})

watchEffect(() => {
    model.value = scaleFactor.value
})

const modifyQuantity = (delta: number) => {
    const newQuantity = Number(quantity.value) + delta
    quantity.value = Math.max(1, newQuantity)
}
</script>

<style scoped>
.scaler-inline-group {
    display: flex;
    gap: .5rem;
    align-items: center
}
</style>
