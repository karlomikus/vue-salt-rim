<template>
    <div class="public-page">
        <div class="public-page__header">
            <SiteLogo :no-link="true"></SiteLogo>
        </div>
        <div class="public-page-menu">
            <div class="public-page-menu__bar">
                <h2>{{ menu.bar.name }}</h2>
                <h4 v-show="menu.bar.subtitle">{{ menu.bar.subtitle }}</h4>
                <p v-show="menu.bar.description">{{ menu.bar.description }}</p>
            </div>
            <div v-for="category in menu.categories" :key="category.name" class="public-page-menu__category">
                <h3>{{ category.name }}</h3>
                <div class="public-page-menu__category__cocktails">
                    <div v-for="cocktail in category.cocktails" :key="cocktail.sort" class="public-page-menu__cocktail">
                        <div class="public-page-menu__cocktail__image">
                            <img :src="cocktail.image" alt="">
                        </div>
                        <div class="public-page-menu__cocktail__info">
                            <h4>{{ cocktail.name }}</h4>
                            <p>
                                {{ cocktail.short_ingredients.join(', ') }}
                            </p>
                            <a v-if="cocktail.public_id" :href="publicUrl(cocktail)">View recipe</a>
                        </div>
                        <div v-if="cocktail.price.full > 0" class="public-page-menu__cocktail__price">
                            {{ cocktail.price.formatted }}{{ cocktail.currency }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="public-footer">
            Powered by <a href="https://barassistant.app">Bar Assistant</a>
        </div>
    </div>
</template>
<script>
import SiteLogo from '../Layout/SiteLogo.vue'
import ApiRequests from './../../ApiRequests.js'

export default {
    components: {
        SiteLogo,
    },
    data() {
        return {
            isLoading: false,
            host: window.location.host,
            protocol: window.location.protocol,
            menu: {
                bar: {},
                categories: []
            },
        }
    },
    created() {
        ApiRequests.fetchPublicMenu(this.$route.params.slug).then(data => {
            this.menu = data
        }).catch(() => {
            this.$toast.default(this.$t('menu.menu-not-found'))
            this.$router.push('/')
        })
    },
    mounted() {
        document.body.classList.add('public-body')
    },
    unmounted() {
        document.body.classList.remove('public-body')
    },
    methods: {
        publicUrl(cocktail) {
            return `${this.protocol}//${this.host}/e/cocktail/${cocktail.public_id}/${cocktail.slug}`
        },
    }
}
</script>
<style scoped>
.public-page__header {
    padding: 2rem 0;
}

.public-page {
    align-items: center;
    justify-content: center;
    flex-direction: column;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 0 0.5rem;
}

.public-footer {
    padding: 1rem 0;
    font-size: 0.85rem;
    color: var(--clr-gray-300);
}

.public-footer a {
    color: var(--clr-gray-200);
}

.public-page-menu__bar {
    color: var(--clr-gray-200);
}

.public-page-menu__bar h2 {
    color: var(--clr-gray-100);
    font-weight: var(--fw-bold);
}

.public-page-menu__category h3 {
    margin: 0.5rem 0;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #DDD4F0;
    font-weight: var(--fw-bold);
    text-shadow: 0 2px 0 rgba(0, 0, 0, .7);
}

.public-page-menu__category__cocktails {
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-1);
}

@media (max-width: 545px) {
    .public-page-menu__category__cocktails {
        display: grid;
        grid-template-columns: 1fr 1fr;
    }
}

.public-page-menu__cocktail {
    background: var(--clr-gray-50);
    display: flex;
    gap: var(--gap-size-3);
    padding: var(--gap-size-2);
    border-radius: var(--radius-3);
    color: var(--clr-gray-600);
    box-shadow: var(--shadow-elevation-low-dark);
}

@media (max-width: 545px) {
    .public-page-menu__cocktail {
        flex-direction: column;
        gap: var(--gap-size-2);
    }
}

.public-page-menu__cocktail__image {
    width: 100%;
    height: 100px;
    flex-basis: 100px;
    flex-shrink: 0;
    border-radius: var(--radius-2);
    overflow: hidden;
}

@media (max-width: 545px) {
    .public-page-menu__cocktail__image {
        flex-basis: auto;
        height: 150px;
    }
}

.public-page-menu__cocktail__image img {
    display: block;
    object-fit: cover;
    width: 100%;
    height: 100%;
}

.public-page-menu__cocktail__info {
    margin-right: auto;
}

.public-page-menu__cocktail__info h4 {
    font-size: 1.25rem;
    font-weight: var(--fw-bold);
    font-family: var(--font-heading);
    color: var(--clr-gray-800);
}

@media (max-width: 545px) {
    .public-page-menu__cocktail__info h4 {
        font-size: 1rem;
    }
}

.public-page-menu__cocktail__info p {
    color: var(--clr-gray-500);
}

@media (max-width: 545px) {
    .public-page-menu__cocktail__info p {
        font-size: 0.85rem;
    }
}

.public-page-menu__cocktail__price {
    font-size: 1.25rem;
    font-weight: var(--fw-bold);
}

@media (max-width: 545px) {
    .public-page-menu__cocktail__price {
        margin-top: auto;
        font-size: 1rem;
        text-align: right;
    }
}
</style>
