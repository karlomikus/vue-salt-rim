<script setup>
import UnitHandler from '../../UnitHandler.js'
</script>
<template>
    <OverlayLoader v-if="isLoadingIngredient" />
    <div v-if="ingredient.id" class="ingredient-details">
        <PageHeader>
            {{ ingredient.name }}
            <p :title="$t('added-on-by', { date: createdDate, name: ingredient.created_user.name })">
                <template v-if="ingredient.category">
                    <RouterLink :to="{ name: 'ingredients', query: { 'filter[category_id]': ingredient.category.id } }">{{ ingredient.category.name }}</RouterLink> &middot;
                </template>
                <template v-if="ingredient.updated_user">{{ $t('updated-on-by', { date: updatedDate, name: ingredient.updated_user.name }) }}</template>
                <template v-else>{{ $t('added-on-by', { date: createdDate, name: ingredient.created_user.name }) }}</template>
            </p>
            <template #actions>
                <button v-if="ingredient.access.can_delete" type="button" class="button button--outline" @click="deleteIngredient">{{ $t('remove') }}</button>
                <RouterLink v-if="ingredient.access.can_edit" class="button button--dark" :to="{ name: 'ingredients.form', query: { id: ingredient.id } }">{{ $t('edit') }}</RouterLink>
            </template>
        </PageHeader>
        <div class="block-container block-container--padded ingredient-details__box">
            <div class="ingredient-details__box__image-container">
                <img :src="mainIngredientImageUrl" :alt="ingredient.name" />
            </div>
            <div class="ingredient-details__box__content">
                <div class="item-details__chips">
                    <div class="item-details__chips__group">
                        <div class="item-details__chips__group__title">{{ $t('strength') }}:</div>
                        <ul v-if="ingredient.strength > 0" class="chips-list">
                            <li>
                                <span class="chip"><abbr :title="$t('ABV-definition')">{{ $t('ABV') }}</abbr>: {{ ingredient.strength + '%' }}</span>
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
                </div>
                <ul class="ingredient-details__more">
                    <OverlayLoader v-if="isLoadingExtra || isLoadingShelf || isLoadingShoppingList" />
                    <li>
                        <a href="#" @click.prevent="toggleShelf">
                            <template v-if="isAddedToShelf">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11.0026 16L18.0737 8.92893L16.6595 7.51472L11.0026 13.1716L8.17421 10.3431L6.75999 11.7574L11.0026 16Z"></path></svg> {{ $t('ingredient.remove-from-shelf') }}
                            </template>
                            <template v-else>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z"></path></svg> {{ $t('ingredient.add-to-shelf') }}
                            </template>
                        </a>
                    </li>
                    <li>
                        <a href="#" @click.prevent="toggleShoppingList">
                            <template v-if="isAddedToShoppingList">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4.00436 6.41686L0.761719 3.17422L2.17593 1.76001L5.41857 5.00265H20.6603C21.2126 5.00265 21.6603 5.45037 21.6603 6.00265C21.6603 6.09997 21.6461 6.19678 21.6182 6.29L19.2182 14.29C19.0913 14.713 18.7019 15.0027 18.2603 15.0027H6.00436V17.0027H17.0044V19.0027H5.00436C4.45207 19.0027 4.00436 18.5549 4.00436 18.0027V6.41686ZM5.50436 23.0027C4.67593 23.0027 4.00436 22.3311 4.00436 21.5027C4.00436 20.6742 4.67593 20.0027 5.50436 20.0027C6.33279 20.0027 7.00436 20.6742 7.00436 21.5027C7.00436 22.3311 6.33279 23.0027 5.50436 23.0027ZM17.5044 23.0027C16.6759 23.0027 16.0044 22.3311 16.0044 21.5027C16.0044 20.6742 16.6759 20.0027 17.5044 20.0027C18.3328 20.0027 19.0044 20.6742 19.0044 21.5027C19.0044 22.3311 18.3328 23.0027 17.5044 23.0027Z"></path></svg> {{ $t('ingredient.remove-from-list') }}
                            </template>
                            <template v-else>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4.00436 6.41686L0.761719 3.17422L2.17593 1.76001L5.41857 5.00265H20.6603C21.2126 5.00265 21.6603 5.45037 21.6603 6.00265C21.6603 6.09997 21.6461 6.19678 21.6182 6.29L19.2182 14.29C19.0913 14.713 18.7019 15.0027 18.2603 15.0027H6.00436V17.0027H17.0044V19.0027H5.00436C4.45207 19.0027 4.00436 18.5549 4.00436 18.0027V6.41686ZM6.00436 7.00265V13.0027H17.5163L19.3163 7.00265H6.00436ZM5.50436 23.0027C4.67593 23.0027 4.00436 22.3311 4.00436 21.5027C4.00436 20.6742 4.67593 20.0027 5.50436 20.0027C6.33279 20.0027 7.00436 20.6742 7.00436 21.5027C7.00436 22.3311 6.33279 23.0027 5.50436 23.0027ZM17.5044 23.0027C16.6759 23.0027 16.0044 22.3311 16.0044 21.5027C16.0044 20.6742 16.6759 20.0027 17.5044 20.0027C18.3328 20.0027 19.0044 20.6742 19.0044 21.5027C19.0044 22.3311 18.3328 23.0027 17.5044 23.0027Z"></path></svg> {{ $t('ingredient.add-to-list') }}
                            </template>
                        </a>
                    </li>
                    <li v-if="ingredient.ingredient_parts.length">
                        {{ $t('contains-ingredients') }}:
                        <template v-for="(part, index) in ingredient.ingredient_parts" :key="part.id">
                            <RouterLink :to="{name: 'ingredients.show', params: {id: part.slug}}">{{ part.name }}</RouterLink><template v-if="index + 1 !== ingredient.ingredient_parts.length">, </template>
                        </template>
                    </li>
                    <li><RouterLink :to="{name: 'cocktails', query: {'filter[ingredient_id]': ingredient.id}}">Used in <strong>{{ ingredient.cocktails.length }}</strong> cocktail recipes</RouterLink></li>
                    <li v-if="extraIfAddedToShelf.length > 0">{{ $t('ingredient.extra-cocktails') }}: <RouterLink :to="{name: 'cocktails', query: {'filter[id]': extraCocktailsIds}}">{{ extraIfAddedToShelf.length }} {{ $t('cocktail.cocktails') }}</RouterLink></li>
                </ul>
                <div v-if="ingredient.description">
                    <h2 class="details-block-container__title">{{ $t('description') }}</h2>
                    <div v-html="parsedDescription"></div>
                </div>
                <div v-if="ingredient.prices.length > 0" class="ingredient-details__prices">
                    <h2 class="details-block-container__title">{{ $t('price.prices') }}</h2>
                    <div class="ingredient-details__prices__list">
                        <div v-for="price in ingredient.prices" :key="price.id" class="ingredient-details__prices__list__item">
                            <h5>{{ price.price_category.name }} ({{ price.price_category.currency }})</h5>
                            <p>
                                {{ UnitHandler.formatPrice(price.price, price.price_category.currency) }} &middot; {{ price.amount }}{{ price.units }} <template v-if="price.description">&middot; {{ price.description }}</template>
                            </p>
                        </div>
                    </div>
                </div>
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
import OverlayLoader from '@/components/OverlayLoader.vue'
import { micromark } from 'micromark'
import dayjs from 'dayjs'
import PageHeader from '../PageHeader.vue'

