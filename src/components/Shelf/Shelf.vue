<script setup>
import IngredientListItem from '../Ingredient/IngredientListItem.vue'
import CocktailListItem from '../Cocktail/CocktailListItem.vue'
import CocktailListContainer from '../Cocktail/CocktailListContainer.vue'
</script>

<template>
    <h2 class="page-subtitle">Quick actions</h2>
    <div class="home-actions">
        <a href="#" @click.prevent="randomCocktail()">Random cocktail</a>
        <a href="#">My cocktail recipes</a>
        <RouterLink :to="{name: 'cocktails.form'}">Create a cocktail</RouterLink>
        <!-- <a href="#">Create a collection</a> -->
        <RouterLink :to="{name: 'cocktails', query: {'refinementList[tags][0]': 'Gin'}}">Gin base</RouterLink>
        <RouterLink :to="{name: 'cocktails', query: {'refinementList[tags][0]': 'Rum'}}">Rum base</RouterLink>
    </div>

    <h2 class="page-subtitle">Your favorites ({{ favoriteCocktails.length }})</h2>
    <CocktailListContainer v-if="favoriteCocktails.length > 0" v-slot="observer">
        <CocktailListItem v-for="cocktail in favoriteCocktails" :cocktail="cocktail" :key="cocktail.id" :observer="observer" />
    </CocktailListContainer>
    <div v-else class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" d="M0 0H24V24H0z" />
            <path d="M19.243 4.757c1.462 1.466 2.012 3.493 1.65 5.38.568.16 1.106.463 1.554.908 1.404 1.394 1.404 3.654 0 5.047L17 21.5l-3.022-3L11 21.485 2.52 12.993C.417 10.637.496 7.019 2.757 4.757c2.265-2.264 5.888-2.34 8.244-.228 2.349-2.109 5.979-2.039 8.242.228zm-6.281 7.708c-.616.611-.616 1.597 0 2.208L17 18.682l4.038-4.009c.616-.611.616-1.597 0-2.208-.624-.62-1.642-.62-2.268.002l-1.772 1.754-1.407-1.396-.363-.36c-.624-.62-1.642-.62-2.266 0zm-8.79-6.293c-1.49 1.49-1.565 3.875-.192 5.451L11 18.654l1.559-1.562-1.006-1c-1.404-1.393-1.404-3.653 0-5.047 1.404-1.393 3.68-1.393 5.084 0l.363.36.363-.36c.425-.421.93-.715 1.465-.882.416-1.367.078-2.912-1.001-3.993-1.5-1.502-3.92-1.563-5.49-.153l-1.335 1.198-1.336-1.197c-1.575-1.412-3.99-1.35-5.494.154z" />
        </svg>
        <p>All cocktails you favorited are going to be right here.<br>
            <RouterLink :to="{name: 'cocktails'}">Find cocktails</RouterLink>
        </p>
    </div>

    <h2 class="page-subtitle">Cocktails you can make ({{ shelfCocktails.length }})</h2>
    <CocktailListContainer v-if="shelfCocktails.length > 0" v-slot="observer">
        <CocktailListItem v-for="cocktail in shelfCocktails" :cocktail="cocktail" :key="cocktail.id" :observer="observer" />
    </CocktailListContainer>
    <div v-else class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M3 10H2V4.003C2 3.449 2.455 3 2.992 3h18.016A.99.99 0 0 1 22 4.003V10h-1v10.001a.996.996 0 0 1-.993.999H3.993A.996.996 0 0 1 3 20.001V10zm16 0H5v9h14v-9zM4 5v3h16V5H4zm5 7h6v2H9v-2z" />
        </svg>
        <p>You don't have enough ingredients to create any of the available cocktails.<br>
            <RouterLink :to="{name: 'ingredients'}">Add ingredients</RouterLink>
        </p>
    </div>

    <!-- <h2 class="page-subtitle">Your collections</h2>
  <div class="empty-state">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M6 7V4a1 1 0 0 1 1-1h6.414l2 2H21a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-3v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h3zm0 2H4v10h12v-2H6V9zm2-4v10h12V7h-5.414l-2-2H8z"/></svg>
    <p>Your personal cocktail collections. Coming soon...</p>
  </div> -->

    <h2 class="page-subtitle">Your shopping list ({{ shoppingListIngredients.length }})</h2>
    <div class="shopping-list-container" v-if="shoppingListIngredients.length > 0">
        <IngredientListItem
            v-for="ingredient in shoppingListIngredients"
            :ingredient="ingredient"
            :key="ingredient.id"
            @removedFromShoppingList="removeIngFromList(ingredient)"
            @addedToShelf="removeIngFromList(ingredient)" />
    </div>
    <div class="empty-state" v-else>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M4 16V4H2V2h3a1 1 0 0 1 1 1v12h12.438l2-8H8V5h13.72a1 1 0 0 1 .97 1.243l-2.5 10a1 1 0 0 1-.97.757H5a1 1 0 0 1-1-1zm2 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm12 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
        </svg>
        <p>Ingredients you are missing will be shown here.</p>
    </div>
</template>

<script>
import ApiRequests from '../../ApiRequests';

const api = new ApiRequests();

export default {
    data: () => ({
        favoriteCocktails: [],
        shelfCocktails: [],
        shoppingListIngredients: [],
    }),
    created() {
        document.title = `Shelf \u22C5 Salt Rim`

        api.fetchUserFavoriteCocktails().then(data => {
            this.favoriteCocktails = data
        }).catch(e => {
            this.$toast.error('An error occured while fetching your favorite cocktails from a server.');
        })

        api.fetchUserCocktail().then(data => {
            this.shelfCocktails = data
        }).catch(e => {
            this.$toast.error('An error occured while fetching cocktails you can make from a server.');
        })

        api.fetchIngredientsOnShoppingList().then(data => {
            this.shoppingListIngredients = data
        }).catch(e => {
            this.$toast.error('An error occured while fetching ingredients on your shopping list from a server.');
        })
    },
    methods: {
        randomCocktail() {
            api.randomCocktail().then(resp => {
                this.$router.push({ name: 'cocktails.show', params: { id: resp.slug } })
            });
        },
        removeIngFromList(ingredient) {
            this.shoppingListIngredients.splice(this.shoppingListIngredients.indexOf(ingredient), 1)
        }
    }
}
</script>

<style>
.home-actions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    column-gap: 10px;
    row-gap: 10px;
}

.home-actions a {
    display: flex;
    text-decoration: none;
    background-color: #fff;
    background-size: cover;
    background-position: center center;
    border-radius: 10px;
    height: 100px;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    text-align: center;
}

.home-actions a:nth-child(1) {
    background-color: #C5DEDD;
}

.home-actions a:nth-child(2) {
    background-color: #D6E2E9;
}

.home-actions a:nth-child(3) {
    background-color: #FAD2E1;
}

.home-actions a:nth-child(4) {
    background-color: #EDDCD2;
}

.home-actions a:nth-child(5) {
    background-color: #F0EFEB;
}

.home-actions a:nth-child(6) {
    background-color: #dbcdf0;
}

.home-actions a:hover {
    background-color: var(--color-text);
    color: #fff;
}

.shopping-list-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
    column-gap: 20px;
    row-gap: 20px;
}
</style>
