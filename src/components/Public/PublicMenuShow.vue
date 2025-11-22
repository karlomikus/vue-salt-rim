<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import BarAssistantClient from '@/api/BarAssistantClient'
import { unitHandler } from '@/composables/useUnits'
import type { components } from '@/api/api'

type MenuPublic = components["schemas"]["MenuPublic"]

const route = useRoute()
const host = window.location.host
const protocol = window.location.protocol
const menu = ref<MenuPublic>()

async function refreshMenu() {
    try {
        const resp = (await BarAssistantClient.getPublicMenu(route.params.barId.toString()))?.data
        menu.value = resp
    } catch (e) {
        return
    }
}

function publicUrl(cocktail: components["schemas"]["MenuPublic"]["categories"][0]["items"][0]) {
    return `${protocol}//${host}/e/cocktail/${cocktail.public_id}/cocktail`
}

refreshMenu()
</script>

<template>
    <div class="public-page-menu" v-if="menu">
        <div v-for="category in menu.categories" :key="category.name" class="public-page-menu__category">
            <h3>{{ category.name }}</h3>
            <div class="public-page-menu__category__cocktails">
                <div v-for="item in category.items" :key="item.sort" class="block-container public-page-menu__cocktail">
                    <div :class="{'public-page-menu__cocktail__image': item.type === 'cocktail', 'public-page-menu__ingredient__image': item.type === 'ingredient'}">
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
</template>
<style scoped>
.public-page-menu {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.public-page-menu__category h3 {
    font-size: 1em;
    color: var(--clr-gray-600);
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
    display: flex;
    gap: var(--gap-size-3);
    padding: var(--gap-size-2);
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

.public-page-menu__ingredient__image {
    width: 100%;
    height: 80px;
    flex-basis: 80px;
    flex-shrink: 0;
    border-radius: var(--radius-1);
    overflow: hidden;
}

@media (max-width: 545px) {
    .public-page-menu__ingredient__image {
        flex-basis: auto;
        height: 150px;
    }
}

.public-page-menu__ingredient__image img {
    display: block;
    width: auto;
    margin: 0 auto;
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
    color: var(--clr-gray-700);
    font-size: 0.85em;
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
