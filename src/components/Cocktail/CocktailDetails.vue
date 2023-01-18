<template>
    <OverlayLoader v-if="!cocktail.id" />
    <div class="cocktail-details" v-if="cocktail.id">
        <div class="cocktail-details__graphic" :style="{ 'background-image': 'url(' + mainCocktailImageUrl + ')' }">
            <div class="cocktail-details__graphic__copyright" v-if="mainCocktailImage.copyright">Image &copy; {{ mainCocktailImage.copyright }}</div>
        </div>
        <div class="cocktail-details-box cocktail-details-box--blue">
            <h3 class="cocktail-details-box__title">{{ cocktail.name }}</h3>
            <div class="cocktail-details__chips">
                <div class="cocktail-details__chips__group" v-if="cocktail.tags.length > 0">
                    <div class="cocktail-details__chips__group__title">Tags:</div>
                    <ul class="chips-list">
                        <li v-for="tag in cocktail.tags">
                            <RouterLink :to="{ name: 'cocktails', query: { 'tags[0]': tag } }">{{ tag }}</RouterLink>
                        </li>
                    </ul>
                </div>
                <div class="cocktail-details__chips__group" v-if="cocktail.glass">
                    <div class="cocktail-details__chips__group__title">Glass:</div>
                    <ul class="chips-list">
                        <li>
                            <RouterLink :to="{ name: 'cocktails', query: { 'glass[0]': cocktail.glass.name } }">{{ cocktail.glass.name }}</RouterLink>
                        </li>
                    </ul>
                </div>
                <div class="cocktail-details__chips__group" v-if="cocktail.method">
                    <div class="cocktail-details__chips__group__title">Method:</div>
                    <ul class="chips-list">
                        <li>
                            <RouterLink :to="{ name: 'cocktails', query: { 'method[0]': cocktail.method.name } }">{{ cocktail.method.name }}</RouterLink>
                        </li>
                    </ul>
                </div>
                <div class="cocktail-details__chips__group" v-if="cocktail.abv && cocktail.abv > 0">
                    <div class="cocktail-details__chips__group__title">ABV:</div>
                    <ul class="chips-list">
                        <li><span>{{ cocktail.abv }}%</span></li>
                    </ul>
                </div>
                <div class="cocktail-details__chips__group">
                    <div class="cocktail-details__chips__group__title">Avg rating:</div>
                    <ul class="chips-list">
                        <li><span>{{ cocktail.average_rating }} stars</span></li>
                    </ul>
                </div>
                <div class="cocktail-details__chips__group" >
                    <div class="cocktail-details__chips__group__title">Your rating:</div>
                    <Rating :rating="cocktail.user_rating" type="cocktail" :id="cocktail.id"></Rating>
                </div>
            </div>
            <div class="cocktail-details-box__description">
                <div v-html="parsedDescription"></div>
            </div>
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
                    <template #default="{ toggleDropdown }">
                        <button type="button" class="button-circle" @click="toggleDropdown">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path fill="none" d="M0 0h24v24H0z" />
                                <path d="M13.12 17.023l-4.199-2.29a4 4 0 1 1 0-5.465l4.2-2.29a4 4 0 1 1 .959 1.755l-4.2 2.29a4.008 4.008 0 0 1 0 1.954l4.199 2.29a4 4 0 1 1-.959 1.755zM6 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm11-6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                            </svg>
                        </button>
                    </template>
                    <template #content>
                        <RouterLink class="dropdown-menu__item" target="_blank" :to="{ name: 'print.cocktail', params: { id: cocktail.slug } }">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                <path fill="none" d="M0 0h24v24H0z" />
                                <path d="M6 19H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h3V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v4h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-3v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-2zm0-2v-1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1h2V9H4v8h2zM8 4v3h8V4H8zm0 13v3h8v-3H8zm-3-7h3v2H5v-2z" />
                            </svg>
                            Print recipe
                        </RouterLink>
                        <!-- <RouterLink class="dropdown-menu__item" target="_blank" :to="{ name: 'print.cocktail', params: { id: cocktail.slug } }">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                <path fill="none" d="M0 0h24v24H0z" />
                                <path d="M18.364 15.536L16.95 14.12l1.414-1.414a5 5 0 1 0-7.071-7.071L9.879 7.05 8.464 5.636 9.88 4.222a7 7 0 0 1 9.9 9.9l-1.415 1.414zm-2.828 2.828l-1.415 1.414a7 7 0 0 1-9.9-9.9l1.415-1.414L7.05 9.88l-1.414 1.414a5 5 0 1 0 7.071 7.071l1.414-1.414 1.415 1.414zm-.708-10.607l1.415 1.415-7.071 7.07-1.415-1.414 7.071-7.07z" />
                            </svg>
                            Copy public link
                        </RouterLink>
                        <a class="dropdown-menu__item" target="_blank">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                <path fill="none" d="M0 0h24v24H0z" />
                                <path d="M4.828 21l-.02.02-.021-.02H2.992A.993.993 0 0 1 2 20.007V3.993A1 1 0 0 1 2.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 0 1-.992.993H4.828zM20 15V5H4v14L14 9l6 6zm0 2.828l-6-6L6.828 19H20v-1.172zM8 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
                            </svg>
                            Download as image
                        </a> -->
                    </template>
                </Dropdown>
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
        <div class="cocktail-details-box cocktail-details-box--green" v-if="cocktail.ingredients.length > 0">
            <h3 class="cocktail-details-box__title">Ingredients:</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr;">
                <div class="cocktail-button-group">
                    <h4>Servings:</h4>
                    <button :class="{ 'active-serving': i == servings }" v-for="i in Array.from({ length: 4 }, (x, i) => i + 1)" @click="servings = i">{{ i }}</button>
                </div>
                <div class="cocktail-button-group" style="text-align:right">
                    <h4>Units:</h4>
                    <button type="button" :class="{ 'active-serving': currentUnit == 'ml' }" @click="changeMeasurementUnit('ml')">ml</button>
                    <button type="button" :class="{ 'active-serving': currentUnit == 'oz' }" @click="changeMeasurementUnit('oz')">oz</button>
                    <button type="button" :class="{ 'active-serving': currentUnit == 'cl' }" @click="changeMeasurementUnit('cl')">cl</button>
                </div>
            </div>
            <ul class="cocktail-ingredients">
                <li v-for="ing in cocktail.ingredients" :key="ing.sort">
                    <div class="cocktail-ingredients__content">
                        <RouterLink :to="{ name: 'ingredients.show', params: { id: ing.ingredient_slug } }" data-ingredient="preferred">
                            {{ ing.name }}
                        </RouterLink>
                        <small v-if="ing.optional">(optional)</small>
                        <div class="cocktail-ingredients__content__substitutes">
                            <template v-for="sub in ing.substitutes">
                                or <RouterLink :to="{ name: 'ingredients.show', params: { id: sub.slug } }" data-ingredient="substitute">{{ sub.name }}</RouterLink>
                            </template>
                        </div>
                        <span v-if="!userShelfIngredients.includes(ing.ingredient_id)">You are missing this ingredient</span>
                        <span v-if="userShoppingListIngredients.includes(ing.ingredient_id)">You have this ingredient on shopping list</span>
                    </div>
                    <div class="cocktail-ingredients__amount">{{ parseIngredientAmount(ing) }}</div>
                </li>
            </ul>
            <a v-show="missingIngredientIds.length > 0" href="#" @click.prevent="addMissingIngredients">Add missing ingredients to my shopping list</a>
        </div>
        <div class="cocktail-details-box cocktail-details-box--yellow">
            <h3 class="cocktail-details-box__title">Instructions:</h3>
            <div v-html="parsedInstructions"></div>
        </div>
        <div class="cocktail-details-box cocktail-details-box--red" v-if="cocktail.garnish">
            <h3 class="cocktail-details-box__title">Garnish:</h3>
            <div v-html="parsedGarnish"></div>
        </div>
    </div>
