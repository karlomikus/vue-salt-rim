<script setup>
import SingleCocktailItem from './Cocktail/CocktailGridItem.vue'
import CocktailGridContainer from './Cocktail/CocktailGridContainer.vue'
import luckyBgUrl from './../assets/random-cocktail.jpg'
import ginBgUrl from './../assets/gin-tag.jpg'
import whiskeyBgUrl from './../assets/whiskey-tag.jpg'
import vodkaBgUrl from './../assets/vodka-tag.jpg'
import tequilaBgUrl from './../assets/tequila-tag.jpg'
import brandyBgUrl from './../assets/brandy-tag.jpg'
</script>

<template>
  <h2 class="page-subtitle">Select a cocktail</h2>
  <div class="home-actions">
    <a href="#" :style="{'background-image': 'url(' + luckyBgUrl + ')'}">I'm feeling lucky</a>
    <a href="#" :style="{'background-image': 'url(' + ginBgUrl + ')'}">Gin base</a>
    <a href="#" :style="{'background-image': 'url(' + whiskeyBgUrl + ')'}">Whiskey base</a>
    <a href="#" :style="{'background-image': 'url(' + vodkaBgUrl + ')'}">Vodka base</a>
    <a href="#" :style="{'background-image': 'url(' + tequilaBgUrl + ')'}">Tequila base</a>
    <a href="#" :style="{'background-image': 'url(' + brandyBgUrl + ')'}">Brandy base</a>
  </div>
  <h2 class="page-subtitle">Your favorites</h2>
  <cocktail-grid-container>
    <SingleCocktailItem v-for="cocktail in cocktails" :cocktail="cocktail" :key="cocktail.id" />
  </cocktail-grid-container>
  <h2 class="page-subtitle">Your collections</h2>
  <div>TODO</div>
  <h2 class="page-subtitle">Your shopping list</h2>
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

<style>
.home-actions {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 10px;
  row-gap: 10px;
}

.home-actions a {
  display: flex;
  text-decoration: none;
  color: #fff;
  background-color: #fff;
  background-size: cover;
  background-position: center center;
  border-radius: 10px;
  height: 100px;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  box-shadow: inset 0 0 50px 0px #000;
  text-shadow: 0 0 10px #000;
  font-size: 1.5rem;
}
</style>
