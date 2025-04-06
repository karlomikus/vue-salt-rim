<template>
    <PageHeader>
        {{ $t('cocktail.title') }}
    </PageHeader>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
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
        <h3 class="form-section-title">{{ $t('ingredient.ingredients') }}</h3>
        <div class="block-container block-container--padded block-container--inset">
            <div v-show="cocktail.ingredients.length === 0" class="cocktail-form__ingredients__onboard">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <path d="m15.139 7.813 4.638 18.29h8.446l4.638-18.29ZM19.723 29.861l-4.7 10.674 8.977-.02 8.977.02-4.7-10.674-3.619.002h-1.316zM18.88 26.61v2.997h10.24V26.61z" style="fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round" />
                </svg>
                <p>Here you can manage this cocktail's ingredients and amounts. Start by adding your first ingredient.</p>
            </div>
            <ul v-show="cocktail.ingredients.length > 0" class="cocktail-form__ingredients" style="margin-bottom: 20px;">
                <li v-for="(ing, idx) in cocktail.ingredients" :key="ing.ingredient.id" class="block-container" :data-id="ing.ingredient.id">
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
                            <SaltRimDialog v-model="showDialogs[idx]" @dialog-closed="handleCocktailIngredientModalClose(idx)">
                                <template #trigger>
                                    <a href="#" @click.prevent="showDialogs[idx] = true">
                                        {{ $t('edit') }}
                                    </a>
                                </template>
                                <template #dialog>
                                    <CocktailIngredientModal :search-token="bar.search_token" v-model="cocktail.ingredients[idx]" @close="handleCocktailIngredientModalClose(idx)" />
                                </template>
                            </SaltRimDialog>
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
            <div style="text-align: center;">
                <button class="button button--dark" type="button" @click="addIngredient">{{ $t('ingredient.add') }}</button>
            </div>
        </div>
        <SaltRimDialog v-model="showSubstituteDialog">
            <template #trigger>
                <span></span>
            </template>
            <template #dialog>
                <SubstituteModal :search-token="bar.search_token" :value="cocktailIngredientForSubstitutes" @close="showSubstituteDialog = false" />
            </template>
        </SaltRimDialog>
        <h3 class="form-section-title">{{ $t('media') }}</h3>
        <SubscriptionCheck>Subscribe to "Mixologist" plan to upload more than one cocktail recipe image!</SubscriptionCheck>
        <ImageUpload ref="imagesUpload" :images="cocktail.images" :max-images="maxImages" />
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
                <p class="form-input-hint">{{ $t('tag.help-text') }} {{ $t('tag.help-text-recommender') }}</p>
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
import { useTitle } from '@/composables/title'
import { useHtmlDecode } from './../../composables/useHtmlDecode';
import { unitHandler } from '@/composables/useUnits'
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