</template>

<script>
import { marked } from 'marked';
import ApiRequests from '@/ApiRequests';
import Auth from '@/Auth';
import Unitz from 'unitz'
import OverlayLoader from '@/components/OverlayLoader.vue'
import Dropdown from '@/components/Dropdown.vue';
import Rating from '@/components/Rating.vue';

export default {
    data: () => ({
        cocktail: {},
        isFavorited: false,
        servings: 1,
        userShelfIngredients: [],
        userShoppingListIngredients: [],
        currentUnit: 'ml'
    }),
    components: {
        OverlayLoader,
        Dropdown,
        Rating
    },
    computed: {
        parsedInstructions() {
            if (!this.cocktail.instructions) {
                return null;
            }

            return marked.parse(this.cocktail.instructions)
        },
        parsedGarnish() {
            if (!this.cocktail.garnish) {
                return null;
            }

            return marked.parse(this.cocktail.garnish)
        },
        parsedDescription() {
            if (!this.cocktail.description) {
                return null;
            }

            return marked.parse(this.cocktail.description)
        },
        missingIngredientIds() {
            return this.cocktail.ingredients.filter(userIngredient => {
                return !this.userShelfIngredients.includes(userIngredient.ingredient_id) && !this.userShoppingListIngredients.includes(userIngredient.ingredient_id)
            }).map(cocktailIngredient => cocktailIngredient.ingredient_id)
        },
        mainCocktailImage() {
            if (this.cocktail.main_image_id == null) {
                return {};
            }

            return this.cocktail.images.filter((img) => img.id == this.cocktail.main_image_id)[0];
        },
        mainCocktailImageUrl() {
            if (!this.mainCocktailImage.url) {
                return '/no-cocktail.jpg';
            }

            return this.mainCocktailImage.url
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
                        this.$toast.error(e.message);
                    })
                }
            },
            { immediate: true }
        )

        if (localStorage.getItem('defaultUnit')) {
            this.currentUnit = localStorage.getItem('defaultUnit')
        }
    },
    methods: {
        favorite() {
            ApiRequests.favoriteCocktail(this.cocktail.id).then(resp => {
                this.isFavorited = resp.is_favorited
                this.$toast.default(this.isFavorited ? `Added "${this.cocktail.name}" to favorites` : `Removed "${this.cocktail.name}" from favorites`);
            }).catch(e => {
                this.$toast.error(e.message);
            })
        },
        deleteCocktail() {
            if (confirm('Are you sure you want to delete cocktail?')) {
                ApiRequests.deleteCocktail(this.cocktail.id).then(() => {
                    this.$toast.default(`Cocktail "${this.cocktail.name}" successfully removed`);
                    this.$router.push({ name: 'cocktails' })
                }).catch(e => {
                    this.$toast.error(e.message);
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
            }).catch(e => {
                this.$toast.error(e.message);
            })
        },
        parseIngredientAmount(ingredient) {
            let orgAmountMl = ingredient.amount * this.servings;
            let orgUnits = ingredient.units.toLowerCase();

            // Don't convert unconvertable units
            if (orgUnits != 'ml' && orgUnits != 'oz' && orgUnits != 'cl') {
                return `${orgAmountMl} ${orgUnits}`;
            }

            if (this.currentUnit == 'oz') {
                return new Unitz.Fraction(orgAmountMl / 30, [2, 3, 4]).string + ' ' + this.currentUnit
            }

            if (this.currentUnit == 'cl') {
                return Unitz.parse(`${orgAmountMl} ${orgUnits}`).convert('cl') + ' ' + this.currentUnit
            }

            return `${orgAmountMl} ${orgUnits}`;
        },
        changeMeasurementUnit(toUnit) {
            this.currentUnit = toUnit;
            localStorage.setItem('defaultUnit', toUnit);
        }
    }
}
</script>

