<template>
  <div class="cocktail-grid-item" @click="$router.push({ name: 'cocktails.show', params: { id: cocktail.slug } })">
    <div class="cocktail-grid-item__graphic">
      <div class="cocktail-grid-item__graphic__image" :data-img-src="cocktail.image_url"></div>
    </div>
    <h2 class="cocktail-grid-item__title">{{ cocktail.name }}</h2>
    <p class="cocktail-grid-item__ingredients" v-if="cocktail.short_ingredients">{{ cocktail.short_ingredients.join(', ') }}</p>
    <ul class="cocktail-tags">
      <li v-for="tag in cocktail.tags" :key="tag">{{ tag }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  props: ['cocktail', 'observer'],
  mounted() {
    this.observer.observer.observe(this.$el)
  }
}
</script>
<style scoped>
.cocktail-grid-item {
  /* max-width: var(--cocktail-card-width); */
  text-align: center;
  background-color: #fff;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 3px 0 var(--color-bg-dark);
  margin-top: 50px;
  cursor: pointer;
  transition: box-shadow ease-in-out 150ms;
}

.cocktail-grid-item .cocktail-grid-item__title {
  font-family: var(--font-accent);
  font-weight: 700;
  font-size: 1.7rem;
  margin-top: -20px;
}

.cocktail-grid-item__ingredients {
  color: var(--color-text-muted);
}

.cocktail-grid-item__graphic {
  transform: translateY(-50px);
  transition: all ease-in-out .1s;
}

.cocktail-grid-item:hover {
  box-shadow: 0 3px 0 #aa5076;
}

.cocktail-grid-item:hover .cocktail-grid-item__graphic {
  transform: translateY(-55px);
}

.cocktail-grid-item:hover .cocktail-grid-item__title {
  color: #aa5076;
}

.cocktail-grid-item__graphic__image {
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
</style>
