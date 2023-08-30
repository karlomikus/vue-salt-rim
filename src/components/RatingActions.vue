<template>
    <div class="rating">
        <a v-for="val in max" :key="val" href="#" @click.prevent="rate(val)" :class="{'is-rated': val <= currentRating}"></a>
    </div>
</template>

<script>
import ApiRequests from '@/ApiRequests';

export default {
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
                return;
            }

            this.isLoading = true;
            if (this.currentRating == rating) {
                ApiRequests.deleteCocktailUserRating(this.id).then(() => {
                    this.currentRating = 0
                    this.$toast.default(this.$t('rating-removed'))
                    this.isLoading = false;
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false;
                })
            } else {
                ApiRequests.rateCocktail(this.id, { rating: rating }).then(() => {
                    this.currentRating = rating
                    this.$toast.default(this.$t('rating-rated', {rating: rating}))
                    this.isLoading = false;
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false;
                })
            }
        }
    }
}
</script>

<style scoped>
.rating {
    --color-base: var(--clr-link-color);
    --color-unrated: var(--clr-gray-800);
    --color-rated: var(--clr-red-800);
    font-size: 1.5rem;
    display: inline-block;
}

.dark-theme .rating {
    --color-base: rgb(218, 139, 21);
    --color-unrated: rgb(252, 242, 215);
    --color-rated: rgb(218, 139, 21);
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

.rating:hover a:focus {
    color: var(--color-rated);
}

.rating:not(:hover) a:focus {
    color: var(--color-unrated);
}
</style>
