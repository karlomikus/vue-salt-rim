<template>
    <RouterLink class="block-container block-container--hover cocktail-grid-item" :to="{ name: 'cocktails.show', params: { id: cocktail.slug } }">
        <div class="cocktail-grid-item__graphic">
            <img :data-img-src="mainCocktailImageUrl" :src="placeholderImage" alt="Main image of the cocktail">
        </div>
        <h2 class="cocktail-grid-item__title">{{ cocktail.name }} <span v-if="isFavorited">♡</span></h2>
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
import { thumbHashToDataURL } from 'thumbhash'

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
        placeholderImage() {
            if (this.cocktail.image_hash) {
                return thumbHashToDataURL(
                    Uint8Array.from(atob(this.cocktail.image_hash), c => c.charCodeAt(0))
                );
            }

            if (this.cocktail.images && this.cocktail.images.length > 0) {
                return thumbHashToDataURL(
                    Uint8Array.from(atob(this.cocktail.images.filter((img) => img.id == this.cocktail.main_image_id)[0].placeholder_hash), c => c.charCodeAt(0))
                );
            }

            return '';
        },
        isFavorited() {
            const user = Auth.getUser();

            return user.favorite_cocktails.includes(this.cocktail.id);
        },
        mainCocktailImageUrl() {
            if (this.cocktail.image_url) {
                return ApiRequests.imageThumbUrl(this.cocktail.main_image_id);
            }

            if (this.cocktail.images && this.cocktail.images.length > 0) {
                return ApiRequests.imageThumbUrl(this.cocktail.main_image_id);
            }

            return '/no-cocktail.jpg';
        }
    }
}
</script>
<style scoped>
.cocktail-grid-item {
    --image-size: 350px;
    --image-offset: -3rem;
    --image-offset-hover: -3.5rem;
    --content-spacing: 0.325rem;
    --box-shadow: hsl(0deg 0% 63% / 0.36);
    --box-shadow-hover: hsl(0deg 0% 63% / 0.6);
    --clr-content: var(--clr-gray-500);

    display: flex;
    flex-direction: column;
    gap: var(--content-spacing);
    text-align: center;
    padding: 1.5rem;
    border-radius: 1rem;
    border-width: 3px;
    margin-top: calc(var(--image-offset) * -1);
    cursor: pointer;
    text-decoration: none;
}

.dark-theme .cocktail-grid-item {
    --box-shadow: hsl(225deg 40% 5% / 0.36);
    --box-shadow-hover: hsl(225deg 40% 5% / 0.6);
    --clr-content: var(--clr-gray-400);
}

.cocktail-grid-item__title {
    font-size: 1.7rem;
    font-family: var(--font-heading);
    font-weight: var(--fw-bold);
    line-height: 1.3;
    margin-top: calc(var(--image-offset) + 1rem);
}

.cocktail-grid-item:hover .cocktail-grid-item__graphic {
    transform: translateY(var(--image-offset-hover));
}

.cocktail-grid-item:hover .cocktail-grid-item__title {
    color: var(--clr-red-800);
}

.dark-theme .cocktail-grid-item:hover .cocktail-grid-item__title {
    color: #fff;
}

.cocktail-grid-item__ingredients {
    color: var(--clr-content);
}

.cocktail-grid-item__graphic {
    transform: translateY(var(--image-offset));
    transition: all ease-in-out .1s;
}

.cocktail-grid-item__graphic img {
    width: 100%;
    max-width: var(--image-size);
    height: auto;
    border-radius: 0.825rem;
    object-fit: cover;
    transition: box-shadow ease-in-out .1s;
    box-shadow: 0px 0.5px 0.6px var(--box-shadow),
        0px 1.6px 1.8px -0.8px var(--box-shadow),
        0.1px 4px 4.5px -1.7px var(--box-shadow),
        0.1px 9.7px 10.9px -2.5px var(--box-shadow);
}

.cocktail-grid-item:hover .cocktail-grid-item__graphic img {
    box-shadow: 0px 0.5px 0.6px var(--box-shadow-hover),
        0px 1.6px 2px -0.8px var(--box-shadow-hover),
        0.1px 4px 8px -1.7px var(--box-shadow-hover),
        0.1px 9.7px 16px -2.5px var(--box-shadow-hover);
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
