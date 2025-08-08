<template>
    <PageHeader>
        {{ t('cocktail.title') }}
    </PageHeader>
    <form @submit.prevent="submit" v-if="cocktail">
        <OverlayLoader v-if="isLoading" />
        <h3 class="form-section-title">{{ t('recipe-information') }}</h3>
        <div class="block-container block-container--padded">
            <div class="form-group">
                <label class="form-label form-label--required" for="name">{{ t('name') }}:</label>
                <input id="name" v-model="cocktail.name" class="form-input" type="text" required :placeholder="t('placeholder.cocktail-name')">
            </div>
            <div class="form-group">
                <label class="form-label form-label--required" for="instructions">{{ t('instructions') }}:</label>
                <textarea id="instructions" v-model="cocktail.instructions" rows="8" class="form-input" required :placeholder="t('placeholder.cocktail-instructions')"></textarea>
                <p class="form-input-hint">{{ t('field-supports-md') }}</p>
            </div>
            <div class="form-group">
                <label class="form-label" for="garnish">{{ t('garnish') }}:</label>
                <textarea id="garnish" v-model="cocktail.garnish" rows="3" class="form-input" :placeholder="t('placeholder.cocktail-garnish')"></textarea>
                <p class="form-input-hint">{{ t('field-supports-md') }}</p>
            </div>
        </div>
        <h3 class="form-section-title">{{ t('ingredient.ingredients') }}</h3>
        <div class="block-container block-container--padded block-container--inset">
            <div v-show="cocktail.ingredients?.length === 0" class="cocktail-form__ingredients__onboard">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <path d="m15.139 7.813 4.638 18.29h8.446l4.638-18.29ZM19.723 29.861l-4.7 10.674 8.977-.02 8.977.02-4.7-10.674-3.619.002h-1.316zM18.88 26.61v2.997h10.24V26.61z" style="fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round" />
                </svg>
                <p>Here you can manage this cocktail's ingredients and amounts. Start by adding your first ingredient.</p>
            </div>
            <ul ref="ingredientsList" v-show="(cocktail.ingredients?.length ?? 0) > 0" class="cocktail-form__ingredients" style="margin-bottom: 20px;">
                <li v-for="(ing, idx) in cocktail.ingredients" :key="ing.ingredient.id" class="block-container" :data-id="ing.ingredient.id">
                    <div class="drag-handle"></div>
                    <div class="cocktail-form__ingredients__content">
                        <div class="form-group">
                            <label class="form-label">{{ t('ingredient.title') }}<template v-if="ing.sort <= 1"> ({{ t('ingredient.base') }})</template>:</label>
                            <p>
                                {{ ing.ingredient.name }}
                                <span v-if="ing.note">&middot; {{ ing.note }}</span>
                                <small v-show="ing.optional">({{ ing.optional ? t('optional') : '' }})</small>
                            </p>
                            <p v-if="ing.substitutes && ing.substitutes.length > 0" class="substitutes">
                                <template v-for="sub in ing.substitutes">
                                    {{ t('or').toLowerCase() }} {{ sub.ingredient.name }}&nbsp;
                                </template>
                            </p>
                        </div>
                        <div class="form-group">
                            <label class="form-label">{{ t('amount') }}:</label>
                            <p :title="ing.amount + ' ' + ing.units">{{ printIngredientAmount(ing) }}</p>
                        </div>
                        <div class="cocktail-form__ingredients__actions" v-if="cocktail.ingredients">
                            <SaltRimDialog v-model="showDialogs[idx]" @dialog-closed="handleCocktailIngredientModalClose(idx)">
                                <template #trigger>
                                    <a href="#" @click.prevent="showDialogs[idx] = true">
                                        {{ t('edit') }}
                                    </a>
                                </template>
                                <template #dialog>
                                    <CocktailIngredientModal v-if="bar.search_token" :search-token="bar.search_token" v-model="cocktail.ingredients[idx]" @close="handleCocktailIngredientModalClose(idx)" />
                                </template>
                            </SaltRimDialog>
                            &middot;
                            <a href="#" @click.prevent="editIngredientSubstitutes(ing)">
                                {{ t('ingredient.dialog.select-substitutes') }}
                            </a>
                            &middot;
                            <a href="#" @click.prevent="removeIngredient(ing)">
                                {{ t('remove') }}
                            </a>
                        </div>
                    </div>
                </li>
            </ul>
            <div style="text-align: center;">
                <button class="button button--dark" type="button" @click="addIngredient">{{ t('ingredient.add') }}</button>
            </div>
        </div>
        <SaltRimDialog v-model="showSubstituteDialog">
            <template #trigger>
                <span></span>
            </template>
            <template #dialog>
                <SubstituteModal v-if="bar.search_token" :search-token="bar.search_token" :value="cocktailIngredientForSubstitutes" @close="showSubstituteDialog = false" />
            </template>
        </SaltRimDialog>
        <h3 class="form-section-title">{{ t('media') }}</h3>
        <SubscriptionCheck>Subscribe to "Mixologist" plan to upload more than one cocktail recipe image!</SubscriptionCheck>
        <ImageUpload v-if="cocktail.images" ref="imagesUpload" :images="cocktail.images" :max-images="maxImages" />
        <h3 class="form-section-title">{{ t('additional-information') }}</h3>
        <div class="block-container block-container--padded">
            <div class="form-group">
                <label class="form-label" for="description">{{ t('description') }}:</label>
                <textarea id="description" v-model="cocktail.description" rows="5" class="form-input" :placeholder="t('placeholder.cocktail-description')"></textarea>
                <p class="form-input-hint">{{ t('field-supports-md') }}</p>
            </div>
            <div class="form-group" v-if="cocktail.glass">
                <label class="form-label" for="glass">{{ t('glass-type.title') }}:</label>
                <SaltRimDialog v-model="showGlassSelectorDialog">
                    <template #trigger>
                        <button type="button" class="form-input form-input--auto-height form-input--button" @click="showGlassSelectorDialog = !showGlassSelectorDialog">
                            <template v-if="!cocktail.glass || !cocktail.glass.id">
                                Select a glass type...
                            </template>
                            <div class="cocktail-selected-glass" v-else>
                                <div v-if="cocktail.glass.images && cocktail.glass.images.length > 0" class="cocktail-selected-glass__image">
                                    <img :src="cocktail.glass.images[0].url ?? undefined" :alt="cocktail.glass.images[0].copyright ?? undefined">
                                </div>
                                <div>
                                    <h4>{{ cocktail.glass.name }}</h4>
                                    <p>{{ cocktail.glass.description }}</p>
                                    <p v-if="cocktail.glass.volume">{{ t('volume') }}: {{ cocktail.glass.volume }} {{ cocktail.glass.volume_units }}</p>
                                </div>
                            </div>
                        </button>
                    </template>
                    <template #dialog>
                        <div class="dialog-title">{{ t('glass-type.title') }}</div>
                        <GlassSelector v-model="cocktail.glass" :options="glasses" @glass-selected="showGlassSelectorDialog = false"></GlassSelector>
                        <div class="dialog-actions">
                            <button class="button button--outline" @click.prevent="showGlassSelectorDialog = false">{{ t('cancel') }}</button>
                        </div>
                    </template>
                </SaltRimDialog>
            </div>
            <div style="margin-bottom: 2rem;" v-if="cocktail.method">
                <label class="form-label">{{ t('method-and-dilution') }}:</label>
                <div class="cocktail-methods">
                    <SaltRimRadio v-for="method in translatableMethods" :key="method.id" v-model="cocktail.method.id" :value="method.id" :title="method.name" :description="method.dilution_percentage + '%'"></SaltRimRadio>
                </div>
            </div>
            <div class="sr-grid sr-grid--2-col">
                <div class="form-group">
                    <label class="form-label" for="source">{{ t('source') }}:</label>
                    <input id="source" v-model="cocktail.source" class="form-input" type="text" :placeholder="t('placeholder.source')">
                </div>
                <div class="form-group">
                    <label class="form-label" for="year">{{ t('year') }}:</label>
                    <input id="year" v-model="cocktail.year" class="form-input" type="text" :placeholder="t('placeholder.cocktail-year')">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label" for="cocktail-tags">{{ t('tag.tags') }}:</label>
                <TagSelector id="cocktail-tags" v-model="selectedTagNames" :options="tags" label-key="name" :placeholder="t('placeholder.tags')"></TagSelector>
                <p class="form-input-hint">{{ t('tag.help-text') }} {{ t('tag.help-text-recommender') }}</p>
                <GenerationLoader v-if="isLoadingGen"></GenerationLoader>
                <div class="form-group-ai" v-if="cocktailTagsPrompt">
                    <ButtonGenerate :prompt="cocktailTagsPrompt" :format="structuredOutputTags" @before-generation="onBeforePrompt" @after-generation="onAfterPrompt"></ButtonGenerate>
                </div>
            </div>
            <div v-show="utensils.length > 0" class="form-group">
                <label class="form-label" for="utensil">{{ t('utensils.title') }}:</label>
                <select id="utensil" v-model="selectedUtensilIds" class="form-select" multiple style="height: 200px;">
                    <option v-for="utensil in utensils" :key="utensil.id" :value="utensil.id">{{ utensil.name }}</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label" for="cocktail-parent-id">{{ t('cocktail-variety-of') }}:</label>
                <SaltRimDialog v-model="showVarietyDialog">
                    <template #trigger>
                        <button type="button" class="form-input form-input--auto-height form-input--button" @click="showVarietyDialog = !showVarietyDialog">
                            <template v-if="!cocktail.parent_cocktail">
                                {{ t('cocktail-select-parent') }}
                            </template>
                            <div v-else>
                                {{ cocktail.parent_cocktail.name }}
                            </div>
                        </button>
                        <a v-show="cocktail.parent_cocktail !== null" href="#" @click.prevent="cocktail.parent_cocktail = null">{{ t('remove') }}</a>
                    </template>
                    <template #dialog>
                        <CocktailFinder @cocktail-selected="selectParentCocktail" @closed="showVarietyDialog = false"></CocktailFinder>
                    </template>
                </SaltRimDialog>
            </div>
        </div>
        <div class="form-actions form-actions--timestamps">
            <TimeStamps v-if="cocktail.id" :resource="cocktail"></TimeStamps>
            <div class="form-actions__buttons">
                <RouterLink v-if="cocktail.id" class="button button--outline" :to="{ name: 'cocktails.show', params: { id: cocktail.id } }">{{ t('cancel') }}</RouterLink>
                <RouterLink v-else class="button button--outline" :to="{ name: 'cocktails' }">{{ t('cancel') }}</RouterLink>
                <button class="button button--dark" type="submit">{{ t('save') }}</button>
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
import { useTitle } from '@/composables/title'
import { useHtmlDecode } from './../../composables/useHtmlDecode';
import { unitHandler, type UnitIngredient } from '@/composables/useUnits'
import BarAssistantClient from '@/api/BarAssistantClient';
import OverlayLoader from './../OverlayLoader.vue'
import CocktailIngredientModal from './CocktailIngredientModal.vue';
import ImageUpload from './../ImageUpload.vue'
import PageHeader from './../PageHeader.vue'
import Sortable from 'sortablejs'
import SaltRimDialog from './../Dialog/SaltRimDialog.vue'
import SaltRimRadio from '../SaltRimRadio.vue'
import AppState from '../../AppState'
import SubstituteModal from './SubstituteModal.vue'
import SubscriptionCheck from '../SubscriptionCheck.vue'
import TimeStamps from '../TimeStamps.vue'
import TagSelector from '../TagSelector.vue'
import GlassSelector from '../GlassSelector.vue';
import CocktailFinder from '../CocktailFinder.vue';
import usePrompts from '@/composables/usePrompts';
import ButtonGenerate from '../AI/ButtonGenerate.vue';
import GenerationLoader from '../AI/GenerationLoader.vue'
import type { components } from '@/api/api'
import { ref, computed, watch, onMounted, useTemplateRef, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useSaltRimToast } from '@/composables/toast';
import { useConfirm } from '@/composables/confirm'

