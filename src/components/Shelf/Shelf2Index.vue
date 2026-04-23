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
import IconMedal from '../Icons/IconMedal.vue'
import ListItemContainer from '../ListItemContainer.vue'
import MiniRating from '@/components/MiniRating.vue'
import IngredientImage from '../Ingredient/IngredientImage.vue'
import ImageThumb from '../ImageThumb.vue'
import MainIngredientDistribution from '../Ingredient/MainIngredientDistribution.vue'
import UserTasteProfile from './UserTasteProfile.vue'

type BarTotals = components["schemas"]["BarTotalStatsResource"]
type Cocktail = components["schemas"]["Cocktail"]
type CocktailBasic = components["schemas"]["CocktailBasic"]
type Ingredient = components["schemas"]["Ingredient"]
type IngredientRecommend = components["schemas"]["IngredientRecommend"]
type UserTasteProfile = components["schemas"]["UserTasteProfile"]
type BarIngredientDistribution = components["schemas"]["BarIngredientDistributionResource"]
type BarTopStats = components["schemas"]["BarTopStatsResource"]

const { t } = useI18n()

useTitle(t('shelf.title'))

const appState = new AppState()
const favoriteCocktails = ref<Cocktail[]>([])
const latestCocktails = ref<Cocktail[]>([])
const shoppingListIngredients = ref<Ingredient[]>([])
const latestIngredients = ref<Ingredient[]>([])
const recommendedIngredients = ref<IngredientRecommend[]>([])
const recommendedCocktails = ref<CocktailBasic[]>([])
const tasteProfile = ref<UserTasteProfile|null>(null)
const maxItems = ref(8)
const stats = ref<BarTotals|null>(null)
const ingredientDistribution = ref<BarIngredientDistribution|null>(null)
const topRated = ref<BarTopStats|null>(null)

const loaders = ref({
    cocktailFavorites: false,
    cocktailLatest: false,
    shoppingList: false,
    barStats: false,
    favoriteIngredients: false,
    latestIngredients: false,
    recommendedIngredients: false,
    recommendedCocktails: false,
    userTasteProfile: false,
    ingredientDistribution: false,
    topStats: false,
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
    }).finally(() => {
        loaders.value.recommendedCocktails = false
    })

    BarAssistantClient.getCocktails({ 'filter[favorites]': true, per_page: maxItems.value, sort: '-favorited_at', include: 'ratings,ingredients.ingredient,images' }).then(resp => {
        favoriteCocktails.value = resp?.data ?? []
    }).finally(() => {
        loaders.value.cocktailFavorites = false
    })

    BarAssistantClient.getCocktails({ per_page: maxItems.value, sort: '-created_at', include: 'ratings,ingredients.ingredient,images' }).then(resp => {
        latestCocktails.value = resp?.data ?? []
    }).finally(() => {
        loaders.value.cocktailLatest = false
    })

    BarAssistantClient.getIngredients({ 'filter[on_shopping_list]': true, per_page: maxItems.value, include: 'images' }).then(resp => {
        shoppingListIngredients.value = resp?.data ?? []
    }).finally(() => {
        loaders.value.shoppingList = false
    })

    BarAssistantClient.getIngredients({ per_page: maxItems.value, sort: '-created_at', include: 'images,ancestors' }).then(resp => {
        latestIngredients.value = resp?.data ?? []
    }).finally(() => {
        loaders.value.latestIngredients = false
    })

    BarAssistantClient.getBarTotals(appState.bar.id).then(resp => {
        stats.value = resp?.data ?? null
    }).finally(() => {
        loaders.value.barStats = false
    })

    BarAssistantClient.getRecommendedIngredients(appState.user.id).then(resp => {
        recommendedIngredients.value = resp?.data ?? []
    }).finally(() => {
        loaders.value.recommendedIngredients = false
    })

    BarAssistantClient.getMemberTasteProfile(appState.bar.id).then(resp => {
        tasteProfile.value = resp?.data ?? null
    }).finally(() => {
        loaders.value.userTasteProfile = false
    })

    BarAssistantClient.getIngredientDistribution(appState.bar.id).then(resp => {
        ingredientDistribution.value = resp?.data ?? null
    }).finally(() => {
        loaders.value.ingredientDistribution = false
    })

    BarAssistantClient.getBarTopStats(appState.bar.id).then(resp => {
        topRated.value = resp?.data ?? null
    }).finally(() => {
        loaders.value.topStats = false
    })
}

