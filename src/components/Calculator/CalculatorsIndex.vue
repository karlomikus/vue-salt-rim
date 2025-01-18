<script setup lang="ts">
import { ref } from 'vue'
import type { components } from '@/api/api'
import BarAssistantClient from '@/api/BarAssistantClient';
import PageHeader from '../PageHeader.vue';
import CalculatorRender from './CalculatorRender.vue';
import OverlayLoader from './../OverlayLoader.vue'
import { useConfirm } from '@/composables/confirm';
import { useTitle } from '@/composables/title'
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';

type Calculator = components["schemas"]["Calculator"]

const { t } = useI18n()
const confirm = useConfirm()
const calculators = ref<Calculator[]>([])
const isLoading = ref<boolean>(false)

useTitle(t('calculators.title'))

async function fetchCalculators() {
    isLoading.value = true
    try {
        calculators.value = (await BarAssistantClient.getCalculators())?.data ?? [] as Calculator[]
    } catch (e: any) {
        return
    } finally {
        isLoading.value = false
    }
}

async function removeCalculator(calc: Calculator) {
    confirm.show(t('imageupload.delete-confirm'), {
        onResolved: (dialog: any) => {
            dialog.close()
            isLoading.value = true
            BarAssistantClient.deleteCalculator(calc.id).then(() => {
                fetchCalculators()
            }).catch(() => {
            }).finally(() => {
                isLoading.value = false
            })
        }
    })
}

fetchCalculators()
</script>

<template>
    <PageHeader>
        {{ t('calculators.title') }}
        <template #actions>
            <RouterLink class="button button--dark" :to="{ name: 'calculators.form' }">{{ t('calculators.add') }}</RouterLink>
        </template>
    </PageHeader>
    <div class="calculators">
        <OverlayLoader v-if="isLoading" />
        <div v-for="calc in calculators" :key="calc.id" class="calculators__calculator">
            <div class="block-container block-container--padded">
                <CalculatorRender :calculator="calc"></CalculatorRender>
                <div class="calculators__calculator__actions">
                    <RouterLink :to="{ name: 'calculators.form', query: { id: calc.id } }">{{ t('edit') }}</RouterLink> &middot; <a href="#" @click.prevent="removeCalculator(calc)">{{ t('remove') }}</a>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.calculators {
    display: grid;
    gap: var(--gap-size-2);
    grid-template-columns: 1fr 1fr 1fr;
}

.calculators__calculator__actions {
    padding-top: 1rem;
}
</style>