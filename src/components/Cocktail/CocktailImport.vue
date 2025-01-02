<script setup lang="ts">
import { ref, computed } from 'vue'
import BarAssistantClient from '@/api/BarAssistantClient'
import OverlayLoader from './../OverlayLoader.vue'
import PageHeader from './../PageHeader.vue'
import SaltRimRadio from '../SaltRimRadio.vue'
import IngredientFinder from './../IngredientFinder.vue'
import SaltRimDialog from '../Dialog/SaltRimDialog.vue'
import SubscriptionCheck from '../SubscriptionCheck.vue'
import { useSaltRimToast } from '@/composables/toast.js'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import type { components } from '@/api/api'
import { useTitle } from '@/composables/title'
import AppState from '@/AppState'
interface Ingredient {
    id: string,
    name: string,
    slug: string,
}
type Draft2Schema = components["schemas"]["cocktail-02.schema"]
interface Draft1Schema {
    _id: string;
    name: string;
    instructions: string;
    created_at: string;
    updated_at: string;
    description: string;
    source: string;
    garnish: string | null;
    abv: number;
    tags: string[];
    glass: string;
    method: string;
    utensils: string[];
    images: {
        source: string;
        sort: number;
        placeholder_hash: string;
        copyright: string;
    }[];
    ingredients: {
        _id: string;
        name: string;
        strength: number;
        description: string;
        origin: string | null;
        category: string;
        amount: number;
        units: string;
        optional: boolean;
        amount_max: number | null;
        note: string | null;
        substitutes: {
            _id: string;
            amount?: number | null;
            units?: string | null;
            amount_max?: number | null;
            name: string;
            strength: number;
            description: string;
            origin: string | null;
            category: string;
        }[];
        sort: number;
    }[];
}
type Cocktail = components["schemas"]["Cocktail"]
type Bar = components["schemas"]["Bar"]
type Glass = components["schemas"]["Glass"]
type FullIngredient = components["schemas"]["Ingredient"]
type CocktailMethod = components["schemas"]["CocktailMethod"]
type SchemaIngredient = components["schemas"]["cocktail-02.schema"]["ingredients"][0]
interface SchemaWithExtraIngredientData {
    recipe: {
        matchedGlassId: number | null,
        matchedMethodId: number | null,
        ingredients: {
            _source: string | null,
            matchedIngredient: Ingredient | null,
            refIngredient: SchemaIngredient,
            substitutes: {
                matchedIngredient: Ingredient | null,
                refIngredient: SchemaIngredient,
            }[]
        }[]
    }
}

type LocalSchema = Draft2Schema & SchemaWithExtraIngredientData
type CocktailIngredient = LocalSchema["recipe"]["ingredients"][0]
type SubstituteCocktailIngredient = LocalSchema["recipe"]["ingredients"][0]["substitutes"][0]

const { t } = useI18n()
const router = useRouter()
const toast = useSaltRimToast()
const isLoading = ref(false)
const isImporting = ref(false)
const showIngredientDialog = ref(false)
const ingredientEdit = ref<CocktailIngredient | SubstituteCocktailIngredient | null>(null)
const importType = ref('url')
const similarCocktails = ref([] as Cocktail[])
const isLoadingSimilar = ref(false)
const bar = ref({} as Bar)
const appState = new AppState()
const duplicateAction = ref('none')
const source = ref<null | string>(null)
const result = ref<LocalSchema>({} as LocalSchema)
const cocktailTags = computed({
    get() {
        return result.value.recipe?.tags?.join(',')
    },
    set(newVal) {
        if (Array.isArray(newVal)) {
            newVal = newVal.join(',')
        }

        if (newVal == '' || newVal == null || newVal == undefined) {
            result.value.recipe.tags = []
        } else {
            result.value.recipe.tags = Array.from(new Set(newVal.split(',').filter(t => t != '')))
        }
    }
})

useTitle(t('cocktail.import'))

getBar(appState.bar.id)

function clearImport() {
    similarCocktails.value = []
    source.value = null
    ingredientEdit.value = null
    result.value = {} as LocalSchema
}

function importCocktail() {
    similarCocktails.value = []
    ingredientEdit.value = null
    result.value = {} as LocalSchema
    similarCocktails.value = []

    if (importType.value == 'url') {
        fromUrl()
    }

    if (importType.value == 'json') {
        fromJson()
    }
}

