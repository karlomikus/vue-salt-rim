<template>
    <div v-if="!ingredient.id">
        <PageHeader>
            {{ $t('ingredient.title') }}
        </PageHeader>
        <div class="ingredient-details">
            <OverlayLoader v-if="isLoadingIngredient" />
        </div>
    </div>
    <div v-else>
        <PageHeader>
            {{ ingredient.name }}
            <small :title="$t('added-on-by', { date: createdDate, name: ingredient.created_user?.name })">
                <template v-for="(ancestor, index) in ingredient.hierarchy.ancestors" :key="ancestor.id">
                    <RouterLink :to="{ name: 'ingredients', query: { 'filter[descendants_of]': ancestor.id } }">{{ ancestor.name }}</RouterLink>
                    <template v-if="index + 1 !== ingredient.hierarchy?.ancestors?.length"> > </template>
                </template>
            </small>
        </PageHeader>
        <div class="ingredient-details">
            <div class="ingredient-details__column-image">
                <div class="ingredient-details__graphic" :style="{ 'background-color': backgroundColor }">
                    <div v-if="mainIngredientImage.copyright" class="ingredient-details__graphic__copyright">{{ $t('imageupload.copyright-notice', { copyright: mainIngredientImage.copyright }) }}</div>
                    <img v-if="mainIngredientImage.url" :src="mainIngredientImage.url" :alt="ingredient.name" />
                </div>
            </div>
            <div class="ingredient-details__column-sidebar">
                <h3 class="page-subtitle" style="margin-top: 0;">{{ $t('ingredient.status') }}</h3>
                <div class="block-container block-container--inset shelf-actions">
                    <ToggleIngredientBarShelf v-if="ingredient.in_bar_shelf !== undefined" :ingredient="ingredient" v-model="ingredient.in_bar_shelf">
                        <template v-slot="{ isLoading, inList, toggle }">
                            <a href="#" class="block-container block-container--hover shelf-actions__action" v-if="appState.isAdmin() || appState.isModerator()" @click.prevent="toggle">
                                <div>
                                    <IconBarShelf></IconBarShelf>
                                    <IconCheck v-if="inList" class="shelf-actions__action__active"></IconCheck>
                                </div>
                                <template v-if="!isLoading">
                                    <span v-if="!inList">{{ $t('ingredient.add-to-bar-shelf') }}</span>
                                    <span v-else>{{ $t('ingredient.remove-from-bar-shelf') }}</span>
                                </template>
                                <span v-else>{{ $t('loading') }}...</span>
                                <br>
                                <small>{{ $t('ingredient.shelf-bar-help') }}</small>
                            </a>
                        </template>
                    </ToggleIngredientBarShelf>
                    <ToggleIngredientShelf v-if="ingredient.in_shelf !== undefined" :ingredient="ingredient" v-model="ingredient.in_shelf">
                        <template v-slot="{ isLoading, inList, toggle }">
                            <a href="#" class="block-container block-container--hover shelf-actions__action" @click.prevent="toggle">
                                <div>
                                    <IconUserShelf></IconUserShelf>
                                    <IconCheck v-if="inList" class="shelf-actions__action__active"></IconCheck>
                                </div>
                                <template v-if="!isLoading">
                                    <span v-if="!inList">{{ $t('ingredient.add-to-shelf') }}</span>
                                    <span v-else>{{ $t('ingredient.remove-from-shelf') }}</span>
                                </template>
                                <span v-else>{{ $t('loading') }}...</span>
                                <br>
                                <small>{{ $t('ingredient.shelf-user-help') }}</small>
                            </a>
                        </template>
                    </ToggleIngredientShelf>
                    <ToggleIngredientShoppingCart v-if="ingredient.in_shopping_list !== undefined" :ingredient="ingredient" v-model="ingredient.in_shopping_list">
                        <template v-slot="{ isLoading, inList, toggle }">
                            <a href="#" class="block-container block-container--hover shelf-actions__action" @click.prevent="toggle">
                                <div>
                                    <IconShoppingCart></IconShoppingCart>
                                    <IconCheck v-if="inList" class="shelf-actions__action__active"></IconCheck>
                                </div>
                                <template v-if="!isLoading">
                                    <span v-if="!inList">{{ $t('ingredient.add-to-list') }}</span>
                                    <span v-else>{{ $t('ingredient.remove-from-list') }}</span>
                                </template>
                                <span v-else>{{ $t('loading') }}...</span>
                            </a>
                        </template>
                    </ToggleIngredientShoppingCart>
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
                    <h2 class="details-block-container__title">{{ $t('description') }}</h2>
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
                    <ul class="block-container block-container--inset ingredient-details__more">
                        <OverlayLoader v-if="isLoadingExtra" />
                        <li v-if="ingredient.ingredient_parts?.length">
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
                        <li v-if="ingredient.can_be_substituted_with?.length">
                            {{ $t('ingredient.can_be_substituted_with') }}:
                            <template v-for="(ing, index) in ingredient.can_be_substituted_with" :key="ing.id">
                                <RouterLink :to="{name: 'ingredients.show', params: {id: ing.slug}}">{{ ing.name }}</RouterLink><template v-if="index + 1 !== ingredient.can_be_substituted_with.length">, </template>
                            </template>
                        </li>
                        <li v-if="ingredient.used_as_substitute_for?.length">
                            {{ $t('ingredient.can_be_substituted_with') }}:
                            <template v-for="(ing, index) in ingredient.used_as_substitute_for" :key="ing.id">
                                <RouterLink :to="{name: 'ingredients.show', params: {id: ing.slug}}">{{ ing.name }}</RouterLink><template v-if="index + 1 !== ingredient.used_as_substitute_for.length">, </template>
                            </template>
                        </li>
                    </ul>
                    <div v-html="parsedDescription" class="has-markdown"></div>
                </div>
                <div class="block-container block-container--padded">
                    <IngredientHierarchy :parent-id="ingredient.id" :root-id="ingredient.hierarchy.root_ingredient_id ?? 0"></IngredientHierarchy>
                </div>
                <div v-if="ingredient.calculator_id" class="block-container block-container--padded">
                    <h2 class="details-block-container__title">{{ $t('calculators.calculator') }}</h2>
                    <OverlayLoader v-if="isLoadingCalculator" />
                    <CalculatorRender v-if="calculator" :calculator="calculator"></CalculatorRender>
                </div>
                <div v-if="ingredient.prices && ingredient.prices.length > 0" class="block-container block-container--padded ingredient-details__prices">
                    <h2 class="details-block-container__title">{{ $t('price.prices') }}</h2>
                    <div class="ingredient-details__prices__list">
                        <div v-for="ingredientPrice in ingredient.prices" :key="ingredientPrice.created_at" class="ingredient-details__prices__list__item">
                            <h5>{{ ingredientPrice.price_category.name }} ({{ ingredientPrice.price_category.currency }})</h5>
                            <p>
                                {{ unitHandler.formatPrice(ingredientPrice.price.price, ingredientPrice.price_category.currency) }} &middot; {{ ingredientPrice.amount }}{{ ingredientPrice.units }} <template v-if="ingredientPrice.description">&middot; {{ ingredientPrice.description }}</template>
                            </p>
                        </div>
                    </div>
                </div>
                <div style="margin-top: var(--gap-size-2);">
                    <TimeStamps v-if="ingredient.id" :resource="ingredient"></TimeStamps>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { unitHandler } from '@/composables/useUnits'
