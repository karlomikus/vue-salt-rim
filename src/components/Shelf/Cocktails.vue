<script setup>
import SingleCocktailItem from '../Cocktail/CocktailGridItem.vue'
import CocktailGridContainer from '../Cocktail/CocktailGridContainer.vue'
import Tabs from './Tabs.vue'
</script>

<template>
  <Tabs />
  <cocktail-grid-container v-if="cocktails.length > 0">
    <SingleCocktailItem v-for="cocktail in cocktails" :cocktail="cocktail" :key="cocktail.id" />
  </cocktail-grid-container>
  <div class="empty-state" style="margin-top: 30px;" v-else>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 10H2V4.003C2 3.449 2.455 3 2.992 3h18.016A.99.99 0 0 1 22 4.003V10h-1v10.001a.996.996 0 0 1-.993.999H3.993A.996.996 0 0 1 3 20.001V10zm16 0H5v9h14v-9zM4 5v3h16V5H4zm5 7h6v2H9v-2z"/></svg>
    <p>You don't have enough ingredients to create any of the available cocktails.</p>
  </div>
</template>

<script>
import ApiRequests from '../../ApiRequests';

export default {
  data: () => ({
    cocktails: [],
  }),
  created() {
    ApiRequests.fetchUserCocktail().then(data => {
      this.cocktails = data
    })
  }
}
</script>
