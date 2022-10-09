<script setup>
import SingleCocktailItem from './Cocktail/CocktailGridItem.vue'
import CocktailGridContainer from './Cocktail/CocktailGridContainer.vue'
</script>

<template>
  <h2 class="page-subtitle">Your favorites</h2>
  <cocktail-grid-container>
    <SingleCocktailItem v-for="cocktail in cocktails" :cocktail="cocktail" :key="cocktail.id" />
  </cocktail-grid-container>
  <h2 class="page-subtitle">Popular ingredients</h2>
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