import CalculatorRender from '../Calculator/CalculatorRender.vue'
import OverlayLoader from '@/components/OverlayLoader.vue'
import { micromark } from 'micromark'
import dayjs from 'dayjs'
import PageHeader from '../PageHeader.vue'
import BarAssistantClient from '@/api/BarAssistantClient'
import ToggleIngredientShoppingCart from '@/components/ToggleIngredientShoppingCart.vue'
import ToggleIngredientShelf from '@/components/ToggleIngredientShelf.vue'
import ToggleIngredientBarShelf from '../ToggleIngredientBarShelf.vue'
import Dropdown from '@/components/SaltRimDropdown.vue'
import { useTitle } from '@/composables/title'
import IconBarShelf from '../Icons/IconBarShelf.vue'
import IconUserShelf from '../Icons/IconUserShelf.vue'
import IconShoppingCart from '../Icons/IconShoppingCart.vue'
import IconMore from '../Icons/IconMore.vue'
import IngredientHierarchy from './IngredientHierarchy.vue'
import IconCheck from '../Icons/IconCheck.vue'
import { useIngredientBg } from '@/composables/ingredientBg'
import TimeStamps from '@/components/TimeStamps.vue'
import type { components } from '@/api/api'
import { useSaltRimToast } from '@/composables/toast'
import { useConfirm } from '@/composables/confirm'
import { useI18n } from 'vue-i18n'
import AppState from '@/AppState'

