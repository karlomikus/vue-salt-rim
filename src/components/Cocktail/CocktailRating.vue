<template>
    <div class="resource-rating">
        <template v-for="val in 5" :key="val">
            <template v-if="val > averageRating">
                <svg class="resource-rating__empty" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12.0006 18.26L4.94715 22.2082L6.52248 14.2799L0.587891 8.7918L8.61493 7.84006L12.0006 0.5L15.3862 7.84006L23.4132 8.7918L17.4787 14.2799L19.054 22.2082L12.0006 18.26ZM12.0006 15.968L16.2473 18.3451L15.2988 13.5717L18.8719 10.2674L14.039 9.69434L12.0006 5.27502L9.96214 9.69434L5.12921 10.2674L8.70231 13.5717L7.75383 18.3451L12.0006 15.968Z"></path>
                </svg>
            </template>
            <template v-else>
                <svg class="resource-rating__full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12.0006 18.26L4.94715 22.2082L6.52248 14.2799L0.587891 8.7918L8.61493 7.84006L12.0006 0.5L15.3862 7.84006L23.4132 8.7918L17.4787 14.2799L19.054 22.2082L12.0006 18.26Z"></path>
                </svg>
            </template>
        </template>
        <span v-if="userRating" class="resource-rating__alt" :title="$t('your-rating')">{{ userRating }}</span>
    </div>
</template>
<script>
export default {
    props: {
        userRating: {
            type: Number,
            default: null
        },
        averageRating: {
            type: Number,
            default: null
        }
    }
}
</script>
<style scoped>
.resource-rating {
    display: flex;
    gap: 1px;
    align-items: center;
    justify-content: center;
}

.resource-rating svg {
    fill: var(--clr-rating);
    width: 16px;
    height: 16px;
}

.resource-rating__alt {
    color: var(--clr-rating);
    background-color: var(--clr-rating-bg);
    display: block;
    padding: 0 5px;
    border-radius: var(--radius-1);
    font-size: 0.7rem;
    font-weight: bold;
}
</style>
