<script setup lang="ts">
import type { CalculatorFormulaInput, CalculatorFormulaEvaluation, CalculatorResolvedEvaluation } from './Calculator.ts';

defineProps<{
    inputs: CalculatorFormulaInput[],
    evaluations: CalculatorFormulaEvaluation[],
}>()
</script>
<template>
    <div>
        <div class="dsada" v-for="input in inputs">
            <div class="form-group">
                <label class="form-label form-label--required">{{ input.label }}</label>
                {{ input.prefix }} <input class="form-input form-input--small" type="text"> {{ input.suffix }}
            </div>
        </div>
    </div>
</template>