export default {
    components: {
        OverlayLoader,
        PageHeader,
    },
    data: () => ({
        isLoadingIngredient: false,
        isLoadingShelf: false,
        isLoadingShoppingList: false,
        isLoadingExtra: false,
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
        createdDate() {
            const date = dayjs(this.ingredient.created_at).toDate()

            return this.$d(date, 'short')
        },
        updatedDate() {
            const date = dayjs(this.ingredient.updated_at).toDate()

            return this.$d(date, 'short')
        },
        extraCocktailsIds() {
            return this.extraIfAddedToShelf.map(c => c.id).join(',')
        },
        pricesByCurrency() {
            return Object.groupBy(this.ingredient.prices, p => p.price_category.currency)
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
            this.isLoadingIngredient = true
            this.ingredient = await ApiRequests.fetchIngredient(this.$route.params.id).catch(e => {
                this.$toast.error(e.message)

                return {}
            })
            this.isLoadingIngredient = false

            this.isLoadingShelf = true
            const shelfIngredients = await ApiRequests.fetchMyShelf().catch(() => [])
            this.isLoadingShelf = false

            this.isLoadingShoppingList = true
            const shoppingListIngredients = await ApiRequests.fetchShoppingList().catch(() => [])
            this.isLoadingShoppingList = false

            this.isAddedToShelf = shelfIngredients.filter(i => i.ingredient_id == this.ingredient.id).length > 0
            this.isAddedToShoppingList = shoppingListIngredients.filter(i => i.ingredient_id == this.ingredient.id).length > 0

            this.isLoadingExtra = true
            await this.refreshExtraCocktails()
            this.isLoadingExtra = false
        },
        deleteIngredient() {
            this.$confirm(this.$t('ingredient.delete-confirm', { name: this.ingredient.name, total: this.ingredient.cocktails.length }), {
                onResolved: (dialog) => {
                    dialog.close()
                    this.isLoadingIngredient = true
                    ApiRequests.deleteIngredient(this.ingredient.id).then(() => {
                        this.$toast.default(`Ingredient "${this.ingredient.name}" successfully removed`)
                        this.$router.push({ name: 'ingredients' })
                        this.isLoadingIngredient = false
                    }).catch(e => {
                        this.$toast.error(e.message)
                        this.isLoadingIngredient = false
                    })
                }
            })
        },
        toggleShelf() {
            this.isLoadingShelf = true

            const postData = {
                ingredient_ids: [this.ingredient.id]
            }

            if (this.isAddedToShelf) {
                ApiRequests.removeIngredientsFromShelf(postData).then(() => {
                    this.isAddedToShelf = false
                    this.$toast.default(this.$t('ingredient.shelf-remove-success', { name: this.ingredient.name }))
                    this.isLoadingShelf = false
                    this.refreshExtraCocktails()
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoadingShelf = false
                })
            } else {
                ApiRequests.addIngredientsToShelf(postData).then(() => {
                    this.isAddedToShelf = true
                    this.$toast.default(this.$t('ingredient.shelf-add-success', { name: this.ingredient.name }))
                    this.isLoadingShelf = false
                    this.refreshExtraCocktails()
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoadingShelf = false
                })
            }
        },
        toggleShoppingList() {
            this.isLoadingShoppingList = true

            const postData = {
                ingredient_ids: [this.ingredient.id]
            }

            if (this.isAddedToShoppingList) {
                ApiRequests.removeIngredientsFromShoppingList(postData).then(() => {
                    this.$toast.default(this.$t('ingredient.list-remove-success', { name: this.ingredient.name }))
                    this.isAddedToShoppingList = false
                    this.isLoadingShoppingList = false
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoadingShoppingList = false
                })
            } else {
                ApiRequests.addIngredientsToShoppingList(postData).then(() => {
                    this.$toast.default(this.$t('ingredient.list-add-success', { name: this.ingredient.name }))
                    this.isAddedToShoppingList = true
                    this.isLoadingShoppingList = false
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoadingShoppingList = false
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
    gap: 1rem;
}

@media (max-width: 450px) {
    .ingredient-details__box {
        flex-direction: column;
    }
}

.ingredient-details__box__image-container {
    max-width: 350px;
    max-height: 400px;
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
    font-weight: var(--fw-bold);
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

.ingredient-details__more {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    background-color: #f4f1fa;
    border-radius: var(--radius-2);
    padding: 0.5rem 0.75rem;
    margin: 0 0 1rem 0;
    list-style-type: none;
}

.dark-theme .ingredient-details__more {
    background-color: rgba(0, 0, 0, .4);
}

.ingredient-details__more svg {
    width: 16px;
    height: 16px;
}

.ingredient-details__prices {
    margin-top: 1rem;
}

.ingredient-details__prices__list {
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-1);
}

.ingredient-details__prices__list__item {
    /* background-color: var(--clr-gray-100); */
    /* padding: var(--gap-size-2); */
    border-radius: var(--radius-2);
}

.ingredient-details__prices__list__item h5 {
    font-size: 12px;
}
</style>
