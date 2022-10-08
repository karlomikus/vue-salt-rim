<script setup>
import SingleCocktailItem from './SingleCocktailItem.vue'
</script>

<template>
  <h2>Your favorites</h2>
  <div class="home-cocktails">
    <SingleCocktailItem v-for="cocktail in cocktails" :cocktail="cocktail" :key="cocktail.id" />
  </div>
  <h2>Popular ingredients</h2>
  <div>TODO</div>
  <h2>Your collections</h2>
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
