<script setup lang="ts">
import { ref } from 'vue'
import BarAssistantClient from '@/api/BarAssistantClient'
import OverlayLoader from './../OverlayLoader.vue'
import PageHeader from './../PageHeader.vue'
import SaltRimRadio from '../SaltRimRadio.vue'
import IngredientFinder from './../IngredientFinder.vue'
import SaltRimDialog from '../Dialog/SaltRimDialog.vue'
import SubscriptionCheck from '../SubscriptionCheck.vue'
import { useSaltRimToast } from '@/composables/toast.js'
import AppState from '../../AppState'
import UnitHandler from '../../UnitHandler'

import type { components } from '@/api/api'
interface Ingredient {
    id: string,
    name: string,
    slug: string,
}
type Draft2Schema = components["schemas"]["cocktail-02.schema"]
type Glass = components["schemas"]["Glass"]
type FullIngredient = components["schemas"]["Ingredient"]
type CocktailMethod = components["schemas"]["CocktailMethod"]
type SchemaIngredient = components["schemas"]["cocktail-02.schema"]["ingredients"][0]
interface SchemaWithExtraIngredientData {
    recipe: {
        matchedGlassId: number | null,
        matchedMethodId: number | null,
        ingredients: {
            _source: string,
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

const toast = useSaltRimToast()
const isLoading = ref(false)
const showIngredientDialog = ref(false)
const ingredientEdit = ref<CocktailIngredient | SubstituteCocktailIngredient | null>(null)
const importType = ref('url')
const duplicateAction = ref('none')
const source = ref<null | string>(null)
const result = ref<LocalSchema>({} as LocalSchema)

function submit() {
}

function clearImport() {
}

function importCocktail() {
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
    })
}

function fromJson() {
    isLoading.value = true
    try {
        if (source.value != null) {
            const parsed = JSON.parse(source.value) as Draft2Schema

            result.value = {
                ...parsed,
                recipe: {
                    ...parsed.recipe,
                    ingredients: parsed.recipe?.ingredients?.map(i => {
                        return {
                            ...i,
                            _source: '',
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

async function getOrCreateIngredient(name: string): Promise<FullIngredient | null> {
    try {
        const response = await BarAssistantClient.getIngredients({ 'filter[name]': name.toLowerCase() })
        const dbIngredient = response?.data?.[0] ?? null

        if (dbIngredient) {
            return dbIngredient
        }

        return null
    } catch (error) {
        return null;
    }
}

async function finishImporting(route: string) {
    if (result.value.recipe.glass) {
        result.value.recipe.matchedGlassId = (await getGlass(result.value.recipe.glass))?.id ?? null
    }

    if (result.value.recipe.method) {
        result.value.recipe.matchedMethodId = (await getMethod(result.value.recipe.method))?.id ?? null
    }

    let sort = 0
    for (const ingredient of result.value.recipe.ingredients) {
        if (ingredient.matchedIngredient) {
            continue
        }

        const foundIngredient = await getOrCreateIngredient(ingredient.refIngredient.name)
        if (foundIngredient) {
            ingredient.matchedIngredient = {
                id: foundIngredient.id.toString(),
                slug: foundIngredient.slug,
                name: foundIngredient.name,
            }
        }
    }

    console.log(JSON.stringify(result.value.recipe))
}
</script>
<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <PageHeader>
            {{ $t('cocktail.import') }}
        </PageHeader>
        <h3 class="form-section-title">{{ $t('import.type') }}</h3>
        <div class="block-container block-container--padded">
            <SubscriptionCheck>Subscribe to "Mixologist" plan to remove limit of two import actions per minute!</SubscriptionCheck>
            <div class="form-group">
                <label class="form-label form-label--required">{{ $t('type') }}:</label>
                <div class="import-types">
                    <SaltRimRadio v-model="importType" :title="$t('import.type-url-title')" :description="$t('import.type-url-description')" value="url"></SaltRimRadio>
                    <SaltRimRadio v-model="importType" :title="$t('import.type-json-title')" :description="$t('import.type-json-description')" value="json"></SaltRimRadio>
                </div>
            </div>
            <div class="alert alert--info" style="margin: 1rem 0;">
                <h3>{{ $t('information') }}</h3>
                <p>{{ $t('import.notice') }}</p>
            </div>
            <div v-if="importType === 'url'" class="form-group">
                <label class="form-label form-label--required" for="import-source">{{ $t('source') }}:</label>
                <input id="import-source" v-model="source" type="url" class="form-input" placeholder="https://" required>
            </div>
            <div v-else class="form-group">
                <label class="form-label form-label--required" for="import-source">{{ $t('source') }}:</label>
                <textarea id="import-source" v-model="source" class="form-input" rows="14" required></textarea>
            </div>
            <div v-if="importType === 'json'" class="form-group">
                <label class="form-label form-label--required">{{ $t('duplicate.actions') }}:</label>
                <label class="form-checkbox">
                    <input v-model="duplicateAction" name="import-duplicate" type="radio" value="none">
                    <span>{{ $t('duplicate.none') }}</span>
                </label>
                <label class="form-checkbox">
                    <input v-model="duplicateAction" name="import-duplicate" type="radio" value="skip">
                    <span>{{ $t('duplicate.skip') }}</span>
                </label>
                <label class="form-checkbox">
                    <input v-model="duplicateAction" name="import-duplicate" type="radio" value="overwrite">
                    <span>{{ $t('duplicate.overwrite') }}</span>
                </label>
            </div>
            <button type="button" class="button button--outline" @click.prevent="clearImport">{{ $t('clear') }}</button>
            <button type="button" class="button button--dark" @click.prevent="importCocktail">{{ $t('import.start') }}</button>
        </div>
        <div v-if="result.recipe" class="scraper-form">
            <h3 class="form-section-title">{{ $t('recipe-information') }}</h3>
            <div class="block-container block-container--padded">
                <div class="form-group">
                    <label class="form-label" for="name">{{ $t('name') }}</label>
                    <input id="name" v-model="result.recipe.name" type="text" class="form-input">
                </div>
                <div class="form-group">
                    <label class="form-label" for="description">{{ $t('description') }}</label>
                    <textarea id="description" v-model="result.recipe.description" class="form-input" rows="4"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="source">{{ $t('source') }}</label>
                    <input id="source" v-model="result.recipe.source" type="text" class="form-input">
                </div>
                <div class="form-group">
                    <label class="form-label" for="glass">{{ $t('glass-type.title') }}</label>
                    <input id="glass" v-model="result.recipe.glass" type="text" class="form-input">
                </div>
                <div class="form-group">
                    <label class="form-label" for="instructions">{{ $t('instructions') }}</label>
                    <textarea id="instructions" v-model="result.recipe.instructions" class="form-input" rows="4"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="garnish">{{ $t('garnish') }}</label>
                    <textarea id="garnish" v-model="result.recipe.garnish" class="form-input" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="method">{{ $t('method.title') }}</label>
                    <input id="method" v-model="result.recipe.method" type="text" class="form-input">
                </div>
                <template v-for="image in result.recipe.images" :key="image.uri">
                    <div class="form-group">
                        <label class="form-label" for="image_url">{{ $t('image-url') }}</label>
                        <input id="image_url" v-model="image.uri" type="text" class="form-input">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="image_copyrigh">{{ $t('imageupload.copyright') }}</label>
                        <input id="image_copyrigh" v-model="image.copyright" type="text" class="form-input">
                    </div>
                </template>
                <div class="form-group">
                    <label class="form-label" for="tags">{{ $t('tag.tags') }}</label>
                    <input id="tags" v-model="result.recipe.tags" type="text" class="form-input">
                </div>
            </div>
            <h3 class="form-section-title">{{ $t('ingredient.ingredients') }}</h3>
            <template v-for="(ingredient, idx) in result.recipe.ingredients" :key="idx">
                <div class="block-container block-container--padded scraper-ingredients__ingredient">
                    <p v-if="ingredient._source"><strong>{{ $t('source') }}:</strong> {{ ingredient._source }}</p>
                    <div class="scraper-ingredients__ingredient__inputs">
                        <div class="form-group">
                            <label class="form-label" :for="'ingredient_name_' + idx">{{ $t('name') }}</label>
                            <input :id="'ingredient_name_' + idx" v-model="ingredient.refIngredient.name" type="text" class="form-input" :disabled="ingredient.matchedIngredient != null">
                        </div>
                        <div class="form-group">
                            <label class="form-label" :for="'ingredient_amount_' + idx">{{ $t('amount') }}</label>
                            <input :id="'ingredient_amount_' + idx" v-model="ingredient.amount" type="text" class="form-input">
                        </div>
                        <div v-if="ingredient.amount_max" class="form-group">
                            <label class="form-label" :for="'ingredient_amount_max_' + idx">{{ $t('amount-max') }}</label>
                            <input :id="'ingredient_amount_max_' + idx" v-model="ingredient.amount_max" type="text" class="form-input">
                        </div>
                        <div class="form-group">
                            <label class="form-label" :for="'ingredient_units_' + idx">{{ $t('units') }}</label>
                            <input :id="'ingredient_units_' + idx" v-model="ingredient.units" type="text" class="form-input">
                        </div>
                        <div class="form-group">
                            <label class="form-label" :for="'ingredient_note_' + idx">{{ $t('note.title') }}</label>
                            <input :id="'ingredient_note_' + idx" v-model="ingredient.note" type="text" class="form-input">
                        </div>
                    </div>
                    <div v-if="ingredient.matchedIngredient != null" class="scraper-ingredients__ingredient__existing">
                        <span style="letter-spacing: -4px;">&boxur;&rtrif;</span> {{ $t('save-as') }} "{{ ingredient.matchedIngredient.name }}" &middot; <a href="#" @click.prevent="ingredient.matchedIngredient = null">{{ $t('cancel') }}</a>
                    </div>
                    <div class="scraper-ingredients__ingredient__actions">
                        <a href="#" @click.prevent="manuallyMatch(ingredient)">{{ $t('import.manually-match') }}</a>
                        &middot;
                        <a href="#" @click.prevent="removeIngredient(ingredient._id)">{{ $t('remove') }}</a>
                    </div>
                </div>
                <div v-for="(sub, sidx) in ingredient.substitutes" :key="sub._id" class="block-container block-container--padded scraper-ingredients__ingredient" style="margin-left: 3rem;">
                    <p><strong>{{ $t('substitutes') }}:</strong></p>
                    <div class="scraper-ingredients__ingredient__inputs">
                        <div class="form-group">
                            <label class="form-label" :for="'sub_ingredient_name_' + idx">{{ $t('name') }}</label>
                            <input :id="'sub_ingredient_name_' + idx" v-model="sub.refIngredient.name" type="text" class="form-input" :disabled="sub.matchedIngredient != null">
                        </div>
                        <div class="form-group">
                            <label class="form-label" :for="'sub_ingredient_amount_' + sidx">{{ $t('amount') }}</label>
                            <input :id="'sub_ingredient_amount_' + sidx" v-model="sub.amount" type="text" class="form-input">
                        </div>
                        <div v-if="sub.amount_max" class="form-group">
                            <label class="form-label" :for="'sub_ingredient_amount_max_' + sidx">{{ $t('amount-max') }}</label>
                            <input :id="'sub_ingredient_amount_max_' + sidx" v-model="sub.amount_max" type="text" class="form-input">
                        </div>
                        <div class="form-group">
                            <label class="form-label" :for="'sub_ingredient_units_' + sidx">{{ $t('units') }}</label>
                            <input :id="'sub_ingredient_units_' + sidx" v-model="sub.units" type="text" class="form-input">
                        </div>
                    </div>
                    <div v-if="sub.matchedIngredient != null" class="scraper-ingredients__ingredient__existing">
                        <span style="letter-spacing: -4px;">&boxur;&rtrif;</span> {{ $t('save-as') }} "{{ sub.matchedIngredient.name }}" &middot; <a href="#" @click.prevent="sub.matchedIngredient = null">{{ $t('cancel') }}</a>
                    </div>
                    <div class="scraper-ingredients__ingredient__actions">
                        <a href="#" @click.prevent="manuallyMatch(sub)">{{ $t('import.manually-match') }}</a>
                        &middot;
                        <a href="#" @click.prevent="removeSubIngredient(ingredient, ingredient._id)">{{ $t('remove') }}</a>
                    </div>
                </div>
            </template>
            <SaltRimDialog v-if="ingredientEdit" v-model="showIngredientDialog">
                <template #trigger><span></span></template>
                <template #dialog>
                    <div class="dialog-title">{{ $t('import.manually-match') }}</div>
                    <p style="margin-bottom: 1rem;">{{ $t('import.manual-match-notice', {name: ingredientEdit.refIngredient.name}) }}</p>
                    <IngredientFinder :initial-query="ingredientEdit.refIngredient.name" @ingredient-selected="handleIngredientEdit"></IngredientFinder>
                    <div class="dialog-actions">
                        <button type="button" class="button button--outline" @click="showIngredientDialog = false">{{ $t('close') }}</button>
                    </div>
                </template>
            </SaltRimDialog>
            <div class="form-actions">
                <RouterLink class="button button--outline" :to="{ name: 'cocktails' }">{{ $t('cancel') }}</RouterLink>
                <button type="button" class="button button--dark" @click="finishImporting('cocktails.form')">{{ $t('import.continue') }}</button>
            </div>
        </div>
    </form>
</template>

<!-- <script>
import ApiRequests from './../../ApiRequests.js'
import BarAssistantClient from '@/api/BarAssistantClient'
import OverlayLoader from './../OverlayLoader.vue'
import PageHeader from './../PageHeader.vue'
import SaltRimRadio from '../SaltRimRadio.vue'
import IngredientFinder from './../IngredientFinder.vue'
import SaltRimDialog from '../Dialog/SaltRimDialog.vue'
import SubscriptionCheck from '../SubscriptionCheck.vue'
import AppState from '../../AppState'
import UnitHandler from '../../UnitHandler'

export default {
    components: {
        OverlayLoader,
        PageHeader,
        SaltRimRadio,
        IngredientFinder,
        SaltRimDialog,
        SubscriptionCheck
    },
    data() {
        return {
            isLoading: false,
            importType: 'url',
            duplicateAction: 'none',
            source: null,
            scraperMeta: [],
            result: null,
            ingredientEdit: null,
            showIngredientDialog: false,
            appState: new AppState(),
        }
    },
    computed: {
        cocktailTags: {
            get() {
                return this.result.recipe.tags.join(',')
            },
            set(newVal) {
                if (Array.isArray(newVal)) {
                    newVal = newVal.join(',')
                }

                if (newVal == '' || newVal == null || newVal == undefined) {
                    this.result.recipe.tags = []
                } else {
                    this.result.recipe.tags = Array.from(new Set(newVal.split(',').filter(t => t != '')))
                }
            }
        },
    },
    created() {
        document.title = `${this.$t('cocktail.import')} \u22C5 ${this.site_title}`
    },
    methods: {
        getIngredientById(id) {
            return this.result.ingredients.find(i => i._id == id)
        },
        getScraperMetaById(id) {
            const meta = this.scraperMeta.find(i => i._id == id)

            if (!meta) {
                return {source: null}
            }

            return meta
        },
        fromUrl() {
            this.isLoading = true
            BarAssistantClient.scrapeCocktail(this.source).then(resp => {
                this.result = resp.data.schema
                this.result.recipe.ingredients.map(i => i.existingIngredient = null)
                this.scraperMeta = resp.data.scraper_meta
                this.isLoading = false
            })
        },
        fromJson() {
            this.isLoading = true
            try {
                this.result = JSON.parse(this.source)
            } catch (e) {
                console.error('Unable to parse JSON', e)
                this.result = null
            }
            this.isLoading = false
        },
        importCocktail() {
            if (this.importType == 'url') {
                this.fromUrl()
            }

            if (this.importType == 'json') {
                this.fromJson()
            }
            // this.isLoading = true
            // ApiRequests.importCocktail({ source: this.source, duplicate_actions: this.duplicateAction }, { type: this.importType }).then(data => {
            //     this.result = data
            //     this.result.ingredients.map(i => i.existingIngredient = null)
            //     this.result.ingredients.map(i => {
            //         const newAmount = UnitHandler.convertFromTo(i.units, i.amount, this.appState.defaultUnit)
            //         if (i.amount != newAmount) {
            //             i.units = this.appState.defaultUnit
            //         }
            //         i.amount = newAmount

            //         return i
            //     })
            //     this.cocktailTags = data.tags
            //     this.isLoading = false
            // }).catch(e => {
            //     this.isLoading = false
            //     this.$toast.error(e.message)
            // })
        },
        async matchIngredients() {
            let sortIdx = 0
            for (const key in this.result.ingredients) {
                if (Object.hasOwnProperty.call(this.result.ingredients, key)) {
                    sortIdx++
                    const scrapedIngredient = this.result.ingredients[key]
                    scrapedIngredient.substitutes = []
                    scrapedIngredient.sort = sortIdx

                    if (scrapedIngredient.existingIngredient) {
                        continue
                    }

                    let dbIngredient = null
                    const possibleMatches = await ApiRequests.fetchIngredients({ 'filter[name_exact]': scrapedIngredient.name, 'per_page': 1 }).then(resp => resp.data).catch(() => { return [] })
                    if (possibleMatches.length > 0) {
                        dbIngredient = possibleMatches[0]
                    }

                    // Ingredient not found, try to create a new one
                    if (!dbIngredient) {
                        dbIngredient = await ApiRequests.saveIngredient({
                            name: scrapedIngredient.name,
                            description: scrapedIngredient.description || null,
                            strength: scrapedIngredient.strength || 0,
                            origin: scrapedIngredient.origin || null,
                            color: scrapedIngredient.color || null,
                            images: [],
                            ingredient_category_id: null,
                        }).catch(() => { return null })
                    }

                    if (!dbIngredient) {
                        this.$toast.error(`Unable to create ingredient with name ${scrapedIngredient.name}.`)
                        continue
                    }

                    scrapedIngredient.existingIngredient = {
                        id: dbIngredient.id,
                        slug: dbIngredient.slug,
                        name: dbIngredient.name,
                    }
                }
            }
        },
        async matchGlass() {
            if (!this.result.glass) {
                this.result.glass = {}
                return
            }

            let dbGlass = await ApiRequests.fetchGlasses({ 'filter[name]': this.result.glass }).then(data => {
                if (data.length == 0) {
                    return null
                }

                return data[0]
            }).catch(() => { return null })

            if (!dbGlass) {
                dbGlass = await ApiRequests.saveGlass({ name: this.result.glass, description: null }).catch(() => { return null })
            }

            if (!dbGlass) {
                this.$toast.error(`Unable to create a glass with name ${this.result.glass}.`)
                this.result.glass = {}
                return
            }

            this.result.glass = {
                id: dbGlass.id
            }
        },
        async matchMethod() {
            if (!this.result.method) {
                this.result.method = {}
                return
            }

            const dbMethods = await ApiRequests.fetchCocktailMethods().catch(() => { return [] })
            let foundMethodId = null
            dbMethods.forEach(m => {
                if (this.result.method.toLowerCase().includes(m.name.toLowerCase())) {
                    foundMethodId = m.id
                }
            })

            if (!foundMethodId) {
                this.result.method = {}
                return
            }

            this.result.method = {
                id: foundMethodId
            }
        },
        removeIngredient(ingredient) {
            this.result.ingredients.splice(
                this.result.ingredients.findIndex(i => i == ingredient),
                1
            )
        },
        manuallyMatch(ingredient) {
            this.showIngredientDialog = true
            this.ingredientEdit = ingredient
        },
        handleIngredientEdit(selectedIngredient) {
            this.ingredientEdit.existingIngredient = {
                id: selectedIngredient.id,
                slug: selectedIngredient.slug,
                name: selectedIngredient.name,
            }
            this.showIngredientDialog = false
        },
        resetIngredientMatch(ingredient) {
            ingredient.existingIngredient = null
        },
        clearImport() {
            this.source = null
            this.scraperMeta = []
            this.result = null
            this.ingredientEdit = null
        },
        async goTo(routeName) {
            this.isLoading = true
            await this.matchGlass()
            await this.matchIngredients()
            await this.matchMethod()
            this.isLoading = false

            this.result.recipe.ingredients.map(i => {
                i.ingredient.id = i.existingIngredient.id
                i.ingredient.slug = i.existingIngredient.slug
                i.ingredient.name = i.existingIngredient.name

                if (i.units == null) {
                    i.units = this.appState.defaultUnit
                }

                return i
            })

            sessionStorage.setItem('scrapeResult', JSON.stringify(this.result.recipe))
            this.$router.push({ name: routeName })
        },
    }
}
</script> -->

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
</style>
