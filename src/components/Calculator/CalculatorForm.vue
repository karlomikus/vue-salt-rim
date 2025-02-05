<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { parser } from 'mathjs'
import OverlayLoader from '@/components/OverlayLoader.vue'
import PageHeader from '../PageHeader.vue';
import type { components } from '@/api/api'
import Sortable from 'sortablejs'
import { useTitle } from '@/composables/title'
import { useSaltRimToast } from '@/composables/toast.js'
import BarAssistantClient from '@/api/BarAssistantClient';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import UnitHandler from '@/UnitHandler'
import { useConfirm } from '@/composables/confirm';

type Calculator = components["schemas"]["Calculator"]
type CalculatorRequest = components["schemas"]["CalculatorRequest"]
type CalculatorBlockRequest = components["schemas"]["CalculatorBlockRequest"]

interface CalculatorFormulaEvaluation {
    block: CalculatorBlockRequest;
    result: string|null;
    error: string|null;
}

const confirm = useConfirm()
const toast = useSaltRimToast()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const calculatorId = route.query.id || null
const mathParser = parser()
const evaluations = ref<CalculatorFormulaEvaluation[]>([])
const inputs = ref<CalculatorBlockRequest[]>([])
const calculator = ref<Calculator>({} as Calculator)
const sortable = ref(null)
const evalList = ref(null)
const isLoading = ref(false)

onMounted(() => {
    initSortable()
})

useTitle(t('calculators.title'))

if (calculatorId) {
    fetchCalculator(parseInt(calculatorId as string))
}

async function fetchCalculator(id: number): Promise<void> {
    isLoading.value = true

    try {
        calculator.value = (await BarAssistantClient.getCalculator(id))?.data ?? {} as Calculator
        useTitle(calculator.value.name + ' \u22C5 ' + t('calculators.title'))
        inputs.value = calculator.value?.blocks?.filter((block) => block.type === 'input') as CalculatorBlockRequest[]
        evaluations.value = calculator.value?.blocks?.filter((block) => block.type === 'eval').map(e => {
            return {
                block: e,
                result: null,
                error: null,
            } as CalculatorFormulaEvaluation
        })
    } catch (err: any) {
        toast.error(err.message)
    } finally {
        isLoading.value = false
    }
}

function updateSortPosition(): void {
    if (!sortable.value) {
        return
    }

    const sorted = (sortable.value as any).toArray() as number[]
    evaluations.value.forEach((evl) => {
        evl.block.sort = sorted.findIndex((sortedId: number) => sortedId == evl.block.sort) + 1

        return evl
    })
}

const sortedEvaluations = computed(() => {
    return [...evaluations.value].sort((a, b) => a.block.sort - b.block.sort)
})

function initSortable() {
    sortable.value = Sortable.create(evalList.value, {
        handle: '.drag-handle',
        ignore: '.ignore-sortable',
        ghostClass: 'block-container--placeholder',
        animation: 150,
        onEnd: updateSortPosition,
    })
}

function addInputVariable() {
    inputs.value.push({
        type: 'input',
        label: 'New variable',
        value: '0',
        variable_name: 'input' + (inputs.value.length + 1),
        sort: inputs.value.length + 1,
        settings: {
            prefix: null,
            suffix: null,
            decimal_places: null,
        }
    })
}

function removeInput(input: CalculatorBlockRequest) {
    if (input.value !== '') {
        confirm.show(t('calculators.confirm-input-delete'), {
            onResolved: (dialog: any) => {
                dialog.close()
                inputs.value.splice(inputs.value.indexOf(input), 1)
            }
        })
    } else {
        inputs.value.splice(inputs.value.indexOf(input), 1)
    }
}

function addEvaluation() {
    evaluations.value.push({
        block: {
            type: 'eval',
            label: 'Evaluation ' + (evaluations.value.length + 1),
            sort: evaluations.value.length + 1,
            value: '',
            variable_name: 'eval' + (evaluations.value.length + 1),
            settings: {
                prefix: null,
                suffix: null,
                decimal_places: '2',
            }
        },
        result: null,
        error: null,
    })
}

