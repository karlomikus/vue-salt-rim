<template>
    <div class="modal-backdrop">
        <div class="modal">
            <section class="modal-body">
                <ais-instant-search :search-client="searchClient" :index-name="index" :on-state-change="onStateChange">
                    <ais-configure :hitsPerPage="30" />
                    <ais-search-box placeholder="Search for ingredient..." :class-names="{'ais-SearchBox-input': 'form-input'}" />
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
            </section>
            <footer class="modal-footer">
                <button type="button" class="button button--outline" @click="cancel" style="margin-right: 10px;">Cancel</button>
                <button type="button" class="button button--dark" @click="save">Done</button>
            </footer>
        </div>
    </div>
</template>

<script>
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import ApiRequests from "../../ApiRequests";
import Auth from '@/Auth.js';

export default {
    props: ['value'],
    watch: {
        value(val) {
            // Save original ingredient for cancel action
            this.orgCocktailIngredient = Object.assign({}, val);

            // Set cocktail ingredient
            this.cocktailIngredient = val

            // Reset search on modal open
            document.querySelector('.modal-body form').reset()

            // Focus seach input on modal open
            setTimeout(() => {
                document.querySelector('.ais-SearchBox input').focus()
            }, 50)
        }
    },
    data() {
        return {
            index: 'ingredients:name:asc',
            searchClient: instantMeiliSearch(
                Auth.getUserSearchSettings().host,
                Auth.getUserSearchSettings().key,
            ),
            cocktailIngredient: {},
            orgCocktailIngredient: {},
            currentQuery: null,
        }
    },
    methods: {
        selectIngredient(item) {
            this.cocktailIngredient.ingredient_id = item.id;
            this.cocktailIngredient.name = item.name;
            this.cocktailIngredient.ingredient_slug = item.slug;
        },
        save() {
            this.$emit('close');
        },
        cancel() {
            this.$emit('close');
        },
        newIngredient() {
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
            }).catch(() => {
                this.$toast.error('Unable to add ingredient.');
            })
        },
        onStateChange({ uiState, setUiState }) {
            const indexState = uiState['ingredients:name:asc'] || {}
            this.currentQuery = indexState.query

            setUiState(uiState);
        },
    },
};
</script>

<style>
:root {
    --modal-body-padding: 20px;
}

.modal-backdrop {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
}

.modal {
    background: var(--color-bg);
    box-shadow: 0 10px 20px 1px rgb(71, 71, 71, 0.3);
    border-radius: 15px;
    overflow-x: auto;
    display: flex;
    flex-direction: column;
    margin: 10px;
    max-width: calc(var(--site-width) / 2);
    width: 100%;
}

.modal-body {
    position: relative;
    padding: var(--modal-body-padding);
}

.modal-footer {
    padding: var(--modal-body-padding);
    padding-top: 0;
    text-align: right;
}

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

.selected-ingredient small {
    font-weight: normal;
    font-size: 0.8rem;
    display: block;
    color: #866269;
}

.ingredient-modal__info {
    background-color: rgb(228, 241, 252);
    color: rgb(28, 48, 65);
    padding: 10px;
    border-radius: 5px;
    margin-top: 10px;
}
</style>
