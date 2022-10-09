<template>
    <h1>{{ ingredient.name }}</h1>
    <p>
        Desc:<br>
        {{ ingredient.description }}<br>
        Strength: {{ ingredient.strength }}%<br>
        Origin: {{ ingredient.origin }}<br>
        Category: {{ ingredient.category.name }}<br>
    </p>
    <ul>
        <li v-for="cocktail in ingredient.cocktails">
            <RouterLink :to="{name: 'cocktails.show', params: {id: cocktail.id}}">{{ cocktail.name }}</RouterLink>
        </li>
    </ul>
</template>

<script>
import ApiRequests from '../../ApiRequests';

const api = new ApiRequests();

export default {
    data: () => ({
        ingredient: {
            category: {}
        }
    }),
    created() {
        api.fetchIngredient(this.$route.params.id).then(data => {
            this.ingredient = data
        })
    }
}
</script>
