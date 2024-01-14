<template>
    <div class="rating">
        <OverlayLoader v-if="isLoading" :size="25" />
        <a v-for="val in max" :key="val" href="#" :class="{'is-rated': val <= currentRating}" @click.prevent="rate(val)"></a>
    </div>
</template>

<script>
import ApiRequests from './../ApiRequests.js'
import OverlayLoader from './OverlayLoader.vue'

export default {
    components: {
        OverlayLoader,
    },
    props: {
        rating: {
            type: Number,
            default: 0
        },
        id: {
            type: Number,
            default: 0
        },
        type: {
            type: String,
            default: 'cocktail'
        }
    },
    data() {
        return {
            isLoading: false,
            currentRating: this.rating,
            max: 5,
            min: 1
        }
    },
    watch: {
        rating(newVal) {
            this.currentRating = newVal
        }
    },
    methods: {
        rate(rating) {
            if (this.isLoading) {
                return
            }

            this.isLoading = true
            if (this.currentRating == rating) {
                ApiRequests.deleteCocktailUserRating(this.id).then(() => {
                    this.currentRating = 0
                    this.$toast.default(this.$t('rating-removed'))
                    this.isLoading = false
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false
                })
            } else {
                ApiRequests.rateCocktail(this.id, { rating: rating }).then(() => {
                    this.currentRating = rating
                    this.$toast.default(this.$t('rating-rated', {rating: rating}))
                    this.isLoading = false
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false
                })
            }
        }
    }
}
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
