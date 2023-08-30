<template>
    <div class="block-container block-container--hover ingredient-grid-item" :class="{ 'ingredient-grid-item--shelf': inShelf }">
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
import OverlayLoader from '@/components/OverlayLoader.vue'
import ApiRequests from './../../ApiRequests.js'

export default {
    components: {
        OverlayLoader
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
        image() {
            if (this.ingredient.image_url) {
                return this.ingredient.image_url;
            }

            if (this.ingredient.images && this.ingredient.images.length > 0) {
                return this.ingredient.images.filter(img => img.id == this.ingredient.main_image_id)[0].url
            }

            return '/no-ingredient.png';
        },
        inShelf() {
            return this.scopedUserIngredients.includes(this.ingredient.id)
        },
        inList() {
            return this.scopedShoppingList.includes(this.ingredient.id)
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
                ApiRequests.removeIngredientsFromShelf({ingredient_ids: [this.ingredient.id]}).then(() => {
                    this.isLoading = false;
                    this.$toast.default(this.$t('ingredient.shelf-remove-success', { name: this.ingredient.name }));
                    this.scopedUserIngredients.splice(this.scopedUserIngredients.indexOf(this.ingredient.id), 1)
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false;
                })
            } else {
                ApiRequests.addIngredientsToShelf({ingredient_ids: [this.ingredient.id]}).then(() => {
                    this.isLoading = false;
                    this.$toast.default(this.$t('ingredient.shelf-add-success', { name: this.ingredient.name }))
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
                    this.$toast.default(this.$t('ingredient.list-remove-success', { name: this.ingredient.name }));
                    this.scopedShoppingList.splice(this.scopedShoppingList.indexOf(this.ingredient.id), 1)
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false;
                })
            } else {
                ApiRequests.addIngredientsToShoppingList(postData).then(() => {
                    this.isLoading = false;
                    this.$toast.default(this.$t('ingredient.list-add-success', { name: this.ingredient.name }))
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
    --igi-clr-content: var(--clr-gray-500);

    display: flex;
    width: 100%;
    padding: 1rem;
    transition: border-color ease-in-out 150ms;
}

.dark-theme .ingredient-grid-item {
    --igi-clr-content: var(--clr-gray-400);
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
    color: var(--igi-clr-content);
    overflow: hidden;
    font-size: 0.815rem;
    max-height: calc(3 * 1.3rem);
}
</style>
