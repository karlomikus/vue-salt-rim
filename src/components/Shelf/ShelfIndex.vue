<script setup lang="ts">
import { ref } from 'vue'
import type { components } from '@/api/api'
import { useI18n } from 'vue-i18n'
import OverlayLoader from '@/components/OverlayLoader.vue'
import PageHeader from '@/components/PageHeader.vue'
import AppState from '../../AppState'
import EmptyState from './../EmptyState.vue'
import BarAssistantClient from '@/api/BarAssistantClient'
import { useTitle } from '@/composables/title'
import ToggleIngredientShoppingCart from '../ToggleIngredientShoppingCart.vue'
import ToggleIngredientShelf from '../ToggleIngredientShelf.vue'
import RecommendedIngredients from '../Ingredient/RecommendedIngredients.vue'
import StatusCheck from '../StatusCheck.vue'
import IconShoppingCart from '../Icons/IconShoppingCart.vue'
import IconFavorite from '../Icons/IconFavorite.vue'
import IconCocktail from '../Icons/IconCocktail.vue'
import IconJigger from '../Icons/IconJigger.vue'
import IconRecommender from '../Icons/IconRecommender.vue'
import IconStar from '../Icons/IconStar.vue'
import IconMedal from '../Icons/IconMedal.vue'
import ListItemContainer from '../ListItemContainer.vue'
import MiniRating from '@/components/MiniRating.vue'
import IngredientImage from '../Ingredient/IngredientImage.vue'
import ImageThumb from '../ImageThumb.vue'

type BarStats = components["schemas"]["BarStats"]
type Cocktail = components["schemas"]["Cocktail"]
type CocktailBasic = components["schemas"]["CocktailBasic"]
type Ingredient = components["schemas"]["Ingredient"]
type IngredientRecommend = components["schemas"]["IngredientRecommend"]

const { t } = useI18n()

useTitle(t('shelf.title'))

const appState = new AppState()
const favoriteCocktails = ref<Cocktail[]>([])
const latestCocktails = ref<Cocktail[]>([])
const shoppingListIngredients = ref<Ingredient[]>([])
const latestIngredients = ref<Ingredient[]>([])
const recommendedIngredients = ref<IngredientRecommend[]>([])
const recommendedCocktails = ref<CocktailBasic[]>([])
const maxItems = ref(5)
const stats = ref<BarStats>({} as BarStats)

const loaders = ref({
    cocktailFavorites: false,
    cocktailLatest: false,
    shoppingList: false,
    barStats: false,
    favoriteIngredients: false,
    latestIngredients: false,
    recommendedIngredients: false,
    recommendedCocktails: false,
})

