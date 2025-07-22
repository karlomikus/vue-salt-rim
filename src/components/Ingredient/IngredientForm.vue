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
                <div class="form-group-ai" v-if="ingredientPrompt">
                    <ButtonGenerate :prompt="ingredientPrompt" @before-generation="onBeforePrompt" @after-generation="onAfterPrompt"></ButtonGenerate>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label" for="description">{{ $t('description') }}:</label>
                <textarea id="description" v-model="ingredient.description" rows="10" class="form-input"></textarea>
                <p class="form-input-hint">{{ $t('field-supports-md') }}</p>
            </div>
            <div class="form-group">
                <label class="form-label" for="strength">{{ $t('strength') }} ({{ $t('ABV') }} %):</label>
                <input id="strength" v-model="ingredient.strength" class="form-input" type="text">
            </div>
            <div class="sr-grid sr-grid--3-col">
                <div class="form-group">
                    <label class="form-label" for="origin">{{ $t('origin') }}:</label>
                    <input id="origin" v-model="ingredient.origin" class="form-input" type="text">
                </div>
                <div class="form-group">
                    <label class="form-label" for="origin">{{ $t('distillery') }}:</label>
                    <input id="origin" v-model="ingredient.distillery" class="form-input" type="text">
                </div>
                <div class="form-group">
                    <label class="form-label" for="color">{{ $t('color') }}:</label>
                    <input id="color" v-model="ingredient.color" class="form-input" type="color" style="width: 100%">
                </div>
            </div>
            <div class="sr-grid sr-grid--3-col">
                <div class="form-group">
                    <label class="form-label" for="origin">{{ $t('sweetness') }}:</label>
                    <input id="origin" v-model="ingredient.sugar_g_per_ml" class="form-input" type="text">
                </div>
                <div class="form-group">
                    <label class="form-label" for="color">{{ $t('acidity') }}:</label>
                    <input id="color" v-model="ingredient.acidity" class="form-input" type="text">
                </div>
                <div class="form-group">
                    <label class="form-label" for="default-units">{{ $t('default-units') }}:</label>
                    <input id="default-units" v-model="ingredient.units" class="form-input" type="text">
                    <p class="form-input-hint">{{ t('ingredient.default-units-help') }}</p>
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
                <SaltRimCheckbox id="parent-ingredient-checkbox" v-model="isParent" :label="$t('ingredient.is-variety')" :description="$t('ingredient.variety-note')"></SaltRimCheckbox>
            </div>
            <div v-show="isParent" class="form-group" v-if="bar.search_host">
                <IngredientFinder v-if="bar.search_token" v-show="ingredient.hierarchy.parent_ingredient?.id == null" :search-token="bar.search_token" @ingredient-selected="selectParentIngredient" :disabled-ingredients="disabledFinderIngredients"></IngredientFinder>
                <div class="form-input form-input--auto-height" v-if="ingredient.hierarchy.parent_ingredient?.id">
                    {{ ingredient.hierarchy.parent_ingredient.name }} &middot; <a href="#" @click.prevent="ingredient.hierarchy.parent_ingredient = null">{{ $t('remove') }}</a>
                </div>
            </div>
            <div class="form-group">
                <SaltRimCheckbox id="complex-ingredient-checkbox" v-model="isComplex" :label="$t('ingredient.is-complex')" :description="$t('ingredient.complex-note')"></SaltRimCheckbox>
            </div>
            <div v-show="isComplex" class="ingredient-form__complex-ingredients" v-if="bar.search_host && ingredient.ingredient_parts">
                <div>
                    <IngredientFinder v-if="bar.search_token" :selected-ingredients="ingredient.ingredient_parts.map(i => i.id)" :search-token="bar.search_token" @ingredient-selected="selectIngredientPart" :disabled-ingredients="disabledFinderIngredients"></IngredientFinder>
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
        <ImageUpload ref="imagesUpload" :images="ingredient.images ?? []" :max-images="1" />
        <h3 class="form-section-title">{{ $t('price.prices') }}</h3>
        <div class="block-container block-container--padded block-container--inset ingredient-prices">
            <template v-if="priceCategories.length > 0">
                <div v-if="ingredient.prices && ingredient.prices.length === 0" class="ingredient-prices__onboard">
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
                            <option :value="0" disabled>Select price category</option>
                            <hr>
                            <optgroup v-for="(priceCategoriesPerCurrency, currency) in groupedPriceCategories" :key="currency" :label="currency">
                                <option v-for="pc in priceCategoriesPerCurrency" :key="pc.id" :value="pc.id">{{ pc.name }}</option>
                            </optgroup>
                        </select>
                    </div>
                    <div class="form-group" style="max-width: 150px;">
                        <label class="form-label form-label--required" :for="'ingredient-price-price-' + idx">{{ $t('price.price') }} <template v-if="price.price_category.id">({{ priceCategories.find(p => p.id == price.price_category.id)?.currency }})</template></label>
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
                <i18n-t keypath="price.missing-price-categories">
                    <template #link>
                        <RouterLink :to="{name: 'settings.price-categories'}" target="_blank">{{ t('prices.price-categories').toLocaleLowerCase() }}</RouterLink>
                    </template>
                </i18n-t>
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

