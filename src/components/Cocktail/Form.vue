<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <PageHeader>
            {{ $t('cocktail') }}
        </PageHeader>
        <h3 class="form-section-title">{{ $t('recipe-information') }}</h3>
        <div class="block-container block-container--padded">
            <div class="form-group">
                <label class="form-label form-label--required" for="name">{{ $t('name') }}:</label>
                <input class="form-input" type="text" id="name" v-model="cocktail.name" required :placeholder="$t('placeholder.cocktai-name')">
            </div>
            <div class="form-group">
                <label class="form-label form-label--required" for="instructions">{{ $t('instructions') }}:</label>
                <textarea rows="8" class="form-input" id="instructions" v-model="cocktail.instructions" required :placeholder="$t('placeholder.cocktail-instructions')"></textarea>
                <p class="form-input-hint">{{ $t('md.support') }}</p>
            </div>
            <div class="form-group">
                <label class="form-label" for="garnish">{{ $t('garnish') }}:</label>
                <textarea rows="3" class="form-input" id="garnish" v-model="cocktail.garnish" :placeholder="$t('placeholder.cocktail-garnish')"></textarea>
                <p class="form-input-hint">{{ $t('md.support') }}</p>
            </div>
        </div>
        <h3 class="form-section-title">{{ $t('media') }}</h3>
        <ImageUpload ref="imagesUpload" :value="cocktail.images" />
        <h3 class="form-section-title">{{ $t('ingredients') }}</h3>
        <ul class="cocktail-form__ingredients" style="margin-bottom: 20px;">
            <li class="block-container" v-for="ing in cocktail.ingredients" :data-id="ing.ingredient_id">
                <div class="drag-handle"></div>
                <div class="cocktail-form__ingredients__content">
                    <div class="form-group">
                        <label class="form-label">{{ $t('ingredient') }}:</label>
                        <p>{{ ing.name }} <small v-show="ing.optional">({{ ing.optional ? $t('optional') : '' }})</small></p>
                        <p class="substitutes" v-if="ing.substitutes && ing.substitutes.length > 0">
                            <template v-for="sub in ing.substitutes">
                                {{ $t('or').toLowerCase() }} {{ sub.name }}&nbsp;
                            </template>
                        </p>
                    </div>
                    <div class="form-group">
                        <label class="form-label">{{ $t('amount') }}:</label>
                        <p :title="ing.amount + ' ' + ing.units">{{ printIngredientAmount(ing) }}</p>
                    </div>
                    <div class="cocktail-form__ingredients__actions">
                        <a href="#" @click.prevent="editIngredient(ing)">
                            {{ $t('edit') }}
                        </a>
                        &middot;
                        <a href="#" @click.prevent="removeIngredient(ing)">
                            {{ $t('remove') }}
                        </a>
                    </div>
                </div>
            </li>
        </ul>
        <Dialog v-model="showDialog">
            <template #trigger>
                <button class="button button--outline" type="button" @click="addIngredient">{{ $t('ingredient.add') }}</button>
            </template>
            <template #dialog>
                <IngredientModal :value="cocktailIngredientForEdit" @close="closeModal" />
            </template>
        </Dialog>
        <h3 class="form-section-title">{{ $t('additional-information') }}</h3>
        <div class="block-container block-container--padded">
            <div class="form-group">
                <label class="form-label" for="description">{{ $t('description') }}:</label>
                <textarea rows="5" class="form-input" id="description" v-model="cocktail.description" :placeholder="$t('placeholder.cocktail-description')"></textarea>
                <p class="form-input-hint">{{ $t('md.support') }}</p>
            </div>
            <div class="form-group">
                <label class="form-label" for="glass">{{ $t('glass-type') }}:</label>
                <select class="form-select" id="glass" v-model="glassId">
                    <option :value="undefined" disabled>Select a glass type...</option>
                    <option v-for="glass in glasses" :value="glass.id">{{ glass.name }}</option>
                </select>
                <p class="form-input-hint">
                    <RouterLink :to="{name: 'settings.glasses'}" target="_blank">{{ $t('edit-glasses') }}</RouterLink>
                </p>
            </div>
            <div style="margin-bottom: 2rem;">
                <label class="form-label">{{ $t('method-and-dilution') }}:</label>
                <div class="cocktail-methods">
                    <label class="cocktail-method" v-for="method in methods" :for="'method_' + method.id" :class="{'cocktail-method--selected': method.id == methodId}">
                        <Transition name="cocktail-method__selected--transition">
                            <div class="cocktail-method__selected" v-show="method.id == methodId">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.997-6l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z"/></svg>
                            </div>
                        </Transition>
                        <!-- <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M5 16v6H3V3h9.382a1 1 0 0 1 .894.553L14 5h6a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-6.382a1 1 0 0 1-.894-.553L12 16H5zM5 5v9h8.236l1 2H19V7h-6.236l-1-2H5z"/></svg> -->
                        <div class="cocktail-method__title">{{ $t('method.' + method.name) }}</div>
                        <small>{{ method.dilution_percentage }}%</small>
                        <input type="radio" :id="'method_' + method.id" :value="method.id" v-model="methodId">
                    </label>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label" for="source">{{ $t('source') }}:</label>
                <input class="form-input" type="text" id="source" v-model="cocktail.source" :placeholder="$t('placeholder.source')">
            </div>
            <div class="form-group">
                <label class="form-label" for="tags">{{ $t('tags') }}:</label>
                <input class="form-input" type="text" id="tags" v-model="cocktailTags" :placeholder="$t('placeholder.tags')">
                <p class="form-input-hint">{{ $t('tags.help-text') }}</p>
            </div>
        </div>
        <div class="form-actions">
            <RouterLink class="button button--outline" :to="{ name: 'cocktails.show', params: { id: cocktailId } }" v-if="cocktailId">{{ $t('cancel') }}</RouterLink>
            <RouterLink class="button button--outline" :to="{ name: 'cocktails' }" v-else>{{ $t('cancel') }}</RouterLink>
            <button class="button button--dark" type="submit">{{ $t('save') }}</button>
        </div>
    </form>