async function refreshShelf() {
    loaders.value.cocktailFavorites = true
    loaders.value.cocktailLatest = true
    loaders.value.latestIngredients = true
    loaders.value.barStats = true
    loaders.value.shoppingList = true
    loaders.value.recommendedIngredients = true
    loaders.value.recommendedCocktails = true

    BarAssistantClient.getRecommendedCocktails().then(resp => {
        recommendedCocktails.value = resp?.data ?? []
    }).catch(() => {
        // toast.error(t('shelf.toasts.random-cocktail-error'))
    }).finally(() => {
        loaders.value.recommendedCocktails = false
    })

    BarAssistantClient.getCocktails({ 'filter[favorites]': true, per_page: maxItems.value, sort: '-favorited_at', include: 'ratings,ingredients.ingredient,images' }).then(resp => {
        favoriteCocktails.value = resp?.data ?? []
    }).catch(() => {
        // toast.error(t('shelf.toasts.favorites-error'))
    }).finally(() => {
        loaders.value.cocktailFavorites = false
    })

    BarAssistantClient.getCocktails({ per_page: maxItems.value, sort: '-created_at', include: 'ratings,ingredients.ingredient,images' }).then(resp => {
        latestCocktails.value = resp?.data ?? []
    }).catch(() => {
        // toast.error(t('shelf.toasts.shelf-error'))
    }).finally(() => {
        loaders.value.cocktailLatest = false
    })

    BarAssistantClient.getIngredients({ 'filter[on_shopping_list]': true, per_page: maxItems.value, include: 'images' }).then(resp => {
        shoppingListIngredients.value = resp?.data ?? []
    }).catch(() => {
        // toast.error(t('shelf.toasts.list-error'))
    }).finally(() => {
        loaders.value.shoppingList = false
    })

    BarAssistantClient.getIngredients({ per_page: maxItems.value, sort: '-created_at', include: 'images,ancestors' }).then(resp => {
        latestIngredients.value = resp?.data ?? []
    }).catch(() => {
        // toast.error(t('shelf.toasts.list-error'))
    }).finally(() => {
        loaders.value.latestIngredients = false
    })

    BarAssistantClient.getBarStats(appState.bar.id).then(resp => {
        stats.value = resp?.data ?? {} as BarStats
    }).catch(() => {
        // toast.error(t('shelf.toasts.stats-error'))
    }).finally(() => {
        loaders.value.barStats = false
    })

    BarAssistantClient.getRecommendedIngredients(appState.user.id).then(resp => {
        recommendedIngredients.value = resp?.data ?? []
    }).catch(() => {
        // toast.error(t('shelf.toasts.shelf-error'))
    }).finally(() => {
        loaders.value.recommendedIngredients = false
    })
}

refreshShelf()
</script>

