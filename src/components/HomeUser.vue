<script setup>
import HomeCocktailItem from './HomeCocktailItem.vue'
</script>

<template>
  <h2>Your favorites</h2>
  <div class="home-cocktails">
    <HomeCocktailItem v-for="cocktail in cocktails" :cocktail="cocktail" :key="cocktail.id" />
  </div>
  <h2>Popular ingredients</h2>
  <div>TODO</div>
  <h2>Your collections</h2>
  <div>TODO</div>
</template>

<script>
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';

export default {
  data: () => ({
    cocktails: null,
    // searchClient: instantMeiliSearch(
    //   this.SEARCH_BASE_URL,
    //   "YBT-cev!dyj7mju8bur"
    // ),
  }),
  created() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      const url = `${this.API_BASE_URL}/api/cocktails`
      let jsonResp = await (await fetch(url)).json();
      this.cocktails = jsonResp.data
    },
  }
}
</script>
