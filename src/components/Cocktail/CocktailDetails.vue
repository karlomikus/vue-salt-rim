<script setup>
import OverlayLoader from './../OverlayLoader.vue'
</script>

<template>
  <OverlayLoader v-if="!cocktail.id" />
  <div class="cocktail-details" v-if="cocktail.id">
    <div class="cocktail-details__graphic" :style="{'background-image': 'url(' + cocktail.image_url + ')'}">
    </div>
    <div class="cocktail-details-box cocktail-details-box--title">
      <h3 class="cocktail-details-box__title">{{ cocktail.name }}</h3>
      <p>{{ cocktail.description }}</p>
      <button type="button" class="favorite-cocktail" @click="favorite">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path fill="none" d="M0 0H24V24H0z" />
          <path
            d="M20.243 4.757c2.262 2.268 2.34 5.88.236 8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236 2.265-2.264 5.888-2.34 8.244-.228 2.349-2.109 5.979-2.039 8.242.228zM5.172 6.172c-1.49 1.49-1.565 3.875-.192 5.451L12 18.654l7.02-7.03c1.374-1.577 1.299-3.959-.193-5.454-1.487-1.49-3.881-1.562-5.453-.186l-4.202 4.203-1.415-1.414 2.825-2.827-.082-.069c-1.575-1.265-3.877-1.157-5.328.295z" />
        </svg>
      </button>
    </div>
    <div class="cocktail-details-box cocktail-details-box--blue">
      <h3 class="cocktail-details-box__title">Ingredients:</h3>
      <table>
        <tbody>
          <tr v-for="ing in cocktail.ingredients" :key="ing.sort">
            <td>{{ ing.amount }} {{ ing.units }}</td>
            <td>
              <a :href="'/ingredients/' + ing.ingredient_slug">{{ ing.name }}</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="cocktail-details-box cocktail-details-box--purple">
      <h3 class="cocktail-details-box__title">Instructions:</h3>
      <div v-html="parsedInstructions"></div>
    </div>
    <div class="cocktail-details-box cocktail-details-box--green">
      <h3 class="cocktail-details-box__title">Garnish:</h3>
      <p>{{ cocktail.garnish }}</p>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked';
import ApiRequests from '../../ApiRequests';

const api = new ApiRequests();

export default {
  data: () => ({
    cocktail: {}
  }),
  computed: {
    parsedInstructions() {
      return marked.parse(this.cocktail.instructions)
    }
  },
  created() {
    api.fetchCocktail(this.$route.params.id).then(data => {
      this.cocktail = data
    })
  },
  methods: {
    favorite() {
      api.favoriteCocktail(this.cocktail.id).then(() => {
        
      })
    }
  }
}
</script>
<style scoped>
.cocktail-details-box {
  background-color: #fff;
  border-radius: 20px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  padding: 20px 20px 40px 20px;
  margin-top: -20px;
}

.cocktail-details-box.cocktail-details-box--title {
  background-color: #D6E2E9;
}

.cocktail-details-box.cocktail-details-box--purple {
  background-color: #FFF1E6;
}

.cocktail-details-box.cocktail-details-box--green {
  background-color: #FDE2E4;
}

.cocktail-details-box.cocktail-details-box--blue {
  background-color: #E2ECE9;
}

.cocktail-details__graphic {
  background-color: #fff;
  padding: 50px;
  text-align: center;
  background-size: cover;
  background-position: center center;
  height: 800px;
}

.cocktail-details__graphic__image {
  max-width: 500px;
  height: 500px;
  background-size: cover;
  margin: 0 auto;
}

.cocktail-details-box__title {
  font-family: var(--font-accent);
  font-weight: 700;
  margin: 0 0 20px 0;
  border-bottom: 1px solid rgba(0, 0, 0, .1);
  padding-bottom: 15px;
}

.cocktail-details-box--title .cocktail-details-box__title {
  font-size: 1.5rem;
}

.cocktail-details-box__ingredients {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.cocktail-details-box__ingredients li {
  margin-bottom: 10px;
}

.cocktail-details-box__ingredients li span {
  font-weight: 700;
}

.favorite-cocktail {
  width: 70px;
  height: 70px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 20px;
  top: -30px;
  border: 0;
  cursor: pointer;
}

.favorite-cocktail svg {
  width: 32px;
  height: 32px;
  transition: transform ease-in-out .2s;
}

.favorite-cocktail.favorite-cocktail--active svg {
  fill: #ff686b;
}

.favorite-cocktail:hover {
  background: rgb(243, 196, 196);
}

.favorite-cocktail:hover svg {
  transform: scale(1.2, 1.2);
}
</style>