type Cocktail = components['schemas']['Cocktail']
type CocktailRequest = components["schemas"]["CocktailRequest"]
type CocktailIngredient = components['schemas']['CocktailIngredient']
type Glass = components['schemas']['Glass']
type CocktailMethod = components['schemas']['CocktailMethod']
type Tag = components['schemas']['Tag']
type Utensil = components['schemas']['Utensil']
type Bar = components['schemas']['Bar']

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const toast = useSaltRimToast()
const prompts = usePrompts()
const confirm = useConfirm()
const appState = new AppState()
const showDialogs = ref<boolean[]>([])
const isLoading = ref<boolean>(false)
const isLoadingGen = ref<boolean>(false)
const showVarietyDialog = ref<boolean>(false)
const showSubstituteDialog = ref<boolean>(false)
const showGlassSelectorDialog = ref<boolean>(false)
const imageUpload = useTemplateRef('imagesUpload')
const ingredientsList = useTemplateRef('ingredientsList')
const cocktail = ref<Partial<Cocktail>>({
    images: [],
    ingredients: [],
    utensils: [],
    tags: [],
    parent_cocktail: null,
    glass: {} as Glass,
    method: {} as CocktailMethod,
})
const maxImages = appState.isSubscribed() ? 10 : 1
const glasses = ref<Glass[]>([])
const methods = ref<CocktailMethod[]>([])
const tags = ref<Tag[]>([])
const utensils = ref<Utensil[]>([])
const sortable = ref(null)
const selectedUtensilIds = ref<number[]>([])
const selectedTagNames = ref<string[]>([])
const cocktailIngredientForSubstitutes = ref<CocktailIngredient>({} as CocktailIngredient)
const bar = ref<Partial<Bar>>({
    search_token: null,
})
const structuredOutputTags = {
    type: 'array',
    description: 'List of tags for the cocktail, each tag is a string.',
    items: {
        type: 'string',
    },
}

