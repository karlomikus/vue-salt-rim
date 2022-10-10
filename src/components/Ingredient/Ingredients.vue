<script setup>
import Tabs from '../Shelf/Tabs.vue'
import Spinner from './../Spinner.vue'
</script>

<template>
    <tabs />
    <span v-if="ingredients.length == 0">
        Loading...
    </span>
    <div v-else v-for="(ingredients, cat) in groupedByCategory">
        <h3 class="page-subtitle">{{ cat }}</h3>
        <ul class="ingredient-list">
            <li v-for="ingredient in ingredients">
                <div class="ingredient-list__image">
                    <img :src="ingredient.image_url" :alt="ingredient.name">
                </div>
                <div class="ingredient-list__description">
                    <h3>{{ ingredient.name }}</h3>
                    <p>{{ ingredient.description }}</p>
                    <RouterLink :to="{name: 'ingredients.show', params: {id: ingredient.slug}}" class="button-more">
                        <span>Learn more</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path
                                d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z" />
                        </svg></RouterLink>
                </div>
                <div class="ingredient-list__actions">
                    <button class="button-icon-action" @click="removeFromShelf(ingredient)"
                        v-if="userIngredientIds.includes(ingredient.id)">
                        <Spinner v-if="loadingIngredients.includes(ingredient.id)" />
                        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path
                                d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm7.003 13l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z" />
                        </svg>
                    </button>
                    <button class="button-icon-action" @click="addToShelf(ingredient)" v-else>
                        <Spinner v-if="loadingIngredients.includes(ingredient.id)" />
                        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path
                                d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm1 2v14h14V5H5z" />
                        </svg>
                    </button>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
import _ from 'lodash';
import ApiRequests from '../../ApiRequests';

const api = new ApiRequests();

export default {
    data() {
        return {
            ingredients: [],
            userIngredients: [],
            loadingIngredients: []
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
            this.loadingIngredients.push(ingredient.id)
            api.addIngredientToShelf(ingredient.id).then(() => {
                this.loadingIngredients.splice(this.loadingIngredients.indexOf(ingredient.id), 1)
            })

            this.userIngredients.push({ ingredient_id: ingredient.id })
        },
        removeFromShelf(ingredient) {
            this.loadingIngredients.push(ingredient.id)
            api.removeIngredientFromShelf(ingredient.id).then(() => {
                this.loadingIngredients.splice(this.loadingIngredients.indexOf(ingredient.id), 1)
            })

            _.remove(this.userIngredients, function (n) {
                return n.ingredient_id === ingredient.id;
            });
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

.ingredient-list>li {
    background-color: #fff;
    margin: 20px;
    padding: 15px;
    box-shadow: var(--shadow-elevation-medium);
    border-radius: 10px;
    width: 100%;
    max-width: 460px;
    display: flex;
}

.ingredient-list .ingredient-list__description p {
    color: var(--color-text-muted);
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

.button-more {
    display: flex;
    align-items: center;
    margin-top: 5px;
    color: var(--color-text-muted);
}

.button-more svg {
    transition: all ease-in-out .1s;
    fill: var(--color-text-muted);
}
.button-more span {
    margin-right: 3px;
}

.button-more:hover span,
.button-more:focus span,
.button-more:active span {
    font-weight: 700;
    color: var(--color-text);
}

.button-more:hover svg,
.button-more:focus svg,
.button-more:active svg {
    transform: translateX(3px);
}
</style>