</template>

<script>
import Utils from "@/Utils";
import ApiRequests from "@/ApiRequests";
import Unitz from 'unitz'
import OverlayLoader from '@/components/OverlayLoader.vue'
import IngredientModal from '@/components/Cocktail/IngredientModal.vue'
import ImageUpload from '@/components/ImageUpload.vue'
import PageHeader from '@/components/PageHeader.vue'
import Sortable from 'sortablejs';
import Dialog from '@/components/Dialog/Dialog.vue';

export default {
    data() {
        return {
            showDialog: false,
            cocktailIngredientForEdit: {},
            cocktailIngredientForEditOriginal: {},
            isLoading: false,
            cocktail: {
                ingredients: [],
                tags: [],
                glass: null,
                images: []
            },
            glasses: [],
            methods: [],
            cocktailId: null,
            sortable: null
        };
    },
    components: {
        OverlayLoader,
        IngredientModal,
        ImageUpload,
        PageHeader,
        Dialog,
    },
    watch: {
        showDialog(newVal) {
            if (newVal == false) {
                const emptyIngredient = this.cocktail.ingredients.findIndex(i => i.ingredient_id == null);
                if (emptyIngredient != -1) {
                    this.cocktail.ingredients.splice(emptyIngredient, 1);
                }
            }
        }
    },
    computed: {
        cocktailTags: {
            get() {
                return this.cocktail.tags.join(',')
            },
            set(newVal) {
                if (newVal == '' || newVal == null || newVal == undefined) {
                    this.cocktail.tags = []
                } else {
                    this.cocktail.tags = newVal.split(',')
                }
            }
        },
        glassId: {
            get() {
                if (!this.cocktail.glass) {
                    return undefined;
                }

                return this.cocktail.glass.id
            },
            set(newVal) {
                if (!this.cocktail.glass) {
                    this.cocktail.glass = {};
                }

                this.cocktail.glass.id = newVal
            }
        },
        methodId: {
            get() {
                if (!this.cocktail.method) {
                    return undefined;
                }

                return this.cocktail.method.id
            },
            set(newVal) {
                if (!this.cocktail.method) {
                    this.cocktail.method = {};
                }

                this.cocktail.method.id = newVal
            }
        }
    },
    created() {
        document.title = `${this.$t('cocktail')} \u22C5 Salt Rim`

        this.isLoading = true;
        this.cocktailId = this.$route.query.id || null;

        if (this.cocktailId) {
            ApiRequests.fetchCocktail(this.cocktailId).then(data => {
                data.description = Utils.decodeHtml(data.description);
                data.instructions = Utils.decodeHtml(data.instructions);
                data.garnish = Utils.decodeHtml(data.garnish);
                this.cocktail = data;
                this.isLoading = false;
                document.title = `${this.$t('cocktail')} \u22C5 ${this.cocktail.name} \u22C5 Salt Rim`
            })
        }

        ApiRequests.fetchGlasses().then(data => {
            this.glasses = data
            this.isLoading = false;
        })

        ApiRequests.fetchCocktailMethods().then(data => {
            this.methods = data
            this.isLoading = false;
        })
    },
    mounted() {
        const scraped = localStorage.getItem('scrapeResult');
        if (scraped) {
            localStorage.removeItem('scrapeResult');
            const parsedScrapeResult = JSON.parse(scraped);

            this.cocktail = parsedScrapeResult
            if (parsedScrapeResult.glass_id) {
                this.cocktail.glass = {};
                this.glassId = parsedScrapeResult.glass_id;
            }

            this.cocktail.images = [
                {
                    copyright: parsedScrapeResult.image.copyright,
                    url: parsedScrapeResult.image.url,
                    file: parsedScrapeResult.image.url,
                }
            ]
        }

        this.sortable = Sortable.create(document.querySelector('.cocktail-form__ingredients'), {
            handle: '.drag-handle',
            ghostClass: 'block-container--placeholder',
            animation: 150
        });
    },
    methods: {
        removeIngredient(ing) {
            if (!ing.ingredient_id) {
                this.cocktail.ingredients.splice(
                    this.cocktail.ingredients.findIndex(i => i == ing),
                    1
                );

                return;
            }

            this.$confirm(this.$t('cocktail.ingredient-remove', {name: ing.name}), {
                onResolved: (dialog) => {
                    dialog.close();
                    this.cocktail.ingredients.splice(
                        this.cocktail.ingredients.findIndex(i => i == ing),
                        1
                    );
                }
            });
        },
        closeModal(eventData) {
            // User canceled ingredient edit
            if (eventData.type == 'cancel') {
                this.cocktailIngredientForEdit.id = this.cocktailIngredientForEditOriginal.id;
                this.cocktailIngredientForEdit.name = this.cocktailIngredientForEditOriginal.name;
                this.cocktailIngredientForEdit.ingredient_id = this.cocktailIngredientForEditOriginal.ingredient_id;
                this.cocktailIngredientForEdit.ingredient_slug = this.cocktailIngredientForEditOriginal.ingredient_slug;
                this.cocktailIngredientForEdit.amount = this.cocktailIngredientForEditOriginal.amount;
                this.cocktailIngredientForEdit.units = this.cocktailIngredientForEditOriginal.units;
                this.cocktailIngredientForEdit.optional = this.cocktailIngredientForEditOriginal.optional;
                this.cocktailIngredientForEdit.sort = this.cocktailIngredientForEditOriginal.sort;
                this.cocktailIngredientForEdit.substitutes = this.cocktailIngredientForEditOriginal.substitutes;
            }

            this.showDialog = false;
        },
        addIngredient() {
            let placeholderData = {
                ingredient_id: null,
                amount: 30,
                units: 'ml',
                name: this.$t('ingredient.name-placeholder'),
                sort: this.cocktail.ingredients.length + 1
            };

            this.cocktail.ingredients.push(placeholderData);

            // Show modal after adding ingredient
            this.editIngredient(placeholderData)
        },
        printIngredientAmount(ing) {
            const defaultUnit = localStorage.getItem('defaultUnit');

            return Utils.printIngredientAmount(ing, defaultUnit)
        },
        editIngredient(cocktailIngredient) {
            if (!cocktailIngredient.substitutes) {
                cocktailIngredient.substitutes = []
            }

            this.cocktailIngredientForEditOriginal = JSON.parse(JSON.stringify(cocktailIngredient));

            const defaultUnit = localStorage.getItem('defaultUnit');
            if (defaultUnit === 'oz') {
                cocktailIngredient.amount = Utils.ml2oz(cocktailIngredient.amount);
                cocktailIngredient.units = 'oz';
            } else if (defaultUnit === 'cl') {
                cocktailIngredient.amount = Utils.ml2cl(cocktailIngredient.amount);
                cocktailIngredient.units = 'cl';
            }

            this.cocktailIngredientForEdit = cocktailIngredient;
            this.showDialog = true;
        },
        async submit() {
            const sortedIngredientList = this.sortable.toArray();

            this.isLoading = true;

            const postData = {
                name: this.cocktail.name,
                description: this.cocktail.description,
                instructions: this.cocktail.instructions,
                history: this.cocktail.history,
                garnish: this.cocktail.garnish,
                source: this.cocktail.source,
                cocktail_method_id: this.methodId,
                images: [],
                tags: this.cocktail.tags.filter(tag => tag != ''),
                glass_id: this.glassId,
                ingredients: this.cocktail.ingredients
                    .filter(i => i.ingredient_id != null)
                    .map((cIngredient) => {
                        // Convert oz to ml
                        if (cIngredient.units == 'oz') {
                            cIngredient.amount = Unitz.parse(`${cIngredient.amount}${cIngredient.units}`).value * 30
                            cIngredient.units = 'ml'
                        }
                        // Convert cl to ml
                        if (cIngredient.units == 'cl') {
                            cIngredient.amount = cIngredient.amount * 10
                            cIngredient.units = 'ml'
                        }

                        // Just send substitute ids
                        if (cIngredient.substitutes) {
                            cIngredient.substitutes = cIngredient.substitutes.map(s => s.id)
                        }

                        cIngredient.sort = sortedIngredientList.findIndex(sortedId => sortedId == cIngredient.ingredient_id) + 1;

                        return cIngredient;
                    })
            };

            const imageResources = await this.$refs.imagesUpload.uploadPictures().catch(() => {
                this.$toast.error(`${this.$t('image-upload-error')} ${this.$t('image-upload-error.cocktail')}`);
            }) || [];

            if (imageResources.length > 0) {
                postData.images = imageResources.map(img => img.id);
            }

            if (this.cocktailId) {
                ApiRequests.updateCocktail(this.cocktailId, postData).then(data => {
                    this.isLoading = false;
                    this.$toast.default(this.$t('cocktail.update-success'));
                    this.$router.push({ name: 'cocktails.show', params: { id: data.id } })
                }).catch(e => {
                    this.$toast.error(e.message);
                    this.isLoading = false;
                })
            } else {
                ApiRequests.saveCocktail(postData).then(data => {
                    this.isLoading = false;
                    this.$toast.open({
                        message: this.$t('cocktail.create-success')
                    });
                    this.$router.push({ name: 'cocktails.show', params: { id: data.id } })
                }).catch(e => {
                    this.$toast.error(e.message);
                    this.isLoading = false;
                })
            }
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
    row-gap: 1rem;
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
    column-gap: 10px;
    row-gap: 10px;
    width: 100%;
    margin-left: 0.5rem;
}

.cocktail-methods {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 0.5rem;
}

.cocktail-method {
    --cm-clr-bg: #fff;
    --cm-clr-border: var(--clr-gray-200);
    --cm-clr-border-selected: var(--clr-gray-500);
    --cm-clr-shadow-selected: var(--clr-gray-200);
    background: var(--cm-clr-bg);
    flex-basis: 100px;
    flex-grow: 1;
    border: 2px solid var(--cm-clr-border);
    padding: 0.5rem;
    border-radius: 0.25rem;
    text-align: center;
    cursor: pointer;
    transition: box-shadow 100ms cubic-bezier(0.455, 0.03, 0.515, 0.955);
}

.dark-theme .cocktail-method {
    --cm-clr-bg: var(--clr-dark-main-900);
    --cm-clr-border: var(--clr-dark-main-800);
    --cm-clr-border-selected: var(--clr-dark-main-700);
    --cm-clr-shadow-selected: var(--clr-dark-main-800);
}

.cocktail-method__selected {
    position: absolute;
    top: -0.5rem;
    right: -0.5rem;
    transition: transform 150ms cubic-bezier(0.455, 0.03, 0.515, 0.955), opacity 100ms cubic-bezier(0.455, 0.03, 0.515, 0.955);
}

.cocktail-method__selected svg {
    fill: var(--clr-red-700);
}

.cocktail-method__selected--transition-enter-from,
.cocktail-method__selected--transition-leave-to {
    transform: translate(0, -0.25rem);
    opacity: 0;
}

.cocktail-method.cocktail-method--selected {
    box-shadow: 0 0 0 3px var(--cm-clr-shadow-selected);
    border-color: var(--cm-clr-border-selected);
}

.cocktail-method input {
    display: none;
}

.cocktail-method small {
    color: var(--clr-gray-400);
}

.cocktail-method:hover {
    border-color: var(--clr-gray-500);
}
</style>
