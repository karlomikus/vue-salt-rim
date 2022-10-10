<script setup>
import SingleCocktailItem from './Cocktail/CocktailGridItem.vue'
import CocktailGridContainer from './Cocktail/CocktailGridContainer.vue'
</script>

<template>
  <h2 class="page-subtitle">Select a cocktail</h2>
  <a href="#">I'm feeling lucky (random cocktail)</a>
  <a href="#">Tag by Vodka</a>
  <a href="#">Tag by Tequila</a>
  <a href="#">Tag by Gin</a>
  <a href="#">Tag by Whiskey</a>
  <h2 class="page-subtitle">Your favorites</h2>
  <cocktail-grid-container>
    <SingleCocktailItem v-for="cocktail in cocktails" :cocktail="cocktail" :key="cocktail.id" />
  </cocktail-grid-container>
  <h2 class="page-subtitle">Your shopping list</h2>
  <div>TODO</div>
  <h2 class="page-subtitle">Your collections</h2>
  <div>TODO</div>
</template>

<script>
import ApiRequests from '../ApiRequests';

const api = new ApiRequests();

export default {
  data: () => ({
    cocktails: [],
  }),
  created() {
    api.fetchCocktails().then(data => {
      this.cocktails = data
    })
  }
}
</script>
