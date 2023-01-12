<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <PageHeader>
            Cocktail information
        </PageHeader>
        <div class="form-group">
            <label class="form-label form-label--required" for="name">Name:</label>
            <input class="form-input" type="text" id="name" v-model="cocktail.name" required placeholder="Cocktail name...">
        </div>
        <div class="form-group">
            <label class="form-label form-label--required" for="instructions">Instructions:</label>
            <textarea rows="8" class="form-input" id="instructions" v-model="cocktail.instructions" required placeholder="How to prepare the cocktail..."></textarea>
            <p class="form-input-hint">This field supports markdown.</p>
        </div>
        <div class="form-group">
            <label class="form-label" for="garnish">Garnish:</label>
            <textarea rows="3" class="form-input" id="garnish" v-model="cocktail.garnish" placeholder="Something to make a cocktail pop..."></textarea>
            <p class="form-input-hint">This field supports markdown.</p>
        </div>
        <div class="form-group">
            <label class="form-label" for="description">Description:</label>
            <textarea rows="5" class="form-input" id="description" v-model="cocktail.description" placeholder="Cocktail description or history..."></textarea>
            <p class="form-input-hint">This field supports markdown.</p>
        </div>
        <div class="form-group">
            <label class="form-label" for="glass">Glass:</label>
            <select class="form-select" id="glass" v-model="glassId">
                <option :value="undefined" disabled>Select a glass type...</option>
                <option v-for="glass in glasses" :value="glass.id">{{ glass.name }}</option>
            </select>
            <p class="form-input-hint">
                <RouterLink :to="{name: 'settings.glasses'}" target="_blank">Edit glasses</RouterLink>
            </p>
        </div>
        <div class="form-group">
            <label class="form-label" for="glass">Method:</label>
            <select class="form-select" id="glass" v-model="cocktail.cocktail_method_id">
                <option :value="undefined" disabled>Select a method...</option>
                <option :value="1">Build</option>
                <option :value="2">Shake</option>
                <option :value="3">Blend</option>
                <option :value="4">Stir</option>
                <option :value="5">Muddle</option>
                <option :value="6">Layer</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label" for="source">Source:</label>
            <input class="form-input" type="text" id="source" v-model="cocktail.source" placeholder="Book or URL...">
        </div>
        <div class="form-group">
            <label class="form-label" for="tags">Tags:</label>
            <input class="form-input" type="text" id="tags" v-model="cocktailTags" placeholder="Tags to help you find the cocktail...">
            <p class="form-input-hint">Separate multiple tags with a comma (",").</p>
        </div>
        <ImageUpload ref="imagesUpload" :value="cocktail.images" />
        <h2 class="page-subtitle">Ingredients</h2>
        <ul class="cocktail-form__ingredients" style="margin-bottom: 20px;">
            <li v-for="ing in cocktail.ingredients">
                <div class="form-group">
                    <label class="form-label">Ingredient:</label>
                    <p>{{ ing.name }} <small v-show="ing.optional">({{ ing.optional ? 'Optional' : '' }})</small></p>
                    <p class="substitutes" v-if="ing.substitutes && ing.substitutes.length > 0">
                        <template v-for="sub in ing.substitutes">
                            or {{ sub.name }} 
                        </template>
                    </p>
                </div>
                <div class="form-group">
                    <label class="form-label">Amount:</label>
                    <p>{{ ing.amount }} {{ ing.units }}</p>
                </div>
                <div class="cocktail-form__ingredients__actions">
                    <a href="#" @click.prevent="editIngredient(ing)">
                        Edit
                    </a>
                    &middot;
                    <a href="#" @click.prevent="removeIngredient(ing)">
                        Remove
                    </a>
                </div>
            </li>
        </ul>
        <button class="button button--outline" type="button" @click="addIngredient">Add ingredient</button>
        <div class="form-actions">
            <RouterLink class="button button--outline" :to="{ name: 'cocktails.show', params: { id: cocktailId } }" v-if="cocktailId">Cancel</RouterLink>
            <RouterLink class="button button--outline" :to="{ name: 'cocktails' }" v-else>Cancel</RouterLink>
            <button class="button button--dark" type="submit">Save</button>
        </div>
    </form>
    <IngredientModal v-show="isModalVisible" :value="cocktailIngredientForEdit" @close="closeModal" />
</template>

<script>
import Utils from "@/Utils";
import ApiRequests from "@/ApiRequests";
import Unitz from 'unitz'
import OverlayLoader from '@/components/OverlayLoader.vue'
import IngredientModal from '@/components/Cocktail/IngredientModal.vue'
import ImageUpload from '@/components/ImageUpload.vue'
import PageHeader from '@/components/PageHeader.vue'

