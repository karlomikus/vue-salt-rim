<script setup lang="ts">
import OverlayLoader from "./../OverlayLoader.vue";
import AmountInput from "./../AmountInput.vue";
import { ref } from "vue";
import type { components } from "@/api/api";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
type IngredientPart = components["schemas"]["IngredientPart"];
const isLoading = ref(false);
const emit = defineEmits(["close"]);
const model = defineModel<IngredientPart>({
    required: true,
});

const localPart = ref({ ...model.value });
if (!localPart.value.amount_max) {
    localPart.value.amount_max = null;
}

function save(): void {
    model.value = localPart.value;
    emit("close");
}

function cancel(): void {
    emit("close");
}
</script>

<template>
    <form @submit.prevent="save">
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ t("ingredient.title") }}</div>
        <div class="selected-ingredient">
            <small>{{ t("ingredient.dialog.current") }}:</small>
            <p>{{ localPart.ingredient.name }}</p>
        </div>
        <div class="ingredient-form-group">
            <div class="form-group">
                <label class="form-label form-label--required" for="part-amount">{{ t("amount") }}:</label>
                <AmountInput id="part-amount" v-model="localPart.amount" required></AmountInput>
            </div>
            <div class="form-group" v-if="localPart.amount_max !== undefined">
                <label class="form-label" for="part-amount-max">{{ t("amount") }} max:</label>
                <AmountInput id="part-amount-max" v-model="localPart.amount_max"></AmountInput>
            </div>
            <div class="form-group">
                <label class="form-label form-label--required" for="part-units">{{ t("units") }}:</label>
                <input id="part-units" v-model="localPart.units" class="form-input" type="text" list="common-units" required />
                <datalist id="common-units">
                    <option>ml</option>
                    <option>oz</option>
                    <option>cl</option>
                    <option>dashes</option>
                    <option>barspoon</option>
                    <option>drops</option>
                    <option>topup</option>
                    <option>leaves</option>
                </datalist>
            </div>
        </div>
        <div class="form-group">
            <label class="form-label" for="part-note">{{ t("note.title") }}:</label>
            <input id="part-note" v-model="localPart.note" class="form-input" type="text" />
        </div>
        <div class="dialog-actions">
            <button type="button" class="button button--outline" @click="cancel">{{ t("cancel") }}</button>
            <button type="submit" class="button button--dark" :disabled="isLoading">{{ t("save") }}</button>
        </div>
    </form>
</template>

<style scoped>
.selected-ingredient {
    margin: 1rem 0;
    line-height: 1.3;
}

.selected-ingredient small {
    color: var(--clr-gray-500);
}

.selected-ingredient p {
    font-weight: var(--fw-bold);
    font-size: 1.5rem;
}

.ingredient-form-group {
    margin-top: 1rem;
    margin-bottom: 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-size-1);
}

.ingredient-form-group .form-group {
    flex-basis: 150px;
    margin: 0;
}

.ingredient-form-group .form-group:last-child {
    flex-basis: 100px;
    flex-grow: 1;
}

.ingredient-form-group input {
    width: 100%;
}
</style>
