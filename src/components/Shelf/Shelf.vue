<template>
    <PageHeader>
        {{ $t('welcome.user', {'name': user.name}) }} 👋
    </PageHeader>

    <div class="stats">
        <OverlayLoader v-if="loaders.stats"></OverlayLoader>
        <div class="stats__stat">
            <h3>{{ stats.total_cocktails }}</h3>
            <p><RouterLink :to="{name: 'cocktails'}">{{ $t('cocktails.total') }}</RouterLink></p>
        </div>
        <div class="stats__stat">
            <h3>{{ stats.total_ingredients }}</h3>
            <p><RouterLink :to="{name: 'ingredients'}">{{ $t('ingredients.total') }}</RouterLink></p>
        </div>
        <div class="stats__stat">
            <h3>{{ stats.total_shelf_ingredients }}</h3>
            <p><RouterLink :to="{name: 'ingredients', query: {shelf: true}}">{{ $t('shelf-ingredients') }}</RouterLink></p>
        </div>
        <div class="stats__stat">
            <h3>{{ stats.total_shelf_cocktails }}</h3>
            <p><RouterLink :to="{name: 'cocktails', query: {'filter[on_shelf]': true}}">{{ $t('shelf.cocktails') }}</RouterLink></p>
        </div>
    </div>
    <div class="list-grid">
        <div class="list-grid__col">
            <h3 class="page-subtitle">{{ $t('cocktails.latest') }}</h3>
            <CocktailListContainer v-if="latestCocktails.length > 0" v-slot="observer">
                <CocktailListItem v-for="cocktail in latestCocktails" :cocktail="cocktail" :key="cocktail.id" :observer="observer" />
                <RouterLink class="more-link" :to="{name: 'cocktails', query: {'sort': '-created_at'}}">{{ $t('view-all') }} <svg height="21" viewBox="0 0 21 21" width="21" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" transform="translate(4 6)"><path d="m9.5.497 4 4.002-4 4.001"/><path d="m.5 4.5h13"/></g></svg></RouterLink>
            </CocktailListContainer>
            <div v-else class="empty-state">
                <OverlayLoader v-if="loaders.cocktails"></OverlayLoader>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M3 10H2V4.003C2 3.449 2.455 3 2.992 3h18.016A.99.99 0 0 1 22 4.003V10h-1v10.001a.996.996 0 0 1-.993.999H3.993A.996.996 0 0 1 3 20.001V10zm16 0H5v9h14v-9zM4 5v3h16V5H4zm5 7h6v2H9v-2z" />
                </svg>
                <p>{{ $t('missing-cocktails') }}<br>
                    <RouterLink :to="{name: 'cocktails.form'}">{{ $t('cocktail.add') }}</RouterLink>
                </p>
            </div>
        </div>
        <div class="list-grid__col">
            <h3 class="page-subtitle">{{ $t('recent-favorites') }}</h3>
            <CocktailListContainer v-if="favoriteCocktails.length > 0" v-slot="observer">
                <CocktailListItem v-for="cocktail in favoriteCocktails" :cocktail="cocktail" :key="cocktail.id" :observer="observer" />
                <RouterLink class="more-link" :to="{name: 'cocktails', query: {'filter[favorites]': true, sort: '-favorited_at'}}">{{ $t('view-all') }} <svg height="21" viewBox="0 0 21 21" width="21" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" transform="translate(4 6)"><path d="m9.5.497 4 4.002-4 4.001"/><path d="m.5 4.5h13"/></g></svg></RouterLink>
            </CocktailListContainer>
            <div v-else class="empty-state">
                <OverlayLoader v-if="loaders.favorites"></OverlayLoader>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="none" d="M0 0H24V24H0z" />
                    <path d="M19.243 4.757c1.462 1.466 2.012 3.493 1.65 5.38.568.16 1.106.463 1.554.908 1.404 1.394 1.404 3.654 0 5.047L17 21.5l-3.022-3L11 21.485 2.52 12.993C.417 10.637.496 7.019 2.757 4.757c2.265-2.264 5.888-2.34 8.244-.228 2.349-2.109 5.979-2.039 8.242.228zm-6.281 7.708c-.616.611-.616 1.597 0 2.208L17 18.682l4.038-4.009c.616-.611.616-1.597 0-2.208-.624-.62-1.642-.62-2.268.002l-1.772 1.754-1.407-1.396-.363-.36c-.624-.62-1.642-.62-2.266 0zm-8.79-6.293c-1.49 1.49-1.565 3.875-.192 5.451L11 18.654l1.559-1.562-1.006-1c-1.404-1.393-1.404-3.653 0-5.047 1.404-1.393 3.68-1.393 5.084 0l.363.36.363-.36c.425-.421.93-.715 1.465-.882.416-1.367.078-2.912-1.001-3.993-1.5-1.502-3.92-1.563-5.49-.153l-1.335 1.198-1.336-1.197c-1.575-1.412-3.99-1.35-5.494.154z" />
                </svg>
                <p>{{ $t('missing-favorites') }}<br>
                    <RouterLink :to="{name: 'cocktails'}">{{ $t('find-cocktails') }}</RouterLink>
                </p>
            </div>
        </div>
        <div class="list-grid__col">
            <h3 class="page-subtitle">{{ $t('your-shopping-list') }}</h3>
            <IngredientListContainer v-if="shoppingListIngredients.length > 0">
                <IngredientListItem
                    v-for="ingredient in shoppingListIngredients"
                    :ingredient="ingredient"
                    :key="ingredient.id"
                    @removedFromShoppingList="removeIngFromList(ingredient)"
                    @addedToShelf="removeIngFromList(ingredient)" />
                <RouterLink class="more-link" :to="{name: 'shelf.shopping-list'}">{{ $t('view-all') }} <svg height="21" viewBox="0 0 21 21" width="21" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" transform="translate(4 6)"><path d="m9.5.497 4 4.002-4 4.001"/><path d="m.5 4.5h13"/></g></svg></RouterLink>
            </IngredientListContainer>
            <div class="empty-state" v-else>
                <OverlayLoader v-if="loaders.list"></OverlayLoader>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M4 16V4H2V2h3a1 1 0 0 1 1 1v12h12.438l2-8H8V5h13.72a1 1 0 0 1 .97 1.243l-2.5 10a1 1 0 0 1-.97.757H5a1 1 0 0 1-1-1zm2 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm12 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
                </svg>
                <p>{{ $t('missing.ingredients') }}<br><RouterLink :to="{name: 'ingredients'}">{{ $t('all-ingredients') }}</RouterLink></p>
            </div>
        </div>
    </div>