function fromUrl() {
    if (!source.value) {
        return
    }

    isLoading.value = true
    BarAssistantClient.scrapeCocktail(source.value).then(resp => {
        const schema = resp?.data.schema
        if (!schema) {
            return
        }

        findSimilarCocktails(schema.recipe.name)

        result.value = {
            ...schema,
            recipe: {
                ...schema.recipe,
                ingredients: schema.recipe?.ingredients?.map(i => {
                    return {
                        ...i,
                        _source: resp?.data.scraper_meta.find(m => m._id == i._id)?.source,
                        matchedIngredient: null,
                        refIngredient: schema.ingredients.find(ing => ing._id == i._id),
                    }
                })
            }
        } as LocalSchema

        isLoading.value = false
    }).catch(e => {
        toast.error(e.message)
        isLoading.value = false
    })
}

function fromJson() {
    isLoading.value = true
    try {
        if (source.value != null) {
            const parsed = JSON.parse(source.value) as Draft2Schema

            // Draft 1 schema
            if (!parsed.recipe) {
                const parsedDraft1 = JSON.parse(source.value) as Draft1Schema

                result.value = {
                    ingredients: [],
                    recipe: {
                        _id: parsedDraft1._id,
                        name: parsedDraft1.name,
                        description: parsedDraft1.description,
                        instructions: parsedDraft1.instructions,
                        garnish: parsedDraft1.garnish,
                        source: parsedDraft1.source,
                        method: parsedDraft1.method,
                        glass: parsedDraft1.glass,
                        matchedGlassId: null,
                        matchedMethodId: null,
                        images: parsedDraft1.images?.map(img => ({file: img.source, uri: img.source, copyright: img.copyright})) ?? [],
                        ingredients: parsedDraft1.ingredients.map(i => {
                            return {
                                _id: i._id,
                                _source: null,
                                amount: i.amount,
                                amount_max: i.amount_max,
                                units: i.units,
                                note: i.note,
                                matchedIngredient: null,
                                substitutes: i.substitutes?.map(sub => {
                                    return {
                                        _id: sub._id,
                                        amount: sub.amount,
                                        amount_max: sub.amount_max,
                                        units: sub.units,
                                        matchedIngredient: null,
                                        refIngredient: {
                                            _id: sub._id,
                                            name: sub.name,
                                            strength: sub.strength,
                                            description: sub.description,
                                            origin: sub.origin,
                                            category: sub.category,
                                        } as SchemaIngredient,
                                    } as SubstituteCocktailIngredient
                                }),
                                refIngredient: {
                                    _id: i._id,
                                    name: i.name,
                                    strength: i.strength,
                                    description: i.description,
                                    origin: i.origin,
                                    category: i.category,
                                } as SchemaIngredient,
                            } as CocktailIngredient
                        })
                    }
                } as LocalSchema
            } else {
                result.value = {
                    ...parsed,
                    recipe: {
                        ...parsed.recipe,
                        ingredients: parsed.recipe?.ingredients?.map(i => {
                            return {
                                ...i,
                                _source: null,
                                matchedIngredient: null,
                                refIngredient: parsed.ingredients.find(ing => ing._id == i._id),
                                substitutes: i.substitutes?.map(sub => {
                                    return {
                                        ...sub,
                                        matchedIngredient: null,
                                        refIngredient: parsed.ingredients.find(ing => ing._id == sub._id),
                                    }
                                })
                            }
                        })
                    }
                } as LocalSchema
            }
        }
    } catch (e) {
        console.error('Unable to parse JSON', e)
    }
    isLoading.value = false
}

function manuallyMatch(ingredient: CocktailIngredient | SubstituteCocktailIngredient) {
    showIngredientDialog.value = true
    ingredientEdit.value = ingredient
}

function removeIngredient(ingredient: string) {
    result.value.recipe?.ingredients?.splice(
        result.value.recipe?.ingredients?.findIndex(i => i._id == ingredient),
        1
    )
}

function removeSubIngredient(parentIngredient: CocktailIngredient, ingredient: string) {
    parentIngredient?.substitutes?.splice(
        parentIngredient?.substitutes?.findIndex(i => i._id == ingredient),
        1
    )
}

function handleIngredientEdit(selectedIngredient: Ingredient) {
    if (ingredientEdit.value == null) {
        return
    }

    ingredientEdit.value.matchedIngredient = {
        id: selectedIngredient.id,
        slug: selectedIngredient.slug,
        name: selectedIngredient.name,
    }

    showIngredientDialog.value = false
}

