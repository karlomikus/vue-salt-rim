<template>
    <RouterLink class="cocktail-list-item" :to="{ name: 'cocktails.show', params: { id: cocktail.slug } }">
        <div class="cocktail-list-item__graphic">
            <div class="cocktail-list-item__graphic__image" :data-img-src="mainCocktailImageUrl"></div>
        </div>
        <div class="cocktail-list-item__content">
            <h4 class="cocktail-list-item__title">{{ cocktail.name }} <MiniRating v-if="cocktail.user_rating > 0" :rating="cocktail.user_rating"></MiniRating></h4>
            <p v-if="cocktail.short_ingredients">
                {{ cocktail.short_ingredients.join(', ') }}
            </p>
        </div>
    </RouterLink>
</template>

<script>
import ApiRequests from '@/ApiRequests.js';
import MiniRating from '@/components/MiniRating.vue'

export default {
    props: ['cocktail', 'observer'],
    components: {
        MiniRating
    },
    mounted() {
        this.observer.observer.observe(this.$el)
    },
    computed: {
        mainCocktailImageUrl() {
            if (this.cocktail.main_image_id == null) {
                return '/no-cocktail.jpg';
            }

            return ApiRequests.imageThumbUrl(this.cocktail.main_image_id);
        }
    }
}
</script>
<style scoped>
.cocktail-list-item {
    --image-size: 70px;

    display: flex;
    align-items: center;
    background-color: #fff;
    padding: 0.825rem;
    border-radius: 0.5rem;
    box-shadow: 0 3px 0 var(--color-bg-dark);
    transition: box-shadow ease-in-out 150ms;
    text-decoration: none;
}

.cocktail-list-item:hover {
  box-shadow: 0 3px 0 var(--color-link-hover);
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
    color: var(--color-text-muted);
    font-size: 0.8rem;
}
</style>