</template>

<script>
import ApiRequests from '@/ApiRequests';
import Auth from '@/Auth.js';
import IngredientListItem from '@/components/Ingredient/IngredientListItem.vue'
import IngredientListContainer from '@/components/Ingredient/IngredientListContainer.vue'
import CocktailListItem from '@/components/Cocktail/CocktailListItem.vue'
import CocktailListContainer from '@/components/Cocktail/CocktailListContainer.vue'
import OverlayLoader from '@/components/OverlayLoader.vue'
import PageHeader from '@/components/PageHeader.vue'

export default {
    data: () => ({
        user: Auth.getUser(),
        favoriteCocktails: [],
        latestCocktails: [],
        shoppingListIngredients: [],
        maxItems: 5,
        stats: {},
        loaders: {
            favorites: false,
            cocktails: false,
            list: false,
            stats: false,
        }
    }),
    components: {
        IngredientListContainer,
        IngredientListItem,
        CocktailListItem,
        CocktailListContainer,
        OverlayLoader,
        PageHeader,
    },
    created() {
        document.title = `${this.$t('shelf.title')} \u22C5 ${this.site_title}`

        this.loaders.favorites = true;
        this.loaders.cocktails = true;
        this.loaders.stats = true;

        ApiRequests.fetchCocktails({'filter[favorites]': true, per_page: this.maxItems, sort: '-favorited_at'}).then(resp => {
            this.loaders.favorites = false;
            this.favoriteCocktails = resp.data
        }).catch(e => {
            this.loaders.favorites = false;
            this.$toast.error(this.$t('shelf.toasts.favorites-error'));
        })

        ApiRequests.fetchCocktails({per_page: this.maxItems, sort: '-created_at'}).then(resp => {
            this.loaders.cocktails = false;
            this.latestCocktails = resp.data
        }).catch(e => {
            this.loaders.cocktails = false;
            this.$toast.error(this.$t('shelf.toasts.shelf-error'));
        })

        this.fetchShoppingList();

        ApiRequests.fetchStats().then(data => {
            this.loaders.stats = false;
            this.stats = data
        }).catch(e => {
            this.loaders.stats = false;
            this.$toast.error(this.$t('shelf.toasts.stats-error'));
        })
    },
    methods: {
        fetchShoppingList() {
            this.loaders.list = true;
            ApiRequests.fetchIngredients({'filter[on_shopping_list]': true, per_page: this.maxItems}).then(data => {
                this.loaders.list = false;
                this.shoppingListIngredients = data
            }).catch(e => {
                this.loaders.list = false;
                this.$toast.error(this.$t('shelf.toasts.list-error'));
            })
        },
        removeIngFromList() {
            this.fetchShoppingList();
        },
        logout() {
            ApiRequests.logout().then(() => {
                Auth.forgetUser();
                this.$router.push({name: 'login'})
            })
        }
    }
}
</script>

<style scoped>
.list-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(var(--cocktail-list-card-width), 1fr));
    column-gap: 10px;
    row-gap: 10px;
}

@media (max-width: 450px) {
    .list-grid {
        grid-template-columns: 100%;
    }
}

.list-grid__col {
    margin-bottom: 20px;
}

.list-grid h3 {
    padding-bottom: 5px;
    margin-bottom: 10px;
}

.stats {
    --stats-clr-bg: #F0EFEB;
    margin-top: 20px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    column-gap: 10px;
    row-gap: 10px;
}

.dark-theme .stats {
    --stats-clr-bg: #0d0f0f;
}

.dark-theme .stats__stat {
    background-image: linear-gradient(180deg, var(--stats-clr-bg) 20%, var(--clr-dark-main-950) 110%);
    border-top: 1px solid #161a1a;
}

.stats__stat {
    background-color: var(--stats-clr-bg);
    border-radius: 10px;
    padding: 15px;
}

.stats__stat h3 {
    font-size: 2rem;
}

.stats__stat p {
    opacity: .7;
    font-size: .8rem;
}

.more-link {
    display: flex;
    align-items: center;
    justify-content: center;
}

.more-link svg {
    transition: all 0.1s ease-in;
}

.more-link:hover svg, .more-link:focus svg, .more-link:active svg {
    transform: translateX(5px);
}
</style>