const translatableMethods = computed(() => {
    const methodsWithTranslations = ['Shake', 'Stir', 'Build', 'Blend', 'Muddle', 'Layer'];

    return methods.value.map(method => {
        if (methodsWithTranslations.includes(method.name)) {
            return {
                ...method,
                name: t('method.' + method.name)
            }
        }

        return method
    })
})

const cocktailTagsPrompt = computed(() => {
    if (!cocktail.value.name || cocktail.value.name.length < 2 || cocktail.value.ingredients?.length === 0) {
        return ''
    }

    const promptText = `
        Name: ${cocktail.value.name}
        Garnish: ${cocktail.value.garnish || ''}
        Description: ${cocktail.value.description || ''}
        Preparation method: ${cocktail.value.instructions || ''}
        Method and dilution: ${cocktail.value.method?.name || ''} ${cocktail.value.method?.dilution_percentage || ''}%
        ABV: ${cocktail.value.abv}
        Ingredients: ${cocktail.value.ingredients?.map(i => `${i.ingredient.name} - ${i.amount} ${i.units}`).join(', ')}
    `;

    return prompts.buildCocktailTagsPrompt(promptText, tags.value.map(t => t.name))
})

function printIngredientAmount(ing: UnitIngredient) {
    const defaultUnit = appState.defaultUnit

    return unitHandler.print(ing, defaultUnit)
}

