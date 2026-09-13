import { ref, readonly } from "vue";
import BarAssistantClient from "@/api/BarAssistantClient";
import type { components } from "@/api/api";
import { useSaltRimToast } from "@/composables/toast";
import { useI18n } from "vue-i18n";

export type IngredientReview = components["schemas"]["IngredientReview"];
export type IngredientReviewRequest = components["schemas"]["IngredientReviewRequest"];

export function useIngredientReviews() {
    const reviews = ref<IngredientReview[]>([]);
    const isLoading = ref(false);
    const toast = useSaltRimToast();
    const { t } = useI18n();

    async function fetchReviews(ingredientId: number) {
        isLoading.value = true;
        try {
            reviews.value = (await BarAssistantClient.getIngredientReviews(ingredientId, { per_page: 100 }))?.data ?? [];
        } catch (e) {
        } finally {
            isLoading.value = false;
        }
    }

    async function saveReview(ingredientId: number, body: IngredientReviewRequest) {
        isLoading.value = true;
        try {
            await BarAssistantClient.saveIngredientReview(ingredientId, body);
            toast.default(t("review.added"));
            return true;
        } catch (e: any) {
            toast.error(e.message);
            return false;
        } finally {
            isLoading.value = false;
        }
    }

    async function updateReview(ingredientId: number, reviewId: number, body: IngredientReviewRequest) {
        isLoading.value = true;
        try {
            await BarAssistantClient.updateIngredientReview(ingredientId, reviewId, body);
            toast.default(t("review.updated"));
            return true;
        } catch (e: any) {
            toast.error(e.message);
            return false;
        } finally {
            isLoading.value = false;
        }
    }

    async function deleteReview(ingredientId: number, reviewId: number) {
        isLoading.value = true;
        try {
            await BarAssistantClient.deleteIngredientReview(ingredientId, reviewId);
            toast.default(t("review.delete-success"));
            return true;
        } catch (e: any) {
            toast.error(e.message);
            return false;
        } finally {
            isLoading.value = false;
        }
    }

    return {
        reviews,
        isLoading: readonly(isLoading),
        fetchReviews,
        saveReview,
        updateReview,
        deleteReview,
    };
}
