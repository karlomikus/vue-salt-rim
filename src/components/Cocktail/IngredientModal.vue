<script setup>
import Modal from './../Modal.vue'
import OverlayLoader from './../OverlayLoader.vue'
</script>

<template>
    <Modal class="ingredient-modal">
        <template #body>
            <OverlayLoader v-if="isLoading" />
            <ais-instant-search :search-client="searchClient" :index-name="index" :on-state-change="onStateChange">
                <ais-configure :hitsPerPage="30" />
                <ais-search-box placeholder="Search for ingredient..." :class-names="{'ais-SearchBox-input': 'form-input'}" />
                <label for="substitute-adding">
                    <input id="substitute-adding" type="checkbox" v-model="isAddingSubstitute"> Select substitute ingredients
                </label>
                <ais-hits>
                    <template v-slot="{ items }">
                        <div class="ingredients-options">
                            <a href="#" v-for="item in items" @click.prevent="selectIngredient(item)">{{ item.name }}</a>
                        </div>
                    </template>
                </ais-hits>
            </ais-instant-search>
            <div class="ingredient-modal__info" v-show="currentQuery && currentQuery.length > 0">
                Not found what you are looking for? <a href="#" @click.prevent="newIngredient">Create ingredient: "{{ currentQuery }}"</a>
            </div>
            <h3 class="selected-ingredient">
                <small>Current ingredient:</small>
                {{ cocktailIngredient.name }}
            </h3>
            <div class="substitutes">
                <small>Substitutes:</small>
                <span v-for="substitute in cocktailIngredient.substitutes">{{ substitute.name }} &middot; <a href="#" @click.prevent="removeSubstitute(substitute)">Remove</a></span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 2fr; column-gap: 10px;">
                <div class="form-group">
                    <label class="form-label" for="ingredient-amount">Amount:</label>
                    <input class="form-input" type="text" id="ingredient-amount" v-model="cocktailIngredient.amount">
                </div>
                <div class="form-group">
                    <label class="form-label" for="ingredient-units">Units:</label>
                    <input class="form-input" type="text" id="ingredient-units" v-model="cocktailIngredient.units">
                </div>
            </div>
            <div class="form-group">
                <label for="cocktail-ing-optional">
                    <input type="checkbox" id="cocktail-ing-optional" v-model="cocktailIngredient.optional">
                    Make optional
                </label>
            </div>
        </template>
        <template #footer>
            <button type="button" class="button button--outline" @click="cancel" style="margin-right: 10px;">Cancel</button>
            <button type="button" class="button button--dark" @click="save" :disabled="isLoading">Done</button>
        </template>
    </Modal>
</template>

<script>
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import ApiRequests from "../../ApiRequests";
import Auth from '@/Auth.js';

export default {
    props: ['value'],
    watch: {
        value(val) {
            window.document.body.style.overflow = 'hidden';

            // Save original ingredient for cancel action
            this.orgCocktailIngredient = Object.assign({}, val);

            // Set cocktail ingredient
            this.cocktailIngredient = val

            // Reset search on modal open
            document.querySelector('.modal-body form').reset()

            // Add substitutes array
            if (!this.cocktailIngredient.substitutes) {
                this.cocktailIngredient.substitutes = []
            }

            // Focus seach input on modal open
            setTimeout(() => {
                document.querySelector('.ais-SearchBox input').focus()
            }, 50)
        }
    },
    data() {
        return {
            isLoading: false,
            index: 'ingredients:name:asc',
            searchClient: instantMeiliSearch(
                Auth.getUserSearchSettings().host,
                Auth.getUserSearchSettings().key,
            ),
            cocktailIngredient: {},
            orgCocktailIngredient: {},
            currentQuery: null,
            isAddingSubstitute: false
        }
    },
    methods: {
        selectIngredient(item) {
            if (this.isAddingSubstitute) {
                if (this.cocktailIngredient.substitutes && this.cocktailIngredient.substitutes.some(sub => sub.id == item.id)) {
                    return;
                }

                this.cocktailIngredient.substitutes.push({
                    id: item.id,
                    name: item.name,
                    slug: item.slug,
                })
            } else {
                this.cocktailIngredient.ingredient_id = item.id;
                this.cocktailIngredient.name = item.name;
                this.cocktailIngredient.ingredient_slug = item.slug;
            }
        },
        save() {
            window.document.body.style.overflow = 'auto';
            this.isAddingSubstitute = false;
            this.$emit('close');
        },
        cancel() {
            window.document.body.style.overflow = 'auto';
            this.isAddingSubstitute = false;
            this.$emit('close');
        },
        newIngredient() {
            this.isLoading = true;
            ApiRequests.saveIngredient({
                name: this.currentQuery,
                description: null,
                strength: 0,
                origin: null,
                color: null,
                images: [],
                ingredient_category_id: 1,
            }).then(data => {
                this.$toast.default(`Created uncategorized ingredient "${data.name}".`);
                this.selectIngredient({
                    name: data.name,
                    slug: data.slug,
                    id: data.id
                });
                this.isLoading = false;
            }).catch(() => {
                this.$toast.error('Unable to add ingredient.');
                this.isLoading = false;
            })
        },
        removeSubstitute(ing) {
            this.cocktailIngredient.substitutes.splice(
                this.cocktailIngredient.substitutes.findIndex(i => i == ing),
                1
            );
        },
        onStateChange({ uiState, setUiState }) {
            const indexState = uiState[this.index] || {}
            this.currentQuery = indexState.query

            setUiState(uiState);
        },
    },
};
</script>

<style>
.ingredients-options {
    display: flex;
    flex-direction: column;
    height: 200px;
    overflow-y: auto;
    background: rgba(255, 255, 255, .5);
    padding: 15px;
    border-bottom: 2px solid var(--color-bg-dark);
    border-radius: 5px;
    margin-top: 5px;
}

.ingredients-options:hover {
    background: #fff;
}

.ingredients-options a {
    display: block;
    padding: 3px 5px;
    border-radius: 4px;
}

.ingredients-options a:hover {
    display: block;
    background-color: var(--color-menu-item-hover);
}

.modal .ais-SearchBox-reset,
.modal .ais-SearchBox-submit {
    display: none;
}

.selected-ingredient {
    font-family: var(--font-accent);
    font-weight: bold;
    font-size: 1.6rem;
    margin: 15px 0;
    line-height: 1.3;
}

.selected-ingredient small,
.ingredient-modal .substitutes small {
    font-weight: normal;
    font-size: 0.8rem;
    display: block;
    color: #866269;
}

.ingredient-modal .substitutes {
    margin-bottom: 20px;
}

.ingredient-modal .substitutes span {
    font-weight: normal;
    font-size: 1rem;
    display: block;
    font-family: var(--font-accent);
    font-weight: 700;
}

.ingredient-modal__info {
    background: rgba(255, 255, 255, .5);
    border-bottom: 2px solid var(--color-bg-dark);
    border-radius: 5px;
    color: rgb(28, 48, 65);
    padding: 10px;
    margin-top: 10px;
}
</style>
