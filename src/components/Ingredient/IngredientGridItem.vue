<template>
    <div class="block-container block-container--hover ingredient-grid-item" :class="{ 'ingredient-grid-item--shelf': inShelf }">
        <OverlayLoader v-if="isLoading" />
        <div class="ingredient-grid-item__image">
            <IngredientImage :ingredient="ingredient"></IngredientImage>
        </div>
        <div class="ingredient-grid-item__content">
            <RouterLink class="ingredient-grid-item__title" :to="{ name: 'ingredients.show', params: { id: ingredient.slug } }">
                <small v-if="ingredient.category">{{ ingredient.category.name }}</small>
                {{ ingredient.name }}
            </RouterLink>
            <p>{{ cleanDescription }}</p>
            <div class="ingredient-grid-item__actions">
                <a href="#" @click.prevent="toggleShelf">
                    <template v-if="!inShelf">
                        {{ $t('ingredient.add-to-shelf') }}
                    </template>
                    <template v-else>
                        {{ $t('ingredient.remove-from-shelf') }}
                    </template>
                </a>
                &middot;
                <a href="#" @click.prevent="toggleList">
                    <template v-if="!inList">
                        {{ $t('ingredient.add-to-list') }}
                    </template>
                    <template v-else>
                        {{ $t('ingredient.remove-from-list') }}
                    </template>
                </a>
            </div>
        </div>
    </div>
</template>

<script>
import OverlayLoader from './../OverlayLoader.vue'
import IngredientImage from './IngredientImage.vue'
import ApiRequests from './../../ApiRequests.js'
import removeMd from 'remove-markdown'

export default {
    components: {
        OverlayLoader,
        IngredientImage
    },
    props: {
        ingredient: {
            type: Object,
            default() {
                return {}
            }
        },
        userIngredients: {
            type: Array,
            default() {
                return []
            }
        },
        shoppingList: {
            type: Array,
            default() {
                return []
            }
        }
    },
    data() {
        return {
            isLoading: false,
            scopedUserIngredients: [],
            scopedShoppingList: [],
        }
    },
    computed: {
        inShelf() {
            return this.scopedUserIngredients.includes(this.ingredient.id)
        },
        inList() {
            return this.scopedShoppingList.includes(this.ingredient.id)
        },
        cleanDescription() {
            return removeMd(this.ingredient.description)
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
    methods: {
        toggleShelf() {
            this.isLoading = true

            if (this.inShelf) {
                ApiRequests.removeIngredientsFromShelf({ingredient_ids: [this.ingredient.id]}).then(() => {
                    this.isLoading = false
                    this.$toast.default(this.$t('ingredient.shelf-remove-success', { name: this.ingredient.name }))
                    this.scopedUserIngredients.splice(this.scopedUserIngredients.indexOf(this.ingredient.id), 1)
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false
                })
            } else {
                ApiRequests.addIngredientsToShelf({ingredient_ids: [this.ingredient.id]}).then(() => {
                    this.isLoading = false
                    this.$toast.default(this.$t('ingredient.shelf-add-success', { name: this.ingredient.name }))
                    this.scopedUserIngredients.push(this.ingredient.id)
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false
                })
            }
        },
        toggleList() {
            this.isLoading = true

            const postData = {
                ingredient_ids: [this.ingredient.id]
            }

            if (this.inList) {
                ApiRequests.removeIngredientsFromShoppingList(postData).then(() => {
                    this.isLoading = false
                    this.$toast.default(this.$t('ingredient.list-remove-success', { name: this.ingredient.name }))
                    this.scopedShoppingList.splice(this.scopedShoppingList.indexOf(this.ingredient.id), 1)
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false
                })
            } else {
                ApiRequests.addIngredientsToShoppingList(postData).then(() => {
                    this.isLoading = false
                    this.$toast.default(this.$t('ingredient.list-add-success', { name: this.ingredient.name }))
                    this.scopedShoppingList.push(this.ingredient.id)
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false
                })
            }
        }
    }
}
</script>

<style scoped>
.ingredient-grid-item {
    --_clr-content: var(--clr-gray-500);
    display: flex;
    width: 100%;
    padding: var(--gap-size-3);
}

.dark-theme .ingredient-grid-item {
    --_clr-content: var(--clr-gray-400);
}

.ingredient-grid-item__image {
    margin-right: var(--gap-size-3);
}

.ingredient-grid-item__title {
    font-family: var(--font-heading);
    font-weight: var(--fw-bold);
    font-size: 1.3rem;
    line-height: 1.3;
    text-decoration: none;
}

.ingredient-grid-item__title small {
    display: block;
    font-size: 0.7rem;
    color: var(--clr-gray-500);
    font-family: var(--font-primary);
}

.ingredient-grid-item__content {
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-1);
}

.ingredient-grid-item__content p {
    color: var(--_clr-content);
    overflow: hidden;
    font-size: 0.815rem;
    max-height: calc(3 * 1.3rem);
}
</style>
