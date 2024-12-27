<template>
    <PageHeader>
        {{ $t('welcome-user', { 'name': appState.user.name }) }} 👋
    </PageHeader>
    <StatusCheck></StatusCheck>
    <div class="stats">
        <OverlayLoader v-if="loaders.stats"></OverlayLoader>
        <div class="stats__stat">
            <h3>{{ stats.total_cocktails }}</h3>
            <p>
                <RouterLink :to="{ name: 'cocktails' }">{{ $t('total.cocktails') }}</RouterLink>
            </p>
        </div>
        <div class="stats__stat">
            <h3>{{ stats.total_ingredients }}</h3>
            <p>
                <RouterLink :to="{ name: 'ingredients' }">{{ $t('total.ingredients') }}</RouterLink>
            </p>
        </div>
        <div class="stats__stat">
            <h3>{{ stats.total_shelf_ingredients }}</h3>
            <p>
                <RouterLink :to="{ name: 'ingredients', query: { 'filter[on_shelf]': true } }">{{ $t('shelf-ingredients') }}</RouterLink>
            </p>
        </div>
        <div class="stats__stat">
            <h3>{{ stats.total_bar_shelf_ingredients }}</h3>
            <p>
                <RouterLink :to="{ name: 'ingredients', query: { 'filter[bar_shelf]': true } }">{{ $t('bar-shelf-ingredients') }}</RouterLink>
            </p>
        </div>
        <div class="stats__stat">
            <h3>{{ stats.total_favorited_cocktails }}</h3>
            <p>
                <RouterLink :to="{ name: 'cocktails', query: { 'filter[favorites]': true } }">{{ $t('favorited-cocktails') }}</RouterLink>
            </p>
        </div>
        <div class="stats__stat">
            <h3>{{ stats.total_shelf_cocktails }}</h3>
            <p>
                <RouterLink :to="{ name: 'cocktails', query: { 'filter[on_shelf]': true } }">{{ $t('shelf.cocktails') }}</RouterLink>
            </p>
        </div>
        <div class="stats__stat">
            <h3>{{ stats.total_bar_shelf_cocktails }}</h3>
            <p>
                <RouterLink :to="{ name: 'cocktails', query: { 'filter[bar_shelf]': true } }">{{ $t('bar_shelf.cocktails') }}</RouterLink>
            </p>
        </div>
        <div class="stats__stat">
            <h3>{{ stats.total_collections }}</h3>
            <p>
                <RouterLink :to="{ name: 'collections.cocktails' }">{{ $t('collections.title') }}</RouterLink>
            </p>
        </div>
        <div class="stats__stat">
            <h3>{{ stats.total_bar_members }}</h3>
            <p>
                {{ $t('bars.members') }}
            </p>
        </div>
    </div>
    <div class="list-grid">
        <div class="list-grid__col">
            <h3 class="page-subtitle">{{ $t('latest.cocktails') }}</h3>
            <CocktailListContainer v-if="latestCocktails.length > 0" v-slot="observer">
                <CocktailListItem v-for="cocktail in latestCocktails" :key="cocktail.id" :cocktail="cocktail" :observer="observer" />
                <RouterLink :to="{ name: 'cocktails', query: { 'sort': '-created_at' } }">{{ $t('view-all') }}</RouterLink>
            </CocktailListContainer>
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
        <div class="list-grid__col">
            <h3 class="page-subtitle">{{ $t('latest.favorites') }}</h3>
            <CocktailListContainer v-if="favoriteCocktails.length > 0" v-slot="observer">
                <CocktailListItem v-for="cocktail in favoriteCocktails" :key="cocktail.id" :cocktail="cocktail" :observer="observer" />
                <RouterLink :to="{ name: 'cocktails', query: { 'filter[favorites]': true, sort: '-favorited_at' } }">{{ $t('view-all') }}</RouterLink>
            </CocktailListContainer>
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
        <div class="list-grid__col">
            <h3 class="page-subtitle">{{ $t('your-shopping-list') }}</h3>
            <IngredientListContainer v-if="shoppingListIngredients.length > 0">
                <IngredientTile v-for="ingredient in shoppingListIngredients" :key="ingredient.id" :ingredient="ingredient" :images="ingredient.images">
                    <template #content>
                        <ToggleIngredientShelf :ingredient="ingredient" :status="ingredient.in_shelf"></ToggleIngredientShelf>
                        &middot;
                        <ToggleIngredientShoppingCart :ingredient="ingredient" :status="ingredient.in_shopping_list"></ToggleIngredientShoppingCart>
                    </template>
                </IngredientTile>
                <RouterLink :to="{ name: 'ingredients', query: { 'filter[on_shopping_list]': true } }">{{ $t('view-all') }}</RouterLink>
            </IngredientListContainer>
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
    </div>
    <div class="list-grid">
        <div v-if="stats.top_rated_cocktails.length > 0" class="list-grid__col">
            <h3 class="page-subtitle">{{ $t('top-rated-cocktails') }}</h3>
            <div class="list-grid__container">
                <RouterLink v-for="cocktail in stats.top_rated_cocktails" :key="cocktail.id" :to="{ name: 'cocktails.show', params: { id: cocktail.slug } }" class="shelf-stats-count block-container block-container--hover">
                    <h4>{{ cocktail.name }}</h4>
                    <small>{{ $t('avg-rating') }}: {{ cocktail.avg_rating }} &middot; {{ $t('votes') }}: {{ cocktail.votes }}</small>
                </RouterLink>
            </div>
        </div>
        <div v-if="stats.most_popular_ingredients.length > 0" class="list-grid__col">
            <h3 class="page-subtitle">{{ $t('most-popular-ingredients') }}</h3>
            <div class="list-grid__container">
                <IngredientTile v-for="ingredient in stats.most_popular_ingredients" :key="ingredient.id" :ingredient="ingredient" :images="[]">
                    <template #content>
                        {{ ingredient.cocktails_count }} {{ $t('cocktail.cocktails') }}
                    </template>
                </IngredientTile>
            </div>
        </div>
        <div class="list-grid__col" v-if="stats.total_cocktails > 0">
            <h3 class="page-subtitle">{{ $t('recommended-ingredients') }}</h3>
            <RecommendedIngredients :stats="stats"></RecommendedIngredients>
        </div>
    </div>
