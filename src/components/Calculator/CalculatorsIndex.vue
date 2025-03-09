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
import { useSaltRimToast } from '@/composables/toast'
import EmptyState from './../EmptyState.vue'
import IconCalculator from '../Icons/IconCalculator.vue';
import { useClipboard } from '@vueuse/core'
import CalculatorImportDialog from './CalculatorImportDialog.vue';
import SaltRimDialog from './../Dialog/SaltRimDialog.vue'

type Calculator = components["schemas"]["Calculator"]

const { t } = useI18n()
const toast = useSaltRimToast()
const confirm = useConfirm()
const calculators = ref<Calculator[]>([])
const isLoading = ref<boolean>(false)
const showImportDialog = ref<boolean>(false)
const { copy, copied, isSupported } = useClipboard()

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
    confirm.show(t('calculators.delete-confirm', {name: calc.name}), {
        onResolved: (dialog: any) => {
            dialog.close()
            isLoading.value = true
            BarAssistantClient.deleteCalculator(calc.id).then(() => {
                toast.default(t('calculators.delete-success'))
                fetchCalculators()
            }).catch((e: any) => {
                toast.error(e.message)
            }).finally(() => {
                isLoading.value = false
            })
        }
    })
}

async function share(calc: Calculator) {
    if (!isSupported.value) {
        toast.error(t('permissions.clipboard-error'))
        return
    }

    const { id, ...withoutId } = calc;

    const source = JSON.stringify(withoutId)
    await copy(source)

    if (copied.value) {
        toast.default(t('calculators.copy-success'))
    }
}

fetchCalculators()
</script>

<template>
    <PageHeader>
        {{ t('calculators.title') }}
        <template #actions>
            <SaltRimDialog v-model="showImportDialog">
                <template #trigger>
                    <button type="button" class="button button--outline" @click.prevent="showImportDialog = !showImportDialog">{{ $t('calculators.import') }}</button>
                </template>
                <template #dialog>
                    <CalculatorImportDialog @closed="showImportDialog = false" @imported="fetchCalculators" />
                </template>
            </SaltRimDialog>
            <RouterLink class="button button--dark" :to="{ name: 'calculators.form' }">{{ t('calculators.add') }}</RouterLink>
        </template>
    </PageHeader>
    <div>
        <OverlayLoader v-if="isLoading" />
        <div class="calculators">
            <div v-for="calc in calculators" :key="calc.id" class="block-container block-container--padded calculators__calculator">
                <CalculatorRender :calculator="calc"></CalculatorRender>
                <div class="calculators__calculator__actions">
                    <RouterLink :to="{ name: 'calculators.form', query: { id: calc.id } }">{{ t('edit') }}</RouterLink> &middot; <a href="#" @click.prevent="share(calc)">{{ t('share.title') }}</a> &middot; <a href="#" @click.prevent="removeCalculator(calc)">{{ t('remove') }}</a>
                </div>
            </div>
        </div>
        <EmptyState v-if="calculators.length == 0">
            <template #icon>
                <IconCalculator />
            </template>
            <template #default>
                {{ $t('calculators.empty') }}
            </template>
        </EmptyState>
    </div>
</template>

<style scoped>
.calculators {
    display: grid;
    gap: var(--gap-size-2);
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
}

@media (max-width: 450px) {
    .calculators {
        grid-template-columns: 1fr;
    }
}

.calculators__calculator__actions {
    padding-top: 1rem;
}
</style>