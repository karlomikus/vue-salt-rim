<script setup lang="ts">
import type { components } from '@/api/api'
import { parser } from 'mathjs'
import { computed } from 'vue'
import CalculatorRenderBlock from './CalculatorRenderBlock.vue'

type Calculator = components["schemas"]["Calculator"]
type CalculatorBlock = components["schemas"]["CalculatorBlock"]

interface CalculatorFormulaEvaluation {
    block: CalculatorBlock;
    result: string|null;
}

const mathParser = parser()
const props = defineProps<{
    calculator: Calculator,
}>()

const inputs = props.calculator.blocks.filter(input => input.type === 'input')
const evaluations = props.calculator.blocks.filter(input => input.type === 'eval').sort((a, b) => a.sort - b.sort)

const resolvedCalculations = computed<CalculatorFormulaEvaluation[]>(() => {
    inputs.forEach(input => {
        mathParser.set(input.variable_name, input.value)
    })

    return evaluations.map(evl => {
        return {
            block: evl,
            error: null,
            result: resolveCalculation(evl),
        }
    })
})

function resolveCalculation(evaluation: CalculatorBlock): string {
    let result = null
    try {
        result = mathParser.evaluate(evaluation.value)
    } catch (e: any) {
    }

    mathParser.set(evaluation.variable_name, result)

    return parseFloat(result).toFixed(parseInt(evaluation.settings.decimal_places ?? '0'))
}
</script>

<template>
    <div class="calculator">
        <h3 class="calculator__title">{{ calculator.name }}</h3>
        <p>{{ calculator.description }}</p>
        <div class="calculator__inputs">
            <div class="form-group" v-for="input in inputs">
                <label class="form-label form-label--required" :for="'calculator-render-' + calculator.id + '-' + input.sort">{{ input.settings.prefix }} {{ input.label }} {{ input.settings.suffix }}</label>
                <input :id="'calculator-render-' + calculator.id + '-' + input.sort" class="form-input form-input--small" type="text" v-model="input.value">
            </div>
        </div>
        <div class="calculator__evaluations">
            <CalculatorRenderBlock v-for="evl in resolvedCalculations" :evaluated-block="evl"></CalculatorRenderBlock>
        </div>
    </div>
</template>

<style scoped>
.calculator {
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-2);
}

.calculator__inputs {
    padding-bottom: var(--gap-size-3);
}

.calculator__evaluations {
    display: grid;
    gap: var(--gap-size-3);
}

.calculator__title {
    font-size: 1.25rem;
    font-weight: var(--fw-bold);
}
</style>