type Ingredient = components['schemas']['Ingredient']
type CocktailBasic = components['schemas']['CocktailBasic']
type Calculator = components['schemas']['Calculator']

const { t } = useI18n()
const confirm = useConfirm()
const toast = useSaltRimToast()
const route = useRoute()
const router = useRouter()
const appState = new AppState()
const isLoadingIngredient = ref(false)
const isLoadingCalculator = ref(false)
const isLoadingExtra = ref(false)
const extraIfAddedToShelf = ref<CocktailBasic[]>([])
const ingredient = ref<Ingredient>({
    prices: [] as components['schemas']['IngredientPrice'][],
    ingredient_parts: [] as components['schemas']['IngredientBasic'][],
} as Ingredient)
const calculator = ref<Calculator>({} as Calculator)

async function refreshIngredient() {
    isLoadingIngredient.value = true
    try {
        ingredient.value = (await BarAssistantClient.getIngredient(route.params.id.toString()))?.data ?? {} as Ingredient
        useTitle(ingredient.value.name)
    } catch (e: any) {
        toast.default(e.message)
        isLoadingIngredient.value = false
        router.push({ name: 'ingredients' })
        return
    }
    isLoadingIngredient.value = false

    isLoadingExtra.value = true
    extraIfAddedToShelf.value = (await BarAssistantClient.getExtraCocktailsWithIngredient(ingredient.value.id))?.data ?? []
    isLoadingExtra.value = false
}

async function fetchCalculator() {
    if (!ingredient.value.calculator_id) {
        return
    }

    isLoadingCalculator.value = true
    try {
        calculator.value = (await BarAssistantClient.getCalculator(ingredient.value.calculator_id))?.data ?? {} as Calculator
    } catch (e: any) {
        toast.default(e.message)
    } finally {
        isLoadingCalculator.value = false
    }
}

function deleteIngredient() {
    confirm.show(t('ingredient.delete-confirm', { name: ingredient.value.name, total: ingredient.value.cocktails_count }), {
        onResolved: (dialog: any) => {
            dialog.close()
            isLoadingIngredient.value = true
            BarAssistantClient.deleteIngredient(ingredient.value.id).then(() => {
                toast.default(`Ingredient "${ingredient.value.name}" successfully removed`)
                router.push({ name: 'ingredients' })
                isLoadingIngredient.value = false
            }).catch(e => {
                toast.error(e.message)
                isLoadingIngredient.value = false
            })
        }
    })
}

const mainIngredientImage = computed(() => {
    if (!ingredient.value.images || ingredient.value.images.length <= 0) {
        return { url: '/no-ingredient.png', copyright: null }
    }

    return ingredient.value.images[0]
})

const parsedDescription = computed(() => {
    if (!ingredient.value.description) {
        return null
    }

    return micromark(ingredient.value.description)
})

const createdDate = computed(() => {
    const date = dayjs(ingredient.value.created_at).toDate()

    return date.toLocaleDateString()
})

const extraCocktailsIds = computed(() => {
    return extraIfAddedToShelf.value.map(c => c.id).join(',')
})

const backgroundColor = computed(() => {
    const hex = ingredient.value.color || '#51274c'

    return useIngredientBg(hex)
})

watch(
    () => route.params.id,
    async () => {
        if (route.name == 'ingredients.show') {
            await refreshIngredient()
            await fetchCalculator()
        }
    },
    { immediate: true }
)
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
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-1);
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
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-2);
    padding: var(--gap-size-2);
}

.shelf-actions__action {
    display: flex;
    align-items: center;
    flex-direction: column;
    padding: var(--gap-size-2);
    text-align: center;
    text-decoration: none;
}

.shelf-actions__action svg {
    width: 32px;
    height: 32px;
    display: block;
    fill: var(--clr-gray-500);
}

.shelf-actions__action svg.shelf-actions__action__active {
    width: 16px;
    height: 16px;
    fill: rgb(6, 150, 95);
    background: #fff;
    border-radius: 50%;
    position: absolute;
    bottom: 0;
    right: 0;
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
