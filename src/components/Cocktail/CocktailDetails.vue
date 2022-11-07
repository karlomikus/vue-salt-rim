<script setup>
import OverlayLoader from './../OverlayLoader.vue'
import Dropdown from './../Dropdown.vue';
</script>

<template>
    <OverlayLoader v-if="!cocktail.id" />
    <div class="cocktail-details" v-if="cocktail.id">
        <div class="cocktail-details__graphic" :style="{ 'background-image': 'url(' + cocktail.image_url + ')' }">
            <div class="cocktail-details__graphic__copyright">Image &copy; {{ cocktail.image_copyright }}</div>
        </div>
        <div class="cocktail-details-box cocktail-details-box--title">
            <h3 class="cocktail-details-box__title">{{ cocktail.name }}</h3>
            <ul class="cocktail-tags" style="margin: 0; margin-bottom: 10px; justify-content: flex-start;">
                <li v-for="tag in cocktail.tags" style="background-color: #BFD3DF;">{{ tag }}</li>
            </ul>
            <div class="cocktail-details-box__description" v-html="parsedDescription"></div>
            <div class="cocktail-details-box__actions">
                <button type="button" class="button-circle" @click="favorite">
                    <svg v-if="!isFavorited" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path fill="none" d="M0 0H24V24H0z" />
                        <path d="M20.243 4.757c2.262 2.268 2.34 5.88.236 8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236 2.265-2.264 5.888-2.34 8.244-.228 2.349-2.109 5.979-2.039 8.242.228zM5.172 6.172c-1.49 1.49-1.565 3.875-.192 5.451L12 18.654l7.02-7.03c1.374-1.577 1.299-3.959-.193-5.454-1.487-1.49-3.881-1.562-5.453-.186l-4.202 4.203-1.415-1.414 2.825-2.827-.082-.069c-1.575-1.265-3.877-1.157-5.328.295z" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#ee6055">
                        <path fill="none" d="M0 0H24V24H0z" />
                        <path d="M20.243 4.757c2.262 2.268 2.34 5.88.236 8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236C5.515 3 8.093 2.56 10.261 3.44L6.343 7.358l1.414 1.415L12 4.53l-.013-.014.014.013c2.349-2.109 5.979-2.039 8.242.228z" />
                    </svg>
                </button>
                <Dropdown>
                    <template v-slot:default="{ toggleDropdown }">
                        <button type="button" class="button-circle" @click="toggleDropdown"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path fill="none" d="M0 0h24v24H0z" />
                                <path d="M12 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 14c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                            </svg></button>
                    </template>
                    <template #content>
                        <RouterLink class="dropdown-menu__item" :to="{ name: 'cocktails.form', query: { id: cocktail.id } }">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                <path fill="none" d="M0 0h24v24H0z" />
                                <path d="M6.414 16L16.556 5.858l-1.414-1.414L5 14.586V16h1.414zm.829 2H3v-4.243L14.435 2.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 18zM3 20h18v2H3v-2z" />
                            </svg>
                            Edit
                        </RouterLink>
                        <!-- <a class="dropdown-menu__item" href="#">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                <path fill="none" d="M0 0h24v24H0z" />
                                <path d="M12.414 5H21a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7.414l2 2zM4 5v14h16V7h-8.414l-2-2H4zm7 7V9h2v3h3v2h-3v3h-2v-3H8v-2h3z" />
                            </svg>
                            Add to collection
                        </a> -->
                        <a v-show="cocktail.source" class="dropdown-menu__item" target="_blank" :href="cocktail.source">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                <path fill="none" d="M0 0h24v24H0z" />
                                <path d="M10 6v2H5v11h11v-5h2v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6zm11-3v8h-2V6.413l-7.793 7.794-1.414-1.414L17.585 5H13V3h8z" />
                            </svg>
                            Cocktail source
                        </a>
                        <a class="dropdown-menu__item" href="javascript:;" @click.prevent="deleteCocktail">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                <path fill="none" d="M0 0h24v24H0z" />
                                <path d="M7 4V2h10v2h5v2h-2v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6H2V4h5zM6 6v14h12V6H6zm3 3h2v8H9V9zm4 0h2v8h-2V9z" />
                            </svg>
                            Delete
                        </a>
                    </template>
                </Dropdown>
            </div>
        </div>
        <div class="cocktail-details-box cocktail-details-box--green">
            <h3 class="cocktail-details-box__title">Ingredients:</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr;">
                <div class="cocktail-details__button-row">
                    <h4>Servings:</h4>
                    <button :class="{ 'active-serving': i == servings }" v-for="i in Array.from({ length: 4 }, (x, i) => i + 1)" @click="servings = i">{{ i }}</button>
                </div>
                <div class="cocktail-details__button-row" style="text-align:right">
                    <h4>Units:</h4>
                    <button :class="{ 'active-serving': currentUnit == 'ml' }" @click="currentUnit = 'ml'">ml</button>
                    <button :class="{ 'active-serving': currentUnit == 'oz' }" @click="currentUnit = 'oz'">oz</button>
                </div>
            </div>
            <ul class="cocktail-details-box__ingredients">
                <li v-for="ing in cocktail.ingredients" :key="ing.sort">
                    <RouterLink :to="{ name: 'ingredients.show', params: { id: ing.ingredient_slug } }">
                        {{ ing.name }}
                        <small v-if="ing.optional">(optional)</small>
                        <span v-if="!userShelfIngredients.includes(ing.ingredient_id)">You are missing this ingredient</span>
                        <span v-if="userShoppingListIngredients.includes(ing.ingredient_id)">You have this ingredient on shopping list</span>
                    </RouterLink>
                    <div class="cocktail-details-box__ingredients__amount">{{ parseIngredientAmount(ing) }}</div>
                </li>
            </ul>
            <button v-show="missingIngredientIds.length > 0" type="button" class="button button--dark button--small" @click="addMissingIngredients">Add missing ingredients to my shopping list</button>
        </div>
        <div class="cocktail-details-box cocktail-details-box--yellow">
            <h3 class="cocktail-details-box__title">Instructions:</h3>
            <ul class="cocktail-tags" style="margin: 0; margin-bottom: 10px; justify-content: flex-start;">
                <li v-if="cocktail.glass" style="background-color: #ffddc0;">Glass: {{ cocktail.glass.name }}</li>
            </ul>
            <div v-html="parsedInstructions"></div>
        </div>
        <div class="cocktail-details-box cocktail-details-box--red">
            <h3 class="cocktail-details-box__title">Garnish:</h3>
            <p>{{ cocktail.garnish }}</p>
        </div>
    </div>
