<script setup lang="ts">
import type { components } from "@/api/api";
import { useI18n } from "vue-i18n";
import { RouterLink } from "vue-router";
import CalculatorRender from "./CalculatorRender.vue";

type Calculator = components["schemas"]["Calculator"];

defineProps<{
    calculator: Calculator;
}>();

defineEmits<{
    share: [calculator: Calculator];
    remove: [calculator: Calculator];
}>();

const { t } = useI18n();
</script>

<template>
    <article class="calculator-card block-container">
        <div class="calculator-card__body">
            <CalculatorRender :calculator="calculator" />
            <div class="calculator-card__actions">
                <RouterLink :to="{ name: 'calculators.form', query: { id: calculator.id } }">{{ t("edit") }}</RouterLink>
                &middot;
                <a href="#" @click.prevent="$emit('share', calculator)">{{ t("share.title") }}</a>
                &middot;
                <a href="#" @click.prevent="$emit('remove', calculator)">{{ t("remove") }}</a>
            </div>
        </div>
    </article>
</template>

<style scoped>
.calculator-card__body {
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-3);
    padding: var(--padding-block-container);
}

.calculator-card__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-size-2);
}
</style>