<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import BarAssistantClient from '@/api/BarAssistantClient'
import ImageUpload from './../ImageUpload.vue'
import PageHeader from './../PageHeader.vue'
import OverlayLoader from './../OverlayLoader.vue'
import IngredientFinder from './../IngredientFinder.vue'
import TimeStamps from '../TimeStamps.vue'
import EmptyState from '../EmptyState.vue'
import SaltRimCheckbox from '../SaltRimCheckbox.vue'
import CloseButton from '../CloseButton.vue'
import { useTitle } from '@/composables/title'
import AppState from '@/AppState'
import { useHtmlDecode } from './../../composables/useHtmlDecode';
import type { components } from '@/api/api'
import { useI18n } from 'vue-i18n'
import { useSaltRimToast } from '@/composables/toast'
import { useRoute, useRouter } from 'vue-router'
import type { SearchResults } from '@/api/SearchResults'
import usePrompts from '@/composables/usePrompts'
import ButtonGenerate from '@/components/AI/ButtonGenerate.vue'

type Ingredient = components['schemas']['Ingredient']
type IngredientPrice = components['schemas']['IngredientPrice']
type IngredientBasic = components['schemas']['IngredientBasic']
type IngredientSearchResult = SearchResults['ingredient']
type Calculator = components['schemas']['Calculator']
type PriceCategory = components['schemas']['PriceCategory']

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const toast = useSaltRimToast()
const imageUpload = useTemplateRef('imagesUpload')
const isLoading = ref(false)
const isParent = ref(false)
const isComplex = ref(false)
const ingredient = ref<Ingredient>({
    hierarchy: {
        parent_ingredient: {},
    },
    prices: [] as IngredientPrice[],
    ingredient_parts: [] as IngredientBasic[],
} as Ingredient)
const calculators = ref<Calculator[]>([])
const appState = new AppState()
const bar = appState.bar
const priceCategories = ref<PriceCategory[]>([])
const prompts = usePrompts()

const onBeforePrompt = () => {
    isLoading.value = true
}

const onAfterPrompt = (result: any) => {
    isLoading.value = false
    ingredient.value.description = ingredient.value.description + '\n\n' + result.description || ''
    if (!ingredient.value.strength) {
        ingredient.value.strength = result.strength || 0
    }
    ingredient.value.origin = result.origin || ingredient.value.origin
    ingredient.value.color = result.color || '#000000'
}

const ingredientPrompt = computed(() => {
    if (!ingredient.value.name || ingredient.value.name.length < 3) {
        return null
    }

    return prompts.buildIngredientPrompt(ingredient.value.name)
})

async function refreshIngredient(id: string) {
    isLoading.value = true
    const resp = (await BarAssistantClient.getIngredient(id))?.data ?? null
    if (!resp) {
        return
    }

    resp.description = useHtmlDecode(resp.description ?? '')
    isParent.value = resp.hierarchy.parent_ingredient != null
    isComplex.value = (resp.ingredient_parts && resp.ingredient_parts.length > 0) || false
    ingredient.value = resp

    useTitle(`${t('ingredient.title')} \u22C5 ${ingredient.value.name}`)

    isLoading.value = false
}

function refreshCalculators() {
    BarAssistantClient.getCalculators().then(resp => {
        calculators.value = resp?.data ?? []
    })
}

function refreshPriceCategories() {
    BarAssistantClient.getPriceCategories().then(resp => {
        priceCategories.value = resp?.data ?? []
    })
}

function selectIngredientPart(ingredientPart: IngredientSearchResult) {
    if (ingredient.value.ingredient_parts && ingredient.value.ingredient_parts.some(ing => ing.id == ingredientPart.id)) {
        return
    }

    ingredient.value?.ingredient_parts?.push(ingredientPart)
}

