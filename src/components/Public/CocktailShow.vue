<template>
    <div class="bar-cocktail-recipe" itemscope itemtype="http://schema.org/Recipe" v-if="cocktail">
        <div class="bar-cocktail-recipe__header">
            <div class="bar-cocktail-recipe__image" itemprop="image" :content="mainImage.url">
                <img :src="mainImage.url" alt="">
                <div v-if="mainImage.copyright" class="bar-cocktail-recipe__image__copyright">{{ $t('imageupload.copyright-notice', { copyright: mainImage.copyright }) }}</div>
            </div>
            <div class="bar-cocktail-recipe__info">
                <h2 itemprop="name">{{ cocktail.name }}</h2>
                <ul class="bar-cocktail-recipe__tags">
                    <li v-for="t in cocktailTags" :key="t.value" class="bar-cocktail-recipe__tag" :class="t.class">{{ t.value }}</li>
                </ul>
                <div v-show="cocktail.description" itemprop="description" v-html="parsedDescription"></div>
                <div>
                    <a v-if="cocktail.source && isValidURL" :href="cocktail.source">Recipe source <svg class="bar-cocktail-recipe__external-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6V8H5V19H16V14H18V20C18 20.5523 17.5523 21 17 21H4C3.44772 21 3 20.5523 3 20V7C3 6.44772 3.44772 6 4 6H10ZM21 3V11H19L18.9999 6.413L11.2071 14.2071L9.79289 12.7929L17.5849 5H13V3H21Z"></path></svg></a>
                </div>
            </div>
        </div>
        <div class="bar-cocktail-recipe__content block-container block-container--padded">
            <div class="bar-cocktail-recipe__section">
                <h3>{{ $t('ingredient.ingredients') }}</h3>
                <ul class="public-cocktail-recipe__ingredients">
                    <li class="public-cocktail-recipe__ingredients__ingredient" v-for="ing in cocktail.ingredients" :key="ing.name">
                        <div class="public-cocktail-recipe__ingredients__ingredient__name">
                            <div>
                                {{ ing.name }}
                                <template v-if="ing.optional">(optional)</template>
                            </div>
                            <div v-if="ing.note" class="public-cocktail-recipe__ingredients__secondary">
                                {{ ing.note }}
                            </div>
                            <div v-if="ing.substitutes.length > 0" class="public-cocktail-recipe__ingredients__secondary">
                                Substitutes: {{ ing.substitutes.map(sub => sub.name + (sub.amount ? ` (${sub.amount} ${sub.units || ''})` : '')).join(', ') }}
                            </div>
                        </div>
                        <div class="public-cocktail-recipe__ingredients__ingredient__amount">{{ ing.amount }} {{ ing.units }}</div>
                    </li>
                </ul>
            </div>
            <div class="bar-cocktail-recipe__section">
                <h3>{{ $t('instructions') }}</h3>
                <div itemprop="recipeInstructions" class="public-cocktail-recipe__content" v-html="parsedInstructions"></div>
            </div>
            <div v-show="cocktail.garnish" class="bar-cocktail-recipe__section">
                <h3>{{ $t('garnish') }}</h3>
                <div class="public-cocktail-recipe__content" v-html="parsedGarnish"></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { components } from '@/api/api'
import { useRoute } from 'vue-router';
import BarAssistantClient from '@/api/BarAssistantClient'
import { micromark } from 'micromark'

type Cocktail = components['schemas']['PublicCocktailResource']
type CocktailTag = {
    value: string,
    type: string,
    class: string,
}

const route = useRoute()
const cocktail = ref<Cocktail|null>(null)
const currentUnit = ref<'ml' | 'oz' | 'cl'>('ml')

const fetchCocktail = async () => {
    try {
        const response = await BarAssistantClient.getPublicBarCocktail(502, route.params.slug as string)
        cocktail.value = response?.data || null
    } catch (error) {
        console.error('Error fetching cocktails:', error)
    }
}

const parsedDescription = computed(() => {
    return cocktail.value?.description ? micromark(cocktail.value.description) : ''
})

const parsedInstructions = computed(() => {
    return cocktail.value?.instructions ? micromark(cocktail.value.instructions) : ''
})

