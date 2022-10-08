<template>
  <div class="cocktail-details" v-if="cocktail.id">
    <div class="cocktail-details__graphic" :style="{'background-image': 'url(' + cocktail.image_url + ')'}">
    </div>
    <div class="cocktail-details-box cocktail-details-box--title">
        <h3 class="cocktail-details-box__title">{{ cocktail.name }}</h3>
        <p>{{ cocktail.description }}</p>
    </div>
    <div class="cocktail-details-box cocktail-details-box--blue">
        <h3 class="cocktail-details-box__title">Ingredients:</h3>
        <table>
          <tbody>
            <tr v-for="ing in cocktail.ingredients" :key="ing.sort">
              <td>{{ ing.amount }} {{ ing.units }}</td>
              <td>{{ ing.name }}</td>
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
import ApiRequests from '../ApiRequests';

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
    background-color: #e0eff9;
}
.cocktail-details-box.cocktail-details-box--purple {
    background-color: rgb(232, 228, 247);
}
.cocktail-details-box.cocktail-details-box--green {
    background-color: rgb(240, 247, 228);
}
.cocktail-details-box.cocktail-details-box--blue {
    background-color: rgb(206, 217, 236);
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
  border-bottom: 1px solid #737db7;
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
</style>
