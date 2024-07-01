<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <PageHeader>
            {{ $t('ingredient.title') }}
        </PageHeader>
        <h3 class="form-section-title">{{ $t('ingredient.information') }}</h3>
        <div class="block-container block-container--padded">
            <div class="form-group">
                <label class="form-label form-label--required" for="name">{{ $t('name') }}:</label>
                <input id="name" v-model="ingredient.name" class="form-input" type="text" required>
            </div>
            <div class="form-group">
                <label class="form-label" for="category">{{ $t('category.title') }}:</label>
                <select id="category" v-model="ingredientCategoryId" class="form-select" required>
                    <option :value="null" disabled>{{ $t('select-category') }}</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
                <p class="form-input-hint">
                    <SaltRimDialog v-model="showCategoryDialog">
                        <template #trigger>
                            <a href="#" @click.prevent="showCategoryDialog = true">{{ $t('category.add') }}</a>
                        </template>
                        <template #dialog>
                            <CategoryForm :dialog-title="$t('category.add')" @category-dialog-closed="handleCategoryDialogClosed" />
                        </template>
                    </SaltRimDialog>
                </p>
            </div>
            <div class="form-group">
                <label class="form-label" for="description">{{ $t('description') }}:</label>
                <textarea id="description" v-model="ingredient.description" rows="4" class="form-input"></textarea>
                <p class="form-input-hint">{{ $t('field-supports-md') }}</p>
            </div>
            <div class="form-group">
                <label class="form-label" for="strength">{{ $t('strength') }} ({{ $t('ABV') }} %):</label>
                <input id="strength" v-model="ingredient.strength" class="form-input" type="text">
            </div>
            <div class="sr-grid sr-grid--2-col">
                <div class="form-group">
                    <label class="form-label" for="origin">{{ $t('origin') }}:</label>
                    <input id="origin" v-model="ingredient.origin" class="form-input" type="text">
                </div>
                <div class="form-group">
                    <label class="form-label" for="color">{{ $t('color') }}:</label>
                    <input id="color" v-model="ingredient.color" class="form-input" type="color" style="width: 100%">
                </div>
            </div>
        </div>
        <h3 class="form-section-title">{{ $t('recipe-matching') }}</h3>
        <div class="block-container block-container--padded">
            <div class="form-group">
                <SaltRimCheckbox id="parent-ingredient-checkbox" v-model="isParent" :label="$t('ingredient.is-variety')" :description="$t('ingredient.variety-note')"></SaltRimCheckbox>
            </div>
            <div v-show="isParent" class="form-group">
                <IngredientFinder v-show="ingredient.parent_ingredient == null" v-model="ingredient.parent_ingredient" :disabled-ingredients="disabledFinderIngredients"></IngredientFinder>
                <div v-if="ingredient.parent_ingredient" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button type="button" class="button button--outline">{{ ingredient.parent_ingredient.name }}</button>
                    <button type="button" class="button button--dark" @click="ingredient.parent_ingredient = null">{{ $t('remove') }}</button>
                </div>
            </div>
            <div class="form-group">
                <SaltRimCheckbox id="complex-ingredient-checkbox" v-model="isComplex" :label="$t('ingredient.is-complex')" :description="$t('ingredient.complex-note')"></SaltRimCheckbox>
            </div>
            <div v-show="isComplex" class="ingredient-form__complex-ingredients">
                <div>
                    <IngredientFinder @ingredient-selected="selectIngredientPart"></IngredientFinder>
                </div>
                <div>
                    <ul v-if="ingredient.ingredient_parts.length > 0" class="block-container block-container--inset ingredient-form__complex-ingredients__list">
                        <li v-for="part in ingredient.ingredient_parts" :key="part.id">{{ part.name }} &middot; <a href="#" @click.prevent="removeIngredientPart(part)">{{ $t('remove') }}</a></li>
                    </ul>
                    <EmptyState v-else>{{ $t('ingredients-not-selected') }}</EmptyState>
                </div>
            </div>
        </div>
        <h3 class="form-section-title">{{ $t('media') }}</h3>
        <ImageUpload ref="imagesUpload" :value="ingredient.images" :max-images="1" />
        <div class="form-actions form-actions--timestamps">
            <TimeStamps v-if="ingredient.id" :resource="ingredient"></TimeStamps>
            <div class="form-actions__buttons">
                <RouterLink v-if="ingredient.id" class="button button--outline" :to="{ name: 'ingredients.show', params: { id: ingredient.id } }">{{ $t('cancel') }}</RouterLink>
                <RouterLink v-else class="button button--outline" :to="{ name: 'ingredients' }">{{ $t('cancel') }}</RouterLink>
                <button class="button button--dark" type="submit">{{ $t('save') }}</button>
            </div>
        </div>
    </form>
</template>

