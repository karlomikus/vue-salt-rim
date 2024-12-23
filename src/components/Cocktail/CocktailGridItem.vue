<template>
    <RouterLink class="cocktail-grid-item" :to="{ name: 'cocktails.show', params: { id: cocktail.slug } }">
        <div class="cocktail-grid-item__graphic">
            <div class="cocktail-grid-item__badges">
                <div v-if="cocktail.is_favorited" class="cocktail-badge" :title="$t('is_favorited')">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path fill="none" d="M0 0H24V24H0z" />
                        <path d="M20.243 4.757c2.262 2.268 2.34 5.88.236 8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236C5.515 3 8.093 2.56 10.261 3.44L6.343 7.358l1.414 1.415L12 4.53l-.013-.014.014.013c2.349-2.109 5.979-2.039 8.242.228z" />
                    </svg>
                </div>
                <div v-if="cocktail.in_bar_shelf" class="cocktail-badge" :title="$t('in_bar_shelf')">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path fill-rule="evenodd" d="M8.755 2.308A4 4 0 0 0 5.46 6.733l.017.14a1 1 0 0 0 .992.879h1.764L5.267 21.595a.75.75 0 0 0 1.467.314l.944-4.407h8.644l.945 4.407a.75.75 0 0 0 1.466-.314L15.767 7.752h1.764a1 1 0 0 0 .993-.88l.017-.139a4 4 0 0 0-3.295-4.425l-.373-.064a17 17 0 0 0-5.745 0l-.373.064Zm5.495 5.444h-4.5a.753.753 0 0 1-.016.157l-1.735 8.093h8.002l-1.734-8.093a.755.755 0 0 1-.017-.157Z" clip-rule="evenodd" />
                    </svg>
                </div>
                <div v-if="cocktail.in_shelf" class="cocktail-badge" :title="$t('in_your_shelf')">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M16.533 18H6.75v2a.75.75 0 1 1-1.5 0v-2.324c-.829-.362-1.49-1.005-1.808-1.817-.01-.023-.02-.05-.039-.102L2.1 12.264C1.685 11.15 2.613 10 3.927 10c.81 0 1.534.453 1.81 1.134l1.098 2.706c.1.246.15.37.222.47a1.2 1.2 0 0 0 .74.463c.13.027.277.027.57.027h6.98c.569 0 .853 0 1.091-.098.13-.054.248-.128.349-.219.184-.166.281-.405.475-.883l1.001-2.466c.276-.68 1-1.134 1.81-1.134 1.314 0 2.242 1.15 1.827 2.264l-1.12 3c-.195.524-.292.785-.421 1.008a3.43 3.43 0 0 1-1.609 1.404V20a.75.75 0 1 1-1.5 0v-2.005c-.187.005-.415.005-.717.005Z" />
                        <path d="M13.236 3.5h-2.472c-1.1 0-1.976 0-2.66.088-.706.09-1.285.28-1.746.72-.464.441-.669 1.003-.765 1.685-.093.658-.093 1.495-.093 2.54v.88l.21.15c.416.294.752.698.954 1.195L7.898 13.8h7.449l.363-.001h.002l.388-.007.126-.3.11-.268 1-2.466c.202-.497.538-.9.954-1.196l.21-.15v-.88c0-1.044 0-1.881-.093-2.539-.096-.682-.301-1.244-.765-1.686-.46-.438-1.04-.629-1.745-.72-.685-.087-1.56-.087-2.661-.087Z" />
                    </svg>
                </div>
                <div v-if="cocktail.public_id" class="cocktail-badge" :title="$t('is_public')">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path d="M18.364 15.536L16.95 14.12l1.414-1.414a5 5 0 1 0-7.071-7.071L9.879 7.05 8.464 5.636 9.88 4.222a7 7 0 0 1 9.9 9.9l-1.415 1.414zm-2.828 2.828l-1.415 1.414a7 7 0 0 1-9.9-9.9l1.415-1.414L7.05 9.88l-1.414 1.414a5 5 0 1 0 7.071 7.071l1.414-1.414 1.415 1.414zm-.708-10.607l1.415 1.415-7.071 7.07-1.415-1.414 7.071-7.07z" />
                    </svg>
                </div>
            </div>
            <img class="cocktail-grid-item__graphic__image" :data-img-src="mainCocktailImageUrl" :src="placeholderImage" alt="Main image of the cocktail">
        </div>
        <div class="block-container cocktail-grid-item__content">
            <h2 class="cocktail-grid-item__title">{{ cocktail.name }}</h2>
            <div class="cocktail-grid-item__rating">
                <CocktailRating :user-rating="cocktail.rating.user" :average-rating="cocktail.rating.average" />
            </div>
            <p v-if="shortIngredients.length > 0" class="cocktail-grid-item__ingredients">{{ shortIngredients.join(', ') }}</p>
            <ul class="cocktail-tags">
                <li v-for="tag in cocktail.tags.slice(0, maxTags)" :key="tag.id" class="chip">{{ tag.name }}</li>
                <li v-if="cocktail.tags.length - maxTags > 0" class="chip" style="opacity: 0.6;">+ {{ cocktail.tags.length - maxTags }} more</li>
            </ul>
        </div>
    </RouterLink>
