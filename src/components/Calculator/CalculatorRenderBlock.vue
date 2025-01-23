<script setup lang="ts">
import type { components } from '@/api/api'

type CalculatorBlock = components["schemas"]["CalculatorBlock"]

interface CalculatorFormulaEvaluation {
    block: CalculatorBlock;
    result: string|null;
}

defineProps<{
    evaluatedBlock: CalculatorFormulaEvaluation,
}>()
</script>

<template>
    <div class="calculator__evaluated__block">
        <header class="calculator__evaluated__block__label">{{ evaluatedBlock.block.label }}:</header>
        <div class="calculator__evaluated__block__result">{{ evaluatedBlock.block.settings.prefix }} {{ evaluatedBlock.result }} {{ evaluatedBlock.block.settings.suffix }}</div>
        <small v-show="evaluatedBlock.block.description !== null" class="calculator__evaluated__block__description">{{ evaluatedBlock.block.description }}</small>
    </div>
</template>

<style scoped>
.calculator__evaluated__block {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
}

.calculator__evaluated__block__label {
    font-size: 0.85rem;
    margin: 0;
}

.calculator__evaluated__block__result {
    font-size: 1.5rem;
    line-height: 1;
    font-weight: var(--fw-bold);
}

.calculator__evaluated__block__description {
    font-size: 0.85rem;
    color: var(--clr-gray-400);
}
</style>