function handleCocktailIngredientModalClose(idx: number) {
    if (!cocktail.value.ingredients) {
        return
    }

    showDialogs.value[idx] = false
    // Remove empty ingredients (ie: <not selected>)
    const emptyIngredient = cocktail.value.ingredients.findIndex(i => (i.ingredient.id == null || i.ingredient.id === 0))
    if (emptyIngredient != -1) {
        cocktail.value.ingredients.splice(emptyIngredient, 1)
    }
}

function editIngredientSubstitutes(ing: CocktailIngredient) {
    cocktailIngredientForSubstitutes.value = ing
    showSubstituteDialog.value = true
}

function removeIngredient(ing: CocktailIngredient) {
    if (!cocktail.value.ingredients) {
        return
    }

    if (!ing.ingredient.id) {
        cocktail.value.ingredients.splice(
            cocktail.value.ingredients.findIndex(i => i == ing),
            1
        )

        return
    }

    confirm.show(t('cocktail.ingredient-remove', { name: ing.ingredient.name }), {
        onResolved: (dialog: any) => {
            if (!cocktail.value.ingredients) {
                return
            }

            dialog.close()
            cocktail.value.ingredients.splice(
                cocktail.value.ingredients.findIndex(i => i == ing),
                1
            )
        }
    })
}

function addIngredient() {
    const userUnit = appState.defaultUnit
    let defaultAmount = 30
    let defaultUnits = 'ml'

    if (userUnit == 'oz') {
        defaultAmount = 1
        defaultUnits = 'oz'
    }

    if (userUnit == 'cl') {
        defaultAmount = 3
        defaultUnits = 'cl'
    }

    const placeholderData: CocktailIngredient = {
        sort: (cocktail.value.ingredients?.length ?? 0) + 1,
        amount: defaultAmount,
        amount_max: null,
        units: defaultUnits,
        optional: false,
        is_specified: false,
        note: null,
        substitutes: [],
        formatted: {} as components["schemas"]["AmountFormats"],
        ingredient: {
            id: 0,
            slug: '',
            name: t('ingredient.name-placeholder'),
        }
    }

    cocktail.value.ingredients?.push(placeholderData)
    showDialogs.value[(cocktail.value.ingredients?.length ?? 0) - 1] = true
}

