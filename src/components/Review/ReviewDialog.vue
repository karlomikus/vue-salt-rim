<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ t("review.write") }}</div>
        <div class="form-group">
            <label class="form-label">{{ t("review.rating-label") }}</label>
            <RatingActions :rating="currentRating" :id="cocktailId" type="cocktail" />
        </div>
        <div class="form-group">
            <label class="form-label form-label--required" for="review-content">{{ t("content") }}:</label>
            <textarea id="review-content" v-model="content" rows="5" class="form-input" ref="contentInput" required></textarea>
        </div>
        <div class="dialog-actions">
            <button class="button button--outline" type="button" @click.prevent="$emit('reviewDialogClosed')">{{ t("cancel") }}</button>
            <button class="button button--dark" type="submit">{{ t("save") }}</button>
        </div>
    </form>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import OverlayLoader from "@/components/OverlayLoader.vue";
import RatingActions from "@/components/RatingActions.vue";
import { useSaltRimToast } from "@/composables/toast";
import { useReviews } from "@/composables/cocktail/useReviews";

const props = withDefaults(
    defineProps<{
        cocktailId: number;
        initialRating?: number;
    }>(),
    {
        initialRating: 0,
    },
);
const { t } = useI18n();
const toast = useSaltRimToast();
const { isLoading, saveReview } = useReviews();

const emit = defineEmits<{
    reviewDialogClosed: [];
    reviewSaved: [];
}>();

const content = ref("");
const contentInput = ref<HTMLTextAreaElement>();
const currentRating = ref(props.initialRating);

onMounted(() => {
    contentInput.value?.focus();
});

async function submit() {
    if (content.value.trim() === "") {
        toast.error(t("review.content-required"));
        return;
    }

    const saved = await saveReview(props.cocktailId, content.value);

    if (saved) {
        emit("reviewSaved");
    }
}
</script>