<template>
    <PageHeader>
        {{ $t('welcome-user', { 'name': appState.user.name }) }} 👋
    </PageHeader>
    <StatusCheck></StatusCheck>
    <div class="shelf-grid">
        <div class="shelf-grid__col">
            <OverlayLoader v-if="loaders.barStats"></OverlayLoader>
            <h3 class="page-subtitle">{{ $t('shelf.bar-stats') }}</h3>
            <div class="stats">
                <div class="block-container stats__stat">
                    <h3>{{ stats.total_cocktails }}</h3>
                    <p>
                        <RouterLink :to="{ name: 'cocktails' }">{{ $t('total.cocktails') }}</RouterLink>
                    </p>
                </div>
                <div class="block-container stats__stat">
                    <h3>{{ stats.total_ingredients }}</h3>
                    <p>
                        <RouterLink :to="{ name: 'ingredients' }">{{ $t('total.ingredients') }}</RouterLink>
                    </p>
                </div>
                <div class="block-container stats__stat">
                    <h3>{{ stats.total_shelf_ingredients }}</h3>
                    <p>
                        <RouterLink :to="{ name: 'ingredients', query: { 'filter[on_shelf]': 'true' } }">{{ $t('shelf-ingredients') }}</RouterLink>
                    </p>
                </div>
                <div class="block-container stats__stat">
                    <h3>{{ stats.total_bar_shelf_ingredients }}</h3>
                    <p>
                        <RouterLink :to="{ name: 'ingredients', query: { 'filter[bar_shelf]': 'true' } }">{{ $t('bar-shelf-ingredients') }}</RouterLink>
                    </p>
                </div>
                <div class="block-container stats__stat">
                    <h3>{{ stats.total_favorited_cocktails }}</h3>
                    <p>
                        <RouterLink :to="{ name: 'cocktails', query: { 'filter[favorites]': 'true' } }">{{ $t('favorited-cocktails') }}</RouterLink>
                    </p>
                </div>
                <div class="block-container stats__stat">
                    <h3>{{ stats.total_shelf_cocktails }}</h3>
                    <p>
                        <RouterLink :to="{ name: 'cocktails', query: { 'filter[on_shelf]': 'true' } }">{{ $t('shelf.cocktails') }}</RouterLink>
                    </p>
                </div>
                <div class="block-container stats__stat">
                    <h3>{{ stats.total_bar_shelf_cocktails }}</h3>
                    <p>
                        <RouterLink :to="{ name: 'cocktails', query: { 'filter[bar_shelf]': 'true' } }">{{ $t('bar_shelf.cocktails') }}</RouterLink>
                    </p>
                </div>
                <div class="block-container stats__stat">
                    <h3>{{ stats.total_collections }}</h3>
                    <p>
                        <RouterLink :to="{ name: 'collections.cocktails' }">{{ $t('collections.title') }}</RouterLink>
                    </p>
                </div>
                <div class="block-container stats__stat">
                    <h3>{{ stats.total_bar_members }}</h3>
                    <p>
                        {{ $t('bars.members') }}
                    </p>
                </div>
            </div>
        </div>
        <div class="shelf-grid__col">
            <OverlayLoader v-if="loaders.cocktailLatest"></OverlayLoader>
            <h3 class="page-subtitle">{{ $t('latest.cocktails') }}</h3>
            <div class="salt-rim-list" v-if="latestCocktails.length > 0">
                <ListItemContainer tag="RouterLink" v-for="cocktail in latestCocktails" :key="cocktail.id" :to="{ name: 'cocktails.show', params: { id: cocktail.slug } }">
                    <template #image v-if="cocktail.images && cocktail.images[0]">
                        <ImageThumb :image="cocktail.images[0]"></ImageThumb>
                    </template>
                    <template #content>
                        <h5 class="sr-list-item-title">{{ cocktail.name }} <MiniRating v-if="cocktail.rating && (cocktail.rating.user ?? 0) > 0" :rating="cocktail.rating.user ?? 0"></MiniRating></h5>
                        <p v-if="cocktail.ingredients && cocktail.ingredients.length > 0">
                            {{ cocktail.ingredients.map(i => i.ingredient.name).join(', ') }}
                        </p>
                    </template>
                </ListItemContainer>
            </div>
            <EmptyState v-else>
                <template #icon>
                    <IconCocktail></IconCocktail>
                </template>
                <template #default>
                    {{ $t('missing-cocktails') }}<br>
                    <RouterLink :to="{ name: 'cocktails.form' }">{{ $t('cocktail.add') }}</RouterLink>
                </template>
            </EmptyState>
        </div>
        <div class="shelf-grid__col">
            <OverlayLoader v-if="loaders.recommendedCocktails"></OverlayLoader>
            <h3 class="page-subtitle">{{ $t('shelf.recommended-cocktails') }}</h3>
            <div class="salt-rim-list" v-if="recommendedCocktails.length > 0">
                <ListItemContainer tag="RouterLink" :to="{ name: 'cocktails.show', params: { id: cocktail.slug } }" v-for="cocktail in recommendedCocktails" :key="cocktail.id">
                    <template #image v-if="cocktail.image">
                        <ImageThumb :image="cocktail.image"></ImageThumb>
                    </template>
                    <template #content>
                        <h5 class="sr-list-item-title">{{ cocktail.name }}</h5>
                        <p v-if="cocktail.short_ingredients">
                            {{ cocktail.short_ingredients.join(', ') }}
                        </p>
                    </template>
                </ListItemContainer>
            </div>
            <EmptyState v-else>
                <template #icon>
                    <IconRecommender></IconRecommender>
                </template>
                <template #default>
                    {{ $t('missing-recommended-cocktails') }}<br>
                    <RouterLink :to="{ name: 'ingredients' }">{{ $t('all-ingredients') }}</RouterLink>
                </template>
            </EmptyState>
        </div>
        <div class="shelf-grid__col">
            <OverlayLoader v-if="loaders.latestIngredients"></OverlayLoader>
            <h3 class="page-subtitle">{{ $t('latest.ingredients') }}</h3>
            <div class="salt-rim-list" v-if="latestIngredients.length > 0">
                <ListItemContainer tag="RouterLink" v-for="ingredient in latestIngredients" :key="ingredient.id" :to="{ name: 'ingredients.show', params: { id: ingredient.slug } }">
                    <template #image v-if="ingredient.images && ingredient.images.length > 0">
                        <IngredientImage :image-url="ingredient.images[0].url" :color="ingredient.color"></IngredientImage>
                    </template>
                    <template #content>
                        <h5 class="sr-list-item-title">{{ ingredient.name }}</h5>
                        <p>{{ ingredient.hierarchy.path_to_self ?? t('uncategorized') }}</p>
                    </template>
                </ListItemContainer>
            </div>
            <EmptyState v-else>
                <template #icon>
                    <IconJigger></IconJigger>
                </template>
                <template #default>
                    {{ $t('ingredients-not-found') }}.<br>
                    <RouterLink :to="{ name: 'ingredients' }">{{ $t('all-ingredients') }}</RouterLink>
                </template>
            </EmptyState>
        </div>
        <div class="shelf-grid__col">
            <OverlayLoader v-if="loaders.cocktailFavorites"></OverlayLoader>
            <h3 class="page-subtitle">{{ $t('latest.favorites') }}</h3>
            <div class="salt-rim-list" v-if="favoriteCocktails.length > 0">
                <ListItemContainer tag="RouterLink" v-for="cocktail in favoriteCocktails" :key="cocktail.id" :to="{ name: 'cocktails.show', params: { id: cocktail.slug } }">
                    <template #image v-if="cocktail.images && cocktail.images.length > 0">
                        <ImageThumb :image="cocktail.images[0]"></ImageThumb>
                    </template>
                    <template #content>
                        <h5 class="sr-list-item-title">{{ cocktail.name }}</h5>
                        <p v-if="cocktail.ingredients">{{ cocktail.ingredients.map(i => i.ingredient.name).join(', ') }}</p>
                    </template>
                </ListItemContainer>
            </div>
            <EmptyState v-else>
                <template #icon>
                    <IconFavorite></IconFavorite>
                </template>
                <template #default>
                    {{ $t('missing-favorites') }}<br>
                    <RouterLink :to="{ name: 'cocktails' }">{{ $t('find-cocktails') }}</RouterLink>
                </template>
            </EmptyState>
        </div>
        <div class="shelf-grid__col">
            <OverlayLoader v-if="loaders.shoppingList"></OverlayLoader>
            <h3 class="page-subtitle">{{ $t('your-shopping-list') }}</h3>
            <div class="salt-rim-list" v-if="shoppingListIngredients.length > 0">
                <ListItemContainer v-for="ingredient in shoppingListIngredients" :key="ingredient.id">
                    <template #image v-if="ingredient.images && ingredient.images.length > 0">
                        <IngredientImage :image-url="ingredient.images[0].url" :color="ingredient.color"></IngredientImage>
                    </template>
                    <template #content>
                        <h5 class="sr-list-item-title">{{ ingredient.name }}</h5>
                        <p>
                            <ToggleIngredientShelf v-if="ingredient.in_shelf !== undefined" :ingredient="ingredient" v-model="ingredient.in_shelf"></ToggleIngredientShelf>
                            &middot;
                            <ToggleIngredientShoppingCart v-if="ingredient.in_shopping_list !== undefined" :ingredient="ingredient" v-model="ingredient.in_shopping_list"></ToggleIngredientShoppingCart>
                        </p>
                    </template>
                </ListItemContainer>
            </div>
            <EmptyState v-else>
                <template #icon>
                    <IconShoppingCart></IconShoppingCart>
                </template>
                <template #default>
                    {{ $t('missing.ingredients') }}<br>
                    <RouterLink :to="{ name: 'ingredients' }">{{ $t('all-ingredients') }}</RouterLink>
                </template>
            </EmptyState>
        </div>
        <div class="shelf-grid__col">
            <OverlayLoader v-if="loaders.barStats"></OverlayLoader>
            <h3 class="page-subtitle">{{ $t('top-rated-cocktails') }}</h3>
            <div class="salt-rim-list" v-if="stats.top_rated_cocktails && stats.top_rated_cocktails.length > 0">
                <ListItemContainer tag="RouterLink" v-for="cocktail in stats.top_rated_cocktails" :key="cocktail.id" :to="{ name: 'cocktails.show', params: { id: cocktail.slug } }">
                    <template #content>
                        <h5 class="sr-list-item-title">{{ cocktail.name }}</h5>
                        <p>{{ $t('avg-rating') }}: {{ cocktail.avg_rating }} &middot; {{ $t('votes') }}: {{ cocktail.votes }}</p>
                    </template>
                </ListItemContainer>
            </div>
            <EmptyState v-else>
                <template #icon>
                    <IconStar></IconStar>
                </template>
                <template #default>
                    {{ $t('no-cocktails') }}.<br>
                    <RouterLink :to="{ name: 'cocktails.form' }">{{ $t('cocktail.add') }}</RouterLink>
                </template>
            </EmptyState>
        </div>
        <div class="shelf-grid__col">
            <OverlayLoader v-if="loaders.barStats"></OverlayLoader>
            <h3 class="page-subtitle">{{ $t('most-popular-ingredients') }}</h3>
            <div class="salt-rim-list" v-if="stats.most_popular_ingredients && stats.most_popular_ingredients.length > 0">
                <ListItemContainer tag="RouterLink" v-for="ingredient in stats.most_popular_ingredients" :key="ingredient.id" :to="{ name: 'ingredients.show', params: { id: ingredient.slug } }">
                    <template #content>
                        <h5 class="sr-list-item-title">{{ ingredient.name }}</h5>
                        <p>{{ ingredient.cocktails_count }} {{ $t('cocktail.cocktails') }}</p>
                    </template>
                </ListItemContainer>
            </div>
            <EmptyState v-else>
                <template #icon>
                    <IconMedal></IconMedal>
                </template>
                <template #default>
                    {{ $t('ingredients-not-found') }}.<br>
                    <RouterLink :to="{ name: 'ingredients' }">{{ $t('all-ingredients') }}</RouterLink>
                </template>
            </EmptyState>
        </div>
        <div class="shelf-grid__col">
            <h3 class="page-subtitle">{{ $t('recommended-ingredients') }}</h3>
            <RecommendedIngredients v-if="stats?.total_cocktails > 0" :stats="stats"></RecommendedIngredients>
            <EmptyState v-else>
                <template #icon>
                    <IconRecommender></IconRecommender>
                </template>
                <template #default>
                    {{ $t('ingredients-not-found') }}.<br>
                    <RouterLink :to="{ name: 'ingredients.form' }">{{ $t('ingredient.add') }}</RouterLink>
                </template>
            </EmptyState>
        </div>
    </div>