</template>

<script>
import { marked } from 'marked';
import ApiRequests from '../../ApiRequests';
import Auth from '@/Auth';
import Unitz from 'unitz'

export default {
    data: () => ({
        cocktail: {},
        isFavorited: false,
        servings: 1,
        userShelfIngredients: [],
        userShoppingListIngredients: [],
        currentUnit: 'ml'
    }),
    computed: {
        parsedInstructions() {
            if (!this.cocktail.instructions) {
                return null;
            }

            return marked.parse(this.cocktail.instructions)
        },
        parsedDescription() {
            if (!this.cocktail.description) {
                return null;
            }

            return marked.parse(this.cocktail.description)
        },
        missingIngredientIds() {
            return this.cocktail.ingredients.filter(ing => {
                return !this.userShelfIngredients.includes(ing.ingredient_id) && !this.userShoppingListIngredients.includes(ing.ingredient_id)
            }).map(cing => cing.ingredient_id)
        }
    },
    watch: {
        cocktail(val) {
            document.title = `${val.name} \u22C5 Salt Rim`
        }
    },
    created() {
        document.title = `Cocktail \u22C5 Salt Rim`
        this.$watch(
            () => this.$route.params,
            () => {
                if (this.$route.name == 'cocktails.show') {
                    this.userShelfIngredients = Auth.getUser().shelf_ingredients;
                    this.userShoppingListIngredients = Auth.getUser().shopping_lists;

                    ApiRequests.fetchCocktail(this.$route.params.id).then(data => {
                        this.cocktail = data
                        this.isFavorited = Auth.getUser().favorite_cocktails.includes(this.cocktail.id);
                    }).catch(e => {
                        this.$toast.open({
                            message: e,
                            type: 'error',
                            dismissible: false,
                        });
                    })
                }
            },
            { immediate: true }
        )
    },
    methods: {
        favorite() {
            ApiRequests.favoriteCocktail(this.cocktail.id).then(resp => {
                this.isFavorited = resp.is_favorited
                this.$toast.default(this.isFavorited ? `Added "${this.cocktail.name}" to favorites` : `Removed "${this.cocktail.name}" from favorites`);
            })
        },
        deleteCocktail() {
            if (confirm('Are you sure you want to delete cocktail?')) {
                ApiRequests.deleteCocktail(this.cocktail.id).then(resp => {
                    this.$toast.open({
                        message: `Cocktail "${this.cocktail.name}" successfully removed`
                    });
                    this.$router.push({ name: 'cocktails' })
                })
            }
        },
        addMissingIngredients() {
            const postData = {
                ingredient_ids: this.missingIngredientIds
            };

            ApiRequests.addIngredientsToShoppingList(postData).then(data => {
                this.$toast.default(`Added ${data.length} ingredients to your shopping list.`)
                Auth.refreshUser().then(() => {
                    this.userShoppingListIngredients = Auth.getUser().shopping_lists;
                })
            })
        },
        parseIngredientAmount(ingredient) {
            let amount = ingredient.amount * this.servings;
            let units = ingredient.units.toLowerCase();

            // Don't convert unconvertable units
            if (units != 'ml' && units != 'oz') {
                return `${amount} ${units}`;
            }

            if (units == 'ml' && this.currentUnit == 'oz') {
                return new Unitz.Fraction(amount / 30, [2, 3, 4]).string + ' ' + this.currentUnit
            }

            if (units == 'oz' && this.currentUnit == 'ml') {
                return amount * 30 + ' ' + this.currentUnit
            }

            return `${amount} ${units}`;
        }
    }
}
</script>
<style>
.cocktail-details-box {
    background-color: #fff;
    border-radius: 20px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    padding: 20px 20px 40px 20px;
    margin-top: -20px;
}