async function getGlass(glassName: string): Promise<Glass | null> {
    try {
        const response = await BarAssistantClient.getGlasses({ 'filter[name]': glassName.toLowerCase() })
        const dbGlass = response?.data?.[0] ?? null

        if (dbGlass) {
            return dbGlass
        }

        return null
    } catch (error) {
        return null
    }
}

async function getMethod(methodName: string): Promise<CocktailMethod | null> {
    try {
        const response = await BarAssistantClient.getCocktailMethods({ 'filter[name]': methodName.toLowerCase() })
        const dbGlass = response?.data?.[0] ?? null

        if (dbGlass) {
            return dbGlass
        }

        return null
    } catch (error) {
        return null;
    }
}

async function getOrCreateIngredient(ingredient: SchemaIngredient): Promise<FullIngredient | null> {
    try {
        const response = await BarAssistantClient.getIngredients({ 'filter[name_exact]': ingredient.name.toLowerCase(), per_page: 1 })
        const dbIngredient = response?.data?.[0] ?? null

        if (dbIngredient) {
            return dbIngredient
        }

        const newIngredient = await BarAssistantClient.saveIngredient({name: ingredient.name, description: ingredient.description, origin: ingredient.origin, strength: ingredient.strength ?? 0.0})
        return newIngredient?.data ?? null
    } catch (error) {
        return null;
    }
}

async function finishImporting() {
    isImporting.value = true
    if (result.value.recipe.glass) {
        result.value.recipe.matchedGlassId = (await getGlass(result.value.recipe.glass))?.id ?? null
    }

    if (result.value.recipe.method) {
        result.value.recipe.matchedMethodId = (await getMethod(result.value.recipe.method))?.id ?? null
    }

    for (const ingredient of result.value.recipe.ingredients) {
        if (ingredient.matchedIngredient) {
            continue
        }

        const foundIngredient = await getOrCreateIngredient(ingredient.refIngredient)
        if (foundIngredient) {
            ingredient.matchedIngredient = {
                id: foundIngredient.id.toString(),
                slug: foundIngredient.slug,
                name: foundIngredient.name,
            }
        }

        for (const substitute of ingredient.substitutes) {
            if (substitute.matchedIngredient) {
                continue
            }

            const foundIngredient = await getOrCreateIngredient(substitute.refIngredient)
            if (foundIngredient) {
                substitute.matchedIngredient = {
                    id: foundIngredient.id.toString(),
                    slug: foundIngredient.slug,
                    name: foundIngredient.name,
                }
            }
        }
    }

    const cocktail = {
        name: result.value.recipe.name,
        description: result.value.recipe.description,
        instructions: result.value.recipe.instructions,
        garnish: result.value.recipe.garnish,
        source: result.value.recipe.source,
        method: {id: result.value.recipe.matchedMethodId},
        glass: {id: result.value.recipe.matchedGlassId},
        images: result.value.recipe.images?.map(img => ({
            url: img.uri,
            file: img.uri,
            file_path: 'Image from: ' + result.value.recipe.source,
            copyright: img.copyright,
            sort: img.sort,
        })) ?? [],
        tags: result.value.recipe.tags,
        ingredients: result.value.recipe.ingredients.map(i => {
            const ing = i as CocktailIngredient

            return {
                units: ing.units,
                amount: ing.amount,
                amount_max: ing.amount_max,
                optional: ing.optional,
                sort: ing.sort,
                note: ing.note,
                substitutes: ing.substitutes?.map(s => {
                    const sub = s as SubstituteCocktailIngredient

                    return {
                        units: sub.units,
                        amount: sub.amount,
                        amount_max: sub.amount_max,
                        ingredient: sub.matchedIngredient,
                    }
                }),
                ingredient: ing.matchedIngredient,
            }
        }),
        utensils: [],
    }

    sessionStorage.setItem('scrapeResult', JSON.stringify(cocktail))
    router.push({ name: 'cocktails.form' })
}

async function findSimilarCocktails(name: string): Promise<void> {
    isLoadingSimilar.value = true
    const response = await BarAssistantClient.getCocktails({ 'filter[name]': name.toLowerCase(), per_page: 10 })
    isLoadingSimilar.value = false
    similarCocktails.value = response?.data ?? []
}

