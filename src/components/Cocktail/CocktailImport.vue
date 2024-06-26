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
                    <SaltRimRadio v-model="importType" :title="$t('import.type-yaml-title')" :description="$t('import.type-yaml-description')" value="yaml"></SaltRimRadio>
                    <SaltRimRadio v-model="importType" :title="$t('import.type-collection-title')" :description="$t('import.type-collection-description')" value="collection"></SaltRimRadio>
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
                <textarea id="import-source" v-model="source" class="form-input" rows="7" required></textarea>
            </div>
            <div v-if="importType === 'collection'" class="form-group">
                <label class="form-label form-label--required">{{ $t('duplicate.actions') }}:</label>
                <label class="form-checkbox">
                    <input v-model="duplicateAction" name="import-duplicate" type="radio" :value="0">
                    <span>{{ $t('duplicate.none') }}</span>
                </label>
                <label class="form-checkbox">
                    <input v-model="duplicateAction" name="import-duplicate" type="radio" :value="1">
                    <span>{{ $t('duplicate.skip') }}</span>
                </label>
                <label class="form-checkbox">
                    <input v-model="duplicateAction" name="import-duplicate" type="radio" :value="2">
                    <span>{{ $t('duplicate.overwrite') }}</span>
                </label>
            </div>
            <button type="button" class="button button--dark" @click.prevent="importCocktail">{{ $t('import.start') }}</button>
        </div>
        <div v-if="result" class="scraper-form">
            <h3 class="form-section-title">{{ $t('recipe-information') }}</h3>
            <div class="block-container block-container--padded">
                <div class="form-group">
                    <label class="form-label" for="name">{{ $t('name') }}</label>
                    <input id="name" v-model="result.name" type="text" class="form-input">
                </div>
                <div class="form-group">
                    <label class="form-label" for="description">{{ $t('description') }}</label>
                    <textarea id="description" v-model="result.description" class="form-input" rows="4"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="source">{{ $t('source') }}</label>
                    <input id="source" v-model="result.source" type="text" class="form-input">
                </div>
                <div class="form-group">
                    <label class="form-label" for="glass">{{ $t('glass-type.title') }}</label>
                    <input id="glass" v-model="result.glass" type="text" class="form-input">
                </div>
                <div class="form-group">
                    <label class="form-label" for="instructions">{{ $t('instructions') }}</label>
                    <textarea id="instructions" v-model="result.instructions" class="form-input" rows="4"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="garnish">{{ $t('garnish') }}</label>
                    <textarea id="garnish" v-model="result.garnish" class="form-input" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="method">{{ $t('method.title') }}</label>
                    <input id="method" v-model="result.method" type="text" class="form-input">
                </div>
                <template v-for="image in result.images" :key="image.url">
                    <div class="form-group">
                        <label class="form-label" for="image_url">{{ $t('image-url') }}</label>
                        <input id="image_url" v-model="image.url" type="text" class="form-input">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="image_copyrigh">{{ $t('imageupload.copyright') }}</label>
                        <input id="image_copyrigh" v-model="image.copyright" type="text" class="form-input">
                    </div>
                </template>
                <div class="form-group">
                    <label class="form-label" for="tags">{{ $t('tag.tags') }}</label>
                    <input id="tags" v-model="cocktailTags" type="text" class="form-input">
                </div>
            </div>
            <h3 class="form-section-title">{{ $t('ingredient.ingredients') }}</h3>
            <div v-for="(ingredient, idx) in result.ingredients" :key="idx" class="block-container block-container--padded scraper-ingredients__ingredient">
                <p><strong>{{ $t('source') }}:</strong> {{ ingredient.source }}</p>
                <div class="scraper-ingredients__ingredient__inputs">
                    <div class="form-group">
                        <label class="form-label" :for="'ingredient_name_' + idx">{{ $t('name') }}</label>
                        <input :id="'ingredient_name_' + idx" v-model="ingredient.name" type="text" class="form-input" :disabled="ingredient.existingIngredient != null">
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
                <div v-if="ingredient.existingIngredient" class="scraper-ingredients__ingredient__existing"><span style="letter-spacing: -4px;">&boxur;&rtrif;</span> {{ $t('save-as') }} "{{ ingredient.existingIngredient.name }}" &middot; <a href="#" @click.prevent="resetIngredientMatch(ingredient)">{{ $t('cancel') }}</a></div>
                <div class="scraper-ingredients__ingredient__actions">
                    <a href="#" @click.prevent="manuallyMatch(ingredient)">{{ $t('import.manually-match') }}</a>
                    &middot;
                    <a href="#" @click.prevent="removeIngredient(ingredient)">{{ $t('remove') }}</a>
                </div>
            </div>
            <SaltRimDialog v-if="ingredientEdit" v-model="showIngredientDialog">
                <template #trigger><span></span></template>
                <template #dialog>
                    <div class="dialog-title">{{ $t('import.manually-match') }}</div>
                    <p style="margin-bottom: 1rem;">{{ $t('import.manual-match-notice', {name: ingredientEdit.name}) }}</p>
                    <IngredientFinder :initial-query="ingredientEdit.name" @ingredient-selected="handleIngredientEdit"></IngredientFinder>
                    <div class="dialog-actions">
                        <button type="button" class="button button--outline" @click="showIngredientDialog = false">{{ $t('close') }}</button>
                    </div>
                </template>
            </SaltRimDialog>
            <div class="form-actions">
                <RouterLink class="button button--outline" :to="{ name: 'cocktails' }">{{ $t('cancel') }}</RouterLink>
                <button type="button" class="button button--dark" @click="goTo('cocktails.form')">{{ $t('import.continue') }}</button>
            </div>
        </div>
    </form>
