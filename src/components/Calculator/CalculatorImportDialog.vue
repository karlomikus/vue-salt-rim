<template>
    <form @submit.prevent="save">
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">Import calculator</div>
        <div class="form-group">
            <label class="form-label" for="source">{{ $t('source') }}:</label>
            <textarea id="source" v-model="source" rows="8" class="form-input"></textarea>
        </div>
        <div class="dialog-actions">
            <button class="button button--outline" @click.prevent="$emit('closed')">{{ $t('cancel') }}</button>
            <button class="button button--dark" type="submit">{{ $t('save') }}</button>
        </div>
    </form>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import BarAssistantClient from '@/api/BarAssistantClient';
import OverlayLoader from './../OverlayLoader.vue'
import type { components } from '@/api/api'
import { useSaltRimToast } from '@/composables/toast'

type Calculator = components["schemas"]["Calculator"]
type CalculatorRequest = components["schemas"]["CalculatorRequest"]
type CalculatorBlockRequest = components["schemas"]["CalculatorBlockRequest"]

const toast = useSaltRimToast()
const emit = defineEmits(['closed', 'imported'])
const isLoading = ref(false)
const source = ref('')

async function save(): Promise<void> {
    isLoading.value = true
    const calculator = JSON.parse(source.value) as Calculator

    const inputGroup = calculator.blocks.filter(block => block.type === 'input') as CalculatorBlockRequest[];
    const evalGroup = calculator.blocks.filter(block => block.type === 'eval') as CalculatorBlockRequest[];

    const postData: CalculatorRequest = {
        name: calculator.name,
        description: calculator.description,
        blocks: [...inputGroup, ...evalGroup],
    }

    BarAssistantClient.saveCalculator(postData).then(() => {
        emit('imported')
        emit('closed')
    }).catch(e => {
        toast.error(e.message)
    }).finally(() => {
        isLoading.value = false
    })
}
</script>