</template>

<script>
import IngredientListContainer from '@/components/Ingredient/IngredientListContainer.vue'
import CocktailListItem from '@/components/Cocktail/CocktailListItem.vue'
import CocktailListContainer from '@/components/Cocktail/CocktailListContainer.vue'
import OverlayLoader from '@/components/OverlayLoader.vue'
import PageHeader from '@/components/PageHeader.vue'
import AppState from './../../AppState'
import EmptyState from './../EmptyState.vue'
import BarAssistantClient from '@/api/BarAssistantClient'
import { useTitle } from '@/composables/title'
import IngredientTile from '../Tiles/IngredientTile.vue'
import ToggleIngredientShoppingCart from '../ToggleIngredientShoppingCart.vue'
import ToggleIngredientShelf from '../ToggleIngredientShelf.vue'
import RecommendedIngredients from '../Ingredient/RecommendedIngredients.vue'
import StatusCheck from '../StatusCheck.vue'
import IconShoppingCart from '../Icons/IconShoppingCart.vue'
import IconFavorite from '../Icons/IconFavorite.vue'
import IconCocktail from '../Icons/IconCocktail.vue'

export default {
    components: {
        IngredientListContainer,
        CocktailListItem,
        CocktailListContainer,
        OverlayLoader,
        PageHeader,
        EmptyState,
        IngredientTile,
        ToggleIngredientShoppingCart,
        ToggleIngredientShelf,
        RecommendedIngredients,
        StatusCheck,
        IconShoppingCart,
        IconFavorite,
        IconCocktail,
    },
    data() {
        return {
            appState: new AppState(),
            favoriteCocktails: [],
            latestCocktails: [],
            shoppingListIngredients: [],
            favoriteIngredients: [],
            topRatedCocktails: [],
            recommendedIngredients: [],
            maxItems: 5,
            stats: {
                top_rated_cocktails: [],
                most_popular_ingredients: [],
            },
            loaders: {
                favorites: false,
                cocktails: false,
                list: false,
                stats: false,
                favorite_ingredients: false,
                recommended: false,
            }
        }
    },
    computed: {
        shelfPercent() {
            return Number(this.stats.total_shelf_cocktails / this.stats.total_cocktails).toLocaleString(undefined,{style: 'percent', minimumFractionDigits:2})
        }
    },
    created() {
        useTitle(this.$t('shelf.title'))

        this.loaders.favorites = true
        this.loaders.cocktails = true
        this.loaders.stats = true
        this.loaders.recommended = true

        BarAssistantClient.getCocktails({ 'filter[favorites]': true, per_page: this.maxItems, sort: '-favorited_at', include: 'ratings,ingredients.ingredient,images' }).then(resp => {
            this.loaders.favorites = false
            this.favoriteCocktails = resp.data
        }).catch(() => {
            this.loaders.favorites = false
            this.$toast.error(this.$t('shelf.toasts.favorites-error'))
        })

        BarAssistantClient.getCocktails({ per_page: this.maxItems, sort: '-created_at', include: 'ratings,ingredients.ingredient,images' }).then(resp => {
            this.loaders.cocktails = false
            this.latestCocktails = resp.data
        }).catch(() => {
            this.loaders.cocktails = false
            this.$toast.error(this.$t('shelf.toasts.shelf-error'))
        })

        this.fetchShoppingList()

        BarAssistantClient.getBarStats(this.appState.bar.id).then(resp => {
            this.loaders.stats = false
            this.stats = resp.data
        }).catch(() => {
            this.loaders.stats = false
            this.$toast.error(this.$t('shelf.toasts.stats-error'))
        })

        this.loaders.recommended = true
        BarAssistantClient.getRecommendedIngredients(this.appState.user.id).then(resp => {
            this.loaders.recommended = false
            this.recommendedIngredients = resp.data
        }).catch(() => {
            this.loaders.recommended = false
            this.$toast.error(this.$t('shelf.toasts.shelf-error'))
        })
    },
    methods: {
        fetchShoppingList() {
            this.loaders.list = true
            BarAssistantClient.getIngredients({ 'filter[on_shopping_list]': true, per_page: this.maxItems, include: 'images' }).then(response => {
                this.loaders.list = false
                this.shoppingListIngredients = response.data
            }).catch(() => {
                this.loaders.list = false
                this.$toast.error(this.$t('shelf.toasts.list-error'))
            })
        },
        removeIngFromList() {
            this.fetchShoppingList()
        }
    }
}
</script>

<style scoped>
.list-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(var(--cocktail-list-card-width), 1fr));
    gap: var(--gap-size-2);
}

@media (max-width: 450px) {
    .list-grid {
        grid-template-columns: 100%;
    }
}

.list-grid h3 {
    padding-bottom: 5px;
    margin-bottom: 10px;
}

.stats {
    margin-top: 20px;
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-size-2);
}

.stats__stat {
    background-color: var(--clr-accent-green);
    border-radius: var(--radius-3);
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
    font-size: 2.5rem;
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

.shelf-stats-count h4 {
    font-size: 1.15rem;
    font-family: var(--font-heading);
    font-weight: var(--fw-bold);
}

.shelf-stats-count small {
    color: var(--clr-gray-500);
}

.block-recommended {
    background-color: var(--clr-accent-green);
    padding: var(--gap-size-3);
    border-radius: var(--radius-3);
}

.dark-theme .shelf-stats-count small {
    color: var(--clr-gray-400);
}
</style>
