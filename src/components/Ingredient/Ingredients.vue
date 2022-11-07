<script setup>
import Spinner from './../Spinner.vue'
</script>

<template>
    <div style="text-align: right;">
        <RouterLink class="button button--outline" :to="{ name: 'ingredients.form' }">Add ingredient</RouterLink>
    </div>
    <h2 class="page-subtitle" style="margin-top: 10px;">Ingredients</h2>
    <p class="page-description">
        This is a list of ingredients available in your Bar Assistant server. You can press the "plus" sign to add specific ingredients to your shelf and this will update what cocktails you can make.
        By clicking "Learn more" you can see more details about the ingredient, including an option to add it to your shopping list.
    </p>
    <div style="text-align: center; padding: 40px;" v-if="ingredients.length == 0">
        <Spinner :size="64" />
    </div>
    <div v-else v-for="(ingredients, cat) in groupedByCategory">
        <h2 class="ingredient-category-title">{{ cat }} ({{ ingredients.filter(i => userIngredientIds.includes(i.id)).length }}/{{ ingredients.length }})</h2>
        <ul class="ingredient-list">
            <li v-for="ingredient in ingredients" :ref="setupObserver">
                <div class="ingredient-list__image" :style="{ 'background-color': setupColor(ingredient.color) }">
                    <img :data-img-src="ingredient.image_url" :alt="ingredient.name">
                </div>
                <div class="ingredient-list__description">
                    <h3>{{ ingredient.name }}</h3>
                    <p>{{ ingredient.description }}</p>
                    <RouterLink :to="{ name: 'ingredients.show', params: { id: ingredient.slug } }" class="button-more">
                        <span>Learn more</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z" />
                        </svg>
                    </RouterLink>
                </div>
                <div class="ingredient-list__actions">
                    <button class="button button--icon" title="Remove from my bar shelf" @click="removeFromShelf(ingredient)" v-if="userIngredientIds.includes(ingredient.id)">
                        <Spinner v-if="loadingIngredients.includes(ingredient.id)" />
                        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z" />
                        </svg>
                    </button>
                    <button class="button button--icon" title="Add to my bar shelf" @click="addToShelf(ingredient)" v-else>
                        <Spinner v-if="loadingIngredients.includes(ingredient.id)" />
                        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" />
                        </svg>
                    </button>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
import _ from 'lodash';
import ApiRequests from '../../ApiRequests';

export default {
    data() {
        return {
            observer: null,
            ingredients: [],
            userIngredients: [],
            loadingIngredients: []
        }
    },
    created() {
        document.title = `Ingredients \u22C5 Salt Rim`

        this.observer = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const imgElement = entry.target.querySelector('img');
                    imgElement.setAttribute('src', imgElement.dataset.imgSrc);
                    this.observer.unobserve(entry.target)
                }
            });
        });

        ApiRequests.fetchIngredients().then(data => {
            this.ingredients = data
        });

        ApiRequests.fetchMyShelf().then(data => {
            this.userIngredients = data
        });
    },
    computed: {
        groupedByCategory() {
            return _.groupBy(this.ingredients, 'category.name');
        },
        userIngredientIds() {
            return this.userIngredients.map(ui => ui.ingredient_id)
        }
    },
    methods: {
        setupColor(hex) {
            var c;
            if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
                c = hex.substring(1).split('');
                if (c.length == 3) {
                    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
                }
                c = '0x' + c.join('');
                return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',.13)';
            }

            return hex;
        },
        setupObserver(el) {
            if (el) {
                this.observer.observe(el)
            }
        },
        addToShelf(ingredient) {
            this.loadingIngredients.push(ingredient.id)
            ApiRequests.addIngredientToShelf(ingredient.id).then(() => {
                this.loadingIngredients.splice(this.loadingIngredients.indexOf(ingredient.id), 1)
            })

            this.userIngredients.push({ ingredient_id: ingredient.id })
        },
        removeFromShelf(ingredient) {
            this.loadingIngredients.push(ingredient.id)
            ApiRequests.removeIngredientFromShelf(ingredient.id).then(() => {
                this.loadingIngredients.splice(this.loadingIngredients.indexOf(ingredient.id), 1)
            })

            _.remove(this.userIngredients, function (n) {
                return n.ingredient_id === ingredient.id;
            });
        }
    }
}
</script>

<style scoped>
.ingredient-list {
    list-style: none;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
    row-gap: 20px;
    column-gap: 20px;
}

.ingredient-category-title {
    background-color: var(--color-text);
    color: #fff;
    display: inline-block;
    font-size: 1rem;
    padding: 3px 10px;
    border-radius: 20px;
    margin: 20px auto;
}

.ingredient-list>li {
    background-color: #fff;
    padding: 20px;
    box-shadow: var(--shadow-elevation-medium);
    border-radius: 10px;
    width: 100%;
    display: flex;
}

.ingredient-list .ingredient-list__description h3 {
    font-family: var(--font-accent);
    font-weight: bold;
    font-size: 1.3rem;
}

.ingredient-list .ingredient-list__description p {
    color: var(--color-text-muted);
    overflow: hidden;
    line-height: 1.6rem;
    max-height: calc(3 * 1.6rem);
}

.ingredient-list .ingredient-list__image {
    flex-shrink: 0;
    margin-right: 15px;
    align-self: center;
    width: 120px;
    height: 120px;
    text-align: center;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.ingredient-list .ingredient-list__image img {
    height: 115px;
}

@media (max-width: 450px) {
    .ingredient-list .ingredient-list__image {
        margin-right: 10px;
        width: 90px;
        height: 90px;
    }

    .ingredient-list .ingredient-list__image img {
        height: 90px;
    }
}

.ingredient-list__actions {
    margin-left: auto;
    flex-shrink: 0;
}

.button-more {
    display: flex;
    align-items: center;
    margin-top: 5px;
    color: var(--color-text-muted);
}

.button-more svg {
    transition: all ease-in-out .1s;
    fill: var(--color-text-muted);
}

.button-more span {
    margin-right: 3px;
}

.button-more:hover span,
.button-more:focus span,
.button-more:active span {
    font-weight: 700;
    color: var(--color-text);
}

.button-more:hover svg,
.button-more:focus svg,
.button-more:active svg {
    transform: translateX(3px);
}
</style>
