<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <PageHeader>
            {{ $t('ingredient') }}
        </PageHeader>
        <h3 class="form-section-title">{{ $t('ingredient-information') }}</h3>
        <div class="block-container block-container--padded">
            <div class="form-group">
                <label class="form-label form-label--required" for="name">{{ $t('name') }}:</label>
                <input class="form-input" type="text" id="name" v-model="ingredient.name" required>
            </div>
            <div class="form-group">
                <label class="form-label form-label--required" for="category">{{ $t('category') }}:</label>
                <select class="form-select" id="category" v-model="ingredient.ingredient_category_id" required>
                    <option :value="undefined" disabled>{{ $t('select-category') }}</option>
                    <option v-for="cat in categories" :value="cat.id">{{ cat.name }}</option>
                </select>
                <p class="form-input-hint">
                    <RouterLink :to="{name: 'settings.categories'}" target="_blank">{{ $t('edit-categories') }}</RouterLink>
                </p>
            </div>
            <div style="margin: 1rem 0;">
                <Checkbox v-model="isParent" id="is-variety">{{ $t('ingredient-is-variety') }}</Checkbox>
            </div>
            <div class="form-group" v-show="isParent">
                <label class="form-label" for="parent-ingredient">{{ $t('parent-ingredient') }}:</label>
                <IngredientFinder v-model="ingredient.parent_ingredient" :block="blockIngredients"></IngredientFinder>
            </div>
            <div class="form-group">
                <label class="form-label form-label--required" for="strength">{{ $t('strength') }} ({{ $t('ABV') }} %):</label>
                <input class="form-input" type="text" id="strength" v-model="ingredient.strength" required>
            </div>
            <div class="form-group">
                <label class="form-label" for="description">{{ $t('description') }}:</label>
                <textarea rows="4" class="form-input" id="description" v-model="ingredient.description"></textarea>
                <p class="form-input-hint">{{ $t('md.support') }}</p>
            </div>
            <div class="form-group">
                <label class="form-label" for="origin">{{ $t('origin') }}:</label>
                <input class="form-input" type="text" id="origin" v-model="ingredient.origin">
            </div>
            <div class="form-group">
                <label class="form-label" for="color">{{ $t('color') }}:</label>
                <input class="form-input" type="color" id="color" v-model="ingredient.color" style="width: 100%">
            </div>
        </div>
        <h3 class="form-section-title">{{ $t('media') }}</h3>
        <ImageUpload ref="imagesUpload" :value="ingredient.images" :max-images="1" />
        <div class="form-actions">
            <RouterLink v-if="ingredientId" class="button button--outline" :to="{name: 'ingredients.show', params: { id: ingredientId }}">{{ $t('cancel') }}</RouterLink>
            <RouterLink v-else class="button button--outline" :to="{name: 'ingredients'}">{{ $t('cancel') }}</RouterLink>
            <button class="button button--dark" type="submit">{{ $t('save') }}</button>
        </div>
    </form>
</template>

<script>
import ApiRequests from "@/ApiRequests";
import Utils from "@/Utils";
import ImageUpload from '@/components/ImageUpload.vue'
import PageHeader from '@/components/PageHeader.vue'
import OverlayLoader from '@/components/OverlayLoader.vue'
import Checkbox from '@/components/Checkbox.vue'
import IngredientFinder from '@/components/IngredientFinder.vue'

export default {
    data() {
        return {
            isLoading: false,
            ingredientId: null,
            isParent: false,
            ingredients: [],
            ingredient: {
                color: '#000',
                images: []
            },
            categories: []
        };
    },
    components: {
        ImageUpload,
        PageHeader,
        OverlayLoader,
        Checkbox,
        IngredientFinder
    },
    created() {
        document.title = `${this.$t('ingredient')} \u22C5 ${this.site_title}`

        this.ingredientId = this.$route.query.id || null;

        if (this.ingredientId) {
            this.isLoading = true;
            ApiRequests.fetchIngredient(this.ingredientId).then(data => {
                data.description = Utils.decodeHtml(data.description);

                this.ingredient = data;
                this.isParent = this.ingredient.parent_ingredient != null;

                document.title = `${this.$t('ingredient')} \u22C5 ${this.ingredient.name} \u22C5 ${this.site_title}`
                this.isLoading = false;
            })
        }

        ApiRequests.fetchIngredientCategories().then(data => {
            this.categories = data
        })
    },
    computed: {
        blockIngredients() {
            if (!this.ingredient.id) {
                return [];
            }

            return [this.ingredient.id];
        }
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
                parent_ingredient_id: this.isParent && this.ingredient.parent_ingredient ? this.ingredient.parent_ingredient.id : null,
                images: [],
                ingredient_category_id: this.ingredient.ingredient_category_id,
            };

            const imageResources = await this.$refs.imagesUpload.uploadPictures().catch(() => {
                this.$toast.error(`${this.$t('image-upload-error')} ${this.$t('image-upload-error.ingredient')}`);
            }) || [];

            if (imageResources.length > 0) {
                postData.images = imageResources.map(img => img.id);
            }

            if (this.ingredientId) {
                ApiRequests.updateIngredient(this.ingredientId, postData).then(data => {
                    this.$toast.default(this.$t('ingredient.update-success'));
                    this.$router.push({ name: 'ingredients.show', params: { id: data.id } })
                    this.isLoading = false;
                }).catch(e => {
                    this.$toast.error(e.message);
                    this.isLoading = false;
                    this.isLoading = false;
                })
            } else {
                ApiRequests.saveIngredient(postData).then(data => {
                    this.$toast.default(this.$t('ingredient.create-success'));
                    this.$router.push({ name: 'ingredients.show', params: { id: data.id } })
                    this.isLoading = false;
                }).catch(e => {
                    this.$toast.error(e.message);
                    this.isLoading = false;
                    this.isLoading = false;
                })
            }
        }
    }
}
</script>
