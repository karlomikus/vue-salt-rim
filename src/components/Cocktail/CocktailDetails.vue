<script setup>
import OverlayLoader from './../OverlayLoader.vue'
import Dropdown from './../Dropdown.vue';
</script>

<template>
  <OverlayLoader v-if="!cocktail.id" />
  <div class="cocktail-details" v-if="cocktail.id">
    <div class="cocktail-details__graphic" :style="{'background-image': 'url(' + cocktail.image_url + ')'}">
    </div>
    <div class="cocktail-details-box cocktail-details-box--title">
      <h3 class="cocktail-details-box__title">{{ cocktail.name }}</h3>
      <p>{{ cocktail.description }}</p>
      <div class="cocktail-details-box__actions">
        <button type="button" class="button-circle" @click="favorite">
          <svg v-if="!isFavorited" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" d="M0 0H24V24H0z" />
            <path
              d="M20.243 4.757c2.262 2.268 2.34 5.88.236 8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236 2.265-2.264 5.888-2.34 8.244-.228 2.349-2.109 5.979-2.039 8.242.228zM5.172 6.172c-1.49 1.49-1.565 3.875-.192 5.451L12 18.654l7.02-7.03c1.374-1.577 1.299-3.959-.193-5.454-1.487-1.49-3.881-1.562-5.453-.186l-4.202 4.203-1.415-1.414 2.825-2.827-.082-.069c-1.575-1.265-3.877-1.157-5.328.295z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#ee6055">
            <path fill="none" d="M0 0H24V24H0z" />
            <path
              d="M20.243 4.757c2.262 2.268 2.34 5.88.236 8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236C5.515 3 8.093 2.56 10.261 3.44L6.343 7.358l1.414 1.415L12 4.53l-.013-.014.014.013c2.349-2.109 5.979-2.039 8.242.228z" />
          </svg>
        </button>
        <Dropdown>
          <template v-slot:default="{toggleDropdown}">
            <button type="button" class="button-circle" @click="toggleDropdown"><svg xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24" width="24" height="24">
                <path fill="none" d="M0 0h24v24H0z" />
                <path
                  d="M12 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 14c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg></button>
          </template>
          <template #content>
            <a class="dropdown-menu__item" :href="'/cocktails/form?id=' + cocktail.id">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="none" d="M0 0h24v24H0z" />
                <path
                  d="M6.414 16L16.556 5.858l-1.414-1.414L5 14.586V16h1.414zm.829 2H3v-4.243L14.435 2.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 18zM3 20h18v2H3v-2z" />
              </svg>
              Edit
            </a>
            <a class="dropdown-menu__item" :href="'/cocktails/form?id=' + cocktail.id">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="none" d="M0 0h24v24H0z" />
                <path
                  d="M12.414 5H21a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7.414l2 2zM4 5v14h16V7h-8.414l-2-2H4zm7 7V9h2v3h3v2h-3v3h-2v-3H8v-2h3z" />
              </svg>
              Add to collection
            </a>
            <a class="dropdown-menu__item" target="_blank" :href="cocktail.source">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="none" d="M0 0h24v24H0z" />
                <path
                  d="M10 6v2H5v11h11v-5h2v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6zm11-3v8h-2V6.413l-7.793 7.794-1.414-1.414L17.585 5H13V3h8z" />
              </svg>
              Cocktail source
            </a>
            <a class="dropdown-menu__item" href="#" @click.prevent="deleteCocktail">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="none" d="M0 0h24v24H0z" />
                <path
                  d="M7 4V2h10v2h5v2h-2v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6H2V4h5zM6 6v14h12V6H6zm3 3h2v8H9V9zm4 0h2v8h-2V9z" />
              </svg>
              Delete
            </a>
          </template>
        </Dropdown>
      </div>
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
    cocktail: {},
    isFavorited: false
  }),
  computed: {
    parsedInstructions() {
      return marked.parse(this.cocktail.instructions)
    }
  },
  created() {
    api.fetchCocktail(this.$route.params.id).then(data => {
      this.cocktail = data
      api.fetchUser().then(u => {
        this.isFavorited = u.favorite_cocktails.includes(this.cocktail.id)
      })
    })
  },
  methods: {
    favorite() {
      api.favoriteCocktail(this.cocktail.id).then(resp => {
        this.isFavorited = resp.is_favorited
        this.$toast.open({
          message: this.isFavorited ? 'Added to favorites' : 'Removed from favorites'
        });
      })
    },
    deleteCocktail() {
      if (confirm('Are you sure you want to delete cocktail?')) {
        api.deleteCocktail(this.cocktail.id).then(resp => {
          this.$toast.open({
            message: `Cocktail "${this.cocktail.name}" successfully removed`
          });
          this.$router.push({ name: 'cocktails' })
        })
      }
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
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
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

.cocktail-details-box__actions {
  position: absolute;
  right: 20px;
  top: -30px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 10px;
}
</style>
