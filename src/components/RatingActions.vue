<template>
    <div class="rating">
        <OverlayLoader v-if="isLoading" :size="25" />
        <a v-for="val in max" :key="val" href="#" :class="{'is-rated': val <= currentRating}" @click.prevent="rate(val)"></a>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BarAssistantClient from '@/api/BarAssistantClient';
import OverlayLoader from './OverlayLoader.vue'
import { useSaltRimToast } from '@/composables/toast';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const toast = useSaltRimToast()
const isLoading = ref(false)
const max = 5
const min = 1
const props = defineProps<{
    rating: number
    id: number
    type: string
}>()
const currentRating = ref(props.rating)

async function rate(rating: number) {
    if (isLoading.value || rating < min || rating > max) {
        return
    }

    isLoading.value = true

    try {
        if (currentRating.value == rating) {
            await BarAssistantClient.deleteCocktailRating(props.id)
            currentRating.value = 0
            toast.default(t('rating-removed'))
        } else {
            await BarAssistantClient.rateCocktail(props.id, { rating: rating })
            currentRating.value = rating
            toast.default(t('rating-rated', { rating: rating }))
        }
    } catch (e) {
        toast.error(t('rating-error'))
    } finally {
        isLoading.value = false
    }
}

watch(() => props.id, () => {
    currentRating.value = props.rating
}, { immediate: true })
</script>

<style scoped>
.rating {
    --color-base: var(--clr-link-color);
    --color-unrated: var(--clr-gray-400);
    --color-rated: var(--clr-rating);
    font-size: 1.5rem;
    display: inline-block;
}

.dark-theme .rating {
    --color-base: var(--clr-gray-50);
    --color-unrated: var(--clr-gray-400);
    --color-rated: var(--clr-rating);
}

.rating:hover a {
    color: var(--color-rated);
}

.rating a {
    text-decoration: none;
    color: var(--color-base);
}

.rating a:before {
    content: '☆';
}

.rating a.is-rated:before {
    content: '★';
}

.rating a:hover ~ a {
    color: var(--color-unrated);
}

.rating a:hover {
    color: var(--color-rated);
}

</style>