<style scoped>
.cocktail-details {
    max-width: 1200px;
    margin: 0 auto;
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

.cocktail-details-box {
    background-color: #fff;
    border-radius: 20px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    padding: 20px 20px 40px 20px;
    margin-top: -20px;
}

.cocktail-details-box.cocktail-details-box--blue {
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

.cocktail-details-box__title {
    font-family: var(--font-heading);
    font-size: 1.3rem;
    font-weight: 700;
    margin: 0 0 20px 0;
}

.cocktail-details-box--blue .cocktail-details-box__title {
    font-size: 2rem;
}

.cocktail-ingredients {
    list-style: none;
    padding: 0;
    margin: 0;
}

.cocktail-ingredients li {
    display: flex;
    align-items: center;
    background-color: rgb(211, 227, 222);
    border-radius: 4px;
    margin-bottom: 10px;
    padding: 5px 10px;
}

.cocktail-ingredients li .cocktail-ingredients__content small {
    color: var(--clr-red-800);
    margin-left: 5px;
}

.cocktail-ingredients li .cocktail-ingredients__content span {
    display: block;
    font-size: 0.7rem;
    color: var(--clr-gray-500);
}

.cocktail-ingredients li .cocktail-ingredients__content .cocktail-ingredients__content__substitutes {
    font-size: 0.7rem;
    color: var(--clr-gray-500);
}

.cocktail-ingredients li .cocktail-ingredients__amount {
    font-weight: 700;
    font-size: 1.2rem;
    margin-left: auto;
    text-align: right;
    font-feature-settings: "frac";
}

@media (max-width: 450px) {
    .cocktail-ingredients li .cocktail-ingredients__amount {
        font-size: 1rem;
    }
}

.cocktail-details-box__actions {
    position: absolute;
    right: 20px;
    top: -25px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    column-gap: 5px;
}

.cocktail-details-box__description {
    overflow-y: auto;
    max-height: 150px;
}

.cocktail-button-group {
    margin-bottom: 20px;
}

.cocktail-button-group h4 {
    font-size: 0.7rem;
}

.cocktail-button-group button {
    background: rgb(211, 227, 222);
    border: 3px solid rgb(211, 227, 222);
    font-size: 1rem;
    min-width: 2rem;
    cursor: pointer;
    color: var(--clr-gray-800)
}

.cocktail-button-group button.active-serving {
    background-color: rgb(162, 197, 186);
    border-color: rgb(162, 197, 186);
}

.cocktail-button-group button:hover {
    border-color: rgb(129, 173, 159);
}

.cocktail-details-box ol {
    padding-left: 30px;
}

.cocktail-details-box ol li::marker {
    font-size: 1.1rem;
    font-weight: bold;
}

.cocktail-details__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1rem;
}

.cocktail-details__chips__group__title {
    font-size: 0.7rem;
    margin-bottom: 0.25rem;
}

.cocktail-details__chips .rating {
    line-height: 1;
}
</style>
