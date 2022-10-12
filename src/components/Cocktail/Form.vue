<template>
    <form @submit.prevent="submit">
        <h2 class="page-subtitle">Cocktail information</h2>
        <div class="form-group">
            <label class="form-label" for="name">Name:</label>
            <input class="form-input" type="text" id="name" v-model="cocktail.name">
        </div>
        <div class="form-group">
            <label class="form-label" for="instructions">Instructions:</label>
            <textarea rows="3" class="form-input" id="instructions" v-model="cocktail.instructions"></textarea>
        </div>
        <div class="form-group">
            <label class="form-label" for="garnish">Garnish:</label>
            <textarea rows="3" class="form-input" id="garnish" v-model="cocktail.garnish"></textarea>
        </div>
        <div class="form-group">
            <label class="form-label" for="description">Description:</label>
            <textarea rows="3" class="form-input" id="description" v-model="cocktail.description"></textarea>
        </div>
        <div class="form-group">
            <label class="form-label" for="source">Source:</label>
            <input class="form-input" type="text" id="source" v-model="cocktail.source">
        </div>
        <div class="form-group">
            <label class="form-label" for="images">Images:</label>
            <input class="form-input" type="file" id="images" @change="processImage">
        </div>
        <h2 class="page-subtitle">Ingredients</h2>
        <ul class="cocktail-form__ingredients">
            <li v-for="ing in cocktail.ingredients">
                <div class="form-group">
                    <label class="form-label" for="name">Ingredient:</label>
                    <select class="form-select" v-model="ing.ingredient_id">
                        <option v-for="ingOption in ingredients" :value="ingOption.id">{{ ingOption.name }}</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Amount:</label>
                    <input class="form-input" type="text" v-model="ing.amount">
                </div>
                <div class="form-group">
                    <label class="form-label">Units:</label>
                    <input class="form-input" type="text" v-model="ing.units">
                </div>
            </li>
        </ul>
        <button type="button" @click="addIngredient">Add ingredient +</button>
        <hr>
        <button type="button">Cancel</button>
        <button type="submit">Save</button>
    </form>
</template>

<script>
import vueFilePond from "vue-filepond";
import ApiRequests from "../../ApiRequests";
import "filepond/dist/filepond.min.css";

const FilePond = vueFilePond();
const api = new ApiRequests();

export default {
    components: {
        FilePond,
    },
    data() {
        return {
            cocktail: {
                ingredients: []
            },
            ingredients: []
        };
    },
    created() {
        const cocktailId = this.$route.query.id || null;

        if (cocktailId) {
            api.fetchCocktail(cocktailId).then(data => {
                this.cocktail = data;
            })
        }

        api.fetchIngredients().then(data => {
            this.ingredients = data
        })
    },
    methods: {
        addIngredient() {
            this.cocktail.ingredients.push({
                name: null,
            });
        },
        processImage(e) {
            if (!e.target.files || !e.target.files[0]) return;

            const FR = new FileReader();

            FR.addEventListener("load", evt => {
                this.cocktail.image = evt.target.result
            });

            FR.readAsDataURL(e.target.files[0]);
        },
        submit() {
            const postData = {
                name: this.cocktail.name,
                description: this.cocktail.description,
                instructions: this.cocktail.instructions,
                history: this.cocktail.history,
                source: this.cocktail.source,
                image: this.cocktail.image,
                tags: ['Strong'],
                ingredients: this.cocktail.ingredients
            };
            console.log(postData)

            api.saveCocktail(postData).then(data => {
                console.log(data)
            })
        }
    }
}
</script>

<style scope>
.cocktail-form__ingredients {
    list-style: none;
    margin: 0;
    padding: 0;
}

.cocktail-form__ingredients li {
    display: grid;
    grid-template-columns: 4fr 1fr 1fr;
    column-gap: 10px;
    row-gap: 10px;
    /* margin: 0 0 20px 0; */
}
</style>