export default {
    components: {
        OverlayLoader,
        ImageUpload,
        PageHeader,
        SaltRimDialog,
        SaltRimRadio,
        SubstituteModal,
        SubscriptionCheck,
        TimeStamps,
        TagSelector,
        CocktailIngredientModal,
    },
    data() {
        const appState = new AppState()

        return {
            appState: appState,
            bar: {
                search_host: null,
                search_token: null,
            },
            showDialogs: [],
            showSubstituteDialog: false,
            cocktailIngredientForSubstitutes: {},
            maxImages: appState.isSubscribed() ? 10 : 1,
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
        },
        'cocktail.instructions': function (newVal) {
            if (this.cocktail.method && !this.cocktail.method.id) {
                const matchedMethod = this.methods.find(method =>
                    newVal.toLowerCase().includes(method.name.toLowerCase())
                )

                if (matchedMethod) {
                    this.cocktail.method.id = matchedMethod.id;
                }
            }
        },
    },
    async created() {
        useTitle(this.$t('cocktail.add'))

        this.isLoading = true

        this.glasses = (await BarAssistantClient.getGlasses())?.data ?? []
        this.methods = (await BarAssistantClient.getCocktailMethods())?.data ?? []
        this.tags = (await BarAssistantClient.getTags())?.data ?? []
        this.utensils = (await BarAssistantClient.getUtensils())?.data ?? []

        const cocktailId = this.$route.query.id || null

        this.bar = (await BarAssistantClient.getBar(this.appState.bar.id)).data ?? {}

        if (cocktailId) {
            await BarAssistantClient.getCocktail(cocktailId).then(resp => {
                resp.data.description = useHtmlDecode(resp.data.description)
                resp.data.instructions = useHtmlDecode(resp.data.instructions)
                resp.data.garnish = useHtmlDecode(resp.data.garnish)
                if (!resp.data.method) {
                    resp.data.method = {}
                }
                if (!resp.data.glass) {
                    resp.data.glass = {}
                }
                resp.data.utensils = resp.data.utensils.map(ut => ut.id)
                resp.data.tags = resp.data.tags.map(i => i.name)

                this.cocktail = resp.data

                useTitle(`${this.$t('cocktail.title')} \u22C5 ${this.cocktail.name}`)
            })
        }

        this.checkForImportData()

        if (!this.appState.isSubscribed()) {
            this.maxImages = 1
        }

        this.isLoading = false
    },
    mounted() {
        this.sortable = Sortable.create(document.querySelector('.cocktail-form__ingredients'), {
            handle: '.drag-handle',
            ghostClass: 'block-container--placeholder',
            animation: 150,
            onEnd: () => {
                this.updateSortPosition()
            },
        })
    },
    methods: {
        handleCocktailIngredientModalClose(idx) {
            this.showDialogs[idx] = false
            const emptyIngredient = this.cocktail.ingredients.findIndex(i => i.ingredient.id == null)
            if (emptyIngredient != -1) {
                this.cocktail.ingredients.splice(emptyIngredient, 1)
            }
        },
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
            const userUnit = this.appState.defaultUnit
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
            this.showDialogs[this.cocktail.ingredients.length - 1] = true
        },
        printIngredientAmount(ing) {
            const defaultUnit = this.appState.defaultUnit

            return unitHandler.print(ing, defaultUnit)
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
                        cIngredient.amount = unitHandler.asDecimal(cIngredient.amount)
                        if (cIngredient.amount_max) {
                            cIngredient.amount_max = unitHandler.asDecimal(cIngredient.amount_max)
                        }
                        cIngredient.sort = sortedIngredientList.findIndex(sortedId => sortedId == cIngredient.ingredient.id) + 1

                        // Handle substitutes
                        cIngredient.substitutes.map(sub => {
                            sub.ingredient_id = sub.ingredient.id

                            return sub
                        }).filter(sub => sub.units).map(sub => {
                            if (sub.amount) {
                                sub.amount = unitHandler.asDecimal(sub.amount)
                            }
                            if (sub.amount_max) {
                                sub.amount_max = unitHandler.asDecimal(sub.amount_max)
                            }

                            return sub
                        })

                        cIngredient.ingredient_id = cIngredient.ingredient.id

                        return cIngredient
                    })
            }

            const imageResources = await this.$refs.imagesUpload.save().catch(() => {
                this.$toast.error(`${this.$t('imageupload.error')} ${this.$t('imageupload.error-cocktail')}`)

                return []
            })

            if (imageResources.length > 0) {
                postData.images = imageResources.map(img => img.id)
            }

            if (this.cocktail.id) {
                BarAssistantClient.updateCocktail(this.cocktail.id, postData).then(resp => {
                    this.isLoading = false
                    this.$toast.default(this.$t('cocktail.update-success'))
                    this.$router.push({ name: 'cocktails.show', params: { id: resp.data.slug } })
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false
                })
            } else {
                BarAssistantClient.saveCocktail(postData).then(resp => {
                    this.isLoading = false
                    this.$toast.open({
                        message: this.$t('cocktail.create-success')
                    })
                    this.$router.push({ name: 'cocktails.show', params: { id: resp.data.slug } })
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
</style>
