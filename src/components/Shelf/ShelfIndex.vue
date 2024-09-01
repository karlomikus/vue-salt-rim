<template>
    <PageHeader>
        {{ $t('welcome-user', { 'name': appState.user.name }) }} 👋
    </PageHeader>

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
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path d="M3 10H2V4.003C2 3.449 2.455 3 2.992 3h18.016A.99.99 0 0 1 22 4.003V10h-1v10.001a.996.996 0 0 1-.993.999H3.993A.996.996 0 0 1 3 20.001V10zm16 0H5v9h14v-9zM4 5v3h16V5H4zm5 7h6v2H9v-2z" />
                    </svg>
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
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
                        <path fill="none" d="M0 0H24V24H0z" />
                        <path d="M19.243 4.757c1.462 1.466 2.012 3.493 1.65 5.38.568.16 1.106.463 1.554.908 1.404 1.394 1.404 3.654 0 5.047L17 21.5l-3.022-3L11 21.485 2.52 12.993C.417 10.637.496 7.019 2.757 4.757c2.265-2.264 5.888-2.34 8.244-.228 2.349-2.109 5.979-2.039 8.242.228zm-6.281 7.708c-.616.611-.616 1.597 0 2.208L17 18.682l4.038-4.009c.616-.611.616-1.597 0-2.208-.624-.62-1.642-.62-2.268.002l-1.772 1.754-1.407-1.396-.363-.36c-.624-.62-1.642-.62-2.266 0zm-8.79-6.293c-1.49 1.49-1.565 3.875-.192 5.451L11 18.654l1.559-1.562-1.006-1c-1.404-1.393-1.404-3.653 0-5.047 1.404-1.393 3.68-1.393 5.084 0l.363.36.363-.36c.425-.421.93-.715 1.465-.882.416-1.367.078-2.912-1.001-3.993-1.5-1.502-3.92-1.563-5.49-.153l-1.335 1.198-1.336-1.197c-1.575-1.412-3.99-1.35-5.494.154z" />
                    </svg>
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
                <IngredientListItem v-for="ingredient in shoppingListIngredients" :key="ingredient.id" :ingredient="ingredient" @removed-from-shopping-list="removeIngFromList(ingredient)" @added-to-shelf="removeIngFromList(ingredient)" />
                <RouterLink :to="{ name: 'ingredients', query: { 'filter[on_shopping_list]': true } }">{{ $t('view-all') }}</RouterLink>
            </IngredientListContainer>
            <EmptyState v-else>
                <template #icon>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path d="M4 16V4H2V2h3a1 1 0 0 1 1 1v12h12.438l2-8H8V5h13.72a1 1 0 0 1 .97 1.243l-2.5 10a1 1 0 0 1-.97.757H5a1 1 0 0 1-1-1zm2 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm12 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
                    </svg>
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
                <RouterLink v-for="ingredient in stats.most_popular_ingredients" :key="ingredient.id" :to="{ name: 'ingredients.show', params: { id: ingredient.slug } }" class="shelf-stats-count block-container block-container--hover">
                    <h4>{{ ingredient.name }}</h4>
                    <small>{{ ingredient.cocktails_count }} {{ $t('cocktail.cocktails') }}</small>
                </RouterLink>
            </div>
        </div>
        <div v-if="recommendedIngredients.length > 0" class="list-grid__col">
            <h3 class="page-subtitle">{{ $t('recommended-ingredients') }}</h3>
            <div class="block-recommended">
                You can make <strong>{{ shelfPercent }}</strong> of bar cocktails. Add one of the following ingredients to you shelf to increase your cocktail options:
                <template v-for="(ing, index) in recommendedIngredients" :key="ing.id">
                    <RouterLink :to="{ name: 'ingredients.show', params: { id: ing.slug } }">{{ ing.name }}</RouterLink>
                    <template v-if="index + 1 !== recommendedIngredients.length"> &middot; </template>
                </template>
            </div>
        </div>
    </div>
</template>

<script>
import ApiRequests from './../../ApiRequests.js'
import IngredientListItem from '@/components/Ingredient/IngredientListItem.vue'
import IngredientListContainer from '@/components/Ingredient/IngredientListContainer.vue'
import CocktailListItem from '@/components/Cocktail/CocktailListItem.vue'
import CocktailListContainer from '@/components/Cocktail/CocktailListContainer.vue'
import OverlayLoader from '@/components/OverlayLoader.vue'
import PageHeader from '@/components/PageHeader.vue'
import AppState from './../../AppState'
import EmptyState from './../EmptyState.vue'
import BarAssistantClient from '@/api/BarAssistantClient'
import { useTitle } from '@/composables/title'

export default {
    components: {
        IngredientListContainer,
        IngredientListItem,
        CocktailListItem,
        CocktailListContainer,
        OverlayLoader,
        PageHeader,
        EmptyState
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

        ApiRequests.fetchCocktails({ 'filter[favorites]': true, per_page: this.maxItems, sort: '-favorited_at', include: 'ratings,ingredients.ingredient,images' }).then(resp => {
            this.loaders.favorites = false
            this.favoriteCocktails = resp.data
        }).catch(() => {
            this.loaders.favorites = false
            this.$toast.error(this.$t('shelf.toasts.favorites-error'))
        })

        ApiRequests.fetchCocktails({ per_page: this.maxItems, sort: '-created_at', include: 'ratings,ingredients.ingredient,images' }).then(resp => {
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
            ApiRequests.fetchIngredients({ 'filter[on_shopping_list]': true, per_page: this.maxItems, include: 'images' }).then(response => {
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
    align-items: baseline;
}

.stats__stat h3 {
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
