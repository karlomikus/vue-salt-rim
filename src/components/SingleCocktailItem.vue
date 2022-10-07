<template>
  <div class="home-cocktail-item" @click="$router.push({ name: 'cocktails.show', params: { id: cocktail.id } })">
    <div class="home-cocktail-item__graphic">
      <div class="home-cocktail-item__graphic__image" :style="{'background-image': 'url(' + cocktail.image_url + ')'}"></div>
    </div>
    <h2 class="home-cocktail-item__title">{{ cocktail.name }}</h2>
    <p class="home-cocktail-item__ingredients" v-if="cocktail.short_ingredients">{{ cocktail.short_ingredients.join(', ') }}</p>
    <ul class="home-cocktail-item__tags">
      <li v-for="tag in cocktail.tags" :key="tag">{{ tag }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  props: ['cocktail']
}
</script>
<style scoped>
.home-cocktail-item {
  width: 300px;
  text-align: center;
  background-color: #fff;
  margin: 15px;
  padding: 30px;
  border-radius: 20px;
  box-shadow: var(--shadow-elevation-medium);
  margin-top: 50px;
  cursor: pointer;
}

.home-cocktail-item .home-cocktail-item__title {
  font-family: var(--font-accent);
  font-weight: 700;
  font-size: 1.7rem;
  margin-top: -20px;
}

.home-cocktail-item__ingredients {
  color: var(--bar-c-text-muted);
}

.home-cocktail-item__graphic {
  transform: translateY(-50px);
}

.home-cocktail-item__graphic__image {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background-color: #fff;
  background-size: cover;
  background-position: center center;
  margin: 0 auto;
  box-shadow: 0px 0.5px 0.6px hsl(0deg 0% 63% / 0.36),
    0px 1.6px 1.8px -0.8px hsl(0deg 0% 63% / 0.36),
    0.1px 4px 4.5px -1.7px hsl(0deg 0% 63% / 0.36),
    0.1px 9.7px 10.9px -2.5px hsl(0deg 0% 63% / 0.36);
}

.home-cocktail-item__tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  list-style: none;
  padding: 0;
  margin: 10px -3px -3px -3px;
}

.home-cocktail-item__tags li {
  background-color: rgb(171, 250, 222);
  border-radius: 4px;
  margin: 3px;
  padding: 2px 5px;
  font-size: 12px;
}
</style>
