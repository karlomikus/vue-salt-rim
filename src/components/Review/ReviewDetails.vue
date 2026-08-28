<template>
    <div class="review" :class="{ 'review--own': isOwnReview }">
        <div class="review__header">
            <div class="review__author">
                <span class="review__author-name">{{ review.author.name }}</span>
                <span v-if="review.rating !== null" class="review__stars" :title="t('your-rating')">
                    <span v-for="val in 5" :key="val" class="review__star">
                        <span class="review__star-empty" aria-hidden="true">☆</span>
                        <span class="review__star-filled" :style="{ width: `${fillPercent(val)}%` }" aria-hidden="true">★</span>
                    </span>
                </span>
            </div>
            <div>
                <DateFormatter :date="review.created_at" format="long" />
                <template v-if="canDelete">
                    &middot; <a href="#" @click.prevent="handleDelete">{{ t("review.delete") }}</a>
                </template>
            </div>
        </div>
        <div class="review__content">{{ review.content }}</div>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import DateFormatter from "@/components/DateFormatter.vue";
import { useConfirm } from "@/composables/confirm";
import { useReviews } from "@/composables/cocktail/useReviews";
import type { Review } from "@/composables/cocktail/useReviews";

const props = defineProps<{
    review: Review;
    cocktailId: number;
    currentUserId: number;
    isBarAdmin: boolean;
}>();

const emit = defineEmits<{
    reviewDeleted: [];
}>();

const { t } = useI18n();
const confirm = useConfirm();
const { deleteReview } = useReviews();

const canDelete = computed(() => props.review.author.id === props.currentUserId || props.isBarAdmin);

const isOwnReview = computed(() => props.review.author.id === props.currentUserId);

function fillPercent(val: number): number {
    const rating = props.review.rating ?? 0;
    return Math.max(0, Math.min(100, (rating - (val - 1)) * 100));
}

function handleDelete() {
    confirm.show(t("review.confirm-delete"), {
        onResolved: async (dialog: { close: () => void }) => {
            dialog.close();
            const deleted = await deleteReview(props.cocktailId, props.review.id);
            if (deleted) {
                emit("reviewDeleted");
            }
        },
    });
}
</script>

<style scoped>
.review {
    margin-bottom: 1rem;
    border-radius: var(--radius-1);
    padding: 0.75rem;
    background-color: var(--clr-gray-100);
}

.dark-theme .review {
    background-color: var(--clr-gray-700);
    color: var(--clr-gray-300);
}

.review--own {
    border: 2px solid var(--clr-gray-400);
}

.dark-theme .review--own {
    border-color: var(--clr-gray-400);
}

.review:last-child {
    margin: 0;
}

.review__header {
    display: flex;
    flex-direction: column;
    margin-bottom: 0.5rem;
    font-size: 0.75rem;
    opacity: 0.85;
}

.review__author {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: var(--fw-bold);
}

.review__author-name {
    font-size: 0.9rem;
}

.review__stars {
    font-size: 0.85rem;
    line-height: 1;
    display: inline-flex;
    color: var(--clr-rating);
}

.review__star {
    position: relative;
    display: inline-block;
    width: 1em;
    height: 1em;
}

.review__star-empty,
.review__star-filled {
    position: absolute;
    inset: 0;
    display: block;
    line-height: 1;
}

.review__star-empty {
    color: var(--clr-gray-400);
}

.dark-theme .review__star-empty {
    color: var(--clr-gray-50);
}

.review__star-filled {
    color: var(--clr-rating);
    overflow: hidden;
}

.review__content {
    font-size: 1rem;
    white-space: pre-wrap;
}
</style>
