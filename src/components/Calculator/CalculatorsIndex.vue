<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { parser } from 'mathjs'
import PageHeader from '../PageHeader.vue';
import Sortable from 'sortablejs'
import CalculatorRender from './CalculatorRender.vue';
import type { CalculatorFormulaInput, CalculatorFormulaEvaluation, Calculator } from './Calculator.ts';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
const mathParser = parser()
const evaluations = ref<CalculatorFormulaEvaluation[]>([])
const inputs = ref<CalculatorFormulaInput[]>([])
const calculator = ref<Calculator>({} as Calculator)
const sortable = ref(null)
const evalList = ref(null)

onMounted(() => {
    initSortable()
})

function initSortable() {
    sortable.value = Sortable.create(evalList.value, {
        handle: '.drag-handle',
        ghostClass: 'block-container--placeholder',
        animation: 150
    })
}

function addInputVariable() {
    inputs.value.push({
        prefix: null,
        suffix: null,
        label: 'New variable',
        format: null,
        value: '0',
        scopeName: 'input' + (inputs.value.length + 1),
        sort: inputs.value.length + 1,
    })
}

function removeInput(input: CalculatorFormulaInput) {
    inputs.value.splice(inputs.value.indexOf(input), 1)
}

function addEvaluation() {
    evaluations.value.push({
        prefix: null,
        suffix: null,
        label: 'Evaluation ' + (evaluations.value.length + 1),
        format: null,
        sort: 0,
        value: '',
        scopeName: 'eval' + (evaluations.value.length + 1),
        result: null,
        error: null,
        decimalPlaces: 2,
    })
}

function removeEvaluation(evaluation: CalculatorFormulaEvaluation) {
    evaluations.value.splice(evaluations.value.indexOf(evaluation), 1)
}

function resolveAll(): void {
    mathParser.clear()
    evaluations.value.forEach(evaluation => evaluation.error = null)
    evaluations.value.forEach(evaluation => evaluation.result = null)

    inputs.value.forEach(input => {
        mathParser.set(input.scopeName, input.value)
    })

    for(let i = 0; i < evaluations.value.length; i++) {
        const evaluation = evaluations.value[i]
        let result = null

        try {
            result = mathParser.evaluate(evaluation.value).toString()
        } catch (e: any) {
            evaluation.error = e.message
            continue
        }

        evaluation.result = result

        mathParser.set(evaluation.scopeName, result)
    }
}
</script>

<template>
    <PageHeader>
        {{ $t('calculators.form') }}
    </PageHeader>
    <div class="calculator-form">
        <div class="calculator-form__form">
            <h3 class="form-section-title">{{ $t('calculators.information') }}</h3>
            <div class="block-container block-container--padded">
                <div class="form-group">
                    <label class="form-label form-label--required">{{ t('name') }}</label>
                    <input class="form-input form-input--small" type="text" v-model="calculator.title">
                </div>
                <div class="form-group">
                    <label class="form-label">{{ t('description') }}</label>
                    <textarea class="form-input" rows="3" v-model="calculator.description"></textarea>
                </div>
            </div>
            <h3 class="form-section-title">{{ $t('calculators.inputs') }}</h3>
            <p>In this section, you define all your required inputs that will change the result of your evaluations. Each input can be used in all evaluations.</p>
            <div class="calculator-form-group block-container block-container--inset block-container--padded">
                <div class="block-container calculator-input-group" v-for="input in inputs" :key="input.sort">
                    <div class="form-row-group">
                        <div class="form-group">
                            <label class="form-label form-label--required">{{ t('label') }}</label>
                            <input class="form-input form-input--small" type="text" v-model="input.label">
                        </div>
                        <div class="form-group">
                            <label class="form-label">{{ t('prefix') }}</label>
                            <input class="form-input form-input--small" type="text" v-model="input.prefix" style="width: 100px;">
                        </div>
                        <div class="form-group">
                            <label class="form-label">{{ t('suffix') }}</label>
                            <input class="form-input form-input--small" type="text" v-model="input.suffix" style="width: 100px;">
                        </div>
                    </div>
                    <div class="form-row-group">
                        <div class="form-group">
                            <label class="form-label form-label--required">{{ t('var-name') }}</label>
                            <input class="form-input form-input--small" type="text" v-model="input.scopeName">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Default value</label>
                            <input class="form-input form-input--small" type="text" v-model="input.value">
                        </div>
                    </div>
                    <a href="#" @click.prevent="removeInput(input)">{{ t('remove') }}</a>
                </div>
                <button class="button button--dark" @click.prevent="addInputVariable()">add input +</button>
            </div>
            <h3 class="form-section-title">{{ $t('calculators.evaluations') }}</h3>
            <p>In this section, you define your evaluations and their result display settings. Each evaluation can access and use all previously defined inputs and evaluation results in its formula using defined variable name.</p>
            <div class="calculator-form-group block-container block-container--inset block-container--padded" ref="evalList">
                <div class="block-container calculator-evaluation-group" v-for="evaluation in evaluations">
                    <div class="drag-handle"></div>
                    <div>
                        <div class="form-row-group">
                            <div class="form-group">
                                <label class="form-label form-label--required" :for="'calc-evaluation-label-' + evaluation.sort">{{ t('label') }}</label>
                                <input :id="'calc-evaluation-label-' + evaluation.sort" class="form-input form-input--small" type="text" v-model="evaluation.label">
                            </div>
                            <div class="form-group">
                                <label class="form-label">{{ t('prefix') }}</label>
                                <input class="form-input form-input--small" type="text" v-model="evaluation.prefix" style="width: 100px;">
                            </div>
                            <div class="form-group">
                                <label class="form-label">{{ t('suffix') }}</label>
                                <input class="form-input form-input--small" type="text" v-model="evaluation.suffix" style="width: 100px;">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Decimal places</label>
                                <input class="form-input form-input--small" type="text" v-model="evaluation.decimalPlaces" style="width: 70px;">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Description</label>
                                <input class="form-input form-input--small" type="text" v-model="evaluation.decimalPlaces">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label form-label--required">{{ t('var-name') }}</label>
                            <input class="form-input form-input--small" type="text" v-model="evaluation.scopeName">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Expression</label>
                            <textarea class="form-input" rows="2" v-model="evaluation.value"></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Result</label>
                            <p>{{ evaluation.prefix }} {{ evaluation.result ?? 'None, click preview to resolve' }} {{ evaluation.suffix }}</p>
                            <p v-show="evaluation.error !== null">Error: {{ evaluation.error }}</p>
                        </div>
                        <a href="#" @click.prevent="removeEvaluation(evaluation)">{{ t('remove') }}</a>
                    </div>
                </div>
                <button class="button button--dark" @click.prevent="addEvaluation()">add evaluation +</button>
            </div>
            <button class="button button--outline" type="button" @click="resolveAll()">Preview</button>
            <button class="button button--dark" type="button" @click="resolveAll()">Save</button>
        </div>
    </div>
</template>

<style scoped>
.calculator-form {
    display: grid;
}
.calculator-form-group {
    display: grid;
    gap: var(--gap-size-2);
}
.calculator-input-group {
    padding: var(--gap-size-3);
    /* display: flex;
    gap: var(--gap-size-2); */
}
.calculator-evaluation-group {
    padding: var(--gap-size-3);
    display: flex;
    gap: var(--gap-size-2);
}
</style>