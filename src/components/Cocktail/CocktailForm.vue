<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <PageHeader>
            {{ $t('cocktail.title') }}
        </PageHeader>
        <h3 class="form-section-title">{{ $t('recipe-information') }}</h3>
        <div class="block-container block-container--padded">
            <div class="form-group">
                <label class="form-label form-label--required" for="name">{{ $t('name') }}:</label>
                <input id="name" v-model="cocktail.name" class="form-input" type="text" required :placeholder="$t('placeholder.cocktail-name')">
            </div>
            <div class="form-group">
                <label class="form-label form-label--required" for="instructions">{{ $t('instructions') }}:</label>
                <textarea id="instructions" v-model="cocktail.instructions" rows="8" class="form-input" required :placeholder="$t('placeholder.cocktail-instructions')"></textarea>
                <p class="form-input-hint">{{ $t('field-supports-md') }}</p>
            </div>
            <div class="form-group">
                <label class="form-label" for="garnish">{{ $t('garnish') }}:</label>
                <textarea id="garnish" v-model="cocktail.garnish" rows="3" class="form-input" :placeholder="$t('placeholder.cocktail-garnish')"></textarea>
                <p class="form-input-hint">{{ $t('field-supports-md') }}</p>
            </div>
        </div>
        <h3 class="form-section-title">{{ $t('media') }}</h3>
        <SubscriptionCheck>Subscribe to "Mixologist" plan to upload more than one cocktail recipe image!</SubscriptionCheck>
        <ImageUpload ref="imagesUpload" :value="cocktail.images" :max-images="maxImages" />
        <h3 class="form-section-title">{{ $t('ingredient.ingredients') }}</h3>
        <div class="block-container block-container--padded block-container--inset">
            <ul v-show="cocktail.ingredients.length > 0" class="cocktail-form__ingredients" style="margin-bottom: 20px;">
                <li v-for="ing in cocktail.ingredients" :key="ing.ingredient.id" class="block-container" :data-id="ing.ingredient.id">
                    <div class="drag-handle"></div>
                    <div class="cocktail-form__ingredients__content">
                        <div class="form-group">
                            <label class="form-label">{{ $t('ingredient.title') }}<template v-if="ing.sort <= 1"> ({{ $t('ingredient.base') }})</template>:</label>
                            <p>
                                {{ ing.ingredient.name }}
                                <span v-if="ing.note">&middot; {{ ing.note }}</span>
                                <small v-show="ing.optional">({{ ing.optional ? $t('optional') : '' }})</small>
                            </p>
                            <p v-if="ing.substitutes && ing.substitutes.length > 0" class="substitutes">
                                <template v-for="sub in ing.substitutes">
                                    {{ $t('or').toLowerCase() }} {{ sub.ingredient.name }}&nbsp;
                                </template>
                            </p>
                        </div>
                        <div class="form-group">
                            <label class="form-label">{{ $t('amount') }}:</label>
                            <p :title="ing.amount + ' ' + ing.units">{{ printIngredientAmount(ing) }}</p>
                        </div>
                        <div class="cocktail-form__ingredients__actions">
                            <a href="#" @click.prevent="cocktailIngredientForEdit = ing; showDialog = true">
                                {{ $t('edit') }}
                            </a>
                            &middot;
                            <a href="#" @click.prevent="editIngredientSubstitutes(ing)">
                                {{ $t('ingredient.dialog.select-substitutes') }}
                            </a>
                            &middot;
                            <a href="#" @click.prevent="removeIngredient(ing)">
                                {{ $t('remove') }}
                            </a>
                        </div>
                    </div>
                </li>
            </ul>
            <SaltRimDialog v-model="showDialog">
                <template #trigger>
                    <button class="button button--dark" type="button" @click="addIngredient">{{ $t('ingredient.add') }}</button>
                </template>
                <template #dialog>
                    <IngredientModal :cocktail-ingredient="cocktailIngredientForEdit" @close="showDialog = false" />
                </template>
            </SaltRimDialog>
        </div>
        <SaltRimDialog v-model="showSubstituteDialog">
            <template #trigger>
                <span></span>
            </template>
            <template #dialog>
                <SubstituteModal :value="cocktailIngredientForSubstitutes" @close="showSubstituteDialog = false" />
            </template>
        </SaltRimDialog>
        <h3 class="form-section-title">{{ $t('additional-information') }}</h3>
        <div class="block-container block-container--padded">
            <div class="form-group">
                <label class="form-label" for="description">{{ $t('description') }}:</label>
                <textarea id="description" v-model="cocktail.description" rows="5" class="form-input" :placeholder="$t('placeholder.cocktail-description')"></textarea>
                <p class="form-input-hint">{{ $t('field-supports-md') }}</p>
            </div>
            <div class="form-group">
                <label class="form-label" for="glass">{{ $t('glass-type.title') }}:</label>
                <select id="glass" v-model="cocktail.glass.id" class="form-select">
                    <option :value="undefined" disabled>Select a glass type...</option>
                    <option v-for="glass in glasses" :key="glass.id" :value="glass.id">{{ glass.name }}</option>
                </select>
            </div>
            <div style="margin-bottom: 2rem;">
                <label class="form-label">{{ $t('method-and-dilution') }}:</label>
                <div class="cocktail-methods">
                    <SaltRimRadio v-for="method in methods" :key="method.id" v-model="cocktail.method.id" :value="method.id" :title="$t('method.' + method.name)" :description="method.dilution_percentage + '%'"></SaltRimRadio>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label" for="source">{{ $t('source') }}:</label>
                <input id="source" v-model="cocktail.source" class="form-input" type="text" :placeholder="$t('placeholder.source')">
            </div>
            <div class="form-group">
                <label class="form-label" for="cocktail-tags">{{ $t('tag.tags') }}:</label>
                <TagSelector id="cocktail-tags" v-model="cocktail.tags" :options="tags" label-key="name" :placeholder="$t('placeholder.tags')"></TagSelector>
                <p class="form-input-hint">{{ $t('tag.help-text') }}</p>
            </div>
            <div v-show="utensils.length > 0" class="form-group">
                <label class="form-label" for="utensil">{{ $t('utensils.title') }}:</label>
                <select id="utensil" v-model="cocktail.utensils" class="form-select" multiple style="height: 200px;">
                    <option v-for="utensil in utensils" :key="utensil.id" :value="utensil.id">{{ utensil.name }}</option>
                </select>
            </div>
        </div>
        <div class="form-actions form-actions--timestamps">
            <TimeStamps v-if="cocktail.id" :resource="cocktail"></TimeStamps>
            <div class="form-actions__buttons">
                <RouterLink v-if="cocktail.id" class="button button--outline" :to="{ name: 'cocktails.show', params: { id: cocktail.id } }">{{ $t('cancel') }}</RouterLink>
                <RouterLink v-else class="button button--outline" :to="{ name: 'cocktails' }">{{ $t('cancel') }}</RouterLink>
                <button class="button button--dark" type="submit">{{ $t('save') }}</button>
            </div>
        </div>
    </form>
