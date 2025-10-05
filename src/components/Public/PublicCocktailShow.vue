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
                <div class="bar-cocktail-recipe__info__source">
                    <a v-if="cocktail.source && isValidURL" :href="cocktail.source">Recipe source <svg class="bar-cocktail-recipe__external-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6V8H5V19H16V14H18V20C18 20.5523 17.5523 21 17 21H4C3.44772 21 3 20.5523 3 20V7C3 6.44772 3.44772 6 4 6H10ZM21 3V11H19L18.9999 6.413L11.2071 14.2071L9.79289 12.7929L17.5849 5H13V3H21Z"></path></svg></a>
                    <span v-else-if="cocktail.source">{{ cocktail.source }}</span>
                </div>
            </div>
        </div>
        <div class="bar-cocktail-recipe__content block-container block-container--padded">
            <div class="bar-cocktail-recipe__section">
                <h3>{{ $t('ingredient.ingredients') }}</h3>
                <div class="bar-cocktail-recipe__ingredient-actions">
                    <div>
                        <button type="button" class="button button--public" @click="showScaler = !showScaler">Scale recipe</button>
                    </div>
                    <div>
                        <button type="button" class="button button--public" :class="{'button--active': currentUnit == 'ml'}" @click="currentUnit = 'ml'">ml</button>
                        <button type="button" class="button button--public" :class="{'button--active': currentUnit == 'oz'}" @click="currentUnit = 'oz'">oz</button>
                        <button type="button" class="button button--public" :class="{'button--active': currentUnit == 'cl'}" @click="currentUnit = 'cl'">cl</button>
                    </div>
                </div>
                <CocktailRecipeScaler v-if="showScaler" v-model="scaleFactor" :cocktail-volume-ml="cocktail.volume_ml ?? 0" :method-dilution="cocktail.method_dilution_percentage ?? 0" :current-unit="currentUnit" />
                <ul class="public-cocktail-recipe__ingredients">
                    <CocktailIngredient
                        v-for="ing in cocktail.ingredients"
                        :key="ing.name"
                        :cocktail-ingredient="ing"
                        :units="currentUnit"
                        :scale-factor="scaleFactor"
                    />
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
import CocktailIngredient from './PublicCocktailIngredient.vue';
import CocktailRecipeScaler from './../Cocktail/CocktailRecipeScaler.vue';

type Cocktail = components['schemas']['PublicCocktailResource']
type CocktailTag = {
    value: string,
    type: string,
    class: string,
}

const route = useRoute()
const cocktail = ref<Cocktail|null>(null)
const currentUnit = ref<'ml' | 'oz' | 'cl'>('ml')
const scaleFactor = ref<number>(1)
const showScaler = ref<boolean>(false)
const barId = route.params.barId.toString()

const fetchCocktail = async () => {
    try {
        const response = await BarAssistantClient.getPublicBarCocktail(barId, route.params.slug.toString())
        cocktail.value = response?.data || null
    } catch (error) {
        cocktail.value = null
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
        copyright: null,
    }
})

const cocktailTags = computed(() => {
    const result: CocktailTag[] = []

    result.push(...(cocktail.value?.tags.map(tag => ({ value: tag, type: 'tag', class: 'bar-cocktail-recipe__tag--tag' })) || []))

    if (cocktail.value?.glass) {
        result.push({ value: cocktail.value.glass, type: 'glass', class: 'bar-cocktail-recipe__tag--glass' })
    }

    if (cocktail.value?.method) {
        result.push({ value: cocktail.value.method, type: 'method', class: 'bar-cocktail-recipe__tag--method' })
    }

    if (cocktail.value?.abv) {
        result.push({ value: cocktail.value.abv.toString() + '% ABV', type: 'abv', class: 'bar-cocktail-recipe__tag--abv' })
    }

    result.push(...(cocktail.value?.utensils.map(utensil => ({ value: utensil, type: 'utensil', class: 'bar-cocktail-recipe__tag--utensil' })) || []))

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
    gap: .5rem;
}

.bar-cocktail-recipe__info h2 {
    font-family: var(--font-heading);
    font-size: 2.2em;
    font-weight: bold;
    margin-top: 0;
    line-height: 1.1;
}

:deep(.bar-cocktail-recipe__info p) {
    line-height: 1.5;
}

.bar-cocktail-recipe__info__source {
    font-size: 0.75em;
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
    border-radius: .25rem;
}

.bar-cocktail-recipe__image__copyright {
    background-color: rgba(0, 0, 0, 0.3);
    color: #fff;
    text-shadow: 0 0 3px rgba(0, 0, 0, 0.7);
    font-size: 0.65em;
    position: absolute;
    bottom: 0;
    padding: 1px 5px;
    border-radius: 3px;
    margin: 4px;
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

.bar-cocktail-recipe__tag--abv {
    background-color: oklch(0.931 0.034 28.4);
    color: oklch(0.431 0.170 28.4);
}

.bar-cocktail-recipe__tag--utensil {
    background-color: oklch(0.950 0.009 73.7);
    color: oklch(0.513 0.025 73.7);
}

.bar-cocktail-recipe__external-icon {
    width: 0.75em;
    height: 0.75em;
    vertical-align: middle;
}

.bar-cocktail-recipe__ingredient-actions {
    display: flex;
    justify-content: space-between;
    margin-bottom: .5rem;
}
</style>
