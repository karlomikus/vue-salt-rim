<template>
  <div v-for="(ingredients, cat) in groupedByCategory">
    <h3 class="page-subtitle">{{ cat }}</h3>
    <ul class="ingredient-list">
        <li v-for="ingredient in ingredients">
            <div class="ingredient-list__image">
                <img src="http://localhost:8000/bottle.png" alt="sas">
            </div>
            <div class="ingredient-list__description">
                <h3>{{ ingredient.name }}</h3>
                <p>{{ ingredient.description }}</p>
                <button class="button button--icon" @click="removeFromShelf(ingredient)" v-if="userIngredientIds.includes(ingredient.id)">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.997-6l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z"/></svg>
                    <span>Remove from shelf</span>
                </button>
                <button class="button button--icon" @click="addToShelf(ingredient)" v-else>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"/></svg>
                    <span>Add to shelf</span>
                </button>
            </div>
            <div class="ingredient-list__actions">
                
            </div>
        </li>
    </ul>
  </div>
</template>

<script>
import _ from 'lodash';
import ApiRequests from '../ApiRequests';

const api = new ApiRequests();

export default {
    data() {
        return {
            ingredients: [],
            userIngredients: []
        }
    },
    created() {
        api.fetchIngredients().then(data => {
            this.ingredients = data
        });

        api.fetchMyShelf().then(data => {
            this.userIngredients = data
        });
    },
    computed: {
        groupedByCategory() {
            return _.groupBy(this.ingredients, 'category.name');
        },
        userIngredientIds() {
            return this.userIngredients.map(ui => ui.ingredient_id)
        }
    },
    methods: {
        addToShelf(ingredient) {
            api.addIngredientToShelf(ingredient.id)
            this.userIngredients.push({ingredient_id: ingredient.id})
        },
        removeFromShelf(ingredient) {
            api.removeIngredientFromShelf(ingredient.id)
            // this.userIngredients.push({ingredient_id: ingredient.id})
        }
    }
}
</script>

<style scoped>
.ingredient-list {
    list-style: none;
    padding: 0;
    margin: -20px;
    display: flex;
    flex-wrap: wrap;
}

.ingredient-list > li {
    background-color: #fff;
    margin: 20px;
    padding: 15px;
    box-shadow: var(--shadow-elevation-medium);
    border-radius: 10px;
    width: 100%;
    max-width: 460px;
    display: flex;
}

.ingredient-list .ingredient-list__image {
    flex-shrink: 0;
    margin-right: 15px;
    align-self: center;
}

.ingredient-list .ingredient-list__image img {
    height: 120px;
}

.ingredient-list__actions {
    margin-left: auto;
    flex-shrink: 0;
}
</style>