.cocktail-details-box.cocktail-details-box--title {
    background-color: var(--color-var-1);
}

.cocktail-details-box.cocktail-details-box--yellow {
    background-color: var(--color-var-2);
}

.cocktail-details-box.cocktail-details-box--red {
    background-color: var(--color-var-3);
}

.cocktail-details-box.cocktail-details-box--green {
    background-color: var(--color-var-4);
}

.cocktail-details__graphic {
    background-color: #fff;
    padding: 10px;
    background-size: cover;
    background-position: center center;
    height: 1000px;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
}

@media (max-width: 450px) {
    .cocktail-details__graphic {
        height: 500px;
    }
}

.cocktail-details__graphic__copyright {
    display: inline;
    background-color: rgba(0, 0, 0, .4);
    color: #fff;
    width: 100%;
    border-radius: 15px;
    padding: 2px 7px;
    font-size: 0.7rem;
}

.cocktail-details-box__title {
    font-family: var(--font-accent);
    font-weight: 700;
    margin: 0 0 20px 0;
    border-bottom: 1px solid rgba(0, 0, 0, .1);
    padding-bottom: 15px;
}

.cocktail-details-box--title .cocktail-details-box__title {
    font-size: 1.8rem;
}

.cocktail-details-box__ingredients {
    list-style: none;
    padding: 0;
    margin: 0;
}

.cocktail-details-box__ingredients li {
    display: flex;
    align-items: center;
    background-color: rgb(211, 227, 222);
    margin-bottom: 10px;
    padding: 5px 10px;
}

.cocktail-details-box__ingredients li a {
    text-decoration: none;
}

.cocktail-details-box__ingredients li a small {
    color: var(--color-link-hover);
}

.cocktail-details-box__ingredients li a span {
    display: block;
    font-size: 0.7rem;
    color: var(--color-text-muted);
}

.cocktail-details-box__ingredients li .cocktail-details-box__ingredients__amount {
    font-weight: 700;
    font-size: 1.2rem;
    margin-left: auto;
    text-align: right;
    font-feature-settings: "frac";
}

@media (max-width: 450px) {
    .cocktail-details-box__ingredients li .cocktail-details-box__ingredients__amount {
        font-size: 1rem;
    }
}

.cocktail-details-box__actions {
    position: absolute;
    right: 20px;
    top: -25px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 5px;
}

.cocktail-details-box__description {
    overflow-y: auto;
    max-height: 150px;
}

.cocktail-details__button-row {
    margin-bottom: 20px;
}

.cocktail-details__button-row h4 {
    font-size: 0.8rem;
}

.cocktail-details__button-row button {
    background: rgb(211, 227, 222);
    border: 3px solid rgb(211, 227, 222);
    font-size: 1.2rem;
    width: 35px;
    cursor: pointer;
    color: var(--color-text)
}

.cocktail-details__button-row button.active-serving {
    background-color: rgb(162, 197, 186);
    border-color: rgb(162, 197, 186);
}

.cocktail-details__button-row button:hover {
    border-color: rgb(129, 173, 159);
}

.cocktail-details-box ol {
    padding-left: 30px;
}

.cocktail-details-box ol li::marker {
    font-size: 1.1rem;
    font-family: var(--font-accent);
    font-weight: bold;
}
</style>
