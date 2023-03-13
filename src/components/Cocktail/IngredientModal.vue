<template>
    <div>
        <OverlayLoader v-if="isLoading" />
        <ais-instant-search :search-client="searchClient" :index-name="index" :on-state-change="onStateChange">
            <ais-configure :hitsPerPage="30" />
            <ais-search-box placeholder="Search for ingredient..." :class-names="{'ais-SearchBox-input': 'form-input'}" />
            <ais-hits>
                <template v-slot="{ items }">
                    <div class="block-container ingredients-options">
                        <a href="#" v-for="item in items" @click.prevent="selectIngredient(item)">{{ item.name }}</a>
                    </div>
                </template>
            </ais-hits>
        </ais-instant-search>
        <div style="margin: 1rem 0;">
            <Checkbox v-model="isAddingSubstitute" id="substitute-adding">Select substitute ingredients</Checkbox>
        </div>
        <div class="block-container ingredient-modal__info" v-show="currentQuery && currentQuery.length > 0">
            Not found what you are looking for? <a href="#" @click.prevent="newIngredient">Create ingredient: "{{ currentQuery }}"</a>
        </div>
        <div class="selected-ingredient">
            <small>Current ingredient:</small>
            <p>{{ cocktailIngredient.name }}</p>
        </div>
        <div class="selected-ingredient selected-ingredient--substitutes">
            <small>Substitutes:</small>
            <p>
                <span v-if="cocktailIngredient.substitutes.length > 0" v-for="substitute in cocktailIngredient.substitutes">{{ substitute.name }} &middot; <a href="#" @click.prevent="removeSubstitute(substitute)">Remove</a></span>
                <span v-else>No substitutes selected.</span>
            </p>
        </div>
        <div class="ingredient-form-group">
            <div class="form-group">
                <label class="form-label" for="ingredient-amount">Amount:</label>
                <input class="form-input" type="text" id="ingredient-amount" v-model="cocktailIngredient.amount">
            </div>
            <div class="form-group">
                <label class="form-label" for="ingredient-units">Units:</label>
                <input class="form-input" type="text" id="ingredient-units" list="common-units" v-model="cocktailIngredient.units">
                <p class="form-input-hint">Use "oz", "cl", "ml" for common fluid units to enable unit conversion on cocktail page.</p>
                <datalist id="common-units">
                    <option>ml</option>
                    <option>oz</option>
                    <option>cl</option>
                    <option>dashes</option>
                    <option>barspoon</option>
                    <option>drops</option>
                </datalist>
            </div>
        </div>
        <div style="margin: 1rem 0;">
            <Checkbox v-model="cocktailIngredient.optional" id="is-cocktail-ing-optional">Make this ingredient optional.</Checkbox>
        </div>
        <div class="dialog-actions">
            <button type="button" class="button button--outline" @click="cancel">Cancel</button>
            <button type="button" class="button button--dark" @click="save" :disabled="isLoading">Done</button>
        </div>
    </div>
</template>

<script>
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import ApiRequests from "../../ApiRequests";
import Auth from '@/Auth.js';
import Checkbox from '@/components/Checkbox.vue';
import OverlayLoader from './../OverlayLoader.vue'

export default {
    props: ['value'],
    data() {
        return {
            isLoading: false,
            index: 'ingredients:name:asc',
            searchClient: instantMeiliSearch(
                Auth.getUserSearchSettings().host,
                Auth.getUserSearchSettings().key,
            ),
            cocktailIngredient: this.value,
            currentQuery: null,
            isAddingSubstitute: false
        }
    },
    components: {
        OverlayLoader,
        Checkbox
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
            this.isAddingSubstitute = false;
            this.$emit('close', {type: 'save'});
        },
        cancel() {
            // this.cocktailIngredient.ingredient_id = null
            this.isAddingSubstitute = false;
            this.$emit('close', {type: 'cancel'});
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

<style scoped>
.ingredients-options {
    display: flex;
    flex-direction: column;
    height: 200px;
    overflow-y: auto;
    padding: 1rem;
    border-radius: 5px;
    margin-top: 0.5rem;
}

.ingredients-options a {
    display: block;
    padding: 0.125rem 0.25rem;
    border-radius: 4px;
}

.ingredients-options a:hover {
    background-color: var(--clr-gray-50);
}

.modal .ais-SearchBox-reset,
.modal .ais-SearchBox-submit {
    display: none;
}

.selected-ingredient {
    margin: 1rem 0;
    line-height: 1.3;
}

.selected-ingredient small {
    color: var(--clr-gray-400);
}

.selected-ingredient p {
    font-weight: bold;
    font-size: 1.5rem;
}

.selected-ingredient.selected-ingredient--substitutes {
    margin-bottom: 2rem;
}

.selected-ingredient.selected-ingredient--substitutes p {
    font-size: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.ingredient-modal__info {
    padding: 0.5rem;
    margin-top: 1rem;
}

@media (max-width: 450px) {
    .ingredient-modal {
        padding: 5px;
    }
}

.ingredient-form-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.ingredient-form-group .form-group:first-child {
    flex-basis: 150px;
}

.ingredient-form-group .form-group:last-child {
    flex-basis: 200px;
    flex-grow: 1;
}

.ingredient-form-group input {
    width: 100%;
}
</style>