function onBeforePrompt() {
    isLoadingGen.value = true
}

function onAfterPrompt(result: any) {
    isLoadingGen.value = false
    const uniqueTags = new Set([...selectedTagNames.value, ...result.map((tag: string) => tag.trim())])
    cocktail.value.tags = Array.from(uniqueTags)
}

function selectParentCocktail(parentCocktail: Cocktail) {
    cocktail.value.parent_cocktail = parentCocktail
    showVarietyDialog.value = false
}

function checkForImportData() {
    const scraped = sessionStorage.getItem('scrapeResult')
    if (scraped) {
        sessionStorage.removeItem('scrapeResult')
        const parsedScrapeResult = JSON.parse(scraped)

        cocktail.value = parsedScrapeResult
    }
}

function initSortable() {
    nextTick(() => {
        sortable.value = Sortable.create(document.querySelector('.cocktail-form__ingredients'), {
            handle: '.drag-handle',
            ghostClass: 'block-container--placeholder',
            animation: 150,
            onEnd: updateSortPosition,
        })
    })
}

function updateSortPosition() {
    if (!sortable.value || !cocktail.value.ingredients) {
        return
    }

    const sortedIngredientList = (sortable.value as any).toArray()

    cocktail.value.ingredients.map((cIngredient) => {
        cIngredient.sort = sortedIngredientList.findIndex((sortedId: number) => sortedId == cIngredient.ingredient.id) + 1

        return cIngredient
    })
}

async function submit() {
    const sortedIngredientList = (sortable.value as any).toArray()

    isLoading.value = true

    const postData = {
        name: cocktail.value.name,
        description: cocktail.value.description,
        instructions: cocktail.value.instructions,
        garnish: cocktail.value.garnish,
        source: cocktail.value.source,
        cocktail_method_id: cocktail.value.method?.id,
        utensils: selectedUtensilIds.value,
        parent_cocktail_id: cocktail.value.parent_cocktail ? cocktail.value.parent_cocktail.id : null,
        images: [] as number[],
        tags: selectedTagNames.value,
        glass_id: cocktail.value.glass ? cocktail.value.glass.id : null,
        year: cocktail.value.year,
        ingredients: (cocktail.value.ingredients ?? [])
            .filter(i => i.ingredient.id != null || i.ingredient.id !== 0)
            .filter(i => i.units)
            .map((cIngredient) => {
                const substitutes = (cIngredient.substitutes ?? [])
                    .filter(sub => sub.ingredient.id != null && sub.ingredient.id !== 0)
                    .map(sub => {
                        return {
                            ingredient_id: sub.ingredient.id,
                            amount: sub.amount ? unitHandler.asDecimal(sub.amount.toString()) : null,
                            amount_max: sub.amount_max ? unitHandler.asDecimal(sub.amount_max.toString()) : null,
                            units: sub.units,
                        }
                    })

                return {
                    ingredient_id: cIngredient.ingredient.id,
                    name: cIngredient.ingredient.name,
                    amount: unitHandler.asDecimal(cIngredient.amount.toString()),
                    units: cIngredient.units,
                    amount_max: cIngredient.amount_max ? unitHandler.asDecimal(cIngredient.amount_max.toString()) : null,
                    optional: cIngredient.optional,
                    is_specified: cIngredient.is_specified,
                    note: cIngredient.note,
                    sort: sortedIngredientList.findIndex((sortedId: number) => sortedId == cIngredient.ingredient.id) + 1,
                    substitutes: substitutes
                }
            })
    } as CocktailRequest

    if (imageUpload.value) {
        const imageResources = await imageUpload.value.save().catch(() => {
            toast.error(`${t('imageupload.error')} ${t('imageupload.error-cocktail')}`)
        }) || []

        if (imageResources.length > 0) {
            postData.images = imageResources.map((img: any) => img.id)
        }
    }

    if (cocktail.value.id) {
        BarAssistantClient.updateCocktail(cocktail.value.id, postData).then(resp => {
            if (!resp) {
                return
            }

            isLoading.value = false
            toast.default(t('cocktail.update-success'))
            router.push({ name: 'cocktails.show', params: { id: resp.data.slug } })
        }).catch(e => {
            toast.error(e.message)
            isLoading.value = false
        })
    } else {
        BarAssistantClient.saveCocktail(postData).then(resp => {
            if (!resp) {
                return
            }

            isLoading.value = false
            toast.open({
                message: t('cocktail.create-success')
            })
            router.push({ name: 'cocktails.show', params: { id: resp.data.slug } })
        }).catch(e => {
            toast.error(e.message)
            isLoading.value = false
        })
    }
}