refreshShelf()
</script>

<template>
    <PageHeader>
        {{ $t('welcome-user', { 'name': appState.user.name }) }} 👋
        <small>Your member role in this bar is TODO</small>
        <template v-if="appState.isAdmin() || appState.isModerator() || appState.isGeneral()" #actions>
            <RouterLink class="button button--outline" :to="{ name: 'ingredients.form' }">{{ $t('ingredient.add') }}</RouterLink>
            <RouterLink class="button button--outline" :to="{ name: 'cocktails.form' }">{{ $t('cocktail.add') }}</RouterLink>
        </template>
    </PageHeader>
    <StatusCheck></StatusCheck>
    <div class="shelf-container">
        <div class="shelf-grid">
            <div class="shelf-grid__col">
                <OverlayLoader v-if="loaders.barStats"></OverlayLoader>
                <h3 class="page-subtitle">{{ $t('shelf.bar-stats') }}</h3>
                <div class="stats" v-if="stats">
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
                        <h3>{{ stats.total_bar_shelf_ingredients }}</h3>
                        <p>
                            <RouterLink :to="{ name: 'ingredients', query: { 'filter[bar_shelf]': 'true' } }">{{ $t('bar-shelf-ingredients') }}</RouterLink>
                        </p>
                    </div>
                    <div class="block-container stats__stat">
                        <h3>{{ stats.total_bar_shelf_cocktails }}</h3>
                        <p>
                            <RouterLink :to="{ name: 'cocktails', query: { 'filter[bar_shelf]': 'true' } }">{{ $t('bar_shelf.cocktails') }}</RouterLink>
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
        </div>
        <div class="shelf-grid">
            <div class="shelf-grid__col">
                <OverlayLoader v-if="loaders.barStats"></OverlayLoader>
                <h3 class="page-subtitle">Ingredient statistics</h3>
                <RecommendedIngredients v-if="stats?.total_cocktails" :stats="stats"></RecommendedIngredients>
                <EmptyState v-else>
                    <template #icon>
                        <IconRecommender></IconRecommender>
                    </template>
                    <template #default>
                        {{ $t('ingredients-not-found') }}.
                    </template>
                </EmptyState>
                <MainIngredientDistribution v-if="ingredientDistribution" :stats="ingredientDistribution"></MainIngredientDistribution>
            </div>
            <div class="shelf-grid__col" v-if="tasteProfile">
                <h3 class="page-subtitle">Your taste profile</h3>
                <UserTasteProfile :profile="tasteProfile"></UserTasteProfile>
            </div>
        </div>
        <div class="shelf-grid">
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
                        {{ $t('missing-recommended-cocktails') }}
                    </template>
                </EmptyState>
            </div>
            <div class="shelf-grid__col">
                <h3 class="page-subtitle">{{ $t('your-shopping-list') }}</h3>
                <OverlayLoader v-if="loaders.shoppingList"></OverlayLoader>
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
                        {{ $t('missing.ingredients') }}
                    </template>
                </EmptyState>
            </div>
            <div class="shelf-grid__col">
                <OverlayLoader v-if="loaders.topStats"></OverlayLoader>
                <h3 class="page-subtitle">Preferred ingredients</h3>
                <div class="salt-rim-list" v-if="topRated">
                    <ListItemContainer tag="RouterLink" v-for="ingredient in topRated.top_member_ingredients" :key="ingredient.id" :to="{ name: 'ingredients.show', params: { id: ingredient.slug } }">
                        <template #content>
                            <h5 class="sr-list-item-title">{{ ingredient.name }}</h5>
                            <p>Present in {{ $t('n-cocktails', ingredient.count) }}</p>
                        </template>
                    </ListItemContainer>
                </div>
                <EmptyState v-else>
                    <template #icon>
                        <IconMedal></IconMedal>
                    </template>
                    <template #default>
                        {{ $t('ingredients-not-found') }}.
                    </template>
                </EmptyState>
            </div>
        </div>
        <div class="shelf-grid">
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
                        {{ $t('missing-cocktails') }}
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
                        {{ $t('ingredients-not-found') }}.
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
                        {{ $t('missing-favorites') }}
                    </template>
                </EmptyState>
            </div>
        </div>
    </div>
</template>

<style scoped>
.shelf-container {
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-4);
}
.shelf-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: var(--gap-size-3);
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
    font-size: .85rem;
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
