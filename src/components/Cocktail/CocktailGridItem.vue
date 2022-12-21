<template>
    <RouterLink class="cocktail-grid-item" :to="{ name: 'cocktails.show', params: { id: cocktail.slug } }">
        <svg v-show="isFavorited" class="cocktail-grid-item__favorited-mark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" d="M0 0H24V24H0z" />
            <path d="M20.243 4.757c2.262 2.268 2.34 5.88.236 8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236 2.265-2.264 5.888-2.34 8.244-.228 2.349-2.109 5.979-2.039 8.242.228zM5.172 6.172c-1.49 1.49-1.565 3.875-.192 5.451L12 18.654l7.02-7.03c1.374-1.577 1.299-3.959-.193-5.454-1.487-1.49-3.881-1.562-5.453-.186l-4.202 4.203-1.415-1.414 2.825-2.827-.082-.069c-1.575-1.265-3.877-1.157-5.328.295z" />
        </svg>
        <div class="cocktail-grid-item__graphic">
            <div class="cocktail-grid-item__graphic__image" :data-img-src="mainCocktailImageUrl"></div>
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
    --cocktail-grid-image-size: 200px;
}

.cocktail-grid-item {
    text-align: center;
    background-color: #fff;
    padding: 30px;
    border-radius: 20px;
    box-shadow: 0 3px 0 var(--color-bg-dark);
    margin-top: 50px;
    cursor: pointer;
    transition: box-shadow ease-in-out 150ms;
    text-decoration: none;
}

.cocktail-grid-item.cocktail-grid-item--span {
    grid-column-end: span 2;
}

.cocktail-grid-item__favorited-mark {
    position: absolute;
    right: 10px;
    top: 10px;
    fill: var(--color-link-hover);
}

.cocktail-grid-item .cocktail-grid-item__title {
    font-family: var(--font-accent);
    font-weight: 700;
    font-size: 1.7rem;
    margin-top: -30px;
}

.cocktail-grid-item__ingredients {
    color: var(--color-text-muted);
}

.cocktail-grid-item__graphic {
    transform: translateY(-50px);
    transition: all ease-in-out .1s;
}

.cocktail-grid-item:hover {
    box-shadow: 0 3px 0 #aa5076;
}

.cocktail-grid-item:hover .cocktail-grid-item__graphic {
    transform: translateY(-55px);
}

.cocktail-grid-item:hover .cocktail-grid-item__title {
    color: #aa5076;
}

.cocktail-grid-item__graphic__image {
    width: var(--cocktail-grid-image-size);
    height: var(--cocktail-grid-image-size);
    border-radius: 20px;
    background-color: #fff;
    background-size: cover;
    background-position: center center;
    margin: 0 auto;
    transition: box-shadow ease-in-out .1s;
    box-shadow: 0px 0.5px 0.6px hsl(0deg 0% 63% / 0.36),
        0px 1.6px 1.8px -0.8px hsl(0deg 0% 63% / 0.36),
        0.1px 4px 4.5px -1.7px hsl(0deg 0% 63% / 0.36),
        0.1px 9.7px 10.9px -2.5px hsl(0deg 0% 63% / 0.36);
}

.cocktail-grid-item:hover .cocktail-grid-item__graphic__image {
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
    margin-top: 20px;
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