async function getBar(barId: number): Promise<void> {
    isLoading.value = true
    const resp = await BarAssistantClient.getBar(barId)
    if (resp) {
        bar.value = resp.data
    }
    isLoading.value = false
}
</script>
<template>
    <form @submit.prevent="finishImporting">
        <PageHeader>
            {{ t('cocktail.import') }}
        </PageHeader>
        <h3 class="form-section-title">{{ t('import.type') }}</h3>
        <div class="block-container block-container--padded">
            <!-- <OverlayLoader v-if="isLoading" /> -->
            <SubscriptionCheck>Subscribe to "Mixologist" plan to remove limit of two import actions per minute!</SubscriptionCheck>
            <div class="form-group">
                <label class="form-label form-label--required">{{ t('type') }}:</label>
                <div class="import-types">
                    <SaltRimRadio v-model="importType" :title="t('import.type-url-title')" :description="t('import.type-url-description')" value="url"></SaltRimRadio>
                    <SaltRimRadio v-model="importType" :title="t('import.type-json-title')" :description="t('import.type-json-description')" value="json"></SaltRimRadio>
                </div>
            </div>
            <div class="alert alert--info" style="margin: 1rem 0;">
                <h3>{{ t('information') }}</h3>
                <p>{{ t('import.notice') }}</p>
            </div>
            <div v-if="importType === 'url'" class="form-group">
                <label class="form-label form-label--required" for="import-source">{{ t('source') }}:</label>
                <input id="import-source" v-model="source" type="url" class="form-input" placeholder="https://" required>
            </div>
            <div v-else class="form-group">
                <label class="form-label form-label--required" for="import-source">{{ t('source') }}:</label>
                <textarea id="import-source" v-model="source" class="form-input" rows="14" required></textarea>
                <p class="form-input-hint">
                    JSON structure needs to be compatible with <a href="https://barassistant.app/cocktail-02.schema.json">Draft 2</a> or <a href="https://barassistant.app/cocktail-01.schema.json">Draft 1</a> JSON schema.
                </p>
            </div>
            <!-- <div v-if="importType === 'json'" class="form-group">
                <label class="form-label form-label--required">{{ t('duplicate.actions') }}:</label>
                <label class="form-checkbox">
                    <input v-model="duplicateAction" name="import-duplicate" type="radio" value="none">
                    <span>{{ t('duplicate.none') }}</span>
                </label>
                <label class="form-checkbox">
                    <input v-model="duplicateAction" name="import-duplicate" type="radio" value="skip">
                    <span>{{ t('duplicate.skip') }}</span>
                </label>
                <label class="form-checkbox">
                    <input v-model="duplicateAction" name="import-duplicate" type="radio" value="overwrite">
                    <span>{{ t('duplicate.overwrite') }}</span>
                </label>
            </div> -->
            <div style="display: flex; gap: var(--gap-size-2);">
                <button type="button" class="button button--outline" @click.prevent="clearImport">{{ t('clear') }}</button>
                <button type="button" class="button button--dark" @click.prevent="importCocktail" :disabled="isLoading"><OverlayLoader v-if="isLoading" />{{ t('import.start') }}</button>
            </div>
        </div>
        <div class="sda" v-if="similarCocktails.length > 0">
            <h3 class="form-section-title">{{ t('cocktails-similar') }}</h3>
            <div class="similar-cocktails-list block-container block-container--padded">
                <OverlayLoader v-if="isLoadingSimilar" />
                <RouterLink :to="{name: 'cocktails.show', params: { id: cocktail.slug }}" v-for="cocktail in similarCocktails" :key="cocktail.id">{{ cocktail.name }}</RouterLink>
            </div>
        </div>
        <div v-if="result.recipe" class="scraper-form">
            <h3 class="form-section-title">{{ t('recipe-information') }}</h3>
            <div class="block-container block-container--padded">
                <div class="form-group">
                    <label class="form-label form-label--required" for="name">{{ t('name') }}</label>
                    <input id="name" v-model="result.recipe.name" type="text" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="description">{{ t('description') }}</label>
                    <textarea id="description" v-model="result.recipe.description" class="form-input" rows="4"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="source">{{ t('source') }}</label>
                    <input id="source" v-model="result.recipe.source" type="text" class="form-input">
                </div>
                <div class="form-group">
                    <label class="form-label" for="glass">{{ t('glass-type.title') }}</label>
                    <input id="glass" v-model="result.recipe.glass" type="text" class="form-input">
                </div>
                <div class="form-group">
                    <label class="form-label form-label--required" for="instructions">{{ t('instructions') }}</label>
                    <textarea id="instructions" v-model="result.recipe.instructions" class="form-input" rows="4" required></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="garnish">{{ t('garnish') }}</label>
                    <textarea id="garnish" v-model="result.recipe.garnish" class="form-input" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="method">{{ t('method.title') }}</label>
                    <input id="method" v-model="result.recipe.method" type="text" class="form-input">
                </div>
                <template v-for="image in result.recipe.images" :key="image.uri">
                    <div class="form-group">
                        <label class="form-label" for="image_url">{{ t('generate-image-dialog.preview') }}</label>
                        <!-- <input id="image_url" v-model="image.uri" type="text" class="form-input"> -->
                        <img class="import-image-preview" :src="image.uri" alt="Preview image of cocktail from the scraped URL">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="image_copyrigh">{{ t('imageupload.copyright') }}</label>
                        <input id="image_copyrigh" v-model="image.copyright" type="text" class="form-input">
                    </div>
                </template>
                <div class="form-group">
                    <label class="form-label" for="tags">{{ t('tag.tags') }}</label>
                    <input id="tags" v-model="cocktailTags" type="text" class="form-input">
                </div>
            </div>
            <h3 class="form-section-title">{{ t('ingredient.ingredients') }}</h3>
            <template v-for="(ingredient, idx) in result.recipe.ingredients" :key="idx">
                <div class="block-container block-container--padded scraper-ingredients__ingredient">
                    <p v-if="ingredient._source"><strong>{{ t('source') }}:</strong> {{ ingredient._source }}</p>
                    <div class="scraper-ingredients__ingredient__inputs">
                        <div class="form-group">
                            <label class="form-label form-label--required" :for="'ingredient_name_' + idx">{{ t('name') }}</label>
                            <input :id="'ingredient_name_' + idx" v-model="ingredient.refIngredient.name" type="text" class="form-input" :disabled="ingredient.matchedIngredient != null" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label form-label--required" :for="'ingredient_amount_' + idx">{{ t('amount') }}</label>
                            <input :id="'ingredient_amount_' + idx" v-model="ingredient.amount" type="text" class="form-input" required>
                        </div>
                        <div v-if="ingredient.amount_max" class="form-group">
                            <label class="form-label" :for="'ingredient_amount_max_' + idx">{{ t('amount-max') }}</label>
                            <input :id="'ingredient_amount_max_' + idx" v-model="ingredient.amount_max" type="text" class="form-input">
                        </div>
                        <div class="form-group">
                            <label class="form-label form-label--required" :for="'ingredient_units_' + idx">{{ t('units') }}</label>
                            <input :id="'ingredient_units_' + idx" v-model="ingredient.units" type="text" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" :for="'ingredient_note_' + idx">{{ t('note.title') }}</label>
                            <input :id="'ingredient_note_' + idx" v-model="ingredient.note" type="text" class="form-input">
                        </div>
                    </div>
                    <div v-if="ingredient.matchedIngredient != null" class="scraper-ingredients__ingredient__existing">
                        <span style="letter-spacing: -4px;">&boxur;&rtrif;</span> {{ t('save-as') }} "{{ ingredient.matchedIngredient.name }}" &middot; <a href="#" @click.prevent="ingredient.matchedIngredient = null">{{ t('cancel') }}</a>
                    </div>
                    <div class="scraper-ingredients__ingredient__actions">
                        <a href="#" @click.prevent="manuallyMatch(ingredient)">{{ t('import.manually-match') }}</a>
                        &middot;
                        <a href="#" @click.prevent="removeIngredient(ingredient._id)">{{ t('remove') }}</a>
                    </div>
                </div>
                <div v-for="(sub, sidx) in ingredient.substitutes" :key="sub._id" class="block-container block-container--padded scraper-ingredients__ingredient" style="margin-left: 3rem;">
                    <p><strong>{{ t('substitutes') }}:</strong></p>
                    <div class="scraper-ingredients__ingredient__inputs">
                        <div class="form-group">
                            <label class="form-label" :for="'sub_ingredient_name_' + idx">{{ t('name') }}</label>
                            <input :id="'sub_ingredient_name_' + idx" v-model="sub.refIngredient.name" type="text" class="form-input" :disabled="sub.matchedIngredient != null">
                        </div>
                        <div class="form-group">
                            <label class="form-label" :for="'sub_ingredient_amount_' + sidx">{{ t('amount') }}</label>
                            <input :id="'sub_ingredient_amount_' + sidx" v-model="sub.amount" type="text" class="form-input">
                        </div>
                        <div v-if="sub.amount_max" class="form-group">
                            <label class="form-label" :for="'sub_ingredient_amount_max_' + sidx">{{ t('amount-max') }}</label>
                            <input :id="'sub_ingredient_amount_max_' + sidx" v-model="sub.amount_max" type="text" class="form-input">
                        </div>
                        <div class="form-group">
                            <label class="form-label" :for="'sub_ingredient_units_' + sidx">{{ t('units') }}</label>
                            <input :id="'sub_ingredient_units_' + sidx" v-model="sub.units" type="text" class="form-input">
                        </div>
                    </div>
                    <div v-if="sub.matchedIngredient != null" class="scraper-ingredients__ingredient__existing">
                        <span style="letter-spacing: -4px;">&boxur;&rtrif;</span> {{ t('save-as') }} "{{ sub.matchedIngredient.name }}" &middot; <a href="#" @click.prevent="sub.matchedIngredient = null">{{ t('cancel') }}</a>
                    </div>
                    <div class="scraper-ingredients__ingredient__actions">
                        <a href="#" @click.prevent="manuallyMatch(sub)">{{ t('import.manually-match') }}</a>
                        &middot;
                        <a href="#" @click.prevent="removeSubIngredient(ingredient, ingredient._id)">{{ t('remove') }}</a>
                    </div>
                </div>
            </template>
            <SaltRimDialog v-if="ingredientEdit" v-model="showIngredientDialog">
                <template #trigger><span></span></template>
                <template #dialog>
                    <div class="dialog-title">{{ t('import.manually-match') }}</div>
                    <p style="margin-bottom: 1rem;">{{ t('import.manual-match-notice', {name: ingredientEdit.refIngredient.name}) }}</p>
                    <IngredientFinder v-if="bar.search_token" :search-token="bar.search_token" :initial-query="ingredientEdit.refIngredient.name" @ingredient-selected="handleIngredientEdit"></IngredientFinder>
                    <div class="dialog-actions">
                        <button type="button" class="button button--outline" @click="showIngredientDialog = false">{{ t('close') }}</button>
                    </div>
                </template>
            </SaltRimDialog>
            <div class="form-actions">
                <RouterLink class="button button--outline" :to="{ name: 'cocktails' }">{{ t('cancel') }}</RouterLink>
                <button type="submit" class="button button--dark" :disabled="isImporting"><OverlayLoader v-if="isImporting" />{{ t('import.continue') }}</button>
            </div>
        </div>
    </form>