export default {
    data() {
        return {
            isModalVisible: false,
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
            cocktailId: null
        };
    },
    components: {
        OverlayLoader,
        IngredientModal,
        ImageUpload,
        PageHeader,
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
        noImage() {
            return `${window.srConfig.API_URL}/uploads/cocktails/no-image.jpg`;
        }
    },
    created() {
        document.title = `Cocktail Form \u22C5 Salt Rim`

        this.isLoading = true;
        this.cocktailId = this.$route.query.id || null;

        if (this.cocktailId) {
            ApiRequests.fetchCocktail(this.cocktailId).then(data => {
                data.description = Utils.decodeHtml(data.description);
                data.instructions = Utils.decodeHtml(data.instructions);
                data.garnish = Utils.decodeHtml(data.garnish);
                this.cocktail = data;
                this.isLoading = false;
                document.title = `Cocktail form \u22C5 ${this.cocktail.name} \u22C5 Salt Rim`
            })
        }

        ApiRequests.fetchGlasses().then(data => {
            this.glasses = data
            this.isLoading = false;
        })
    },
    methods: {
        removeIngredient(ing) {
            this.cocktail.ingredients.splice(
                this.cocktail.ingredients.findIndex(i => i == ing),
                1
            );
        },
        closeModal(eventData) {
            if (!this.cocktailIngredientForEdit.ingredient_id) {
                this.cocktail.ingredients.splice(
                    this.cocktail.ingredients.findIndex(i => i == this.cocktailIngredientForEdit),
                    1
                );
            }

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

            this.isModalVisible = false;
        },
        addIngredient() {
            let placeholderData = {
                ingredient_id: null,
                name: '<Not selected>',
                amount: 30,
                units: 'ml'
            };
            this.cocktail.ingredients.push(placeholderData);

            this.editIngredient(placeholderData)
        },
        editIngredient(cocktailIngredient) {
            if (!cocktailIngredient.substitutes) {
                cocktailIngredient.substitutes = []
            }

            this.cocktailIngredientForEditOriginal = JSON.parse(JSON.stringify(cocktailIngredient));
            this.cocktailIngredientForEdit = cocktailIngredient;
            this.isModalVisible = true;
        },
        removeImage() {
            if (!confirm('Are you sure you want to remove this image?')) {
                return;
            }

            ApiRequests.deleteImage(this.cocktail.image_id).then(() => {
                this.$toast.default(`Removed cocktail image successfully.`);
                this.cocktail.image_url = null;
                this.cocktail.image_id = null;
            }).catch(() => {
                this.$toast.default(`Unable to remove cocktail image.`);
            })
        },
        async submit() {
            this.isLoading = true;

            const postData = {
                name: this.cocktail.name,
                description: this.cocktail.description,
                instructions: this.cocktail.instructions,
                history: this.cocktail.history,
                garnish: this.cocktail.garnish,
                source: this.cocktail.source,
                cocktail_method_id: this.cocktail.cocktail_method_id,
                images: [],
                tags: this.cocktail.tags.filter(tag => tag != ''),
                glass_id: this.glassId,
                ingredients: this.cocktail.ingredients
                    .filter(i => i.name != '<Not selected>')
                    .map((ingredient, idx) => {
                        // Convert oz to ml
                        if (ingredient.units == 'oz') {
                            ingredient.amount = Unitz.parse(`${ingredient.amount}${ingredient.units}`).value * 30
                            ingredient.units = 'ml'
                        }
                        // Convert cl to ml
                        if (ingredient.units == 'cl') {
                            ingredient.amount = ingredient.amount * 10
                            ingredient.units = 'ml'
                        }

                        // Just send substitute ids
                        if (ingredient.substitutes) {
                            ingredient.substitutes = ingredient.substitutes.map(s => s.id)
                        }

                        ingredient.sort = idx + 1;

                        return ingredient;
                    })
            };

            const imageResources = await this.$refs.imagesUpload.uploadPictures().catch(() => {
                this.$toast.error('An error occured while uploading images. Your cocktail is still saved.');
            }) || [];

            if (Array.isArray(imageResources)) {
                postData.images = imageResources.map(img => img.id);
            }

            if (this.cocktailId) {
                ApiRequests.updateCocktail(this.cocktailId, postData).then(data => {
                    this.isLoading = false;
                    this.$toast.default(`Cocktail updated successfully.`);
                    this.$router.push({ name: 'cocktails.show', params: { id: data.id } })
                }).catch(e => {
                    this.$toast.error(e.message);
                    this.isLoading = false;
                })
            } else {
                ApiRequests.saveCocktail(postData).then(data => {
                    this.isLoading = false;
                    this.$toast.open({
                        message: 'Cocktail created successfully.'
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

<style scope>
.cocktail-form__ingredients {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    row-gap: 5px;
}

.cocktail-form__ingredients li {
    display: grid;
    grid-template-columns: 2fr 1fr;
    grid-template-rows: auto auto;
    column-gap: 10px;
    row-gap: 10px;
    background: rgba(255, 255, 255, .5);
    padding: 10px;
    border-bottom: 2px solid var(--clr-red-300);
    border-radius: 5px;
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
</style>
