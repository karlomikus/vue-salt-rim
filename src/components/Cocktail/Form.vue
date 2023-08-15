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
        <ul class="cocktail-form__ingredients" style="margin-bottom: 20px;" v-show="cocktail.ingredients.length > 0">
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
                <select class="form-select" id="glass" v-model="cocktail.glass.id">
                    <option :value="undefined" disabled>Select a glass type...</option>
                    <option v-for="glass in glasses" :value="glass.id">{{ glass.name }}</option>
                </select>
                <p class="form-input-hint">
                    <RouterLink :to="{ name: 'settings.glasses' }" target="_blank">{{ $t('edit-glasses') }}</RouterLink>
                </p>
            </div>
            <div style="margin-bottom: 2rem;">
                <label class="form-label">{{ $t('method-and-dilution') }}:</label>
                <div class="cocktail-methods">
                    <Radio v-for="method in methods" :value="method.id" :title="method.name" :description="method.dilution_percentage + '%'" v-model="cocktail.method.id"></Radio>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label" for="source">{{ $t('source') }}:</label>
                <input class="form-input" type="text" id="source" v-model="cocktail.source" :placeholder="$t('placeholder.source')">
            </div>
            <div class="form-group">
                <label class="form-label" for="tags">{{ $t('tags') }}:</label>
                <input class="form-input" type="text" id="tags" list="existing-tags" v-model="cocktailTags" :placeholder="$t('placeholder.tags')">
                <datalist id="existing-tags">
                    <option v-for="tag in tags" :value="tag.name"></option>
                </datalist>
                <p class="form-input-hint">{{ $t('tags.help-text') }}</p>
            </div>
            <div class="form-group" v-show="utensils.length > 0">
                <label class="form-label" for="utensil">{{ $t('utensils.title') }}:</label>
                <select class="form-select" id="utensil" multiple v-model="cocktail.utensils" style="height: 200px;">
                    <option v-for="utensil in utensils" :value="utensil.id">{{ utensil.name }}</option>
                </select>
            </div>
        </div>
        <div class="form-actions">
            <RouterLink class="button button--outline" :to="{ name: 'cocktails.show', params: { id: cocktail.id } }" v-if="cocktail.id">{{ $t('cancel') }}</RouterLink>
            <RouterLink class="button button--outline" :to="{ name: 'cocktails' }" v-else>{{ $t('cancel') }}</RouterLink>
            <button class="button button--dark" type="submit">{{ $t('save') }}</button>
        </div>
    </form>
</template>

<script>
import Utils from "./../../Utils.js";
import ApiRequests from "./../../ApiRequests.js";
import Unitz from 'unitz'
import OverlayLoader from './../OverlayLoader.vue'
import IngredientModal from './../Cocktail/IngredientModal.vue'
import ImageUpload from './../ImageUpload.vue'
import PageHeader from './../PageHeader.vue'
import Sortable from 'sortablejs';
import Dialog from './../Dialog/Dialog.vue';
import Radio from "../Radio.vue";

