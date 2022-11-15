<script setup>
import OverlayLoader from './../OverlayLoader.vue'
import IngredientModal from './IngredientModal.vue'
import ImageUpload from './../ImageUpload.vue'
</script>

<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <h2 class="page-subtitle">Cocktail information</h2>
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
            <label class="form-label" for="source">Source:</label>
            <input class="form-input" type="text" id="source" v-model="cocktail.source" placeholder="Book or URL...">
        </div>
        <div class="form-group">
            <label class="form-label" for="tags">Tags:</label>
            <input class="form-input" type="text" id="tags" v-model="cocktailTags" placeholder="Tags to help you find the cocktail...">
            <p class="form-input-hint">Separate multiple tags with a comma (",").</p>
        </div>
        <ImageUpload ref="imagesUpload" @upload-finished="imagesUploaded" :value="cocktail.images" />
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
import ApiRequests from "../../ApiRequests";
import Unitz from 'unitz'

export default {
    data() {
        return {
            isModalVisible: false,
            cocktailIngredientForEdit: {},
            isLoading: false,
            cocktail: {
                ingredients: [],
                tags: [],
            },
            images: [
                { image: null, copyright: null }
            ],
            ingredients: [],
            cocktailId: null
        };
    },
    computed: {
        cocktailTags: {
            get() {
                return this.cocktail.tags.join(',')
            },
            set(newVal) {
                this.cocktail.tags = newVal.split(',')
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
                this.cocktail = data;
                this.images[0].copyright = this.cocktail.image_copyright;
                this.isLoading = false;
                document.title = `Cocktail form \u22C5 ${this.cocktail.name} \u22C5 Salt Rim`
            })
        }

        ApiRequests.fetchIngredients().then(data => {
            this.ingredients = data
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
        closeModal() {
            if (!this.cocktailIngredientForEdit.ingredient_id) {
                this.cocktail.ingredients.splice(
                    this.cocktail.ingredients.findIndex(i => i == this.cocktailIngredientForEdit),
                    1
                );
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
                images: [],
                tags: this.cocktail.tags,
                ingredients: this.cocktail.ingredients
                    .filter(i => i.name != '<Not selected>')
                    .map(i => {
                        // Convert oz to ml
                        if (i.units == 'oz') {
                            i.amount = Unitz.parse(`${i.amount}${i.units}`).value * 30
                            i.units = 'ml'
                        }
                        // Convert cl to ml
                        if (i.units == 'cl') {
                            i.amount = i.amount * 10
                            i.units = 'ml'
                        }

                        // Just send substitute ids
                        if (i.substitutes) {
                            i.substitutes = i.substitutes.map(s => s.id)
                        }

                        return i;
                    })
            };

            const imageResources = await this.$refs.imagesUpload.uploadPictures().catch(() => {
                this.$toast.error('An error occured while uploading images. Your cocktail is still saved.');
            }) || [];
            
            postData.images = imageResources.map(img => img.id);

            if (this.cocktailId) {
                ApiRequests.updateCocktail(this.cocktailId, postData).then(data => {
                    this.isLoading = false;
                    this.$toast.default(`Cocktail updated successfully.`);
                    this.$router.push({ name: 'cocktails.show', params: { id: data.id } })
                }).catch(async errorResponse => {
                    if (errorResponse.status == 422) {
                        const body = await errorResponse.json();
                        this.$toast.error(body.message);
                    } else {
                        this.$toast.error(`Error occured: ${errorResponse.status}`);
                    }

                    this.isLoading = false;
                })
            } else {
                ApiRequests.saveCocktail(postData).then(data => {
                    this.isLoading = false;
                    this.$toast.open({
                        message: 'Cocktail created successfully.'
                    });
                    this.$router.push({ name: 'cocktails.show', params: { id: data.id } })
                }).catch(async errorResponse => {
                    if (errorResponse.status == 422) {
                        const body = await errorResponse.json();
                        this.$toast.error(body.message);
                    } else {
                        this.$toast.error(`Error occured: ${errorResponse.status}`);
                    }

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
    border-bottom: 2px solid var(--color-bg-dark);
    border-radius: 5px;
}

.cocktail-form__ingredients li small {
    color: var(--color-text-muted);
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
    color: var(--color-text-muted);
}
</style>
