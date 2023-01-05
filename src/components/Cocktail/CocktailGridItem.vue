<template>
    <RouterLink class="cocktail-grid-item" :to="{ name: 'cocktails.show', params: { id: cocktail.slug } }">
        <div class="cocktail-grid-item__graphic">
            <img :data-img-src="mainCocktailImageUrl" alt="Main image of the cocktail">
        </div>
        <h2 class="cocktail-grid-item__title">{{ cocktail.name }}</h2>
        <div class="cocktail-grid-item__rating">
            <span v-for="val in 5">
                <template v-if="val > cocktail.average_rating">☆</template>
                <template v-else>★</template>
            </span>
        </div>
        <p class="cocktail-grid-item__ingredients" v-if="cocktail.short_ingredients">{{ cocktail.short_ingredients.join(', ') }}</p>
        <ul class="cocktail-tags">
            <li v-for="tag in cocktail.tags.slice(0, maxTags)" :key="tag" class="tag tag--background">{{ tag }}</li>
            <li class="tag tag--background" v-if="cocktail.tags.length - maxTags > 0" style="opacity: 0.6;">+ {{ cocktail.tags.length - maxTags }} more</li>
        </ul>
    </RouterLink>
</template>

<script>
import Auth from '@/Auth.js';
import ApiRequests from '@/ApiRequests.js';

export default {
    props: ['cocktail', 'observer', 'isSpan'],
    data() {
        return {
            maxTags: 4
        }
    },
    mounted() {
        this.observer.observer.observe(this.$el)
    },
    computed: {
        isFavorited() {
            const user = Auth.getUser();

            return user.favorite_cocktails.includes(this.cocktail.id);
        },
        mainCocktailImageUrl() {
            if (!this.cocktail.image_url) {
                return '/no-cocktail.jpg';
            }

            return ApiRequests.imageThumbUrl(this.cocktail.main_image_id);
        }
    }
}
</script>
<style scoped>
.cocktail-grid-item {
    --image-size: 200px;
    --image-offset: -3rem;
    --image-offset-hover: -3.5rem;
    --content-spacing: 0.325rem;

    display: flex;
    flex-direction: column;
    gap: var(--content-spacing);
    text-align: center;
    background-color: #fff;
    padding: 1.5rem;
    border-radius: 1rem;
    box-shadow: 0 3px 0 var(--color-bg-dark);
    margin-top: calc(var(--image-offset) * -1);
    cursor: pointer;
    transition: box-shadow ease-in-out 150ms;
    text-decoration: none;
}

.cocktail-grid-item__title {
    font-size: 1.7rem;
    font-family: var(--font-heading);
    font-weight: var(--fw-bold);
    line-height: 1.3;
    margin-top: calc(var(--image-offset) + 1rem);
}

.cocktail-grid-item:hover {
    box-shadow: 0 3px 0 var(--color-link-hover);
}

.cocktail-grid-item:hover .cocktail-grid-item__graphic {
    transform: translateY(var(--image-offset-hover));
}

.cocktail-grid-item:hover .cocktail-grid-item__title {
    color: var(--color-link-hover);
}

.cocktail-grid-item__ingredients {
    color: var(--color-text-muted);
}

.cocktail-grid-item__graphic {
    transform: translateY(var(--image-offset));
    transition: all ease-in-out .1s;
}

.cocktail-grid-item__graphic img {
    width: var(--image-size);
    height: var(--image-size);
    border-radius: 0.825rem;
    object-fit: cover;
    transition: box-shadow ease-in-out .1s;
    box-shadow: 0px 0.5px 0.6px hsl(0deg 0% 63% / 0.36),
        0px 1.6px 1.8px -0.8px hsl(0deg 0% 63% / 0.36),
        0.1px 4px 4.5px -1.7px hsl(0deg 0% 63% / 0.36),
        0.1px 9.7px 10.9px -2.5px hsl(0deg 0% 63% / 0.36);
}

.cocktail-grid-item:hover .cocktail-grid-item__graphic img {
    box-shadow: 0px 0.5px 0.6px hsl(0deg 0% 63% / 0.6),
        0px 1.6px 2px -0.8px hsl(0deg 0% 63% / 0.6),
        0.1px 4px 8px -1.7px hsl(0deg 0% 63% / 0.6),
        0.1px 9.7px 16px -2.5px hsl(0deg 0% 63% / 0.6);
}

.cocktail-tags {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    list-style: none;
    padding: 0;
    gap: 5px;
}

@media (max-width: 450px) {
    .cocktail-grid-item {
        padding: 20px;
        border-radius: 15px;
        margin-top: 40px;
    }
}

.cocktail-grid-item__rating {
    color: rgb(235, 133, 0);
}
</style>
