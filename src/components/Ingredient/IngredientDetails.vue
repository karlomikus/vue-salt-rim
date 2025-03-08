<script setup>
import UnitHandler from '../../UnitHandler.js'
import DateFormatter from '../DateFormatter.vue'
import CalculatorRender from '../Calculator/CalculatorRender.vue'
</script>
<template>
    <div v-if="!ingredient.id">
        <PageHeader>
            {{ $t('ingredient.title') }}
            <small>
                <DateFormatter format="short" />
            </small>
        </PageHeader>
        <div class="ingredient-details">
            <OverlayLoader v-if="isLoadingIngredient" />
        </div>
    </div>
    <div v-else>
        <PageHeader>
            {{ ingredient.name }}
            <small :title="$t('added-on-by', { date: createdDate, name: ingredient.created_user.name })">
                <template v-for="(ancestor, index) in ingredient.hierarchy.ancestors" :key="ancestor.id">
                    <RouterLink :to="{ name: 'ingredients', query: { 'filter[descendants_of]': ancestor.id } }">{{ ancestor.name }}</RouterLink>
                    <template v-if="index + 1 !== ingredient.hierarchy.ancestors.length"> > </template>
                    <template v-else> &middot; </template>
                </template>
                <template v-if="ingredient.updated_user">{{ $t('updated-on-by', { date: updatedDate, name: ingredient.updated_user.name }) }}</template>
                <template v-else>{{ $t('added-on-by', { date: createdDate, name: ingredient.created_user.name }) }}</template>
            </small>
        </PageHeader>
        <div class="ingredient-details">
            <div class="ingredient-details__column-image">
                <div class="ingredient-details__graphic" :style="{ 'background-color': backgroundColor }">
                    <div v-if="mainIngredientImage.copyright" class="ingredient-details__graphic__copyright">{{ $t('imageupload.copyright-notice', { copyright: mainIngredientImage.copyright }) }}</div>
                    <img :src="mainIngredientImage.url" :alt="ingredient.name" />
                </div>
            </div>
            <div class="ingredient-details__column-sidebar">
                <div class="item-details__chips">
                    <div class="item-details__chips__group">
                        <div class="item-details__chips__group__title">{{ $t('strength') }}:</div>
                        <ul v-if="ingredient.strength > 0" class="chips-list">
                            <li>
                                <span><abbr :title="$t('ABV-definition')">{{ $t('ABV') }}</abbr>: {{ ingredient.strength + '%' }}</span>
                            </li>
                            <li>
                                <span>{{ $t('alcohol-proof') }}: {{ ingredient.strength * 2 }}</span>
                            </li>
                        </ul>
                        <ul v-else class="chips-list">
                            <li>
                                <span>{{ $t('non-alcoholic') }}</span>
                            </li>
                        </ul>
                    </div>
                    <div v-if="ingredient.origin" class="item-details__chips__group">
                        <div class="item-details__chips__group__title">{{ $t('origin') }}:</div>
                        <ul class="chips-list">
                            <li>
                                <span>{{ ingredient.origin }}</span>
                            </li>
                        </ul>
                    </div>
                    <div v-if="ingredient.distillery" class="item-details__chips__group">
                        <div class="item-details__chips__group__title">{{ $t('distillery') }}:</div>
                        <ul class="chips-list">
                            <li>
                                <span>{{ ingredient.distillery }}</span>
                            </li>
                        </ul>
                    </div>
                    <div v-if="ingredient.sugar_g_per_ml" class="item-details__chips__group">
                        <div class="item-details__chips__group__title">{{ $t('sweetness') }}:</div>
                        <ul class="chips-list">
                            <li>
                                <span>{{ ingredient.sugar_g_per_ml }}</span>
                            </li>
                        </ul>
                    </div>
                    <div v-if="ingredient.acidity" class="item-details__chips__group">
                        <div class="item-details__chips__group__title">{{ $t('acidity') }}:</div>
                        <ul class="chips-list">
                            <li>
                                <span>{{ ingredient.acidity }}</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div v-if="ingredient.used_as_substitute_for && ingredient.used_as_substitute_for.length > 0">
                    <h3 class="page-subtitle">{{ $t('ingredient.used_as_substitute_for') }}</h3>
                    <IngredientTile v-for="ing in ingredient.used_as_substitute_for" :key="ing.slug" :ingredient="ing" :images="[]"></IngredientTile>
                    <RouterLink :to="{name: 'cocktails', query: {'filter[ingredient_substitute_id]': ingredient.id}}">
                        View all
                    </RouterLink>
                </div>
                <div v-if="ingredient.can_be_substituted_with && ingredient.can_be_substituted_with.length > 0">
                    <h3 class="page-subtitle">{{ $t('ingredient.can_be_substituted_with') }}</h3>
                    <IngredientTile v-for="ing in ingredient.can_be_substituted_with" :key="ing.slug" :ingredient="ing" :images="[]"></IngredientTile>
                </div>
            </div>
            <div class="ingredient-details__column-content">
                <div v-if="ingredient.access && (ingredient.access.can_edit || ingredient.access.can_delete)" class="ingredient-details__actions">
                    <Dropdown>
                        <template #default="{ toggleDropdown }">
                            <button type="button" class="button button-circle" @click.prevent="toggleDropdown">
                                <IconMore></IconMore>
                            </button>
                        </template>
                        <template #content>
                            <RouterLink v-if="ingredient.access.can_edit" class="dropdown-menu__item" :to="{ name: 'ingredients.form', query: { id: ingredient.id } }">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                    <path fill="none" d="M0 0h24v24H0z" />
                                    <path d="M6.414 16L16.556 5.858l-1.414-1.414L5 14.586V16h1.414zm.829 2H3v-4.243L14.435 2.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 18zM3 20h18v2H3v-2z" />
                                </svg>
                                {{ $t('edit') }}
                            </RouterLink>
                            <hr v-if="ingredient.access.can_delete" class="dropdown-menu__separator">
                            <a v-if="ingredient.access.can_delete" class="dropdown-menu__item" href="javascript:;" @click.prevent="deleteIngredient">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                    <path fill="none" d="M0 0h24v24H0z" />
                                    <path d="M7 4V2h10v2h5v2h-2v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6H2V4h5zM6 6v14h12V6H6zm3 3h2v8H9V9zm4 0h2v8h-2V9z" />
                                </svg>
                                {{ $t('remove') }}
                            </a>
                        </template>
                    </Dropdown>
                </div>
                <div class="block-container block-container--padded">
                    <h2 class="details-block-container__title">{{ $t('ingredient.status') }}</h2>
                    <ul class="block-container block-container--inset ingredient-details__more">
                        <OverlayLoader v-if="isLoadingExtra" />
                        <li>
                            <div class="shelf-actions">
                                <div class="block-container shelf-actions__action" v-if="appState.isAdmin() || appState.isModerator()">
                                    <IconBarShelf></IconBarShelf>
                                    <ToggleIngredientBarShelf :ingredient="ingredient" :status="ingredient.in_bar_shelf"></ToggleIngredientBarShelf>
                                    <br>
                                    <small>{{ $t('ingredient.shelf-bar-help') }}</small>
                                </div>
                                <div class="block-container shelf-actions__action">
                                    <IconUserShelf></IconUserShelf>
                                    <ToggleIngredientShelf :ingredient="ingredient" :status="ingredient.in_shelf"></ToggleIngredientShelf>
                                    <br>
                                    <small>{{ $t('ingredient.shelf-user-help') }}</small>
                                </div>
                                <div class="block-container shelf-actions__action">
                                    <IconShoppingCart></IconShoppingCart>
                                    <ToggleIngredientShoppingCart :ingredient="ingredient" :status="ingredient.in_shopping_list"></ToggleIngredientShoppingCart>
                                </div>
                            </div>
                        </li>
                        <li v-if="ingredient.ingredient_parts.length">
                            {{ $t('contains-ingredients') }}:
                            <template v-for="(part, index) in ingredient.ingredient_parts" :key="part.id">
                                <RouterLink :to="{name: 'ingredients.show', params: {id: part.slug}}">{{ part.name }}</RouterLink><template v-if="index + 1 !== ingredient.ingredient_parts.length">, </template>
                            </template>
                        </li>
                        <li>
                            <RouterLink :to="{name: 'cocktails', query: {'filter[ingredient_id]': ingredient.id}}">
                                Used in <strong>{{ ingredient.cocktails_count }} <template v-if="ingredient.cocktails_as_substitute_count && ingredient.cocktails_as_substitute_count > 0">(+{{ ingredient.cocktails_as_substitute_count }} as substitute)</template></strong> cocktail recipes
                            </RouterLink>
                        </li>
                        <li v-if="extraIfAddedToShelf.length > 0">{{ $t('ingredient.extra-cocktails') }}: <RouterLink :to="{name: 'cocktails', query: {'filter[id]': extraCocktailsIds}}">{{ extraIfAddedToShelf.length }} {{ $t('cocktail.cocktails') }}</RouterLink></li>
                    </ul>
                    <template v-if="ingredient.description">
                        <h2 class="details-block-container__title">{{ $t('description') }}</h2>
                        <div v-html="parsedDescription" class="has-markdown"></div>
                    </template>
                    <IngredientHierarchy :parent-id="ingredient.id" :root-id="ingredient.hierarchy.root_ingredient_id"></IngredientHierarchy>
                </div>
                <div v-if="ingredient.calculator_id" class="block-container block-container--padded">
                    <h2 class="details-block-container__title">{{ $t('calculators.calculator') }}</h2>
                    <OverlayLoader v-if="isLoadingCalculator" />
                    <CalculatorRender v-if="calculator" :calculator="calculator"></CalculatorRender>
                </div>
                <div v-if="ingredient.prices.length > 0" class="block-container block-container--padded ingredient-details__prices">
                    <h2 class="details-block-container__title">{{ $t('price.prices') }}</h2>
                    <div class="ingredient-details__prices__list">
                        <div v-for="ingredientPrice in ingredient.prices" :key="ingredientPrice.id" class="ingredient-details__prices__list__item">
                            <h5>{{ ingredientPrice.price_category.name }} ({{ ingredientPrice.price_category.currency }})</h5>
                            <p>
                                {{ UnitHandler.formatPrice(ingredientPrice.price.price, ingredientPrice.price_category.currency) }} &middot; {{ ingredientPrice.amount }}{{ ingredientPrice.units }} <template v-if="ingredientPrice.description">&middot; {{ ingredientPrice.description }}</template>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import OverlayLoader from '@/components/OverlayLoader.vue'