function removeEvaluation(evaluation: CalculatorFormulaEvaluation) {
    if (evaluation.block.value !== '') {
        confirm.show(t('calculators.confirm-eval-delete'), {
            onResolved: (dialog: any) => {
                dialog.close()
                evaluations.value.splice(evaluations.value.indexOf(evaluation), 1)
            }
        })
    } else {
        evaluations.value.splice(evaluations.value.indexOf(evaluation), 1)
    }
}

function resolveAll(): void {
    mathParser.clear()
    evaluations.value.forEach(evaluation => evaluation.error = null)
    evaluations.value.forEach(evaluation => evaluation.result = null)

    inputs.value.forEach(input => {
        mathParser.set(input.variable_name, input.value)
    })

    for(let i = 0; i < sortedEvaluations.value.length; i++) {
        const evaluation = sortedEvaluations.value[i]
        let result = null

        try {
            result = mathParser.evaluate(evaluation.block.value)
        } catch (e: any) {
            evaluation.error = e.message
            continue
        }

        evaluation.result = UnitHandler.toFixedWithTruncate(result, evaluation.block.settings.decimal_places ?? 0)

        mathParser.set(evaluation.block.variable_name, result)
    }
}

async function save(): Promise<void> {
    if (!sortable.value) {
        return;
    }

    const inputGroup = inputs.value;
    const evalGroup = evaluations.value.map(v => v.block);

    const postData: CalculatorRequest = {
        name: calculator.value.name,
        description: calculator.value.description,
        blocks: [...inputGroup, ...evalGroup],
    }

    isLoading.value = true
    if (calculator.value.id) {
        BarAssistantClient.updateCalculator(calculator.value.id, postData).then(() => {
            router.push({ name: 'calculators.index' })
        }).catch(e => {
            toast.error(e.message)
        }).finally(() => {
            isLoading.value = false
        })
    } else {
        BarAssistantClient.saveCalculator(postData).then(() => {
            router.push({ name: 'calculators.index' })
        }).catch(e => {
            toast.error(e.message)
        }).finally(() => {
            isLoading.value = false
        })
    }
}
</script>

