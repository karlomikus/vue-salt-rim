<template>
    <div class="ingredient-grid-item" :class="{'ingredient-grid-item--shelf': inShelf}">
        <OverlayLoader v-if="isLoading" />
        <div class="ingredient-grid-item__image" :style="{ 'background-color': setupColor(ingredient.color) }">
            <img :src="image" alt="Main image of the ingredient">
        </div>
        <div class="ingredient-grid-item__content">
            <RouterLink class="ingredient-grid-item__title" :to="{ name: 'ingredients.show', params: { id: ingredient.slug } }">
                {{ ingredient.name }}
            </RouterLink>
            <p>{{ ingredient.description }}</p>
            <div class="ingredient-grid-item__actions">
                <a href="#" @click.prevent="toggleShelf">
                    <template v-if="!inShelf">
                        Add to shelf
                    </template>
                    <template v-else>
                        Remove from shelf
                    </template>
                </a>
                &middot;
                <a href="#" @click.prevent="toggleList">
                    <template v-if="!inList">
                        Add to shopping list
                    </template>
                    <template v-else>
                        Remove from shopping list
                    </template>
                </a>
            </div>
        </div>
    </div>
</template>

<script>
import OverlayLoader from '@/components/OverlayLoader.vue'
import ApiRequests from "@/ApiRequests";

export default {
    props: ['ingredient', 'userIngredients', 'shoppingList'],
    components: {
        OverlayLoader
    },
    data() {
        return {
            isLoading: false,
            scopedUserIngredients: [],
            scopedShoppingList: [],
        }
    },
    watch: {
        userIngredients: {
            handler(newVal) {
                this.scopedUserIngredients = newVal
            },
            immediate: true
        },
        shoppingList: {
            handler(newVal) {
                this.scopedShoppingList = newVal
            },
            immediate: true
        }
    },
    computed: {
        image() {
            if (!this.ingredient.image_url) {
                return '/no-ingredient.png';
            }

            return this.ingredient.image_url;
        },
        inShelf() {
            return this.scopedUserIngredients.includes(this.ingredient.id)
        },
        inList() {
            return this.scopedShoppingList.includes(this.ingredient.id)
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
        toggleShelf() {
            this.isLoading = true;

            if (this.inShelf) {
                ApiRequests.removeIngredientFromShelf(this.ingredient.id).then(() => {
                    this.isLoading = false;
                    this.$toast.default(`Removed "${this.ingredient.name}" from your shelf.`);
                    this.scopedUserIngredients.splice(this.scopedUserIngredients.indexOf(this.ingredient.id), 1)
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false;
                })
            } else {
                ApiRequests.addIngredientToShelf(this.ingredient.id).then(() => {
                    this.isLoading = false;
                    this.$toast.default(`Added "${this.ingredient.name}" to your shelf.`)
                    this.scopedUserIngredients.push(this.ingredient.id)
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false;
                })
            }
        },
        toggleList() {
            this.isLoading = true;

            const postData = {
                ingredient_ids: [this.ingredient.id]
            };

            if (this.inList) {
                ApiRequests.removeIngredientsFromShoppingList(postData).then(() => {
                    this.isLoading = false;
                    this.$toast.default(`Removed "${this.ingredient.name}" from your shopping list.`);
                    this.scopedShoppingList.splice(this.scopedShoppingList.indexOf(this.ingredient.id), 1)
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false;
                })
            } else {
                ApiRequests.addIngredientsToShoppingList(postData).then(() => {
                    this.isLoading = false;
                    this.$toast.default(`Added "${this.ingredient.name}" to your shopping list.`)
                    this.scopedShoppingList.push(this.ingredient.id)
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false;
                })
            }
        }
    }
}
</script>

<style scoped>
.ingredient-grid-item {
    --image-size: 70px;
    --content-padding: 0.315rem;

    display: flex;
    width: 100%;
    background-color: #fff;
    padding: 1rem;
    box-shadow: 0 3px 0 var(--clr-red-300);
    border-radius: 0.815rem;
    transition: box-shadow ease-in-out 150ms;
}

.ingredient-grid-item:hover {
    box-shadow: 0 3px 0 var(--clr-red-800);
}

.ingredient-grid-item__image {
    flex-shrink: 0;
    margin-right: 1rem;
    align-self: start;
    width: var(--image-size);
    height: var(--image-size);
    text-align: center;
    border-radius: 0.415rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.ingredient-grid-item__image img {
    height: var(--image-size);
}

.ingredient-grid-item__title {
    font-family: var(--font-heading);
    font-weight: bold;
    font-size: 1.3rem;
    line-height: 1.3;
    text-decoration: none;
}

.ingredient-grid-item__content {
    display: flex;
    flex-direction: column;
    gap: var(--content-padding);
}

.ingredient-grid-item__content p {
    color: var(--clr-gray-500);
    overflow: hidden;
    font-size: 0.815rem;
    max-height: calc(3 * 1.3rem);
}
</style>
