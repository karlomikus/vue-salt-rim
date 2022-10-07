<template>
  <div v-for="(ingredients, cat) in groupedByCategory">
    <h3>{{ cat }}</h3>
    <ul>
        <li v-for="ingredient in ingredients">
            {{ ingredient.name }}
            <br>
            <small>{{ ingredient.description }}</small>
        </li>
    </ul>
  </div>
</template>

<script>
import _ from 'lodash';

export default {
    data() {
        return {
            ingredients: []
        }
    },
    created() {
        this.fetchIngredients();
    },
    computed: {
        groupedByCategory() {
            return _.groupBy(this.ingredients, 'category.name');
        }
    },
    methods: {
        async fetchIngredients() {
            const url = `${this.API_BASE_URL}/api/ingredients`
            let jsonResp = await (await fetch(url)).json();
            this.ingredients = jsonResp.data
        },
    }
}
</script>