export default {
    data() {
        return {
            showDialog: false,
            cocktailIngredientForEdit: {},
            cocktailIngredientForEditOriginal: {},
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
        };
    },
    components: {
        OverlayLoader,
        IngredientModal,
        ImageUpload,
        PageHeader,
        Dialog,
        Radio
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
                return this.cocktail.tags.map(i => i.name).join(',')
            },
            set(newVal) {
                if (newVal == '' || newVal == null || newVal == undefined) {
                    this.cocktail.tags = []
                } else {
                    this.cocktail.tags = [];
                    newVal.split(',').forEach(tagName => {
                        this.cocktail.tags.push({ name: tagName })
                    })
                }
            }
        },
    },
    async created() {
        document.title = `${this.$t('cocktail')} \u22C5 ${this.site_title}`

        this.isLoading = true;
        const cocktailId = this.$route.query.id || null;

        if (cocktailId) {
            await ApiRequests.fetchCocktail(cocktailId).then(data => {
                data.description = Utils.decodeHtml(data.description);
                data.instructions = Utils.decodeHtml(data.instructions);
                data.garnish = Utils.decodeHtml(data.garnish);
                if (!data.method) {
                    data.method = {}
                }
                if (!data.glass) {
                    data.glass = {}
                }
                data.utensils = data.utensils.map(ut => ut.id)

                this.cocktail = data;

                document.title = `${this.$t('cocktail')} \u22C5 ${this.cocktail.name} \u22C5 ${this.site_title}`
            })
        }

        await ApiRequests.fetchGlasses().then(data => this.glasses = data)
        await ApiRequests.fetchCocktailMethods().then(data => this.methods = data)
        await ApiRequests.fetchTags().then(data => this.tags = data)
        await ApiRequests.fetchUtensils().then(data => this.utensils = data)

        this.isLoading = false;
    },
    mounted() {
        this.checkForImportData();

        this.sortable = Sortable.create(document.querySelector('.cocktail-form__ingredients'), {
            handle: '.drag-handle',
            ghostClass: 'block-container--placeholder',
            animation: 150
        });
    },
    methods: {
        checkForImportData() {
            const scraped = localStorage.getItem('scrapeResult');
            if (scraped) {
                localStorage.removeItem('scrapeResult');
                const parsedScrapeResult = JSON.parse(scraped);

                this.cocktail = parsedScrapeResult

                if (parsedScrapeResult.images.length > 0) {
                    this.cocktail.images = [
                        {
                            copyright: parsedScrapeResult.images[0].copyright,
                            url: parsedScrapeResult.images[0].url,
                            file: parsedScrapeResult.images[0].url,
                        }
                    ]
                }
            }
        },
        removeIngredient(ing) {
            if (!ing.ingredient_id) {
                this.cocktail.ingredients.splice(
                    this.cocktail.ingredients.findIndex(i => i == ing),
                    1
                );

                return;
            }

            this.$confirm(this.$t('cocktail.ingredient-remove', { name: ing.name }), {
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
            const userUnit = localStorage.getItem('defaultUnit');
            let defaultAmount = 30;
            let defaultUnits = 'ml';

            if (userUnit == 'oz') {
                defaultAmount = 1
                defaultUnits = 'oz'
            }

            if (userUnit == 'cl') {
                defaultAmount = 3
                defaultUnits = 'cl'
            }

            let placeholderData = {
                ingredient_id: null,
                amount: defaultAmount,
                units: defaultUnits,
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

            const userUnit = localStorage.getItem('defaultUnit');
            if (userUnit === 'oz') {
                if (cocktailIngredient.units == 'ml') {
                    cocktailIngredient.units = 'oz';
                    cocktailIngredient.amount = Utils.ml2oz(cocktailIngredient.amount);
                }
                if (cocktailIngredient.units == 'cl') {
                    cocktailIngredient.units = 'oz';
                    cocktailIngredient.amount = Utils.cl2oz(cocktailIngredient.amount);
                }
            } else if (userUnit === 'cl') {
                if (cocktailIngredient.units == 'ml') {
                    cocktailIngredient.units = 'cl';
                    cocktailIngredient.amount = Utils.ml2cl(cocktailIngredient.amount);
                }
                if (cocktailIngredient.units == 'oz') {
                    cocktailIngredient.units = 'cl';
                    cocktailIngredient.amount = Utils.oz2cl(cocktailIngredient.amount);
                }
            } else if (userUnit === 'ml') {
                if (cocktailIngredient.units == 'oz') {
                    cocktailIngredient.units = 'ml';
                    cocktailIngredient.amount = Utils.oz2ml(cocktailIngredient.amount);
                }
                if (cocktailIngredient.units == 'cl') {
                    cocktailIngredient.units = 'ml';
                    cocktailIngredient.amount = Utils.cl2ml(cocktailIngredient.amount);
                }
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
                cocktail_method_id: this.cocktail.method.id,
                utensils: this.cocktail.utensils,
                images: [],
                tags: this.cocktail.tags.filter(tag => tag.name != '').map(tag => tag.name),
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

            if (this.cocktail.id) {
                ApiRequests.updateCocktail(this.cocktail.id, postData).then(data => {
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
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-top: 0.5rem;
}
</style>
