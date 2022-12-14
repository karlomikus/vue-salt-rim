<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <PageHeader>
            Ingredient information
        </PageHeader>
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
            <p class="form-input-hint">
                <RouterLink :to="{name: 'settings.categories'}" target="_blank">Edit categories</RouterLink>
            </p>
        </div>
        <div class="form-group">
            <label class="form-label form-label--required" for="strength">Strength (ABV %):</label>
            <input class="form-input" type="text" id="strength" v-model="ingredient.strength" required>
        </div>
        <div class="form-group">
            <label class="form-label" for="description">Description:</label>
            <textarea rows="4" class="form-input" id="description" v-model="ingredient.description"></textarea>
            <p class="form-input-hint">This field supports markdown.</p>
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
            <ColorPicker v-if="showColorPicker" alpha-channel="hide" :visible-formats="['hex']" :color="ingredient.color ?? {}" @color-change="updateColor" />
        </div>
        <ImageUpload ref="imagesUpload" :value="ingredient.images" />
        <div class="form-actions">
            <RouterLink v-if="ingredientId" class="button button--outline" :to="{name: 'ingredients.show', params: { id: ingredientId }}">Cancel</RouterLink>
            <RouterLink v-else class="button button--outline" :to="{name: 'ingredients'}">Cancel</RouterLink>
            <button class="button button--dark" type="submit">Save</button>
        </div>
    </form>
</template>

<script>
import ApiRequests from "@/ApiRequests";
import Utils from "@/Utils";
import ImageUpload from '@/components/ImageUpload.vue'
import { ColorPicker } from 'vue-accessible-color-picker'
import PageHeader from '@/components/PageHeader.vue'
import OverlayLoader from '@/components/OverlayLoader.vue'

export default {
    data() {
        return {
            isLoading: false,
            ingredientId: null,
            showColorPicker: false,
            ingredient: {
                images: []
            },
            categories: []
        };
    },
    components: {
        ImageUpload,
        ColorPicker,
        PageHeader,
        OverlayLoader
    },
    created() {
        document.title = `Ingredient Form \u22C5 Salt Rim`

        this.ingredientId = this.$route.query.id || null;

        if (this.ingredientId) {
            this.isLoading = true;
            ApiRequests.fetchIngredient(this.ingredientId).then(data => {
                data.description = Utils.decodeHtml(data.description);

                this.ingredient = data;

                document.title = `Ingredient Form \u22C5 ${this.ingredient.name} \u22C5 Salt Rim`
                this.isLoading = false;
            })
        }

        ApiRequests.fetchIngredientCategories().then(data => {
            this.categories = data
        })
    },
    methods: {
        async submit() {
            this.isLoading = true;

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

            if (Array.isArray(imageResources)) {
                postData.images = imageResources.map(img => img.id);
            }

            if (this.ingredientId) {
                ApiRequests.updateIngredient(this.ingredientId, postData).then(data => {
                    this.$toast.default('Ingredient updated');
                    this.$router.push({ name: 'ingredients.show', params: { id: data.id } })
                    this.isLoading = false;
                }).catch(e => {
                    this.$toast.error(e.message);
                    this.isLoading = false;
                    this.isLoading = false;
                })
            } else {
                ApiRequests.saveIngredient(postData).then(data => {
                    this.$toast.default('Ingredient created');
                    this.$router.push({ name: 'ingredients.show', params: { id: data.id } })
                    this.isLoading = false;
                }).catch(e => {
                    this.$toast.error(e.message);
                    this.isLoading = false;
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
    cursor: pointer;
    padding: 10px;
    width: 100%;
    display: flex;
    background: rgba(255, 255, 255, .5);
    border-radius: 5px;
    height: 3rem;
    border: 2px solid var(--clr-red-300);
    border-top-color: transparent;
    border-left-color: transparent;
    border-right-color: transparent;
}

.colorpicker-button span {
    display: flex;
    width: 100%;
    height: 100%;
}

.colorpicker-button:hover,
.colorpicker-button:active,
.colorpicker-button:focus {
    background: #fff;
    border-color: var(--clr-gray-800);
}
</style>
