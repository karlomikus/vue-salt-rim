<template>
    <div class="resource-facts">
        <dl>
            <template v-if="ingredient.strength && ingredient.strength > 0">
                <dt>{{ t("ABV") }}</dt>
                <dd><abbr :title="t('ABV-definition')">{{ ingredient.strength + "%" }}</abbr></dd>
                <dt>{{ t("alcohol-proof") }}</dt>
                <dd>{{ ingredient.strength * 2 }}</dd>
            </template>
            <template v-else>
                <dt>{{ t("ABV") }}</dt>
                <dd>{{ t("non-alcoholic") }}</dd>
            </template>
            <template v-if="ingredient.origin">
                <dt>{{ t("origin") }}</dt>
                <dd><RouterLink :to="{name: 'ingredients', query: {'filter[origin]': ingredient.origin}}">{{ ingredient.origin }}</RouterLink></dd>
            </template>
            <template v-if="ingredient.distillery">
                <dt>{{ t("distillery") }}</dt>
                <dd><RouterLink :to="{name: 'ingredients', query: {'filter[distillery]': ingredient.distillery}}">{{ ingredient.distillery }}</RouterLink></dd>
            </template>
            <template v-if="ingredient.sugar_g_per_ml">
                <dt>{{ t("sweetness") }}</dt>
                <dd>{{ ingredient.sugar_g_per_ml }} g/l</dd>
            </template>
            <template v-if="ingredient.acidity">
                <dt>{{ t("acidity") }}</dt>
                <dd>{{ ingredient.acidity }} g/l</dd>
            </template>
        </dl>
    </div>
</template>

<script setup lang="ts">
import type { components } from "@/api/api";
import { useI18n } from "vue-i18n";

type Ingredient = components["schemas"]["Ingredient"];

const { t } = useI18n();
const props = defineProps<{
    ingredient: Partial<Ingredient>;
}>();
</script>
