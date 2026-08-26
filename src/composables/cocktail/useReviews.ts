import { ref, readonly } from "vue";
import BarAssistantClient from "@/api/BarAssistantClient";
import type { components } from "@/api/api";
import { useSaltRimToast } from "@/composables/toast";
import { useI18n } from "vue-i18n";

export type Review = components["schemas"]["Review"];

export function useReviews() {
    const reviews = ref<Review[]>([]);
    const isLoading = ref(false);
    const toast = useSaltRimToast();
    const { t } = useI18n();

    async function fetchReviews(cocktailId: number) {
        isLoading.value = true;
        try {
            reviews.value = (await BarAssistantClient.getCocktailReviews(cocktailId, { per_page: 100 }))?.data ?? [];
        } catch (e) {} finally {
            isLoading.value = false;
        }
    }

    async function saveReview(cocktailId: number, content: string) {
        isLoading.value = true;
        try {
            await BarAssistantClient.saveReview(cocktailId, { content });
            toast.default(t("review.added"));
            return true;
        } catch (e: any) {
            toast.error(e.message);
            return false;
        } finally {
            isLoading.value = false;
        }
    }

    async function deleteReview(cocktailId: number, reviewId: number) {
        isLoading.value = true;
        try {
            await BarAssistantClient.deleteReview(cocktailId, reviewId);
            toast.default(t("review.delete-success"));
            return true;
        } catch (e: any) {
            toast.error(e.message);
            return false;
        } finally {
            isLoading.value = false;
        }
    }

    function updateReviewRating(reviewId: number, rating: number) {
        const review = reviews.value.find((r) => r.id === reviewId);
        if (review) {
            review.rating = rating;
        }
    }

return {
            reviews: readonly(reviews),
            isLoading: readonly(isLoading),
            fetchReviews,
            saveReview,
            deleteReview,
            updateReviewRating,
        };
}