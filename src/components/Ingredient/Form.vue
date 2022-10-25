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
                <option :value="undefined" disabled>Select a category...</option>
                <option v-for="cat in categories" :value="cat.id">{{ cat.name }}</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label form-label--required" for="strength">Strength (%):</label>
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
            <input class="form-input" type="file" id="images" ref="image">
        </div>
        <div class="form-group">
            <label class="form-label" for="copyright">Image copyright:</label>
            <input class="form-input" type="text" id="copyright" v-model="images[0].copyright">
        </div>
        <div class="form-actions">
            <RouterLink class="button button--outline" :to="{name: 'ingredients'}">Cancel</RouterLink>
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
            ingredientId: null,
            ingredient: {},
            images: [
                {image: null, copyright: null}
            ],
            categories: []
        };
    },
    created() {
        document.title = `Ingredient Form \u22C5 Salt Rim`

        this.ingredientId = this.$route.query.id || null;

        if (this.ingredientId) {
            api.fetchIngredient(this.ingredientId).then(data => {
                this.ingredient = data;
                this.images[0].copyright = this.ingredient.image_copyright;

                document.title = `Ingredient Form \u22C5 ${this.ingredient.name} \u22C5 Salt Rim`
            })
        }

        api.fetchIngredientCategories().then(data => {
            this.categories = data
        })
    },
    methods: {
        async submit() {
            const postData = {
                name: this.ingredient.name,
                description: this.ingredient.description,
                strength: this.ingredient.strength,
                origin: this.ingredient.origin,
                color: this.ingredient.color,
                images: [],
                ingredient_category_id: this.ingredient.ingredient_category_id,
            };

            const image = this.$refs.image.files[0] || null;

            if (image) {
                const formData = new FormData();
                formData.append('images[0][image]', image)
                formData.append('images[0][copyright]', this.images[0].copyright)

                const resp = await api.uploadImages(formData).catch(e => {
                    this.$toast.error('An error occured while uploading images. Your ingredient is still saved.');
                });

                if (resp) {
                    postData.images.push(resp[0].id);
                }
            }

            if (this.ingredientId) {
                api.updateIngredient(this.ingredientId, postData).then(data => {
                    this.$toast.default('Ingredient updated');
                    this.$router.push({ name: 'ingredients.show', params: { id: data.id } })
                })
            } else {
                api.saveIngredient(postData).then(data => {
                    this.$toast.default('Ingredient created');
                    this.$router.push({ name: 'ingredients.show', params: { id: data.id } })
                })
            }
        }
    }
}
</script>
