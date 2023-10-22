<template>
    <div v-if="ingredient.id" class="ingredient-details">
        <OverlayLoader v-if="isLoading" />
        <div class="block-container block-container--padded ingredient-details__box" style="margin-top: 100px;">
            <div class="ingredient-details__box__content">
                <div class="ingredient-details__title">
                    <h2>{{ ingredient.name }}</h2>
                    <p>
                        {{ $t('added-on-by', { date: createdDate, name: ingredient.created_user.name }) }}
                        <template v-if="ingredient.updated_user"> &middot; {{ $t('updated-on-by', { date: updatedDate, name: ingredient.updated_user.name }) }}</template>
                    </p>
                </div>
                <div class="item-details__chips">
                    <div v-if="ingredient.category" class="item-details__chips__group">
                        <div class="item-details__chips__group__title">{{ $t('category') }}:</div>
                        <ul class="chips-list">
                            <li>
                                <RouterLink class="chip" :to="{ name: 'ingredients', query: { 'filter[category_id]': ingredient.category.id } }">{{ ingredient.category.name }}</RouterLink>
                            </li>
                        </ul>
                    </div>
                    <div class="item-details__chips__group">
                        <div class="item-details__chips__group__title">{{ $t('strength') }}:</div>
                        <ul v-if="ingredient.strength > 0" class="chips-list">
                            <li>
                                <span class="chip"><abbr :title="$t('ABV.definition')">{{ $t('ABV') }}</abbr>: {{ ingredient.strength + '%' }}</span>
                            </li>
                            <li>
                                <span class="chip">{{ $t('alcohol-proof') }}: {{ ingredient.strength * 2 }}</span>
                            </li>
                        </ul>
                        <ul v-else class="chips-list">
                            <li>
                                <span class="chip">{{ $t('non-alcoholic') }}</span>
                            </li>
                        </ul>
                    </div>
                    <div v-if="ingredient.origin" class="item-details__chips__group">
                        <div class="item-details__chips__group__title">{{ $t('origin') }}:</div>
                        <ul class="chips-list">
                            <li>
                                <span class="chip">{{ ingredient.origin }}</span>
                            </li>
                        </ul>
                    </div>
                    <div v-if="isAddedToShelf || isAddedToShoppingList" class="item-details__chips__group">
                        <div class="item-details__chips__group__title">{{ $t('status') }}:</div>
                        <ul class="chips-list">
                            <li v-show="isAddedToShelf">
                                <span class="chip">{{ $t('ingredient.in-shelf') }}</span>
                            </li>
                            <li v-show="isAddedToShoppingList">
                                <span class="chip">{{ $t('ingredient.on-shopping-list') }}</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div v-html="parsedDescription"></div>
            </div>
            <div class="ingredient-details__box__image-container">
                <img :src="mainIngredientImageUrl" :alt="ingredient.name" />
            </div>
        </div>
        <div class="block-container block-container--padded ingredient-details__cocktails">
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
                    <template #default="{ toggleDropdown }">
                        <button type="button" class="button-circle" @click="toggleDropdown">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path fill="none" d="M0 0h24v24H0z" />
                                <path d="M12 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 14c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                            </svg>
                        </button>
                    </template>
                    <template #content>
                        <RouterLink v-if="ingredient.access.can_edit" class="dropdown-menu__item" :to="{ name: 'ingredients.form', query: { id: ingredient.id } }">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path fill="none" d="M0 0h24v24H0z" />
                                <path d="M6.414 16L16.556 5.858l-1.414-1.414L5 14.586V16h1.414zm.829 2H3v-4.243L14.435 2.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 18zM3 20h18v2H3v-2z" />
                            </svg>
                            {{ $t('edit') }}
                        </RouterLink>
                        <a class="dropdown-menu__item" href="#" @click.prevent="toggleShoppingList">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path fill="none" d="M0 0h24v24H0z" />
                                <path d="M15.366 3.438L18.577 9H22v2h-1.167l-.757 9.083a1 1 0 0 1-.996.917H4.92a1 1 0 0 1-.996-.917L3.166 11H2V9h3.422l3.212-5.562 1.732 1L7.732 9h8.535l-2.633-4.562 1.732-1zM18.826 11H5.173l.667 8h12.319l.667-8zM13 13v4h-2v-4h2zm-4 0v4H7v-4h2zm8 0v4h-2v-4h2z" />
                            </svg>
                            <template v-if="isAddedToShoppingList">
                                {{ $t('ingredient.remove-from-list') }}
                            </template>
                            <template v-else>
                                {{ $t('ingredient.add-to-list') }}
                            </template>
                        </a>
                        <a v-if="ingredient.access.can_delete" class="dropdown-menu__item" href="#" @click.prevent="deleteIngredient">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path fill="none" d="M0 0h24v24H0z" />
                                <path d="M7 4V2h10v2h5v2h-2v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6H2V4h5zM6 6v14h12V6H6zm3 3h2v8H9V9zm4 0h2v8h-2V9z" />
                            </svg>
                            {{ $t('remove') }}
                        </a>
                    </template>
                </Dropdown>
            </div>
            <h2 class="details-block-container__title">{{ $t('ingredient.cocktail-children', { total: ingredient.cocktails.length }) }}</h2>
            <ul v-if="ingredient.cocktails.length > 0" class="ingredient-chips-list">
                <li v-if="extraIfAddedToShelf.length > 0" class="ingredient-chips-list__label">{{ $t('ingredient.extra-cocktails') }}:</li>
                <li v-for="cocktail in extraIfAddedToShelf" :key="cocktail.id">
                    <RouterLink class="chip" :to="{ name: 'cocktails.show', params: { id: cocktail.slug } }">{{ cocktail.name }}</RouterLink>
                </li>
                <li v-if="extraIfAddedToShelf.length > 0 && defaultCocktails.length > 0" class="ingredient-chips-list__label">{{ $t('ingredient.cocktails-rest') }}:</li>
                <li v-for="cocktail in defaultCocktails" :key="cocktail.id">
                    <RouterLink class="chip" :to="{ name: 'cocktails.show', params: { id: cocktail.slug } }">{{ cocktail.name }}</RouterLink>
                </li>
            </ul>
            <div v-else>
                <RouterLink :to="{ name: 'cocktails.form' }">{{ $t('cocktails.add') }}</RouterLink>
            </div>
        </div>
        <div v-if="ingredient.varieties.length > 0" class="block-container block-container--padded">
            <h2 class="details-block-container__title">{{ $t('see-also') }}</h2>
            <ul class="ingredient-chips-list">
                <li v-for="variety in ingredient.varieties" :key="variety.slug">
                    <RouterLink class="chip" :to="{ name: 'ingredients.show', params: { id: variety.slug } }">{{ variety.name }}</RouterLink>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import ApiRequests from './../../ApiRequests.js'
