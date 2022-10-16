<template>
    <form @submit.prevent="submit">
        <h2 class="page-subtitle">Ingredient information</h2>
        <div class="form-group">
            <label class="form-label form-label--required" for="name">Name:</label>
            <input class="form-input" type="text" id="name" v-model="ingredient.name" required>
        </div>
        <div class="form-group">
            <label class="form-label form-label--required" for="category">Category:</label>
            <select class="form-select" id="category" v-model="ingredient.ingredient_category_id">
                <option v-for="cat in categories" :value="cat.id">{{ cat.name }}</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label" for="strength">Strength:</label>
            <input class="form-input" type="text" id="strength" v-model="ingredient.strength" required>
        </div>
        <div class="form-group">
            <label class="form-label" for="description">Description:</label>
            <textarea rows="4" class="form-input" id="description" v-model="ingredient.description"></textarea>
        </div>
        <div class="form-group">
            <label class="form-label" for="origin">Origin:</label>
            <input class="form-input" type="text" id="origin" v-model="ingredient.origin">
        </div>
        <div class="form-group">
            <label class="form-label" for="color">Color:</label>
            <input class="form-input" type="text" id="color" v-model="ingredient.color">
        </div>
        <div class="form-group">
            <label class="form-label" for="images">Images:</label>
            <input class="form-input" type="file" id="images" @change="processImage">
        </div>
        <div class="form-group">
            <label class="form-label" for="copyright">Image copyright:</label>
            <input class="form-input" type="text" id="copyright" v-model="images[0].copyright">
        </div>
        <div class="form-actions">
            <a class="button button--outline" href="/ingredients">Cancel</a>
            <button class="button button--dark" type="submit">Save</button>
        </div>
    </form>
</template>

<script>
import ApiRequests from "../../ApiRequests";

const api = new ApiRequests();

export default {
    data() {
        return {
            ingredient: {},
            images: [
                {image: null, copyright: null}
            ],
            categories: []
        };
    },
    created() {
        const ingredientId = this.$route.query.id || null;

        if (ingredientId) {
            api.fetchIngredient(ingredientId).then(data => {
                this.ingredient = data;
            })
        }

        api.fetchIngredientCategories().then(data => {
            this.categories = data
        })
    },
    methods: {
        processImage(e) {
            if (!e.target.files || !e.target.files[0]) return;

            const FR = new FileReader();

            FR.addEventListener("load", evt => {
                this.images[0].image = evt.target.result
            });

            FR.readAsDataURL(e.target.files[0]);
        },
        submit() {
            const postData = {
                name: this.ingredient.name,
                description: this.ingredient.description,
                strength: this.ingredient.strength,
                origin: this.ingredient.origin,
                color: this.ingredient.color,
                ingredient_category_id: this.ingredient.ingredient_category_id,
            };

            if (this.cocktailId) {
                // api.updateCocktail(this.cocktailId, postData).then(data => {
                //     this.$toast.open({
                //         message: 'Cocktail updated'
                //     });
                //     this.$router.push({ name: 'cocktails.show', params: { id: data.id } })
                // })
            } else {
                api.saveIngredient(postData).then(data => {
                    this.$toast.open({
                        message: 'Ingredient created'
                    });
                    this.$router.push({ name: 'ingredients.show', params: { id: data.id } })
                })
            }
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
    grid-template-rows: auto auto;
    column-gap: 10px;
    row-gap: 10px;
}

.cocktail-form__ingredients li .form-group {
    margin: 0;
}

.cocktail-form__ingredients__actions {
    grid-column: span 3;
    text-align: right;
    margin-bottom: 20px;
}
</style>
