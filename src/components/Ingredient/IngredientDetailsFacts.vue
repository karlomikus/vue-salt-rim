<template>
    <div class="resource-facts">
        <dl>
            <template v-if="canRate && ingredient.id">
                <dt>{{ t("your-rating") }}</dt>
                <dd>
                    <Rating :id="ingredient.id" :rating="ingredient.rating?.user ?? 0" type="ingredient" @rated="onRated"></Rating>
                </dd>
            </template>
            <dt>{{ t("avg-rating") }}</dt>
            <dd>
                <span>{{ ingredient.rating?.average }} ★</span>
                <span v-if="ingredient.rating?.total_votes"> ({{ t("total-votes", { total: ingredient.rating?.total_votes }) }})</span>
            </dd>
            <template v-if="ingredient.taste_descriptors && ingredient.taste_descriptors.length > 0">
                <dt>{{ t("taste-descriptors") }}</dt>
                <dd>
                    <div>
                        <template v-for="(descriptor, index) in ingredient.taste_descriptors" :key="descriptor.id">
                            {{ descriptor.name }}<template v-if="index + 1 !== ingredient.taste_descriptors.length">, </template>
                        </template>
                    </div>
                </dd>
            </template>
            <template v-if="ingredient.strength && ingredient.strength > 0">
                <dt>{{ t("ABV") }}</dt>
                <dd>
                    <abbr :title="t('ABV-definition')">{{ ingredient.strength + "%" }}</abbr>
                </dd>
                <dt>{{ t("alcohol-proof") }}</dt>
                <dd>{{ ingredient.strength * 2 }}</dd>
            </template>
            <template v-else>
                <dt>{{ t("ABV") }}</dt>
                <dd>{{ t("non-alcoholic") }}</dd>
            </template>
            <template v-if="ingredient.origin">
                <dt>{{ t("origin") }}</dt>
                <dd>
                    <RouterLink :to="{ name: 'ingredients', query: { 'filter[origin]': ingredient.origin } }">{{ ingredient.origin }}</RouterLink>
                </dd>
            </template>
            <template v-if="ingredient.distillery">
                <dt>{{ t("distillery") }}</dt>
                <dd>
                    <RouterLink :to="{ name: 'ingredients', query: { 'filter[distillery]': ingredient.distillery } }">{{ ingredient.distillery }}</RouterLink>
                </dd>
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
import { computed } from "vue";
import type { components } from "@/api/api";
import Rating from "@/components/RatingActions.vue";
import { useI18n } from "vue-i18n";
import AppState from "@/AppState";

type Ingredient = components["schemas"]["Ingredient"];

const { t } = useI18n();
const appState = new AppState();
const props = defineProps<{
    ingredient: Partial<Ingredient>;
}>();

const emit = defineEmits<{
    (e: "rating-changed", rating: number): void;
}>();

const canRate = computed(() => Boolean(appState.bar?.access?.role_id));

function onRated(rating: number) {
    emit("rating-changed", rating);
}
</script>