</template>

<script>
import ApiRequests from './../../ApiRequests.js'
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
            duplicateAction: 0,
            source: null,
            result: null,
            ingredientEdit: null,
            showIngredientDialog: false,
            appState: new AppState(),
        }
    },
    computed: {
        cocktailTags: {
            get() {
                return this.result.tags.join(',')
            },
            set(newVal) {
                if (Array.isArray(newVal)) {
                    newVal = newVal.join(',')
                }

                if (newVal == '' || newVal == null || newVal == undefined) {
                    this.result.tags = []
                } else {
                    this.result.tags = Array.from(new Set(newVal.split(',').filter(t => t != '')))
                }
            }
        },
    },
    created() {
        document.title = `${this.$t('cocktail.import')} \u22C5 ${this.site_title}`
    },
    methods: {
        importCocktail() {
            this.isLoading = true
            if (this.importType == 'collection') {
                this.$toast.default('Started importing collection.')

                ApiRequests.importCocktail({ source: this.source, duplicate_actions: this.duplicateAction }, { type: 'collection' }).then(() => {
                    this.$router.push({ name: 'cocktails' })
                }).catch(e => {
                    this.isLoading = false
                    this.$toast.error(e.message)
                })
            } else {
                ApiRequests.importCocktail({ source: this.source, duplicate_actions: this.duplicateAction }, { type: this.importType }).then(data => {
                    this.result = data
                    this.result.ingredients.map(i => i.existingIngredient = null)
                    this.result.ingredients.map(i => {
                        const newAmount = UnitHandler.convertFromTo(i.units, i.amount, this.appState.defaultUnit)
                        if (i.amount != newAmount) {
                            i.units = this.appState.defaultUnit
                        }
                        i.amount = newAmount

                        return i
                    })
                    this.cocktailTags = data.tags
                    this.isLoading = false
                }).catch(e => {
                    this.isLoading = false
                    this.$toast.error(e.message)
                })
            }
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
        async goTo(routeName) {
            this.isLoading = true
            await this.matchGlass()
            await this.matchIngredients()
            await this.matchMethod()
            this.isLoading = false

            this.result.ingredients.map(i => {
                i.ingredient_id = i.existingIngredient.id
                i.ingredient_slug = i.existingIngredient.slug
                i.name = i.existingIngredient.name

                if (i.units == null) {
                    i.units = this.appState.defaultUnit
                }

                return i
            })

            sessionStorage.setItem('scrapeResult', JSON.stringify(this.result))
            this.$router.push({ name: routeName })
        },
    }
}
</script>

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
    color: var(--clr-accent-800);
    margin-bottom: var(--gap-size-3);
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