</template>

<script>
import BarAssistantClient from '@/api/BarAssistantClient';
import { thumbHashToDataURL } from 'thumbhash'
import CocktailRating from './CocktailRating.vue'

export default {
    components: {
        CocktailRating
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
    data() {
        return {
            maxTags: 4
        }
    },
    computed: {
        mainImage() {
            const images = this.cocktail.images

            return images.sort((a, b) => a.sort - b.sort)[0]
        },
        placeholderImage() {
            if (this.cocktail.image_hash) {
                return thumbHashToDataURL(
                    Uint8Array.from(atob(this.cocktail.image_hash), c => c.charCodeAt(0))
                )
            }

            if (this.cocktail.images && this.cocktail.images.length > 0) {
                return thumbHashToDataURL(
                    Uint8Array.from(atob(this.mainImage.placeholder_hash), c => c.charCodeAt(0))
                )
            }

            return ''
        },
        mainCocktailImageUrl() {
            if (this.cocktail.image_url) {
                return BarAssistantClient.getImageThumbUrl(this.cocktail.main_image_id)
            }

            if (this.cocktail.images && this.cocktail.images.length > 0) {
                return BarAssistantClient.getImageThumbUrl(this.mainImage.id)
            }

            return '/no-cocktail.jpg'
        },
        shortIngredients() {
            return this.cocktail.ingredients.map(i => i.ingredient.name)
        }
    },
    mounted() {
        this.observer.observer.observe(this.$el)
    }
}
</script>
<style scoped>
.cocktail-grid-item {
    --_image-size: 325px;
    --_clr-content: var(--clr-gray-500);
    text-align: center;
    border-width: 3px;
    cursor: pointer;
    text-decoration: none;
    display: flex;
    flex-direction: column;
}

.cocktail-grid-item:hover .block-container {
    border-bottom-color: var(--clr-accent-500);
}

.dark-theme .cocktail-grid-item {
    --_clr-content: var(--clr-gray-400);
}

.cocktail-grid-item__title {
    font-size: 1.7rem;
    font-family: var(--font-heading);
    font-weight: var(--fw-bold);
    line-height: 1.3;
}

.cocktail-grid-item__content {
    padding: 1.5rem;
    border-radius: var(--radius-3);
    margin-top: -2.25rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-2);
}

.cocktail-grid-item:hover .cocktail-grid-item__title {
    color: var(--clr-link-color-hover);
}

.cocktail-grid-item__ingredients {
    color: var(--_clr-content);
    font-size: 0.85rem;
}

.cocktail-grid-item__graphic {
    isolation: isolate;
}

.cocktail-grid-item__graphic img {
    width: 100%;
    height: var(--_image-size);
    border-top-left-radius: var(--radius-3);
    border-top-right-radius: var(--radius-3);
    object-fit: cover;
}

.cocktail-tags {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    list-style: none;
    padding: 0;
    gap: var(--gap-size-1);
}

.cocktail-grid-item__badges {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
    display: flex;
    gap: var(--gap-size-1);
    z-index: 1;
}

.cocktail-badge {
    background-color: rgba(0, 0, 0, .5);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: var(--radius-round);
}

.cocktail-badge svg {
    fill: rgba(255, 255, 255, .9);
    width: 16px;
    height: 16px;
}

@media (max-width: 545px) {
    .cocktail-grid-item {
        --_image-size: 200px;
    }

    .cocktail-grid-item__title {
        font-size: 1.25rem;
    }

    .cocktail-grid-item__content {
        padding: var(--gap-size-3);
        border-radius: var(--radius-2);
        gap: var(--gap-size-1);
    }

    .cocktail-grid-item__graphic img {
        border-top-left-radius: var(--radius-2);
        border-top-right-radius: var(--radius-2);
    }

    .cocktail-tags .chip {
        padding: 1px 5px;
        font-size: 0.65rem;
    }

    .cocktail-grid-item__ingredients {
        font-size: 0.75rem;
    }
}
</style>
