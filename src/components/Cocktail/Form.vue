<template>
    <form @submit.prevent="submit">
        <h2 class="page-subtitle">Cocktail information</h2>
        <div class="form-group">
            <label class="form-label form-label--required" for="name">Name:</label>
            <input class="form-input" type="text" id="name" v-model="cocktail.name" required>
        </div>
        <div class="form-group">
            <label class="form-label form-label--required" for="instructions">Instructions:</label>
            <textarea rows="3" class="form-input" id="instructions" v-model="cocktail.instructions" required></textarea>
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
            <label class="form-label" for="tags">Tags:</label>
            <input class="form-input" type="text" id="tags" v-model="cocktailTags">
        </div>
        <div class="form-group">
            <label class="form-label" for="images">Images:</label>
            <input class="form-input" type="file" id="images" @change="processImage">
        </div>
        <div class="form-group">
            <label class="form-label" for="copyright">Image copyright:</label>
            <input class="form-input" type="text" id="copyright" v-model="images[0].copyright">
        </div>
        <h2 class="page-subtitle">Ingredients</h2>
        <ul class="cocktail-form__ingredients">
            <li v-for="(ing, index) in cocktail.ingredients">
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
                <div class="cocktail-form__ingredients__actions">
                    <label :for="'is-optional-' + index">
                        <input type="checkbox" :id="'is-optional-' + index" :value="true" v-model="ing.optional">
                        Make optional
                    </label>
                    <button type="button" @click="removeIngredient(ing)">Remove ingredient</button>
                </div>
            </li>
        </ul>
        <button type="button" @click="addIngredient">Create and add ingredient +</button>
        <button type="button" @click="addIngredient">Add ingredient +</button>
        <div class="form-actions">
            <a class="button button--outline" href="/cocktails">Cancel</a>
            <button class="button" type="submit">Save</button>
        </div>
    </form>
</template>

<script>
import ApiRequests from "../../ApiRequests";

const api = new ApiRequests();

export default {
    data() {
        return {
            cocktail: {
                ingredients: [],
                tags: [],
            },
            images: [
                {image: null, copyright: null}
            ],
            ingredients: [],
            cocktailId: null
        };
    },
    computed: {
        cocktailTags: {
            get() {
                return this.cocktail.tags.join(',')
            },
            set(newVal) {
                this.cocktail.tags = newVal.split(',')
            }
        }
    },
    created() {
        this.cocktailId = this.$route.query.id || null;

        if (this.cocktailId) {
            api.fetchCocktail(this.cocktailId).then(data => {
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
        removeIngredient(ing) {
            this.cocktail.ingredients.splice(
                this.cocktail.ingredients.findIndex(i => i == ing),
                1
            );
        },
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
                name: this.cocktail.name,
                description: this.cocktail.description,
                instructions: this.cocktail.instructions,
                history: this.cocktail.history,
                garnish: this.cocktail.garnish,
                source: this.cocktail.source,
                images: this.images,
                tags: this.cocktail.tags,
                ingredients: this.cocktail.ingredients
            };

            if (this.cocktailId) {
                api.updateCocktail(this.cocktailId, postData).then(data => {
                    this.$toast.open({
                        message: 'Cocktail updated'
                    });
                    this.$router.push({ name: 'cocktails.show', params: { id: data.id } })
                })
            } else {
                api.saveCocktail(postData).then(data => {
                    this.$toast.open({
                        message: 'Cocktail created'
                    });
                    this.$router.push({ name: 'cocktails.show', params: { id: data.id } })
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