import { micromark } from 'micromark'
import dayjs from 'dayjs'
import PageHeader from '../PageHeader.vue'
import BarAssistantClient from '@/api/BarAssistantClient'
import AppState from '@/AppState'
import ToggleIngredientShoppingCart from '@/components/ToggleIngredientShoppingCart.vue'
import ToggleIngredientShelf from '@/components/ToggleIngredientShelf.vue'
import ToggleIngredientBarShelf from '../ToggleIngredientBarShelf.vue'
import Dropdown from '@/components/SaltRimDropdown.vue'
import { useTitle } from '@/composables/title'
import IconBarShelf from '../Icons/IconBarShelf.vue'
import IconUserShelf from '../Icons/IconUserShelf.vue'
import IconShoppingCart from '../Icons/IconShoppingCart.vue'
import IconMore from '../Icons/IconMore.vue'
import IngredientTile from '../Tiles/IngredientTile.vue'
import IngredientHierarchy from './IngredientHierarchy.vue'

export default {
    components: {
        OverlayLoader,
        PageHeader,
        ToggleIngredientShelf,
        ToggleIngredientShoppingCart,
        Dropdown,
        ToggleIngredientBarShelf,
        IconBarShelf,
        IconUserShelf,
        IconShoppingCart,
        IconMore,
        IngredientTile,
        IngredientHierarchy,
    },
    data: () => ({
        appState: new AppState(),
        isLoadingCalculator: false,
        isLoadingIngredient: false,
        isLoadingExtra: false,
        ingredient: {},
        calculator: null,
        extraIfAddedToShelf: []
    }),
    computed: {
        mainIngredientImage() {
            if (this.ingredient.images.length <= 0) {
                return { url: '/no-ingredient.png', copyright: null }
            }

            return this.ingredient.images[0]
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
        backgroundColor() {
            const hex = this.ingredient.color || '#51274c'

            let c
            if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
                c = hex.substring(1).split('')
                if (c.length == 3) {
                    c = [c[0], c[0], c[1], c[1], c[2], c[2]]
                }
                c = '0x' + c.join('')
                return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',.13)'
            }

            return hex
        },
    },
    watch: {
        ingredient(val) {
            useTitle(val.name)
        }
    },
    created() {
        this.$watch(
            () => this.$route.params.id,
            async () => {
                if (this.$route.name == 'ingredients.show') {
                    await this.refreshIngredient()
                    if (this.ingredient.calculator_id) {
                        await this.fetchCalculator()
                    }
                }
            },
            { immediate: true }
        )
    },
    methods: {
        async refreshIngredient() {
            this.isLoadingIngredient = true
            try {
                this.ingredient = (await BarAssistantClient.getIngredient(this.$route.params.id)).data
            } catch (e) {
                this.$toast.default(e.message)
                this.isLoadingIngredient = false
                this.$router.push({ name: 'ingredients' })
                return
            }
            this.isLoadingIngredient = false

            this.isLoadingExtra = true
            this.extraIfAddedToShelf = (await BarAssistantClient.getExtraCocktailsWithIngredient(this.ingredient.id)).data
            this.isLoadingExtra = false
        },
        async fetchCalculator() {
            this.isLoadingCalculator = true
            try {
                this.calculator = (await BarAssistantClient.getCalculator(this.ingredient.calculator_id)).data
            } catch (e) {
                this.$toast.default(e.message)
            } finally {
                this.isLoadingCalculator = false
            }
        },
        deleteIngredient() {
            this.$confirm(this.$t('ingredient.delete-confirm', { name: this.ingredient.name, total: this.ingredient.cocktails_count }), {
                onResolved: (dialog) => {
                    dialog.close()
                    this.isLoadingIngredient = true
                    BarAssistantClient.deleteIngredient(this.ingredient.id).then(() => {
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
    }
}
</script>

<style scoped>
.ingredient-details {
    display: grid;
    gap: var(--gap-size-3);
    grid-template-columns: 300px minmax(0, 1fr);
    grid-template-rows: 400px 1fr;
    grid-template-areas:
        "image content"
        "sidebar content";
}

@media (max-width: 800px) {
    .ingredient-details {
        grid-template-columns: 200px minmax(0, 1fr);
    }
}

@media (max-width: 600px) {
    .ingredient-details {
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: 1fr;
        grid-template-areas:
            "image"
            "sidebar"
            "content";
    }
}

.ingredient-details__column-image {
    grid-area: image;
}

.ingredient-details__column-content {
    grid-area: content;
}

.ingredient-details__column-sidebar {
    grid-area: sidebar;
}

.ingredient-details .ingredient-details__image {
    flex-shrink: 0;
    padding: 30px;
    background-color: #fff;
    border-radius: var(--radius-4);
}

.ingredient-details__actions {
    position: absolute;
    right: 20px;
    top: -25px;
    display: grid;
    grid-template-columns: 1fr;
    column-gap: var(--gap-size-1);
    z-index: 1;
}

.ingredient-details__graphic {
    width: auto;
    height: 100%;
    max-height: 400px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: var(--gap-size-3);
    border-radius: var(--radius-3);
    border-bottom: 1px solid #fff;
    box-shadow:
        inset 0px 0.4px 0.5px rgba(0, 0, 0, .04),
        inset 0px 1.1px 1.2px -0.8px rgba(0, 0, 0, .04),
        inset 0px 2.6px 2.9px -1.7px rgba(0, 0, 0, .04),
        inset 0px 6.3px 7.1px -2.5px rgba(0, 0, 0, .04);
}

.dark-theme .ingredient-details__graphic {
    border-bottom: 1px solid rgba(255, 255, 255, .15);
    box-shadow:
        inset 0px 0.4px 0.5px rgba(0, 0, 0, .1),
        inset 0px 1.1px 1.2px -0.8px rgba(0, 0, 0, .1),
        inset 0px 2.6px 2.9px -1.7px rgba(0, 0, 0, .1),
        inset 0px 6.3px 7.1px -2.5px rgba(0, 0, 0, .1);
}

.ingredient-details__graphic img {
    display: block;
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
}

@media (max-width: 450px) {
    .ingredient-details__graphic {
        max-height: none;
    }

    .ingredient-details__graphic img {
        max-height: 300px;
    }
}

.ingredient-details__graphic__copyright {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    display: inline-block;
    background-color: rgba(0, 0, 0, .5);
    color: #fff;
    border-radius: var(--radius-3);
    padding: 2px 7px;
    font-size: 0.7rem;
    z-index: 1;
    text-shadow: 1px 1px 0 rgba(0, 0, 0, .8);
}

.ingredient-chips-list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-size-1);
    align-items: center;
}

.ingredient-chips-list .chip {
    font-size: 1rem;
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

.shelf-actions {
    display: grid;
    gap: var(--gap-size-2);
    grid-template-columns: 1fr 1fr 1fr;
}

.shelf-actions__action {
    display: flex;
    align-items: center;
    flex-direction: column;
    padding: var(--gap-size-2);
    text-align: center;
}

.shelf-actions__action svg {
    width: 32px;
    height: 32px;
    display: block;
    fill: var(--clr-gray-500);
}

svg.shelf-actions__action__status {
    width: 16px;
    height: 16px;
    display: block;
    color: green;
}

.shelf-actions__action small {
    line-height: 1.2;
    color: var(--clr-gray-400);
}

@media (max-width: 450px) {
    .shelf-actions {
        display: flex;
        flex-direction: column;
    }
}
</style>
