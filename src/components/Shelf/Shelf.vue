<template>
    <PageHeader>
        Hello, {{ user.name }} 👋
    </PageHeader>

    <div class="stats">
        <OverlayLoader v-if="loaders.stats"></OverlayLoader>
        <div class="stats__stat">
            <h3>{{ stats.total_cocktails }}</h3>
            <p><RouterLink :to="{name: 'cocktails'}">Total cocktails</RouterLink></p>
        </div>
        <div class="stats__stat">
            <h3>{{ stats.total_ingredients }}</h3>
            <p><RouterLink :to="{name: 'ingredients'}">Total ingredients</RouterLink></p>
        </div>
        <div class="stats__stat">
            <h3>{{ stats.total_shelf_cocktails }}</h3>
            <p><RouterLink :to="{name: 'cocktails', query: {shelf: true}}">Cocktails you can make</RouterLink></p>
        </div>
    </div>

    <div class="list-grid">
        <div class="list-grid__col">
            <h3 class="page-subtitle">Latest cocktails</h3>
            <CocktailListContainer v-if="latestCocktails.length > 0" v-slot="observer">
                <CocktailListItem v-for="cocktail in latestCocktails" :cocktail="cocktail" :key="cocktail.id" :observer="observer" />
                <RouterLink class="more-link" :to="{name: 'cocktails'}">View all <svg height="21" viewBox="0 0 21 21" width="21" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" transform="translate(4 6)"><path d="m9.5.497 4 4.002-4 4.001"/><path d="m.5 4.5h13"/></g></svg></RouterLink>
            </CocktailListContainer>
            <div v-else class="empty-state">
                <OverlayLoader v-if="loaders.cocktails"></OverlayLoader>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M3 10H2V4.003C2 3.449 2.455 3 2.992 3h18.016A.99.99 0 0 1 22 4.003V10h-1v10.001a.996.996 0 0 1-.993.999H3.993A.996.996 0 0 1 3 20.001V10zm16 0H5v9h14v-9zM4 5v3h16V5H4zm5 7h6v2H9v-2z" />
                </svg>
                <p>You don't have any cocktails.<br>
                    <RouterLink :to="{name: 'cocktails.form'}">Create cocktail</RouterLink>
                </p>
            </div>
        </div>
        <div class="list-grid__col">
            <h3 class="page-subtitle">Your recent favorites</h3>
            <CocktailListContainer v-if="favoriteCocktails.length > 0" v-slot="observer">
                <CocktailListItem v-for="cocktail in favoriteCocktails" :cocktail="cocktail" :key="cocktail.id" :observer="observer" />
                <RouterLink class="more-link" :to="{name: 'cocktails', query: {favorites: 'true'}}">View all <svg height="21" viewBox="0 0 21 21" width="21" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" transform="translate(4 6)"><path d="m9.5.497 4 4.002-4 4.001"/><path d="m.5 4.5h13"/></g></svg></RouterLink>
            </CocktailListContainer>
            <div v-else class="empty-state">
                <OverlayLoader v-if="loaders.favorites"></OverlayLoader>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="none" d="M0 0H24V24H0z" />
                    <path d="M19.243 4.757c1.462 1.466 2.012 3.493 1.65 5.38.568.16 1.106.463 1.554.908 1.404 1.394 1.404 3.654 0 5.047L17 21.5l-3.022-3L11 21.485 2.52 12.993C.417 10.637.496 7.019 2.757 4.757c2.265-2.264 5.888-2.34 8.244-.228 2.349-2.109 5.979-2.039 8.242.228zm-6.281 7.708c-.616.611-.616 1.597 0 2.208L17 18.682l4.038-4.009c.616-.611.616-1.597 0-2.208-.624-.62-1.642-.62-2.268.002l-1.772 1.754-1.407-1.396-.363-.36c-.624-.62-1.642-.62-2.266 0zm-8.79-6.293c-1.49 1.49-1.565 3.875-.192 5.451L11 18.654l1.559-1.562-1.006-1c-1.404-1.393-1.404-3.653 0-5.047 1.404-1.393 3.68-1.393 5.084 0l.363.36.363-.36c.425-.421.93-.715 1.465-.882.416-1.367.078-2.912-1.001-3.993-1.5-1.502-3.92-1.563-5.49-.153l-1.335 1.198-1.336-1.197c-1.575-1.412-3.99-1.35-5.494.154z" />
                </svg>
                <p>All cocktails you favorited are going to be right here.<br>
                    <RouterLink :to="{name: 'cocktails'}">Find cocktails</RouterLink>
                </p>
            </div>
        </div>
        <div class="list-grid__col">
            <h3 class="page-subtitle">Your shopping list</h3>
            <IngredientListContainer v-if="shoppingListIngredients.length > 0">
                <IngredientListItem
                    v-for="ingredient in shoppingListIngredients"
                    :ingredient="ingredient"
                    :key="ingredient.id"
                    @removedFromShoppingList="removeIngFromList(ingredient)"
                    @addedToShelf="removeIngFromList(ingredient)" />
                <RouterLink class="more-link" :to="{name: 'shelf.shopping-list'}">View all <svg height="21" viewBox="0 0 21 21" width="21" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" transform="translate(4 6)"><path d="m9.5.497 4 4.002-4 4.001"/><path d="m.5 4.5h13"/></g></svg></RouterLink>
            </IngredientListContainer>
            <div class="empty-state" v-else>
                <OverlayLoader v-if="loaders.list"></OverlayLoader>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M4 16V4H2V2h3a1 1 0 0 1 1 1v12h12.438l2-8H8V5h13.72a1 1 0 0 1 .97 1.243l-2.5 10a1 1 0 0 1-.97.757H5a1 1 0 0 1-1-1zm2 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm12 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
                </svg>
                <p>Ingredients you are missing will be shown here.<br><RouterLink :to="{name: 'ingredients'}">All ingredients</RouterLink></p>
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
        document.title = `Shelf \u22C5 Salt Rim`

        this.loaders.favorites = true;
        this.loaders.cocktails = true;
        this.loaders.stats = true;

        ApiRequests.fetchUserFavoriteCocktails(5).then(data => {
            this.loaders.favorites = false;
            this.favoriteCocktails = data
        }).catch(e => {
            this.loaders.favorites = false;
            this.$toast.error('An error occured while fetching your favorite cocktails from a server.');
        })

        ApiRequests.fetchCocktails({per_page: 5, order_by: 'created_at:desc'}).then(data => {
            this.loaders.cocktails = false;
            this.latestCocktails = data
        }).catch(e => {
            this.loaders.cocktails = false;
            this.$toast.error('An error occured while fetching cocktails you can make from a server.');
        })

        this.fetchShoppingList();

        ApiRequests.fetchStats().then(data => {
            this.loaders.stats = false;
            this.stats = data
        }).catch(e => {
            this.loaders.stats = false;
            this.$toast.error('An error occured while fetching stats from a server.');
        })
    },
    methods: {
        fetchShoppingList() {
            this.loaders.list = true;
            ApiRequests.fetchIngredientsOnShoppingList(5).then(data => {
                this.loaders.list = false;
                this.shoppingListIngredients = data
            }).catch(e => {
                this.loaders.list = false;
                this.$toast.error('An error occured while fetching ingredients on your shopping list from a server.');
            })
        },
        randomCocktail() {
            ApiRequests.randomCocktail().then(resp => {
                this.$router.push({ name: 'cocktails.show', params: { id: resp.slug } })
            });
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
    margin-top: 20px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    column-gap: 10px;
    row-gap: 10px;
}

.stats__stat {
    background-color: #F0EFEB;
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
