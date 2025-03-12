<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BarAssistantClient from '@/api/BarAssistantClient'
import SiteLogo from '@/components/Layout/SiteLogo.vue'
import { unitHandler } from '@/composables/useUnits'
import type { components } from '@/api/api'

type MenuExplore = components["schemas"]["MenuExplore"]

document.body.classList.add('public-body')
onUnmounted(() => {
    document.body.classList.remove('public-body')
})

const route = useRoute()
const router = useRouter()
const host = window.location.host
const protocol = window.location.protocol
const menu = ref<MenuExplore>()

async function refreshMenu() {
    try {
        const resp = (await BarAssistantClient.getPublicMenu(route.params.slug.toString()))?.data
        menu.value = resp
    } catch (e) {
        router.push('/')
        return
    }
}

function publicUrl(cocktail: components["schemas"]["MenuExplore"]["categories"][0]["items"][0]) {
    return `${protocol}//${host}/e/cocktail/${cocktail.public_id}/cocktail`
}

refreshMenu()
</script>

<template>
    <div class="public-page">
        <div class="public-page__header">
            <SiteLogo :no-link="true"></SiteLogo>
        </div>
        <div class="public-page-menu" v-if="menu">
            <div class="public-page-menu__bar">
                <h2>{{ menu.bar.name }}</h2>
                <h4 v-show="menu.bar.subtitle">{{ menu.bar.subtitle }}</h4>
                <p v-show="menu.bar.description">{{ menu.bar.description }}</p>
            </div>
            <div v-for="category in menu.categories" :key="category.name" class="public-page-menu__category">
                <h3>{{ category.name }}</h3>
                <div class="public-page-menu__category__cocktails">
                    <div v-for="item in category.items" :key="item.sort" class="public-page-menu__cocktail">
                        <div class="public-page-menu__cocktail__image">
                            <img v-if="item.image" :src="item.image" alt="">
                            <img v-else src="/no-cocktail.jpg" alt="">
                        </div>
                        <div class="public-page-menu__cocktail__info">
                            <h4>{{ item.name }}</h4>
                            <p>
                                {{ item.description }}
                            </p>
                            <a v-if="item.public_id" :href="publicUrl(item)">View recipe</a>
                        </div>
                        <div v-if="item.price.price > 0" class="public-page-menu__cocktail__price">
                            {{ unitHandler.formatPrice(item.price.price, item.price.currency) }}
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
<style scoped>
.public-page__header {
    padding: var(--gap-size-3);
    margin: var(--gap-size-3) 0;
    background-color: #332d46;
    border-bottom: 1px solid #6b6188;
    box-shadow:
        inset 0px 0.4px 0.5px hsl(var(--shadow-color-dark) / 0.25),
        inset 0px 1.1px 1.2px -0.8px hsl(var(--shadow-color-dark) / 0.25),
        inset 0px 2.6px 2.9px -1.7px hsl(var(--shadow-color-dark) / 0.25),
        inset 0px 6.3px 7.1px -2.5px hsl(var(--shadow-color-dark) / 0.25);
    border-radius: var(--radius-3);
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

.public-page-menu {
    padding: var(--gap-size-3);
    background-color: var(--clr-gray-100);
    border-radius: var(--radius-2);
}

.public-page-menu__bar {
    color: var(--clr-gray-900);
}

.public-page-menu__bar h2 {
    font-weight: var(--fw-bold);
}

.public-page-menu__category h3 {
    margin: 1rem 0;
    text-align: center;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--clr-gray-800);
    font-weight: var(--fw-bold);
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
    border-radius: var(--radius-1);
    /* color: var(--clr-gray-600); */
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
    height: 80px;
    flex-basis: 80px;
    flex-shrink: 0;
    border-radius: var(--radius-1);
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
    font-size: 1.5rem;
    color: var(--clr-gray-900);
    font-weight: var(--fw-bold);
}

@media (max-width: 545px) {
    .public-page-menu__cocktail__price {
        margin-top: auto;
        font-size: 1.15rem;
        text-align: right;
    }
}
</style>
