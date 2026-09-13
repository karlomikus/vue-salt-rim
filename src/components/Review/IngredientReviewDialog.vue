<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ isEditing ? t("review.edit") : t("review.write") }}</div>
        <div class="form-group">
            <label class="form-label form-label--required" for="ingredient-review-content">{{ t("content") }}:</label>
            <textarea
                id="ingredient-review-content"
                v-model="content"
                rows="7"
                class="form-input"
                ref="contentInput"
                placeholder="Your personal thoughts about this ingredient..."
                required
            ></textarea>
        </div>
        <div class="form-group">
            <label class="form-label">{{ t("review.recommendation-label") }}:</label>
            <p class="form-input-hint">Would you recommend this ingredient to others?</p>
            <div class="ingredient-review-dialog__recommendations">
                <SaltRimRadio
                    v-for="option in recommendationOptions"
                    :key="option.value ?? 'none'"
                    v-model="recommendation"
                    :value="option.value"
                    :title="t(option.labelKey)"
                    :description="option.labelDescription"
                ></SaltRimRadio>
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">{{ t("review.descriptors-label") }}:</label>
            <p class="form-input-hint">Select taste descriptors that best describe this ingredient. You can also add your own custom descriptors.</p>
            <TagSelector v-model="selectedDescriptors" :options="descriptors" label-key="name" :allow-custom="true" />
        </div>
        <div class="dialog-actions">
            <button class="button button--outline" type="button" @click.prevent="$emit('reviewDialogClosed')">{{ t("cancel") }}</button>
            <button class="button button--dark" type="submit">{{ t("save") }}</button>
        </div>
    </form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import OverlayLoader from "@/components/OverlayLoader.vue";
import SaltRimRadio from "@/components/SaltRimRadio.vue";
import TagSelector from "@/components/TagSelector.vue";
import { useSaltRimToast } from "@/composables/toast";
import { useIngredientReviews } from "@/composables/ingredient/useIngredientReviews";
import { useTasteDescriptors } from "@/composables/ingredient/useTasteDescriptors";
import type { IngredientReview, IngredientReviewRequest } from "@/composables/ingredient/useIngredientReviews";

const props = defineProps<{
    ingredientId: number;
    review?: IngredientReview | null;
}>();

const { t } = useI18n();
const toast = useSaltRimToast();
const { isLoading, saveReview, updateReview } = useIngredientReviews();
const { descriptors, fetchDescriptors } = useTasteDescriptors();

const emit = defineEmits<{
    reviewDialogClosed: [];
    reviewSaved: [];
}>();

const recommendationOptions: Array<{ value: "avoid" | "decent" | "recommend" | null; labelKey: string; labelDescription: string }> = [
    { value: "avoid", labelKey: "review.recommendation-avoid", labelDescription: "Never drinking it again." },
    { value: "decent", labelKey: "review.recommendation-decent", labelDescription: "Not bad, but not great either." },
    { value: "recommend", labelKey: "review.recommendation-recommend", labelDescription: "Great for sipping and mixing." },
];
const isEditing = computed(() => Boolean(props.review));
const content = ref(props.review?.content ?? "");
const recommendation = ref<string | null>(props.review?.recommendation ?? null);
const selectedDescriptors = ref<string[]>(props.review?.taste_descriptors?.map((descriptor) => descriptor.name) ?? []);
const contentInput = ref<HTMLTextAreaElement>();

onMounted(() => {
    contentInput.value?.focus();
    fetchDescriptors();
});

async function submit() {
    if (content.value.trim() === "") {
        toast.error(t("review.content-required"));
        return;
    }

    const body: IngredientReviewRequest = {
        content: content.value,
        recommendation: recommendation.value as IngredientReviewRequest["recommendation"],
        taste_descriptors: [...selectedDescriptors.value],
    };

    const saved = props.review ? await updateReview(props.ingredientId, props.review.id, body) : await saveReview(props.ingredientId, body);

    if (saved) {
        emit("reviewSaved");
    }
}
</script>

<style scoped>
.ingredient-review-dialog__recommendations {
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-size-2);
}
</style>
