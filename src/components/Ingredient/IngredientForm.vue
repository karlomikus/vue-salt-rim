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
                <SaltRimCheckbox id="parent-ingredient-checkbox" v-model="isParent" :label="$t('ingredient.is-variety')" :description="'[EXPERIMENTAL] ' + $t('ingredient.variety-note')"></SaltRimCheckbox>
            </div>
            <div v-show="isParent" class="form-group">
                <IngredientFinder v-show="ingredient.parent_ingredient == null" v-model="ingredient.parent_ingredient" :disabled-ingredients="disabledFinderIngredients"></IngredientFinder>
                <div v-if="ingredient.parent_ingredient" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    {{ ingredient.parent_ingredient.name }} &middot; <a href="#" @click.prevent="ingredient.parent_ingredient = null">{{ $t('remove') }}</a>
                </div>
            </div>
            <div class="form-group">
                <SaltRimCheckbox id="complex-ingredient-checkbox" v-model="isComplex" :label="$t('ingredient.is-complex')" :description="$t('ingredient.complex-note')"></SaltRimCheckbox>
            </div>
            <div v-show="isComplex" class="ingredient-form__complex-ingredients">
                <div>
                    <IngredientFinder :selected-ingredients="ingredient.ingredient_parts.map(i => i.id)" @ingredient-selected="selectIngredientPart" :disabled-ingredients="disabledFinderIngredients"></IngredientFinder>
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
        <ImageUpload ref="imagesUpload" :images="ingredient.images" :max-images="1" />
        <h3 class="form-section-title">{{ $t('price.prices') }}</h3>
        <div class="block-container block-container--padded block-container--inset ingredient-prices">
            <template v-if="priceCategories.length > 0">
                <div v-for="(price, idx) in ingredient.prices" :key="idx" class="block-container ingredient-prices__price">
                    <CloseButton @closed="removeIngredientPrice(price)"></CloseButton>
                    <div class="form-group" style="width: 100%; max-width: 300px;">
                        <label class="form-label form-label--required" :for="'ingredient-price-category-' + idx">{{ $t('price.category') }}</label>
                        <select :id="'ingredient-price-category-' + idx" v-model="price.price_category.id" class="form-select" required>
                            <option :value="null" disabled>Select price category</option>
                            <hr>
                            <optgroup v-for="(priceCategoriesPerCurrency, currency) in groupedPriceCategories" :key="currency" :label="currency">
                                <option v-for="pc in priceCategoriesPerCurrency" :key="pc.id" :value="pc.id">{{ pc.name }}</option>
                            </optgroup>
                        </select>
                    </div>
                    <div class="form-group" style="max-width: 150px;">
                        <label class="form-label form-label--required" :for="'ingredient-price-price-' + idx">{{ $t('price.price') }} <template v-if="price.price_category.id">({{ priceCategories.find(p => p.id == price.price_category.id).currency }})</template></label>
                        <input :id="'ingredient-price-price-' + idx" v-model="price.price.price" type="text" class="form-input" required>
                    </div>
                    <div class="form-group" style="max-width: 150px;">
                        <label class="form-label form-label--required" :for="'ingredient-price-vol-' + idx">{{ $t('amount') }}</label>
                        <input :id="'ingredient-price-vol-' + idx" v-model="price.amount" type="text" class="form-input" required>
                    </div>
                    <div class="form-group" style="max-width: 100px;">
                        <label class="form-label form-label--required" :for="'ingredient-price-units-' + idx">{{ $t('units') }}</label>
                        <input :id="'ingredient-price-units-' + idx" v-model="price.units" type="text" class="form-input" required>
                    </div>
                    <div class="form-group" style="max-width: 300px;">
                        <label class="form-label" :for="'ingredient-price-description-' + idx">{{ $t('description') }}</label>
                        <input :id="'ingredient-price-description-' + idx" v-model="price.description" type="text" class="form-input">
                    </div>
                </div>
                <div>
                    <button class="button button--dark" type="button" @click="addIngredientPrice">{{ $t('prices.add') }}</button>
                </div>
            </template>
            <div v-else>
                To add ingredient prices, you need to define bar <RouterLink :to="{name: 'settings.price-categories'}">price categories</RouterLink> first.
            </div>
        </div>
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
import BarAssistantClient from '@/api/BarAssistantClient'
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
import CloseButton from '../CloseButton.vue'
import { useTitle } from '@/composables/title'

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
        CategoryForm,
        CloseButton
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
                ingredient_parts: [],
                prices: [],
            },
            categories: [],
            priceCategories: [],
        }
    },
    computed: {
        disabledFinderIngredients() {
            if (!this.ingredient.id) {
                return []
            }

            return [this.ingredient.id]
        },
        groupedPriceCategories() {
            return this.priceCategories.reduce((acc, obj) => {
                const keyValue = obj['currency']
                if (!acc[keyValue]) {
                    acc[keyValue] = []
                }
                acc[keyValue].push(obj)

                return acc
            }, {})
        }
    },
    created() {
        useTitle(this.$t('ingredient.add'))

        const ingredientId = this.$route.query.id || null

        if (ingredientId) {
            this.ingredient.id = ingredientId
            this.refreshIngredient()
        }

        this.refreshCategories()
        this.refreshPriceCategories()
    },
    methods: {
        refreshIngredient() {
            this.isLoading = true
            BarAssistantClient.getIngredient(this.ingredient.id).then(resp => {
                resp.data.description = Utils.decodeHtml(resp.data.description)

                this.ingredient = resp.data
                this.isParent = this.ingredient.parent_ingredient != null
                this.isComplex = this.ingredient.ingredient_parts.length > 0
                if (resp.data.category) {
                    this.ingredientCategoryId = resp.data.category.id
                }

                useTitle(`${this.$t('ingredient.title')} \u22C5 ${this.ingredient.name}`)
                this.isLoading = false
            })
        },
        refreshCategories() {
            BarAssistantClient.getIngredientCategories().then(resp => {
                this.categories = resp.data
            })
        },
        refreshPriceCategories() {
            BarAssistantClient.getPriceCategories().then(resp => {
                this.priceCategories = resp.data
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
        addIngredientPrice() {
            this.ingredient.prices.push({price_category: {id: null}, price: {}})
        },
        removeIngredientPrice(price) {
            this.ingredient.prices.splice(this.ingredient.prices.indexOf(price), 1)
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
                prices: this.ingredient.prices.filter(p => p.price_category.id != null).map(p => ({
                    price_category_id: p.price_category.id,
                    price: p.price.price,
                    amount: p.amount,
                    units: p.units,
                    description: p.description,
                }))
            }

            const imageResources = await this.$refs.imagesUpload.save().catch(() => {
                this.$toast.error(`${this.$t('imageupload.error')} ${this.$t('imageupload.error-ingredient')}`)
            }) || []

            if (imageResources.length > 0) {
                postData.images = imageResources.map(img => img.id)
            }

            if (this.ingredient.id) {
                BarAssistantClient.updateIngredient(this.ingredient.id, postData).then(resp => {
                    this.$toast.default(this.$t('ingredient.update-success'))
                    this.$router.push({ name: 'ingredients.show', params: { id: resp.data.slug } })
                    this.isLoading = false
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false
                    this.isLoading = false
                })
            } else {
                BarAssistantClient.saveIngredient(postData).then(resp => {
                    this.$toast.default(this.$t('ingredient.create-success'))
                    this.$router.push({ name: 'ingredients.show', params: { id: resp.data.slug } })
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

.ingredient-prices {
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-3);
}

.ingredient-prices__price {
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-size-3);
    flex-direction: row;
    padding: var(--gap-size-3);
}

.ingredient-prices__price .form-group {
    margin: 0;
}
</style>