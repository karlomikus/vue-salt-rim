<template>
    <div class="ingredient-details" v-if="ingredient.id">
        <OverlayLoader v-if="isLoading" />
        <div class="ingredient-details__box ingredient-details__box--green" style="margin-top: 100px;">
            <div class="ingredient-details__box__content">
                <h2 class="ingredient-details__box__title">
                    <small>{{ ingredient.category.name }}</small>
                    {{ ingredient.name }}
                </h2>
                <p>{{ ingredient.description }}</p>
                <hr>
                <p>
                    <strong>Strength:</strong><br>
                    <template v-if="ingredient.strength <= 0">
                        Non-alcoholic
                    </template>
                    <template v-else>
                        <abbr title="Alcohol by volume">ABV</abbr>: {{ ingredient.strength + '%' }} &middot; Proof: {{ ingredient.strength * 2 }}
                    </template>
                </p>
                <hr>
                <p><strong>Origin:</strong> {{ ingredient.origin ?? 'n/a' }}</p>
                <hr>
                <ul class="flags" style="margin-top: 20px;">
                    <li v-show="isAddedToShelf">You have this ingredient</li>
                    <li v-show="isAddedToShoppingList">This ingredient is on your shopping list</li>
                </ul>
            </div>
            <div class="ingredient-details__box__image-container">
                <img :src="mainIngredientImageUrl" :alt="ingredient.name" />
            </div>
        </div>
        <div class="ingredient-details__cocktails">
            <div class="ingredient-details__actions">
                <button type="button" class="button-circle" @click="toggleShelf">
                    <svg v-if="!isAddedToShelf" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm1 2v14h14V5H5z" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm7.003 13l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z" />
                    </svg>
                </button>
                <Dropdown>
                    <template v-slot:default="{toggleDropdown}">
                        <button type="button" class="button-circle" @click="toggleDropdown">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path fill="none" d="M0 0h24v24H0z" />
                                <path d="M12 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 14c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                            </svg>
                        </button>
                    </template>
                    <template #content>
                        <RouterLink class="dropdown-menu__item" :to="{name: 'ingredients.form', query: {id: ingredient.id}}">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path fill="none" d="M0 0h24v24H0z" />
                                <path d="M6.414 16L16.556 5.858l-1.414-1.414L5 14.586V16h1.414zm.829 2H3v-4.243L14.435 2.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 18zM3 20h18v2H3v-2z" />
                            </svg>
                            Edit
                        </RouterLink>
                        <a class="dropdown-menu__item" href="#" @click.prevent="toggleShoppingList">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path fill="none" d="M0 0h24v24H0z" />
                                <path d="M15.366 3.438L18.577 9H22v2h-1.167l-.757 9.083a1 1 0 0 1-.996.917H4.92a1 1 0 0 1-.996-.917L3.166 11H2V9h3.422l3.212-5.562 1.732 1L7.732 9h8.535l-2.633-4.562 1.732-1zM18.826 11H5.173l.667 8h12.319l.667-8zM13 13v4h-2v-4h2zm-4 0v4H7v-4h2zm8 0v4h-2v-4h2z" />
                            </svg>
                            <template v-if="isAddedToShoppingList">
                                Remove from shopping list
                            </template>
                            <template v-else>
                                Add to shopping list
                            </template>
                        </a>
                        <a class="dropdown-menu__item" href="#" @click.prevent="deleteIngredient">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path fill="none" d="M0 0h24v24H0z" />
                                <path d="M7 4V2h10v2h5v2h-2v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6H2V4h5zM6 6v14h12V6H6zm3 3h2v8H9V9zm4 0h2v8h-2V9z" />
                            </svg>
                            Delete
                        </a>
                    </template>
                </Dropdown>
            </div>
            <h2 class="ingredient-details__box__title">Used in {{ ingredient.cocktails.length }} cocktails:</h2>
            <ul class="ingredient-chips-list" v-if="ingredient.cocktails.length > 0">
                <li v-for="cocktail in ingredient.cocktails">
                    <RouterLink :to="{name: 'cocktails.show', params: {id: cocktail.slug}}">{{ cocktail.name }}</RouterLink>
                </li>
            </ul>
            <div v-else>
                <RouterLink :to="{name: 'cocktails.form'}">Create a cocktail</RouterLink>
            </div>
        </div>
        <div class="ingredient-details__varieties" v-if="ingredient.varieties.length > 0">
            <h2 class="ingredient-details__box__title">See also:</h2>
            <ul class="ingredient-chips-list">
                <li v-for="variety in ingredient.varieties">
                    <RouterLink :to="{name: 'ingredients.show', params: {id: variety.slug}}">{{ variety.name }}</RouterLink>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import ApiRequests from '../../ApiRequests';
import Auth from '@/Auth.js'
import Dropdown from '@/components/Dropdown.vue';
import OverlayLoader from '@/components/OverlayLoader.vue'