</template>

<style scoped>
.scraper-form .form-group {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}

.scraper-form .form-group label {
    flex-basis: 250px;
}

.scraper-form .form-group :is(input, select, textarea) {
    flex-grow: 1;
    width: auto;
}

.scraper-ingredients__ingredient {
    margin-bottom: 1rem;
}

.scraper-ingredients__ingredient p {
    color: var(--clr-accent-700);
    margin-bottom: var(--gap-size-3);
}

.dark-theme .scraper-ingredients__ingredient p {
    color: var(--clr-accent-300);
}

.scraper-ingredients__ingredient__inputs {
    display: flex;
    /* flex-wrap: wrap; */
    align-items: center;
    gap: var(--gap-size-2);
}

.scraper-ingredients__ingredient .form-group {
    margin-bottom: 0;
}

.scraper-ingredients__ingredient .form-group label,
.scraper-ingredients__ingredient .form-group :is(input, select, textarea) {
    width: 100%;
}

.scraper-ingredients__ingredient__existing {
    font-weight: var(--fw-bold);
}

.import-types {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr;
    gap: var(--gap-size-2);
}

@media (max-width: 450px) {
    .scraper-ingredients__ingredient__inputs {
        flex-wrap: wrap;
    }
    .import-types {
        grid-template-columns: 1fr;
    }
}

.import-image-preview {
    max-width: 150px;
    max-height: 200px;
}

.similar-cocktails-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-size-3);
}
</style>
