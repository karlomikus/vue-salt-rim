<script setup>
import OverlayLoader from './../OverlayLoader.vue'
</script>

<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <h2 class="page-subtitle">Cocktail information</h2>
        <div class="form-group">
            <label class="form-label form-label--required" for="name">Name:</label>
            <input class="form-input" type="text" id="name" v-model="cocktail.name" required>
        </div>
        <div class="form-group">
            <label class="form-label form-label--required" for="instructions">Instructions:</label>
            <textarea rows="5" class="form-input" id="instructions" v-model="cocktail.instructions" required></textarea>
            <p class="form-input-hint">This field supports markdown.</p>
        </div>
        <div class="form-group">
            <label class="form-label" for="garnish">Garnish:</label>
            <textarea rows="3" class="form-input" id="garnish" v-model="cocktail.garnish"></textarea>
        </div>
        <div class="form-group">
            <label class="form-label" for="description">Description:</label>
            <textarea rows="3" class="form-input" id="description" v-model="cocktail.description"></textarea>
            <p class="form-input-hint">This field supports markdown.</p>
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
            <input class="form-input" type="file" id="images" ref="image">
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
                        <input type="checkbox" :id="'is-optional-' + index" v-model="ing.optional">
                        Make optional
                    </label>
                    <button class="button button--outline" type="button" @click="removeIngredient(ing)">Remove ingredient</button>
                </div>
            </li>
        </ul>
        <button class="button button--outline" type="button" @click="addIngredient">Add ingredient</button>
        <div class="form-actions">
            <RouterLink class="button button--outline" :to="{name: 'cocktails.show', params: {id: cocktailId}}" v-if="cocktailId">Cancel</RouterLink>
            <RouterLink class="button button--outline" :to="{name: 'cocktails'}" v-else>Cancel</RouterLink>
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
            isLoading: false,
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
        this.isLoading = true;
        this.cocktailId = this.$route.query.id || null;

        if (this.cocktailId) {
            api.fetchCocktail(this.cocktailId).then(data => {
                this.cocktail = data;
                this.images[0].copyright = this.cocktail.image_copyright;
                this.isLoading = false;
            })
        }

        api.fetchIngredients().then(data => {
            this.ingredients = data
            this.isLoading = false;
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
        async submit() {
            this.isLoading = true;

            const postData = {
                name: this.cocktail.name,
                description: this.cocktail.description,
                instructions: this.cocktail.instructions,
                history: this.cocktail.history,
                garnish: this.cocktail.garnish,
                source: this.cocktail.source,
                images: [],
                tags: this.cocktail.tags,
                ingredients: this.cocktail.ingredients
            };

            const image = this.$refs.image.files[0] || null;

            if (image) {
                const formData = new FormData();
                formData.append('images[0][image]', image)
                formData.append('images[0][copyright]', this.images[0].copyright)

                const resp = await api.uploadImages(formData).catch(e => {
                    this.$toast.error('An error occured while uploading images!');
                    console.error(e)
                });

                if (resp) {
                    postData.images.push(resp[0].id);
                }
            }

            if (this.cocktailId) {
                api.updateCocktail(this.cocktailId, postData).then(data => {
                    this.isLoading = false;
                    this.$toast.open({
                        message: `Cocktail updated successfully.`
                    });
                    this.$router.push({ name: 'cocktails.show', params: { id: data.id } })
                })
            } else {
                api.saveCocktail(postData).then(data => {
                    this.isLoading = false;
                    this.$toast.open({
                        message: 'Cocktail created successfully.'
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
