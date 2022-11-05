<template>
    <div class="modal-backdrop">
        <div class="modal">
            <section class="modal-body">
                <ais-instant-search :search-client="searchClient" index-name="ingredients:name:asc">
                    <ais-configure :hitsPerPage="30" />
                    <div class="cocktail-list-search-container">
                        <ais-search-box placeholder="Search for ingredient..." :class-names="{'ais-SearchBox-input': 'form-input'}" />
                    </div>
                    <ais-hits>
                        <template v-slot="{ items }">
                            <div class="ingredients-options">
                                <a href="#" v-for="item in items" @click.prevent="selectIngredient(item)">{{ item.name }}</a>
                            </div>
                        </template>
                    </ais-hits>
                </ais-instant-search>
                <h3 class="selected-ingredient">{{ cocktailIngredient.name }}</h3>
                <div class="form-group">
                    <label class="form-label">Amount:</label>
                    <input class="form-input" type="text" v-model="cocktailIngredient.amount">
                </div>
                <div class="form-group">
                    <label class="form-label">Units:</label>
                    <input class="form-input" type="text" v-model="cocktailIngredient.units">
                </div>
                <div class="form-group">
                    <label for="cocktail-ing-optional">
                        <input type="checkbox" id="cocktail-ing-optional" v-model="cocktailIngredient.optional">
                        Make optional
                    </label>
                </div>
            </section>
            <footer class="modal-actions">
                <button @click="save">Done</button>
            </footer>
        </div>
    </div>
</template>

<script>
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import Auth from '@/Auth.js';

export default {
    props: ['value'],
    watch: {
        value(val) {
            this.orgCocktailIngredient = Object.freeze(Object.assign({}, val));
            this.cocktailIngredient = val
        }
    },
    data() {
        return {
            searchClient: instantMeiliSearch(
                Auth.getUserSearchSettings().host,
                Auth.getUserSearchSettings().key,
            ),
            cocktailIngredient: this.value,
            orgCocktailIngredient: {}
        }
    },
    methods: {
        close() {
            this.$emit('close');
        },
        selectIngredient(searchItem) {
            this.cocktailIngredient.ingredient_id = searchItem.id;
            this.cocktailIngredient.name = searchItem.name;
            this.cocktailIngredient.ingredient_slug = searchItem.slug;
        },
        save() {
            // this.$emit('ingredientUpdated', this.cocktailIngredient);
            this.close();
        }
    },
};
</script>

<style>
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
    padding: 20px;
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
    margin-top: 10px;
    margin-bottom: 15px;
}
</style>