import Dropdown from '@/components/SaltRimDropdown.vue'
import OverlayLoader from '@/components/OverlayLoader.vue'
import { micromark } from 'micromark'
import dayjs from 'dayjs'

export default {
    components: {
        Dropdown,
        OverlayLoader
    },
    data: () => ({
        isLoading: false,
        ingredient: {},
        isAddedToShelf: false,
        isAddedToShoppingList: false,
        extraIfAddedToShelf: []
    }),
    computed: {
        mainIngredientImageUrl() {
            if (!this.ingredient.main_image_id) {
                return '/no-ingredient.png'
            }

            return this.ingredient.images.filter((img) => img.id == this.ingredient.main_image_id)[0].url
        },
        parsedDescription() {
            if (!this.ingredient.description) {
                return null
            }

            return micromark(this.ingredient.description)
        },
        defaultCocktails() {
            const removeIds = this.extraIfAddedToShelf.map(c => c.id)

            return this.ingredient.cocktails.filter(c => !removeIds.includes(c.id))
        },
        createdDate() {
            const date = dayjs(this.ingredient.created_at).toDate()

            return this.$d(date, 'long')
        },
        updatedDate() {
            const date = dayjs(this.ingredient.updated_at).toDate()

            return this.$d(date, 'long')
        }
    },
    watch: {
        ingredient(val) {
            document.title = `${val.name} \u22C5 ${this.site_title}`
        }
    },
    created() {
        this.$watch(
            () => this.$route.params.id,
            async () => {
                if (this.$route.name == 'ingredients.show') {
                    await this.refreshIngredient()
                }
            },
            { immediate: true }
        )
    },
    methods: {
        async refreshIngredient() {
            this.isLoading = true

            this.ingredient = await ApiRequests.fetchIngredient(this.$route.params.id).catch(e => {
                this.$toast.error(e.message)

                return {}
            })

            const shelfIngredients = await ApiRequests.fetchMyShelf().catch(() => [])
            const shoppingListIngredients = await ApiRequests.fetchShoppingList().catch(() => [])

            this.isAddedToShelf = shelfIngredients.filter(i => i.ingredient_id == this.ingredient.id).length > 0
            this.isAddedToShoppingList = shoppingListIngredients.filter(i => i.ingredient_id == this.ingredient.id).length > 0

            await this.refreshExtraCocktails()

            this.isLoading = false
        },
        deleteIngredient() {
            this.$confirm(this.$t('ingredient.delete-confirm', { name: this.ingredient.name, total: this.ingredient.cocktails.length }), {
                onResolved: (dialog) => {
                    dialog.close()
                    this.isLoading = true
                    ApiRequests.deleteIngredient(this.ingredient.id).then(() => {
                        this.$toast.default(`Ingredient "${this.ingredient.name}" successfully removed`)
                        this.$router.push({ name: 'ingredients' })
                        this.isLoading = false
                    }).catch(e => {
                        this.$toast.error(e.message)
                        this.isLoading = false
                    })
                }
            })
        },
        toggleShelf() {
            this.isLoading = true

            const postData = {
                ingredient_ids: [this.ingredient.id]
            }

            if (this.isAddedToShelf) {
                ApiRequests.removeIngredientsFromShelf(postData).then(() => {
                    this.isAddedToShelf = false
                    this.$toast.default(this.$t('ingredient.shelf-remove-success', { name: this.ingredient.name }))
                    this.isLoading = false
                    this.refreshExtraCocktails()
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false
                })
            } else {
                ApiRequests.addIngredientsToShelf(postData).then(() => {
                    this.isAddedToShelf = true
                    this.$toast.default(this.$t('ingredient.shelf-add-success', { name: this.ingredient.name }))
                    this.isLoading = false
                    this.refreshExtraCocktails()
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false
                })
            }
        },
        toggleShoppingList() {
            this.isLoading = true

            const postData = {
                ingredient_ids: [this.ingredient.id]
            }

            if (this.isAddedToShoppingList) {
                ApiRequests.removeIngredientsFromShoppingList(postData).then(() => {
                    this.$toast.default(this.$t('ingredient.list-remove-success', { name: this.ingredient.name }))
                    this.isAddedToShoppingList = false
                    this.isLoading = false
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false
                })
            } else {
                ApiRequests.addIngredientsToShoppingList(postData).then(() => {
                    this.$toast.default(this.$t('ingredient.list-add-success', { name: this.ingredient.name }))
                    this.isAddedToShoppingList = true
                    this.isLoading = false
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false
                })
            }
        },
        async refreshExtraCocktails() {
            return await ApiRequests.fetchExtraCocktailsWithIngredient(this.ingredient.id).then(data => {
                this.extraIfAddedToShelf = data
            }).catch(e => {
                this.$toast.error(e.message)
            })
        }
    }
}
</script>