<template>
    <PageHeader>
        {{ calculator.id ? t('calculators.edit') : t('calculators.add') }}
    </PageHeader>
    <form @submit.prevent="save" class="calculator-form">
        <OverlayLoader v-if="isLoading" />
        <div class="calculator-form__form">
            <h3 class="form-section-title">{{ t('calculators.information') }}</h3>
            <div class="block-container block-container--padded">
                <div class="form-group">
                    <label class="form-label form-label--required">{{ t('name') }}</label>
                    <input class="form-input form-input--small" type="text" v-model="calculator.name">
                </div>
                <div class="form-group">
                    <label class="form-label">{{ t('description') }}</label>
                    <textarea class="form-input" rows="3" v-model="calculator.description"></textarea>
                </div>
            </div>
            <h3 class="form-section-title">{{ t('calculators.inputs') }}</h3>
            <p class="calculator-form__section-info">{{ t('calculators.inputs-description') }}</p>
            <div class="calculator-form-group block-container block-container--inset block-container--padded">
                <div class="block-container calculator-input-group" v-for="input in inputs" :key="input.sort">
                    <div class="form-row-group">
                        <div class="form-group">
                            <label class="form-label form-label--required">{{ t('label') }}</label>
                            <input class="form-input form-input--small" type="text" v-model="input.label">
                        </div>
                        <div class="form-group">
                            <label class="form-label">{{ t('prefix') }}</label>
                            <input class="form-input form-input--small" type="text" v-model="input.settings.prefix" style="width: 100px;">
                        </div>
                        <div class="form-group">
                            <label class="form-label">{{ t('suffix') }}</label>
                            <input class="form-input form-input--small" type="text" v-model="input.settings.suffix" style="width: 100px;">
                        </div>
                    </div>
                    <div class="form-row-group">
                        <div class="form-group">
                            <label class="form-label form-label--required">{{ t('calculators.var-name') }}</label>
                            <input class="form-input form-input--small" type="text" v-model="input.variable_name">
                        </div>
                        <div class="form-group">
                            <label class="form-label">{{ t('default-value') }}</label>
                            <input class="form-input form-input--small" type="text" v-model="input.value">
                        </div>
                    </div>
                    <a href="#" @click.prevent="removeInput(input)">{{ t('remove') }}</a>
                </div>
                <div class="ignore-sortable" style="text-align: center;">
                    <button class="button button--dark" @click.prevent="addInputVariable()">{{ t('calculators.add-input') }}</button>
                </div>
            </div>
            <h3 class="form-section-title">{{ t('calculators.evaluations') }}</h3>
            <p class="calculator-form__section-info">{{ t('calculators.evaluations-description') }}</p>
            <div class="calculator-form-group block-container block-container--inset block-container--padded" ref="evalList">
                <div class="block-container calculator-evaluation-group" v-for="evaluation in evaluations" :data-id="evaluation.block.sort">
                    <div class="drag-handle"></div>
                    <div>
                        <div class="form-row-group">
                            <div class="form-group">
                                <label class="form-label form-label--required" :for="'calc-evaluation-label-' + evaluation.block.sort">{{ t('label') }}</label>
                                <input :id="'calc-evaluation-label-' + evaluation.block.sort" class="form-input form-input--small" type="text" v-model="evaluation.block.label" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" :for="'calc-evaluation-description-' + evaluation.block.sort">{{ t('description') }}</label>
                                <input :id="'calc-evaluation-description-' + evaluation.block.sort" class="form-input form-input--small" type="text" v-model="evaluation.block.description">
                            </div>
                            <div class="form-group">
                                <label class="form-label" :for="'calc-evaluation-prefix-' + evaluation.block.sort">{{ t('prefix') }}</label>
                                <input :id="'calc-evaluation-prefix-' + evaluation.block.sort" class="form-input form-input--small" type="text" v-model="evaluation.block.settings.prefix" style="width: 100px;">
                            </div>
                            <div class="form-group">
                                <label class="form-label" :for="'calc-evaluation-suffix-' + evaluation.block.sort">{{ t('suffix') }}</label>
                                <input :id="'calc-evaluation-suffix-' + evaluation.block.sort" class="form-input form-input--small" type="text" v-model="evaluation.block.settings.suffix" style="width: 100px;">
                            </div>
                            <div class="form-group">
                                <label class="form-label" :for="'calc-evaluation-decimal-places-' + evaluation.block.sort">Decimal places</label>
                                <input :id="'calc-evaluation-decimal-places-' + evaluation.block.sort" class="form-input form-input--small" type="text" v-model="evaluation.block.settings.decimal_places" style="width: 70px;">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label form-label--required" :for="'calc-evaluation-var-name-' + evaluation.block.sort">{{ t('calculators.var-name') }}</label>
                            <input :id="'calc-evaluation-var-name-' + evaluation.block.sort" class="form-input form-input--small" type="text" v-model="evaluation.block.variable_name" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label form-label--required" :for="'calc-evaluation-value-' + evaluation.block.sort">{{ t('calculators.expression') }}</label>
                            <textarea :id="'calc-evaluation-value-' + evaluation.block.sort" class="form-input" rows="2" v-model="evaluation.block.value" required></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">{{ t('result') }}</label>
                            <p>{{ evaluation.block.settings?.prefix }} {{ evaluation.result ?? t('calculators.missing-result') }} {{ evaluation.block.settings?.suffix }}</p>
                            <p v-show="evaluation.error !== null">{{ t('error') }}: {{ evaluation.error }}</p>
                        </div>
                        <a href="#" @click.prevent="removeEvaluation(evaluation)">{{ t('remove') }}</a>
                    </div>
                </div>
                <div class="ignore-sortable" style="text-align: center;">
                    <button class="button button--dark" type="button" @click.prevent="addEvaluation()">{{ t('calculators.add-evaluation') }}</button>
                </div>
            </div>
            <div class="form-actions form-actions--timestamps">
                <div class="form-actions__buttons">
                    <RouterLink class="button button--outline" :to="{ name: 'calculators.index' }">{{ t('cancel') }}</RouterLink>
                    <button class="button button--outline" type="button" @click="resolveAll()">{{ t('preview') }}</button>
                    <button class="button button--dark" type="submit">{{ $t('save') }}</button>
                </div>
            </div>
        </div>
    </form>
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
}
.calculator-evaluation-group {
    padding: var(--gap-size-3);
    display: flex;
    gap: var(--gap-size-2);
}
.calculator-form__section-info {
    margin-bottom: var(--gap-size-3);
}
</style>