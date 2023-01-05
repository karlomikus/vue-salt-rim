<template>
    <RouterLink class="cocktail-list-item" :to="{ name: 'cocktails.show', params: { id: cocktail.slug } }">
        <div class="cocktail-list-item__graphic">
            <div class="cocktail-list-item__graphic__image" :data-img-src="mainCocktailImageUrl"></div>
        </div>
        <div class="cocktail-list-item__content">
            <h3>{{ cocktail.name }} <MiniRating v-if="cocktail.user_rating > 0" :rating="cocktail.user_rating"></MiniRating></h3>
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

            // return this.cocktail.images.filter((img) => img.id == this.cocktail.main_image_id)[0].url;
            return ApiRequests.imageThumbUrl(this.cocktail.main_image_id);
        }
    }
}
</script>
<style scoped>
.cocktail-list-item {
    display: flex;
    align-items: center;
    background-color: #fff;
    padding: 15px;
    border-radius: 10px;
    box-shadow: 0 3px 0 var(--color-bg-dark);
    transition: box-shadow ease-in-out 150ms;
    text-decoration: none;
}

.cocktail-list-item:hover {
  box-shadow: 0 3px 0 #aa5076;
}

.cocktail-list-item__graphic__image {
    width: 70px;
    height: 70px;
    border-radius: 5px;
    background-color: #fff;
    background-size: cover;
    background-position: center center;
    flex-shrink: 0;
    margin-right: 10px;
}

.cocktail-list-item__content h3 {
    font-size: 1.1rem;
    font-weight: 700;
}

.cocktail-list-item__content p {
    color: var(--color-text-muted);
    font-size: 0.8rem;
}

@media (max-width: 450px) {
    .cocktail-list-item {
        padding: 15px;
    }

    .cocktail-list-item__graphic__image {
        width: 70px;
        height: 70px;
        margin-right: 10px;
    }
}
</style>
