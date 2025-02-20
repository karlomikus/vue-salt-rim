<template>
    <PageHeader>
        {{ $t('ingredient.title') }}
    </PageHeader>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <h3 class="form-section-title">{{ $t('ingredient.information') }}</h3>
        <div class="block-container block-container--padded">
            <div class="form-group">
                <label class="form-label form-label--required" for="name">{{ $t('name') }}:</label>
                <input id="name" v-model="ingredient.name" class="form-input" type="text" required>
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
            <div class="form-group">
                <label class="form-label" for="calculator">{{ $t('ingredient.attach-calculator') }}:</label>
                <select id="calculator" v-model="ingredient.calculator_id" class="form-select">
                    <option :value="null">{{ $t('none') }}</option>
                    <option v-for="calc in calculators" :key="calc.id" :value="calc.id">{{ calc.name }}</option>
                </select>
            </div>
        </div>
        <h3 class="form-section-title">{{ $t('recipe-matching') }}</h3>
        <div class="block-container block-container--padded">
            <div class="form-group">
                <SaltRimCheckbox id="parent-ingredient-checkbox" v-model="isParent" :label="$t('ingredient.is-variety')" :description="'[EXPERIMENTAL] ' + $t('ingredient.variety-note')"></SaltRimCheckbox>
            </div>
            <div v-show="isParent" class="form-group" v-if="bar.search_host">
                <IngredientFinder v-show="ingredient.hierarchy.parent_ingredient == null" :search-token="bar.search_token" v-model="ingredient.hierarchy.parent_ingredient" :disabled-ingredients="disabledFinderIngredients"></IngredientFinder>
                <div v-if="ingredient.hierarchy.parent_ingredient" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    {{ ingredient.hierarchy.parent_ingredient.name }} &middot; <a href="#" @click.prevent="ingredient.hierarchy.parent_ingredient = null">{{ $t('remove') }}</a>
                </div>
            </div>
            <div class="form-group">
                <SaltRimCheckbox id="complex-ingredient-checkbox" v-model="isComplex" :label="$t('ingredient.is-complex')" :description="$t('ingredient.complex-note')"></SaltRimCheckbox>
            </div>
            <div v-show="isComplex" class="ingredient-form__complex-ingredients" v-if="bar.search_host">
                <div>
                    <IngredientFinder :selected-ingredients="ingredient.ingredient_parts.map(i => i.id)" :search-token="bar.search_token" @ingredient-selected="selectIngredientPart" :disabled-ingredients="disabledFinderIngredients"></IngredientFinder>
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
                <div v-show="ingredient.prices.length === 0" class="ingredient-prices__onboard">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                        <path d="M184,89.57V84c0-25.08-37.83-44-88-44S8,58.92,8,84v40c0,20.89,26.25,37.49,64,42.46V172c0,25.08,37.83,44,88,44s88-18.92,88-44V132C248,111.3,222.58,94.68,184,89.57ZM232,132c0,13.22-30.79,28-72,28-3.73,0-7.43-.13-11.08-.37C170.49,151.77,184,139,184,124V105.74C213.87,110.19,232,122.27,232,132ZM72,150.25V126.46A183.74,183.74,0,0,0,96,128a183.74,183.74,0,0,0,24-1.54v23.79A163,163,0,0,1,96,152,163,163,0,0,1,72,150.25Zm96-40.32V124c0,8.39-12.41,17.4-32,22.87V123.5C148.91,120.37,159.84,115.71,168,109.93ZM96,56c41.21,0,72,14.78,72,28s-30.79,28-72,28S24,97.22,24,84,54.79,56,96,56ZM24,124V109.93c8.16,5.78,19.09,10.44,32,13.57v23.37C36.41,141.4,24,132.39,24,124Zm64,48v-4.17c2.63.1,5.29.17,8,.17,3.88,0,7.67-.13,11.39-.35A121.92,121.92,0,0,0,120,171.41v23.46C100.41,189.4,88,180.39,88,172Zm48,26.25V174.4a179.48,179.48,0,0,0,24,1.6,183.74,183.74,0,0,0,24-1.54v23.79a165.45,165.45,0,0,1-48,0Zm64-3.38V171.5c12.91-3.13,23.84-7.79,32-13.57V172C232,180.39,219.59,189.4,200,194.87Z"></path>
                    </svg>
                    <p>Here you can manage this ingredient's prices. Start by adding your first price.</p>
                </div>
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
                <div style="text-align: center;">
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
import CloseButton from '../CloseButton.vue'
import { useTitle } from '@/composables/title'
import AppState from '@/AppState.js'

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
        CloseButton
    },
    data() {
        return {
            appState: new AppState(),
            isLoading: false,
            isParent: false,
            isComplex: false,
            bar: {
                search_host: null,
                search_token: null,
            },
            ingredient: {
                id: null,
                color: '#000',
                images: [],
                ingredient_parts: [],
                hierarchy: {},
                prices: [],
                calculator_id: null,
            },
            priceCategories: [],
            calculators: [],
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
    async created() {
        useTitle(this.$t('ingredient.add'))

        const ingredientId = this.$route.query.id || null

        this.bar = (await BarAssistantClient.getBar(this.appState.bar.id)).data ?? {}

        if (ingredientId) {
            this.ingredient.id = ingredientId
            this.refreshIngredient()
        }

        this.refreshPriceCategories()
        this.refreshCalculators()
    },
    methods: {
        refreshIngredient() {
            this.isLoading = true
            BarAssistantClient.getIngredient(this.ingredient.id).then(resp => {
                resp.data.description = Utils.decodeHtml(resp.data.description)

                this.ingredient = resp.data
                this.isParent = this.ingredient.hierarchy.parent_ingredient != null
                this.isComplex = this.ingredient.ingredient_parts.length > 0

                useTitle(`${this.$t('ingredient.title')} \u22C5 ${this.ingredient.name}`)
                this.isLoading = false
            })
        },
        refreshCalculators() {
            BarAssistantClient.getCalculators().then(resp => {
                this.calculators = resp.data
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
                calculator_id: this.ingredient.calculator_id,
                parent_ingredient_id: this.isParent && this.ingredient.hierarchy.parent_ingredient ? this.ingredient.hierarchy.parent_ingredient.id : null,
                images: [],
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

.ingredient-prices__onboard {
    text-align: center;
}

.ingredient-prices__onboard p {
    max-width: 400px;
    margin: 0 auto;
}

.ingredient-prices__onboard svg {
    height: 64px;
    fill: var(--clr-gray-700);
}
</style>