</template>

<script>
import Utils from './../../Utils.js'
import UnitHandler from './../../UnitHandler'
import ApiRequests from './../../ApiRequests.js'
import OverlayLoader from './../OverlayLoader.vue'
import IngredientModal from './../Cocktail/IngredientModal.vue'
import ImageUpload from './../ImageUpload.vue'
import PageHeader from './../PageHeader.vue'
import Sortable from 'sortablejs'
import SaltRimDialog from './../Dialog/SaltRimDialog.vue'
import SaltRimRadio from '../SaltRimRadio.vue'
import AppState from './../../AppState'
import SubstituteModal from './SubstituteModal.vue'
import SubscriptionCheck from '../SubscriptionCheck.vue'
import TimeStamps from '../TimeStamps.vue'
import TagSelector from '../TagSelector.vue'

export default {
    components: {
        OverlayLoader,
        IngredientModal,
        ImageUpload,
        PageHeader,
        SaltRimDialog,
        SaltRimRadio,
        SubstituteModal,
        SubscriptionCheck,
        TimeStamps,
        TagSelector
    },
    data() {
        return {
            showDialog: false,
            showSubstituteDialog: false,
            cocktailIngredientForEdit: {},
            cocktailIngredientForEditOriginal: {},
            cocktailIngredientForSubstitutes: {},
            maxImages: 10,
            isLoading: false,
            cocktail: {
                id: null,
                ingredients: [],
                tags: [],
                glass: {},
                method: {},
                images: [],
                utensils: []
            },
            glasses: [],
            methods: [],
            tags: [],
            sortable: null,
            utensils: [],
        }
    },
    watch: {
        showDialog(newVal) {
            if (newVal == false) {
                const emptyIngredient = this.cocktail.ingredients.findIndex(i => i.ingredient.id == null)
                if (emptyIngredient != -1) {
                    this.cocktail.ingredients.splice(emptyIngredient, 1)
                }
            }
        }
    },
    async created() {
        document.title = `${this.$t('cocktail.title')} \u22C5 ${this.site_title}`

        this.isLoading = true
        const cocktailId = this.$route.query.id || null

        if (cocktailId) {
            await ApiRequests.fetchCocktail(cocktailId).then(data => {
                data.description = Utils.decodeHtml(data.description)
                data.instructions = Utils.decodeHtml(data.instructions)
                data.garnish = Utils.decodeHtml(data.garnish)
                if (!data.method) {
                    data.method = {}
                }
                if (!data.glass) {
                    data.glass = {}
                }
                data.utensils = data.utensils.map(ut => ut.id)
                data.tags = data.tags.map(i => i.name)

                this.cocktail = data

                document.title = `${this.$t('cocktail.title')} \u22C5 ${this.cocktail.name} \u22C5 ${this.site_title}`
            })
        }

        await ApiRequests.fetchGlasses().then(data => this.glasses = data)
        await ApiRequests.fetchCocktailMethods().then(data => this.methods = data)
        await ApiRequests.fetchTags().then(data => this.tags = data)
        await ApiRequests.fetchUtensils().then(data => this.utensils = data)

        this.isLoading = false
    },
    mounted() {
        this.checkForImportData()

        this.sortable = Sortable.create(document.querySelector('.cocktail-form__ingredients'), {
            handle: '.drag-handle',
            ghostClass: 'block-container--placeholder',
            animation: 150,
            onEnd: () => {
                this.updateSortPosition()
            },
        })

        const state = new AppState()
        if (!state.isSubscribed()) {
            this.maxImages = 1
        }
    },
    methods: {
        checkForImportData() {
            const scraped = sessionStorage.getItem('scrapeResult')
            if (scraped) {
                sessionStorage.removeItem('scrapeResult')
                const parsedScrapeResult = JSON.parse(scraped)

                this.cocktail = parsedScrapeResult
            }
        },
        removeIngredient(ing) {
            if (!ing.ingredient.id) {
                this.cocktail.ingredients.splice(
                    this.cocktail.ingredients.findIndex(i => i == ing),
                    1
                )

                return
            }

            this.$confirm(this.$t('cocktail.ingredient-remove', { name: ing.ingredient.name }), {
                onResolved: (dialog) => {
                    dialog.close()
                    this.cocktail.ingredients.splice(
                        this.cocktail.ingredients.findIndex(i => i == ing),
                        1
                    )
                }
            })
        },
        addIngredient() {
            const appState = new AppState()
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

            const placeholderData = {
                amount: defaultAmount,
                amount_max: null,
                note: null,
                units: defaultUnits,
                sort: this.cocktail.ingredients.length + 1,
                substitutes: [],
                ingredient: {
                    id: null,
                    slug: null,
                    name: this.$t('ingredient.name-placeholder'),
                }
            }

            this.cocktail.ingredients.push(placeholderData)
            this.cocktailIngredientForEdit = placeholderData;
            this.showDialog = true
        },
        printIngredientAmount(ing) {
            const appState = new AppState()
            const defaultUnit = appState.defaultUnit

            return UnitHandler.print(ing, defaultUnit)
        },
        editIngredientSubstitutes(ing) {
            this.cocktailIngredientForSubstitutes = ing
            this.showSubstituteDialog = true
        },
        async submit() {
            const sortedIngredientList = this.sortable.toArray()

            this.isLoading = true

            const postData = {
                name: this.cocktail.name,
                description: this.cocktail.description,
                instructions: this.cocktail.instructions,
                garnish: this.cocktail.garnish,
                source: this.cocktail.source,
                cocktail_method_id: this.cocktail.method.id,
                utensils: this.cocktail.utensils,
                images: [],
                tags: this.cocktail.tags,
                glass_id: this.cocktail.glass.id,
                ingredients: this.cocktail.ingredients
                    .filter(i => i.ingredient.id != null)
                    .map((cIngredient) => {
                        cIngredient.amount = UnitHandler.asDecimal(cIngredient.amount)
                        if (cIngredient.amount_max) {
                            cIngredient.amount_max = UnitHandler.asDecimal(cIngredient.amount_max)
                        }
                        cIngredient.sort = sortedIngredientList.findIndex(sortedId => sortedId == cIngredient.ingredient.id) + 1

                        // Handle substitutes
                        cIngredient.substitutes.filter(sub => sub.units).map(sub => {
                            if (sub.amount) {
                                sub.amount = UnitHandler.asDecimal(sub.amount)
                            }
                            if (sub.amount_max) {
                                sub.amount_max = UnitHandler.asDecimal(sub.amount_max)
                            }
                        })

                        return cIngredient
                    })
            }

            const imageResources = await this.$refs.imagesUpload.uploadPictures().catch(() => {
                this.$toast.error(`${this.$t('imageupload.error')} ${this.$t('imageupload.error-cocktail')}`)
            }) || []

            if (imageResources.length > 0) {
                postData.images = imageResources.map(img => img.id)
            }

            if (this.cocktail.id) {
                ApiRequests.updateCocktail(this.cocktail.id, postData).then(data => {
                    this.isLoading = false
                    this.$toast.default(this.$t('cocktail.update-success'))
                    this.$router.push({ name: 'cocktails.show', params: { id: data.slug } })
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false
                })
            } else {
                ApiRequests.saveCocktail(postData).then(data => {
                    this.isLoading = false
                    this.$toast.open({
                        message: this.$t('cocktail.create-success')
                    })
                    this.$router.push({ name: 'cocktails.show', params: { id: data.slug } })
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false
                })
            }
        },
        updateSortPosition() {
            const sortedIngredientList = this.sortable.toArray()

            this.cocktail.ingredients.map((cIngredient) => {
                cIngredient.sort = sortedIngredientList.findIndex(sortedId => sortedId == cIngredient.ingredient.id) + 1

                return cIngredient
            })
        }
    }
}
</script>

<style scoped>
.cocktail-form__ingredients {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    row-gap: var(--gap-size-3)
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
</style>