function selectParentIngredient(parent: IngredientSearchResult) {
    ingredient.value.hierarchy.parent_ingredient = parent
}

function removeIngredientPart(ingredientPart: IngredientBasic) {
    if (!ingredient.value.ingredient_parts) {
        return
    }

    ingredient.value.ingredient_parts.splice(
        ingredient.value.ingredient_parts.findIndex(i => i == ingredientPart),
        1
    )
}

function addIngredientPrice() {
    if (!ingredient.value.prices) {
        ingredient.value.prices = []
    }

    ingredient.value.prices.push({
        price: {
            price: 0,
            price_minor: 0,
            formatted_price: '',
            currency: '',
        },
        price_category: {
            id: 0,
            name: '',
            currency: '',
            description: '',
        },
        description: '',
        amount: 0,
        units: '',
        created_at: '',
        updated_at: null
    })
}

function removeIngredientPrice(price: IngredientPrice) {
    if (!ingredient.value.prices) {
        return;
    }

    ingredient.value.prices.splice(ingredient.value.prices.indexOf(price), 1)
}

async function submit() {
    isLoading.value = true

    if (!isComplex.value) {
        ingredient.value.ingredient_parts = []
    }

    if (!ingredient.value.strength) {
        ingredient.value.strength = 0
    }

    const postData = {
        name: ingredient.value.name,
        description: ingredient.value.description,
        strength: ingredient.value.strength,
        origin: ingredient.value.origin,
        color: ingredient.value.color,
        sugar_g_per_ml: ingredient.value.sugar_g_per_ml,
        acidity: ingredient.value.acidity,
        distillery: ingredient.value.distillery,
        calculator_id: ingredient.value.calculator_id,
        units: ingredient.value.units,
        parent_ingredient_id: isParent.value && ingredient.value.hierarchy.parent_ingredient ? ingredient.value.hierarchy.parent_ingredient.id : null,
        images: [] as number[],
        complex_ingredient_part_ids: ingredient.value.ingredient_parts ? [...new Set(ingredient.value.ingredient_parts.map(i => i.id))] : [],
        prices: ingredient.value.prices ? ingredient.value.prices.filter(p => p.price_category.id != null).map(p => ({
            price_category_id: p.price_category.id,
            price: p.price.price,
            amount: p.amount,
            units: p.units,
            description: p.description,
        })) : [],
    }

    if (imageUpload.value) {
        const imageResources = await imageUpload.value.save().catch(() => {
            toast.error(`${t('imageupload.error')} ${t('imageupload.error-ingredient')}`)
        }) || []

        if (imageResources.length > 0) {
            postData.images = imageResources.map(img => img.id)
        }
    }

    if (ingredient.value.id) {
        BarAssistantClient.updateIngredient(ingredient.value.id, postData).then(resp => {
            if (!resp) {
                return
            }

            toast.default(t('ingredient.update-success'))
            router.push({ name: 'ingredients.show', params: { id: resp.data.slug } })
        }).catch(e => {
            toast.error(e.message)
        }).finally(() => {
            isLoading.value = false
        })
    } else {
        BarAssistantClient.saveIngredient(postData).then(resp => {
            if (!resp) {
                return
            }

            toast.default(t('ingredient.create-success'))
            router.push({ name: 'ingredients.show', params: { id: resp.data.slug } })
        }).catch(e => {
            toast.error(e.message)
        }).finally(() => {
            isLoading.value = false
        })
    }
}

const descendantIngredientIds = computed(() => {
    if (!ingredient.value.hierarchy.descendants) {
        return []
    }

    return ingredient.value.hierarchy.descendants.map(ingredient => ingredient.id)
})

const disabledFinderIngredients = computed(() => {
    if (!ingredient.value.id) {
        return []
    }

    return [ingredient.value.id].concat(descendantIngredientIds.value)
})

const groupedPriceCategories = computed(() => {
    return priceCategories.value.reduce((acc: Record<string, PriceCategory[]>, obj) => {
        const keyValue = obj['currency']
        if (!acc[keyValue]) {
            acc[keyValue] = []
        }
        acc[keyValue].push(obj)

        return acc
    }, {})
})

useTitle(t('ingredient.add'))

const ingredientId = route.query.id || null
if (ingredientId) {
    refreshIngredient(ingredientId.toString())
}

refreshCalculators()
refreshPriceCategories()
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