<template>
    <RouterLink class="block-container block-container--hover cocktail-list-item" :to="{ name: 'cocktails.show', params: { id: cocktail.slug } }">
        <div class="cocktail-list-item__graphic">
            <div class="cocktail-list-item__graphic__image" :data-img-src="mainCocktailImageUrl"></div>
        </div>
        <div class="cocktail-list-item__content">
            <h4 class="cocktail-list-item__title">{{ cocktail.name }} <MiniRating v-if="cocktail.user_rating > 0" :rating="cocktail.user_rating"></MiniRating></h4>
            <p v-if="shortIngredients.length > 0">
                {{ shortIngredients.join(', ') }}
            </p>
        </div>
    </RouterLink>
</template>

<script>
import ApiRequests from '@/ApiRequests.js'
import MiniRating from '@/components/MiniRating.vue'

export default {
    components: {
        MiniRating
    },
    props: {
        cocktail: {
            type: Object,
            default() {
                return {}
            }
        },
        observer: {
            type: Object,
            default() {
                return {}
            }
        }
    },
    computed: {
        mainCocktailImageUrl() {
            if (this.cocktail.main_image_id == null) {
                return '/no-cocktail.jpg'
            }

            return ApiRequests.imageThumbUrl(this.cocktail.main_image_id)
        },
        shortIngredients() {
            return this.cocktail.ingredients.map(i => i.name)
        }
    },
    mounted() {
        this.observer.observer.observe(this.$el)
    }
}
</script>
<style scoped>
.cocktail-list-item {
    --image-size: 70px;
    --cli-clr-content: var(--clr-gray-500);

    display: flex;
    align-items: center;
    padding: 0.825rem;
    text-decoration: none;
}

.dark-theme .cocktail-list-item {
    --cli-clr-content: var(--clr-gray-400);
}

.cocktail-list-item__graphic {
    align-self: start;
}

.cocktail-list-item__graphic__image {
    width: var(--image-size);
    height: var(--image-size);
    border-radius: 0.325rem;
    background-color: #fff;
    background-size: cover;
    background-position: center center;
    flex-shrink: 0;
    margin-right: 10px;
}

.dark-theme .cocktail-list-item__graphic__image {
    background-color: var(--clr-dark-main-800);
}

.cocktail-list-item__title {
    font-size: 1.1rem;
    font-family: var(--font-heading);
    font-weight: var(--fw-bold);
}

.cocktail-list-item__content {
    display: flex;
    flex-direction: column;
}

.cocktail-list-item__content p {
    color: var(--cli-clr-content);
    font-size: 0.8rem;
}
</style>
