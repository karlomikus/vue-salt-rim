<script setup>
import ImageUpload from './../ImageUpload.vue'
import { ColorPicker } from 'vue-accessible-color-picker'
</script>

<template>
    <form @submit.prevent="submit">
        <h2 class="page-subtitle">Ingredient information</h2>
        <div class="form-group">
            <label class="form-label form-label--required" for="name">Name:</label>
            <input class="form-input" type="text" id="name" v-model="ingredient.name" required>
        </div>
        <div class="form-group">
            <label class="form-label form-label--required" for="category">Category:</label>
            <select class="form-select" id="category" v-model="ingredient.ingredient_category_id" required>
                <option :value="undefined" disabled>Select a category...</option>
                <option v-for="cat in categories" :value="cat.id">{{ cat.name }}</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label form-label--required" for="strength">Strength (ABV %):</label>
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
            <button type="button" class="colorpicker-button" @click="showColorPicker = !showColorPicker">
                <span :style="{'background-color': ingredient.color}"></span>
            </button>
            <!-- <input class="form-input" type="text" id="color" v-model="ingredient.color"> -->
            <ColorPicker v-if="showColorPicker" alpha-channel="hide" :visible-formats="['hex']" :color="ingredient.color" @color-change="updateColor" />
        </div>
        <ImageUpload ref="imagesUpload" :value="ingredient.images" />
        <div class="form-actions">
            <RouterLink class="button button--outline" :to="{name: 'ingredients'}">Cancel</RouterLink>
            <button class="button button--dark" type="submit">Save</button>
        </div>
    </form>
</template>

<script>
import ApiRequests from "../../ApiRequests";

export default {
    data() {
        return {
            ingredientId: null,
            showColorPicker: false,
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
            ApiRequests.fetchIngredient(this.ingredientId).then(data => {
                this.ingredient = data;
                this.images[0].copyright = this.ingredient.image_copyright;

                document.title = `Ingredient Form \u22C5 ${this.ingredient.name} \u22C5 Salt Rim`
            })
        }

        ApiRequests.fetchIngredientCategories().then(data => {
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

            const imageResources = await this.$refs.imagesUpload.uploadPictures().catch(() => {
                this.$toast.error('An error occured while uploading images. Your ingredient is still saved.');
            }) || [];
            
            postData.images = imageResources.map(img => img.id);

            if (this.ingredientId) {
                ApiRequests.updateIngredient(this.ingredientId, postData).then(data => {
                    this.$toast.default('Ingredient updated');
                    this.$router.push({ name: 'ingredients.show', params: { id: data.id } })
                }).catch(async errorResponse => {
                    if (errorResponse.status == 422) {
                        const body = await errorResponse.json();
                        this.$toast.error(body.message);
                    } else {
                        this.$toast.error(`Error occured: ${errorResponse.status}`);
                    }

                    this.isLoading = false;
                })
            } else {
                ApiRequests.saveIngredient(postData).then(data => {
                    this.$toast.default('Ingredient created');
                    this.$router.push({ name: 'ingredients.show', params: { id: data.id } })
                }).catch(async errorResponse => {
                    if (errorResponse.status == 422) {
                        const body = await errorResponse.json();
                        this.$toast.error(body.message);
                    } else {
                        this.$toast.error(`Error occured: ${errorResponse.status}`);
                    }

                    this.isLoading = false;
                })
            }
        },
        updateColor(eventData) {
            this.ingredient.color = eventData.cssColor
        }
    }
}
</script>
<style scoped>
.colorpicker-button {
    padding: 10px;
    width: 100%;
    display: flex;
    background: rgba(255, 255, 255, .5);
    border-radius: 5px;
    height: 3rem;
    border: 2px solid var(--color-bg-dark);
    border-top-color: transparent;
    border-left-color: transparent;
    border-right-color: transparent;
}

.colorpicker-button span {
    display: flex;
    width: 100%;
}
</style>