async function init() {
    useTitle(t('cocktail.add'))

    isLoading.value = true

    glasses.value = (await BarAssistantClient.getGlasses())?.data ?? []
    methods.value = (await BarAssistantClient.getCocktailMethods())?.data ?? []
    tags.value = (await BarAssistantClient.getTags())?.data ?? []
    utensils.value = (await BarAssistantClient.getUtensils())?.data ?? []
    bar.value = (await BarAssistantClient.getBar(appState.bar.id))?.data ?? {}

    const cocktailId = route.query.id || null

    if (cocktailId) {
        const existingCocktail = (await BarAssistantClient.getCocktail(cocktailId.toString()))?.data ?? {} as Cocktail

        existingCocktail.description = useHtmlDecode(existingCocktail.description ?? '')
        existingCocktail.instructions = useHtmlDecode(existingCocktail.instructions ?? '')
        existingCocktail.garnish = useHtmlDecode(existingCocktail.garnish ?? '')
        if (!existingCocktail.method) {
            existingCocktail.method = {} as CocktailMethod
        }
        if (!existingCocktail.glass) {
            existingCocktail.glass = {} as Glass
        }

        cocktail.value = existingCocktail
        selectedUtensilIds.value = existingCocktail.utensils?.map(ut => ut.id) ?? []
        selectedTagNames.value = existingCocktail.tags?.map(t => t.name) ?? []

        useTitle(`${t('cocktail.title')} \u22C5 ${cocktail.value.name}`)
    } else {
        checkForImportData()
    }

    initSortable()

    isLoading.value = false
}

init()

// Watch for changes in the cocktail's instructions to auto-detect method
watch(() => cocktail.value.instructions, (newVal) => {
    if (cocktail.value.method && !cocktail.value.method.id && newVal) {
        const matchedMethod = methods.value.find(method =>
            newVal.toLowerCase().includes(method.name.toLowerCase())
        )

        if (matchedMethod) {
            cocktail.value.method.id = matchedMethod.id;
        }
    }
})
</script>

<style scoped>
.cocktail-form__ingredients {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    row-gap: var(--gap-size-1)
}

.cocktail-form__ingredients li {
    display: flex;
    padding: 1rem;
}

.cocktail-form__ingredients li.cocktail-form__ingredients__placeholder {
    background: rgba(158, 236, 255, 0.2);
}

.cocktail-form__ingredients li small {
    color: var(--clr-gray-500);
}

.cocktail-form__ingredients li .form-group {
    margin: 0;
}

.cocktail-form__ingredients__actions {
    grid-column: span 2;
}

.cocktail-form__ingredients .substitutes {
    font-style: italic;
    font-size: 0.9rem;
    color: var(--clr-gray-500);
}

.cocktail-form__ingredients__content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    grid-template-rows: auto auto;
    gap: var(--gap-size-2);
    width: 100%;
    margin-left: 0.5rem;
}

.cocktail-methods {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--gap-size-3);
    margin-top: 0.5rem;
}

.cocktail-form__ingredients__onboard {
    text-align: center;
    margin-bottom: 1rem;
}

.cocktail-form__ingredients__onboard p {
    max-width: 400px;
    margin: 0 auto;
}

.cocktail-form__ingredients__onboard svg {
    height: 64px;
    stroke: var(--clr-gray-700);
}

.cocktail-selected-glass {
    display: flex;
    flex-direction: row;
    gap: .5rem;
}

.cocktail-selected-glass__image {
    flex: 0;
}

.cocktail-selected-glass img {
    max-width: 50px;
    max-height: 50px;
    height: auto;
}

.cocktail-selected-glass h4 {
    margin: 0;
    font-weight: bold;
}

.cocktail-selected-glass p {
    font-size: 0.85rem;
    color: var(--clr-gray-500);
    line-height: 1.4;
}
</style>