</template>

<style scoped>
.shelf-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(var(--cocktail-list-card-width), 1fr));
    gap: var(--gap-size-2);
}

@media (max-width: 450px) {
    .shelf-grid {
        grid-template-columns: 100%;
    }
}

.stats {
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-size-2);
}

.stats__stat {
    padding: 1rem 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: baseline;
}

@media (max-width: 450px) {
    .stats__stat {
        padding: 0.75rem 1rem;
    }
}

.stats__stat h3 {
    font-family: var(--font-heading);
    line-height: 1;
    font-size: 2.25rem;
    margin-right: 0.25rem;
}

.stats__stat p {
    opacity: .7;
    font-size: .8rem;
}

.list-grid__container {
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-2);
}

.shelf-stats-count {
    padding: var(--gap-size-2) var(--gap-size-3);
    display: flex;
    flex-direction: column;
    text-decoration: none;
}

.shelf-stats-count small {
    color: var(--clr-gray-500);
}

.block-recommended {
    padding: var(--gap-size-3);
}

.dark-theme .shelf-stats-count small {
    color: var(--clr-gray-400);
}

.shelf-grid__col .page-subtitle {
    margin-bottom: var(--gap-size-2);
}

.salt-rim-list {
    display: flex;
    flex-direction: column;
}
</style>