<script>
import ApiRequests from './../../ApiRequests.js'
import Utils from './../../Utils.js'
import ImageUpload from './../ImageUpload.vue'
import PageHeader from './../PageHeader.vue'
import OverlayLoader from './../OverlayLoader.vue'
import IngredientFinder from './../IngredientFinder.vue'
import TimeStamps from '../TimeStamps.vue'
import EmptyState from '../EmptyState.vue'
import SaltRimCheckbox from '../SaltRimCheckbox.vue'
import SaltRimDialog from '../Dialog/SaltRimDialog.vue'
import CategoryForm from '../Settings/CategoryForm.vue'

export default {
    components: {
        ImageUpload,
        PageHeader,
        OverlayLoader,
        IngredientFinder,
        TimeStamps,
        EmptyState,
        SaltRimCheckbox,
        SaltRimDialog,
        CategoryForm
    },
    data() {
        return {
            isLoading: false,
            isParent: false,
            isComplex: false,
            showCategoryDialog: false,
            ingredientCategoryId: null,
            ingredient: {
                id: null,
                color: '#000',
                category: {},
                images: [],
                ingredient_parts: []
            },
            categories: []
        }
    },
    computed: {
        disabledFinderIngredients() {
            if (!this.ingredient.id) {
                return []
            }

            return [this.ingredient.id]
        }
    },
    created() {
        document.title = `${this.$t('ingredient.title')} \u22C5 ${this.site_title}`

        const ingredientId = this.$route.query.id || null

        if (ingredientId) {
            this.ingredient.id = ingredientId
            this.refreshIngredient()
        }

        this.refreshCategories()
    },
    methods: {
        refreshIngredient() {
            this.isLoading = true
            ApiRequests.fetchIngredient(this.ingredient.id).then(data => {
                data.description = Utils.decodeHtml(data.description)

                this.ingredient = data
                this.isParent = this.ingredient.parent_ingredient != null
                this.isComplex = this.ingredient.ingredient_parts.length > 0
                if (data.category) {
                    this.ingredientCategoryId = data.category.id
                }

                document.title = `${this.$t('ingredient.title')} \u22C5 ${this.ingredient.name} \u22C5 ${this.site_title}`
                this.isLoading = false
            })
        },
        refreshCategories() {
            ApiRequests.fetchIngredientCategories().then(data => {
                this.categories = data
            })
        },
        selectIngredientPart(ingredient) {
            if (this.ingredient.ingredient_parts.some(ing => ing.id == ingredient.id)) {
                return
            }

            this.ingredient.ingredient_parts.push(ingredient)
        },
        removeIngredientPart(ingredient) {
            this.ingredient.ingredient_parts.splice(
                this.ingredient.ingredient_parts.findIndex(i => i == ingredient),
                1
            )
        },
        handleCategoryDialogClosed(eventPayload) {
            this.showCategoryDialog = false
            if (eventPayload) {
                this.ingredientCategoryId = eventPayload.id
                this.refreshCategories()
            }
        },
        async submit() {
            this.isLoading = true

            if (!this.isComplex) {
                this.ingredient.ingredient_parts = []
            }

            if (!this.ingredient.strength) {
                this.ingredient.strength = 0
            }

            const postData = {
                name: this.ingredient.name,
                description: this.ingredient.description,
                strength: this.ingredient.strength,
                origin: this.ingredient.origin,
                color: this.ingredient.color,
                parent_ingredient_id: this.isParent && this.ingredient.parent_ingredient ? this.ingredient.parent_ingredient.id : null,
                images: [],
                ingredient_category_id: this.ingredientCategoryId,
                complex_ingredient_part_ids: [...new Set(this.ingredient.ingredient_parts.map(i => i.id))],
            }

            const imageResources = await this.$refs.imagesUpload.uploadPictures().catch(() => {
                this.$toast.error(`${this.$t('imageupload.error')} ${this.$t('imageupload.error-ingredient')}`)
            }) || []

            if (imageResources.length > 0) {
                postData.images = imageResources.map(img => img.id)
            }

            if (this.ingredient.id) {
                ApiRequests.updateIngredient(this.ingredient.id, postData).then(data => {
                    this.$toast.default(this.$t('ingredient.update-success'))
                    this.$router.push({ name: 'ingredients.show', params: { id: data.slug } })
                    this.isLoading = false
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false
                    this.isLoading = false
                })
            } else {
                ApiRequests.saveIngredient(postData).then(data => {
                    this.$toast.default(this.$t('ingredient.create-success'))
                    this.$router.push({ name: 'ingredients.show', params: { id: data.slug } })
                    this.isLoading = false
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false
                    this.isLoading = false
                })
            }
        }
    }
}
</script>

<style scoped>
.ingredient-form__complex-ingredients {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--gap-size-3);
}

@media (max-width: 550px) {
    .ingredient-form__complex-ingredients {
        grid-template-columns: 1fr;
    }
}

.ingredient-form__complex-ingredients__list {
    list-style: none;
    margin: 0;
    overflow-y: auto;
    max-height: 14rem;
    padding: 0.5rem;
}
</style>