const parsedGarnish = computed(() => {
    return cocktail.value?.garnish ? micromark(cocktail.value.garnish) : ''
})

const mainImage = computed(() => {
    if (cocktail.value && cocktail.value.images && cocktail.value.images.length > 0) {
        return  cocktail.value.images[0]
    }

    return {
        url: '/no-cocktail.jpg',
        copyright: 'Missing cocktail image',
    }
})

const cocktailTags = computed(() => {
    const result: CocktailTag[] = []

    result.push(...(cocktail.value?.tags.map(tag => ({ value: tag, type: 'tag', class: 'bar-cocktail-recipe__tag--tag' })) || []))
    result.push({ value: cocktail.value?.glass || 'Unknown glass', type: 'glass', class: 'bar-cocktail-recipe__tag--glass' })
    result.push({ value: cocktail.value?.method || 'Unknown method', type: 'method', class: 'bar-cocktail-recipe__tag--method' })

    return result
})

const isValidURL = computed(() => {
    if (!cocktail.value?.source) {
        return false;
    }

    const source = cocktail.value.source || ''

    try {
        new URL(source.startsWith('http') ? source : `https://${source}`);
        return true;
    } catch (err) {
        return false;
    }
})

fetchCocktail()
</script>

<style scoped>
.bar-cocktail-recipe {
    --bcr-default-gap: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 800px;
    margin: 0 auto;
}

.bar-cocktail-recipe__info {
    display: flex;
    flex-direction: column;
    gap: var(--bcr-default-gap);
}

.bar-cocktail-recipe__info h2 {
    font-family: var(--font-heading);
    font-size: 2.2em;
    font-weight: bold;
    margin-top: 0;
    line-height: 1.1;
}

.bar-cocktail-recipe__image {
    flex-shrink: 0;
    width: 300px;
    position: relative;
}

.bar-cocktail-recipe__image img {
    display: block;
    object-position: center;
    object-fit: cover;
    width: 100%;
    height: 100%;
}

.bar-cocktail-recipe__image__copyright {
    background-color: rgba(0, 0, 0, 0.3);
    color: #fff;
    text-shadow: 0 0 3px rgba(0, 0, 0, 0.7);
    font-size: 0.65em;
    position: absolute;
    bottom: 0;
    padding: 1px 5px;
}

.bar-cocktail-recipe__content {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--bcr-default-gap);
}

.bar-cocktail-recipe__content h3 {
    font-family: var(--font-heading);
    font-size: 1em;
    font-weight: bold;
    color: #8F4277;
    margin-bottom: .25rem;
}

.bar-cocktail-recipe__header {
    display: flex;
    gap: var(--bcr-default-gap);
}

.bar-cocktail-recipe__image img {
    width: 100%;
}

.public-cocktail-recipe__ingredients {
    list-style: none;
    padding: 0;
    margin: 0;
}

.public-cocktail-recipe__ingredients__ingredient {
    border-bottom: 1px dotted var(--clr-gray-300);
    display: flex;
    gap: .25rem;
    padding: .15rem 0;
}

.public-cocktail-recipe__ingredients__secondary {
    font-size: 0.75em;
    color: var(--clr-gray-500);
}

.public-cocktail-recipe__ingredients__ingredient__amount {
    margin-left: auto;
    font-weight: var(--fw-bold);
    flex-shrink: 0;
}

.bar-cocktail-recipe__tags {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    gap: .25rem;
    flex-wrap: wrap;
}

.bar-cocktail-recipe__tag {
    padding: .15rem .5rem;
    font-size: 0.75rem;
    font-weight: var(--fw-bold);
    color: white;
    border-radius: 2px;
    text-transform: capitalize;
}

.bar-cocktail-recipe__tag--tag {
    background-color: oklch(0.882 0.072 52.8);
    color: oklch(0.474 0.121 52.8);
}

.bar-cocktail-recipe__tag--glass {
    background-color: oklch(0.950 0.029 231.6);
    color: oklch(0.550 0.112 231.6);
}

.bar-cocktail-recipe__tag--method {
    background-color: oklch(0.950 0.029 304.7);
    color: oklch(0.451 0.235 304.7);
}

.bar-cocktail-recipe__external-icon {
    width: 0.75em;
    height: 0.75em;
    vertical-align: middle;
}
</style>
