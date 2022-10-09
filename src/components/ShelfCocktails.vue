<script setup>
import SingleCocktailItem from './Cocktail/CocktailGridItem.vue'
import CocktailGridContainer from './Cocktail/CocktailGridContainer.vue'
</script>

<template>
  <cocktail-grid-container>
    <SingleCocktailItem v-for="cocktail in cocktails" :cocktail="cocktail" :key="cocktail.id" />
  </cocktail-grid-container>
</template>

<script>
import ApiRequests from '../ApiRequests';

const api = new ApiRequests();

export default {
  data: () => ({
    cocktails: [],
  }),
  created() {
    api.fetchUserCocktail().then(data => {
      this.cocktails = data
    })
  }
}
</script>