<style scoped>
.ingredient-details .ingredient-details__image {
    flex-shrink: 0;
    padding: 30px;
    background-color: #fff;
    border-radius: var(--radius-4);
}

.ingredient-details .ingredient-details__content {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.ingredient-details__box {
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

.ingredient-details__title {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
}

.dark-theme .ingredient-details__title {
    border-bottom: 2px solid var(--clr-dark-main-800);
}

.ingredient-details__title h2 {
    font-family: var(--font-heading);
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
    line-height: 1.3;
}

.ingredient-details__title p {
    margin-top: 0;
    padding-top: 0;
    font-size: 0.75rem;
    color: var(--clr-dark-main-800);
    opacity: .5;
}

.dark-theme .ingredient-details__title p {
    color: var(--clr-gray-300);
}

:deep(.ingredient-details__box hr) {
    border: 0;
    margin: 0.25rem 0;
    border-top: 2px solid rgba(0, 0, 0, .1);
}

.ingredient-chips-list {
    --icl-clr-bg: rgba(255, 255, 255, .5);
    --icl-clr-bg-hover: #fff;
    --icl-clr-border: rgba(0, 0, 0, .1);
    --icl-clr-border-hover: var(--clr-accent-800);
    list-style: none;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
}

.ingredient-chips-list__label {
    font-size: 0.75rem;
}

.ingredient-details__actions {
    position: absolute;
    top: -25px;
    right: 20px;
    display: flex;
    gap: var(--gap-size-1);
}
</style>
