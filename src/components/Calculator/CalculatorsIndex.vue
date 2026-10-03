<script setup lang="ts">
import { computed, ref } from "vue";
import type { components } from "@/api/api";
import BarAssistantClient from "@/api/BarAssistantClient";
import PageHeader from "../PageHeader.vue";
import CalculatorCard from "./CalculatorCard.vue";
import OverlayLoader from "./../OverlayLoader.vue";
import { useConfirm } from "@/composables/confirm";
import { useTitle } from "@/composables/title";
import { useI18n } from "vue-i18n";
import { RouterLink } from "vue-router";
import { useSaltRimToast } from "@/composables/toast";
import EmptyState from "./../EmptyState.vue";
import IconCalculator from "../Icons/IconCalculator.vue";
import { useClipboard } from "@vueuse/core";
import CalculatorImportDialog from "./CalculatorImportDialog.vue";
import SaltRimDialog from "./../Dialog/SaltRimDialog.vue";

type Calculator = components["schemas"]["Calculator"];

const { t } = useI18n();
const toast = useSaltRimToast();
const confirm = useConfirm();
const calculators = ref<Calculator[]>([]);
const isLoading = ref<boolean>(false);
const showImportDialog = ref<boolean>(false);
const searchTerm = ref<string>("");
const expandedIds = ref<number[]>([]);
const { copy, copied, isSupported } = useClipboard();

useTitle(t("calculators.title"));

const filteredCalculators = computed<Calculator[]>(() => {
    const term = searchTerm.value.trim().toLowerCase();

    if (!term) {
        return calculators.value;
    }

    return calculators.value.filter((calc) => calc.name.toLowerCase().includes(term) || (calc.description ?? "").toLowerCase().includes(term));
});

function isExpanded(calculatorId: number): boolean {
    return expandedIds.value.includes(calculatorId);
}

function toggleCalculator(calculatorId: number): void {
    expandedIds.value = isExpanded(calculatorId) ? expandedIds.value.filter((id) => id !== calculatorId) : [...expandedIds.value, calculatorId];
}

async function fetchCalculators() {
    isLoading.value = true;
    try {
        calculators.value = (await BarAssistantClient.getCalculators())?.data ?? ([] as Calculator[]);
    } catch (e: any) {
        return;
    } finally {
        isLoading.value = false;
    }
}

async function removeCalculator(calc: Calculator) {
    confirm.show(t("calculators.delete-confirm", { name: calc.name }), {
        onResolved: (dialog: any) => {
            dialog.close();
            isLoading.value = true;
            BarAssistantClient.deleteCalculator(calc.id)
                .then(() => {
                    toast.default(t("calculators.delete-success"));
                    fetchCalculators();
                })
                .catch((e: any) => {
                    toast.error(e.message);
                })
                .finally(() => {
                    isLoading.value = false;
                });
        },
    });
}

async function share(calc: Calculator) {
    if (!isSupported.value) {
        toast.error(t("permissions.clipboard-error"));
        return;
    }

    const { id, ...withoutId } = calc;

    const source = JSON.stringify(withoutId);
    await copy(source);

    if (copied.value) {
        toast.default(t("calculators.copy-success"));
    }
}

fetchCalculators();
</script>

<template>
    <PageHeader>
        {{ t("calculators.title") }}
        <template #actions>
            <SaltRimDialog v-model="showImportDialog">
                <template #trigger>
                    <button type="button" class="button button--outline" @click.prevent="showImportDialog = !showImportDialog">
                        {{ $t("calculators.import") }}
                    </button>
                </template>
                <template #dialog>
                    <CalculatorImportDialog @closed="showImportDialog = false" @imported="fetchCalculators" />
                </template>
            </SaltRimDialog>
            <RouterLink class="button button--dark" :to="{ name: 'calculators.form' }">{{ t("calculators.add") }}</RouterLink>
        </template>
    </PageHeader>
    <div class="calculators-index">
        <input v-if="calculators.length > 0" v-model="searchTerm" class="form-input calculators-index__search" type="search" :placeholder="$t('placeholder.search')" />
        <OverlayLoader v-if="isLoading" />
        <div v-if="filteredCalculators.length > 0" class="calculators">
            <CalculatorCard
                v-for="calc in filteredCalculators"
                :key="calc.id"
                :calculator="calc"
                :expanded="isExpanded(calc.id)"
                @toggle="toggleCalculator(calc.id)"
                @share="share"
                @remove="removeCalculator"
            />
        </div>
        <EmptyState v-else-if="!isLoading && calculators.length == 0">
            <template #icon>
                <IconCalculator />
            </template>
            <template #default>
                {{ $t("calculators.empty") }}
            </template>
        </EmptyState>
        <EmptyState v-else-if="!isLoading">
            <template #icon>
                <IconCalculator />
            </template>
            <template #default>
                {{ $t("calculators.no-results") }}
            </template>
        </EmptyState>
    </div>
</template>

<style scoped>
.calculators-index {
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-3);
}

.calculators-index__search {
    max-width: 420px;
}

.calculators {
    display: grid;
    gap: var(--gap-size-2);
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    align-items: start;
}

@media (max-width: 450px) {
    .calculators {
        grid-template-columns: 1fr;
    }
}
</style>