export default {
    data: () => ({
        isLoading: false,
        ingredient: {},
        isAddedToShelf: false,
        isAddedToShoppingList: false,
    }),
    components: {
        Dropdown,
        OverlayLoader
    },
    watch: {
        ingredient(val) {
            document.title = `${val.name} \u22C5 Salt Rim`
        }
    },
    created() {
        this.$watch(
            () => this.$route.params.id,
            () => {
                if (this.$route.name == 'ingredients.show') {
                    this.isLoading = true;
                    this.isAddedToShelf = false;
                    ApiRequests.fetchIngredient(this.$route.params.id).then(data => {
                        this.ingredient = data
                        this.isLoading = false;

                        const currUser = Auth.getUser();
                        this.isAddedToShoppingList = currUser.shopping_lists.includes(this.ingredient.id)

                        ApiRequests.fetchMyShelf().then(data => {
                            data.forEach(i => {
                                if (i.ingredient_id == this.ingredient.id) {
                                    this.isAddedToShelf = true;
                                }
                            })
                        });
                    }).catch(e => {
                        this.$toast.error(e.message);
                    })
                }
            },
            { immediate: true }
        )
    },
    computed: {
        mainIngredientImageUrl() {
            if (!this.ingredient.main_image_id) {
                return '/no-ingredient.png';
            }

            return this.ingredient.images.filter((img) => img.id == this.ingredient.main_image_id)[0].url;
        }
    },
    methods: {
        deleteIngredient() {
            if (confirm(`Are you sure you want to delete "${this.ingredient.name}"? This action cannot be undone and will impact ${this.ingredient.cocktails.length} cocktails.`)) {
                this.isLoading = true;
                ApiRequests.deleteIngredient(this.ingredient.id).then(resp => {
                    this.$toast.default(`Ingredient "${this.ingredient.name}" successfully removed`);
                    this.$router.push({ name: 'ingredients' })
                    this.isLoading = false;
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false;
                })
            }
        },
        toggleShelf() {
            this.isLoading = true;
            if (this.isAddedToShelf) {
                ApiRequests.removeIngredientFromShelf(this.ingredient.id).then(() => {
                    this.isAddedToShelf = false;
                    this.$toast.default(`Removed "${this.ingredient.name}" from your shelf`);
                    this.isLoading = false;
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false;
                })
            } else {
                ApiRequests.addIngredientToShelf(this.ingredient.id).then(() => {
                    this.isAddedToShelf = true;
                    this.$toast.default(`Added "${this.ingredient.name}" to your shelf`);
                    this.isLoading = false;
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false;
                })
            }
        },
        toggleShoppingList() {
            this.isLoading = true;

            const postData = {
                ingredient_ids: [this.ingredient.id]
            };

            if (this.isAddedToShoppingList) {
                ApiRequests.removeIngredientsFromShoppingList(postData).then(() => {
                    this.$toast.default(`Removed "${this.ingredient.name}" from your shopping list.`);
                    this.isAddedToShoppingList = false;
                    this.isLoading = false;
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false;
                })
            } else {
                ApiRequests.addIngredientsToShoppingList(postData).then(() => {
                    this.$toast.default(`Added "${this.ingredient.name}" to your shopping list.`)
                    this.isAddedToShoppingList = true
                    this.isLoading = false;
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false;
                })
            }
        }
    }
}
</script>

<style scope>
.ingredient-details .ingredient-details__image {
    flex-shrink: 0;
    padding: 30px;
    background-color: #fff;
    border-radius: 30px;
}

.ingredient-details .ingredient-details__content {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.ingredient-details__box {
    background-color: #fff;
    padding: 20px 20px 40px 20px;
    border-radius: 20px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    margin-top: -20px;
    display: flex;
}

@media (max-width: 450px) {
    .ingredient-details__box {
        flex-direction: column-reverse;
    }
}

.ingredient-details__box__image-container {
    max-width: 350px;
    max-height: 400px;
    margin-top: -100px;
    margin-left: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.ingredient-details__box img {
    display: block;
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
}

@media (max-width: 450px) {
    .ingredient-details__box__image-container {
        margin-left: 0;
        max-height: none;
    }

    .ingredient-details__box img {
        max-height: 300px;
    }
}

.ingredient-details__box__content {
    width: 100%;
}

.ingredient-details__box__title {
    font-weight: 700;
    font-family: var(--font-accent);
    margin: 10px 0;
    line-height: 1.3rem;
}

.ingredient-details__box__title small {
    display: block;
    font-size: 0.8rem;
    color: var(--color-text-muted);
}

.ingredient-details__box hr {
    border: 0;
    border-top: 2px solid rgba(0, 0, 0, .1);
}

.ingredient-details__box p {
    margin: 5px 0;
    padding: 5px 0;
}

.ingredient-details__box.ingredient-details__box--green {
    background-color: var(--color-var-4);
}

.ingredient-details__cocktails {
    background-color: var(--color-var-1);
    padding: 20px 20px 40px 20px;
    border-radius: 20px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    margin-top: -20px;
}

.ingredient-chips-list {
    list-style: none;
    padding: 0;
    margin: 30px 0 0 0;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.ingredient-chips-list li a {
    display: block;
    padding: 1px 8px;
    font-size: 0.9rem;
    box-shadow: 0 2px 0 rgba(0, 0, 0, .1);
    background-color: rgba(255, 255, 255, .5);
    border-radius: 3px;
    text-decoration: none;
}

.ingredient-chips-list li a:hover,
.ingredient-chips-list li a:active,
.ingredient-chips-list li a:focus {
    box-shadow: 0 2px 0 var(--color-link-hover);
    background-color: #fff;
}

.ingredient-details__actions {
    position: absolute;
    z-index: 5;
    top: -25px;
    right: 20px;
    display: flex;
}

.ingredient-details__actions .button-circle {
    margin-left: 5px;
}

.ingredient-details__varieties {
    background-color: var(--color-var-2);
    padding: 20px 20px 40px 20px;
    border-radius: 20px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    margin-top: -20px;
}
</style>
