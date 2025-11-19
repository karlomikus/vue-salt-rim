<template>
    <form @submit.prevent="saveMenu">
        <PageHeader>
            {{ t('menu.bar-title-menu', { name: appState.bar.name }) }}
        </PageHeader>
        <div class="menu-details">
            <OverlayLoader v-if="isLoading" />
            <div class="block-container block-container--padded" style="width: 100%;">
                <p style="margin-bottom: 1rem;">{{ t('menu.description') }}</p>
                <div class="form-group">
                    <label class="form-label" for="menu-is-active">{{ t('menu.url') }}:</label>
                    <p class="menu-url"><a :href="menuUrl">{{ menuUrl }}</a></p>
                </div>
                <div style="margin: 1rem 0;">
                    <label class="form-checkbox">
                        <input v-model="menu.is_enabled" :value="true" type="checkbox">
                        <span>{{ t('menu.is-active') }}</span>
                    </label>
                </div>
                <p>
                    <a href="#" @click.prevent="quickAddShelf">{{ t('menu.add-shelf-cocktails') }}</a>
                    &middot;
                    <a href="#" @click.prevent="exportMenu">{{ t('menu.export') }}</a>
                </p>
            </div>
            <div class="block-container block-container--padded menu-qr-code">
                <QRCodeVue3
                    v-if="menuUrl"
                    :width="200" :height="200" :value="menuUrl" :image-options="{ hideBackgroundDots: true, imageSize: 0.5, margin: 6 }" :dots-options="{
                        type: 'square',
                        color: '#000000'
                    }" image="/logo-black.png" :background-options="{ color: '#ffffff' }" :corners-square-options="{ color: '#000000' }" :corners-dot-options="{ color: '#000000' }" file-ext="png" :download="false" download-button="button button--outline" :download-options="{ name: 'bar-menu-qr', extension: 'png' }"
                ></QRCodeVue3>
            </div>
        </div>
        <div class="menu-categories">
            <div v-for="(category, idx) in categories" :key="idx" class="menu-category block-container block-container--inset">
                <div class="menu-category__info">
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label" :for="'menu-category-' + idx">{{ t('menu.category-title') }}:</label>
                        <input :id="'menu-category-' + idx" v-model="category.name" class="form-input" type="text">
                    </div>
                    <a href="#" @click.prevent="removeCategory(category)">{{ t('menu.remove-category') }}</a>
                    &middot;
                    <a href="#" @click.prevent="clearCategory(category)">{{ t('menu.clear-category') }}</a>
                </div>
                <div ref="cocktailsList" class="menu-category-cocktails" :data-category-idx="idx">
                    <div v-for="(item, cidx) in category.items" :key="item.id" class="block-container menu-category__cocktail" :data-id="item.id" :data-type="item.type">
                        <div class="drag-handle"></div>
                        <div class="menu-category__cocktail__content">
                            <div>
                                <RouterLink :to="{ name: item.type == 'cocktail' ? 'cocktails.show' : 'ingredients.show', params: { id: item.id } }" class="sr-list-item-title">
                                    <h4 class="sr-list-item-title menu-category__cocktail__content__title">{{ item.name }}</h4>
                                </RouterLink>
                                <p><span class="menu-item-type chip" :class="{'chip--alternate': item.type == 'cocktail'}">{{ item.type }}</span> {{ item.description }}</p>
                                <a href="#" @click.prevent="copyCurrency(item.price.currency)">{{ t('menu.copy-currency') }}</a> &middot;
                                <template v-if="item.type == 'cocktail'">
                                    <SaltRimDialog v-model="showCurrencyCalculator[cidx + '-' + idx]">
                                        <template #trigger>
                                            <a style="margin-top: 0.5rem; display: inline-block;" href="#addcocktail" @click.prevent="showCurrencyCalculator[cidx + '-' + idx] = !showCurrencyCalculator[cidx + '-' + idx]">
                                                {{ t('menu.calculate-price') }}
                                            </a>
                                        </template>
                                        <template #dialog>
                                            <CocktailPriceCalculator :cocktail="{...item, slug: ''}" @selected-price="price => handleCalculatedPrice(item, price)" @closed="showCurrencyCalculator[cidx + '-' + idx] = false"></CocktailPriceCalculator>
                                        </template>
                                    </SaltRimDialog>
                                    &middot;
                                </template>
                                <a href="#" @click.prevent="removeItem(category, item)">{{ t('remove') }}</a>
                            </div>
                            <div class="menu-category__cocktail__content__price">
                                <div class="form-group">
                                    <label class="form-label" :for="'cocktail-category-price-' + idx + '-' + cidx">{{ t('menu.price') }}:</label>
                                    <input :id="'cocktail-category-price-' + idx + '-' + cidx" v-model="item.price.price" class="form-input" type="text">
                                </div>
                                <div class="form-group">
                                    <label class="form-label" :for="'cocktail-category-currency-' + idx + '-' + cidx">{{ t('menu.currency') }}:</label>
                                    <input :id="'cocktail-category-currency-' + idx + '-' + cidx" v-model="item.price.currency" class="form-input" type="text">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <SaltRimDialog v-model="showCocktailFinder[idx]">
                    <template #trigger>
                        <a style="margin-top: 0.5rem; display: inline-block;" href="#addcocktail" @click.prevent="showCocktailFinder[idx] = !showCocktailFinder[idx]">
                            {{ t('menu.add-cocktail') }}
                        </a>
                    </template>
                    <template #dialog>
                        <CocktailFinderBasic v-if="shouldUseBasicSearch" @cocktail-selected="cocktail => selectCocktail(cocktail, category, idx)" @closed="showCocktailFinder[idx] = false"></CocktailFinderBasic>
                        <CocktailFinder v-else @cocktail-selected="cocktail => selectCocktail(cocktail, category, idx)" @closed="showCocktailFinder[idx] = false"></CocktailFinder>
                    </template>
                </SaltRimDialog>
                &middot;
                <SaltRimDialog v-model="showIngredientFinder[idx]">
                    <template #trigger>
                        <a style="margin-top: 0.5rem; display: inline-block;" href="#addingredient" @click.prevent="showIngredientFinder[idx] = !showIngredientFinder[idx]">
                            {{ t('ingredient.add') }}
                        </a>
                    </template>
                    <template #dialog>
                        <div class="dialog-title">{{ t('ingredient.ingredients') }}</div>
                        <IngredientFinderBasic v-if="shouldUseBasicSearch" @ingredient-selected="ingredient => selectIngredient(ingredient, category, idx)"></IngredientFinderBasic>
                        <IngredientFinder v-else-if="!shouldUseBasicSearch && appState.bar.search_token" :search-token="appState.bar.search_token" @ingredient-selected="ingredient => selectIngredient(ingredient, category, idx)"></IngredientFinder>
                        <div class="dialog-actions">
                            <button type="submit" class="button button--dark" @click="showIngredientFinder[idx] = !showIngredientFinder[idx]">{{ t('close') }}</button>
                        </div>
                    </template>
                </SaltRimDialog>
            </div>
        </div>
        <div style="margin: 1rem 0; text-align: center;">
            <button type="button" class="button button--outline" @click="addCategory('')">{{ t('menu.add-category') }}</button>
        </div>
        <div class="form-actions">
            <button type="submit" class="button button--dark">{{ t('save') }}</button>
        </div>
    </form>
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'
import PageHeader from '../PageHeader.vue'
import Sortable from 'sortablejs'
import SaltRimDialog from './../Dialog/SaltRimDialog.vue'
import CocktailFinder from './../CocktailFinder.vue'
import IngredientFinder from './../IngredientFinder.vue'
import CocktailPriceCalculator from './../Calculator/CocktailPriceCalculator.vue'
import AppState from '../../AppState'
import QRCodeVue3 from 'qrcode-vue3'
import OverlayLoader from '../OverlayLoader.vue'
import { useTitle } from '@/composables/title'
import BarAssistantClient from '@/api/BarAssistantClient'
import { useI18n } from 'vue-i18n'
import { useSaltRimToast } from '@/composables/toast'
import type { components } from '@/api/api'
import type { SearchResults } from '@/api/SearchResults'
import { useConfirm } from '@/composables/confirm'
import IngredientFinderBasic from '../IngredientFinderBasic.vue'
import { useBasicSearch } from '@/composables/useBasicSearch'
import CocktailFinderBasic from '../CocktailFinderBasic.vue'

type Menu = components['schemas']['Menu']
type MenuRequest = components['schemas']['MenuRequest']
type MenuCategories = components['schemas']['Menu']['categories']
type MenuItem = components['schemas']['Menu']['categories'][0]['items'][0]
type CocktailSearchResult = SearchResults['cocktail']
type IngredientSearchResult = SearchResults['ingredient']

const shouldUseBasicSearch = useBasicSearch()
const { t } = useI18n()
const toast = useSaltRimToast()
const confirm = useConfirm()
const isLoading = ref(false)
const showCocktailFinder = ref<boolean[]>([])
const showIngredientFinder = ref<boolean[]>([])
const showCurrencyCalculator = ref<Record<string, boolean>>({})
const appState = new AppState()
const categories = ref<MenuCategories>([])
const bar = ref()
const menuUrl = ref('')
const menu = ref<Menu>({} as Menu)
const sortableInstances = ref<any[]>([])

const cocktailMenuItems = computed(() => {
    return categories.value.flatMap(c => c.items).filter(c => c.type == 'cocktail').sort((a, b) => a.sort - b.sort)
})
const ingredientMenuItems = computed(() => {
    return categories.value.flatMap(c => c.items).filter(c => c.type == 'ingredient').sort((a, b) => a.sort - b.sort)
})
const guessCurrency = computed(() => {
    // Use map() to create a new array with just the currencies
    const currencyArray = cocktailMenuItems.value.map(item => item.price.currency)

    // Convert it into a Set, which will automatically remove any duplicates
    const uniqueCurrencySet = new Set(currencyArray)

    // Now convert back into an Array using Array.from()
    const uniqueCurrencies = Array.from(uniqueCurrencySet)

    if (uniqueCurrencies.length == 0) {
        return appState.bar.settings.default_currency ?? null
    }

    return uniqueCurrencies[0]
})

function addItemToCategory(item: MenuItem, category: MenuCategories[0]) {
    category.items.push(item)
}

function selectCocktail(cocktail: CocktailSearchResult, category: MenuCategories[0], finderIdx: number) {
    if (cocktailMenuItems.value.findIndex(c => c.id == cocktail.id) >= 0) {
        toast.default(t('menu.cocktail-already-added', {name: cocktail.name}))

        return
    }

    showCocktailFinder.value[finderIdx] = false

    addItemToCategory({
        id: cocktail.id,
        name: cocktail.name,
        type: 'cocktail',
        sort: 0,
        description: cocktail.short_ingredients.join(', '),
        price: {
            price: 0,
            price_minor: 0,
            formatted_price: '0.00',
            currency: guessCurrency.value ?? '',
        },
    }, category)

    toast.default(t('menu.cocktail-added', {name: cocktail.name}))
}

function selectIngredient(ingredient: IngredientSearchResult, category: MenuCategories[0], finderIdx: number) {
    if (ingredientMenuItems.value.findIndex(c => c.id == ingredient.id) >= 0) {
        toast.default(t('menu.cocktail-already-added', {name: ingredient.name}))

        return
    }

    showIngredientFinder.value[finderIdx] = false

    addItemToCategory({
        id: ingredient.id,
        name: ingredient.name,
        type: 'ingredient',
        sort: 0,
        description: ingredient.category ?? '',
        price: {
            price: 0,
            price_minor: 0,
            formatted_price: '0.00',
            currency: guessCurrency.value ?? '',
        },
    }, category)

    toast.default(t('menu.cocktail-added', {name: ingredient.name}))
}

function addCategory(name: string) {
    if (!name) {
        name = 'Category name ' + (categories.value.length + 1)
    }

    const category = {
        name: name,
        items: []
    };

    categories.value.push(category)

    toast.default(t('menu.category-added'))

    nextTick(() => {
        refreshSortable()
        document.querySelector(`[data-category-idx="${categories.value.length - 1}"]`)?.scrollIntoView(true)
    })

    return category
}

function removeCategory(category: MenuCategories[0]) {
    if (category.items.length > 0) {
        confirm.show(t('menu.delete-category-confirm', {name: category.name}), {
            onResolved: (dialog: any) => {
                dialog.close()
                toast.default(t('menu.category-removed'))
                categories.value.splice(
                    categories.value.findIndex(i => i == category),
                    1
                )
            }
        })

        return
    }

    categories.value.splice(
        categories.value.findIndex(i => i == category),
        1
    )
}

function clearCategory(category: MenuCategories[0]) {
    if (category.items.length == 0) {
        return
    }

    confirm.show(t('menu.clear-category-confirm', {name: category.name}), {
        onResolved: (dialog: any) => {
            dialog.close()
            toast.default(t('menu.category-cleared'))
            category.items = []
        }
    })
}

function removeItem(category: MenuCategories[0], item: MenuItem) {
    confirm.show(t('menu.delete-cocktail-confirm', {name: item.name}), {
        onResolved: (dialog: any) => {
            dialog.close()
            toast.default(t('menu.cocktail-removed'))
            category.items.splice(
                category.items.findIndex(i => i == item),
                1
            )
        }
    })
}

async function refreshMenu() {
    isLoading.value = true
    menu.value = (await BarAssistantClient.getMenu())?.data ?? {} as Menu

    isLoading.value = false

    nextTick(() => {
        refreshSortable()
    })

    categories.value = menu.value.categories ?? []
}

async function refreshBar() {
    bar.value = (await BarAssistantClient.getBar(appState.bar.id))?.data

    menuUrl.value = `${window.location.origin}/menu/${bar.value.slug}`
}

async function exportMenu() {
    const csv = await BarAssistantClient.getMenuExport()
    if (!csv) {
        return
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    const url = window?.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', appState.bar.slug + '-menu.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window?.URL.revokeObjectURL(url);
}

function refreshSortable() {
    sortableInstances.value = []
    document.querySelectorAll('.menu-category-cocktails').forEach(el => {
        sortableInstances.value.push(Sortable.create(el, {
            group: 'nested',
            handle: '.drag-handle',
            ghostClass: 'block-container--placeholder',
            animation: 150,
            fallbackOnBody: true,
            swapThreshold: 0.65,
            onAdd: function (evt: any) {
                const datasetId = evt.item.dataset.id
                let sourceItem = null
                if (evt.item.dataset.type == 'cocktail') {
                    sourceItem = cocktailMenuItems.value.find(c => c.id == datasetId)
                } else {
                    sourceItem = ingredientMenuItems.value.find(c => c.id == datasetId)
                }
                if (!sourceItem) {
                    return
                }

                const fromCategory = categories.value[evt.from.dataset.categoryIdx]
                const targetCategory = categories.value[evt.to.dataset.categoryIdx]

                // Remove from old cat
                fromCategory.items.splice(
                    fromCategory.items.findIndex(i => i == sourceItem),
                    1
                )

                sourceItem.sort = evt.newIndex + 1

                // Add to new cat
                targetCategory.items.splice(evt.newIndex, 0, sourceItem)
            },
        }))
    })
}

function copyCurrency(currency: string) {
    categories.value.forEach(cat => {
        cat.items.forEach(item => {
            item.price.currency = currency
        })
    })
}

function handleCalculatedPrice(item: MenuItem, e: any) {
    item.price.price = e.price
    item.price.currency = e.currency
}

function quickAddShelf() {
    isLoading.value = true
    BarAssistantClient.getBarShelfCocktails(appState.bar.id).then((resp) => {
        if (!resp || !resp.data || resp.data.length == 0) {
            isLoading.value = false
            return
        }

        const cat = addCategory('Bar shelf')
        resp.data.forEach(cocktail => {
            addItemToCategory({
                id: cocktail.id,
                name: cocktail.name,
                type: 'cocktail',
                sort: 0,
                description: cocktail?.short_ingredients?.join(', ') ?? '',
                price: {
                    price: 0,
                    price_minor: 0,
                    formatted_price: '0.00',
                    currency: guessCurrency.value ?? '',
                },
            }, cat)
        })
        isLoading.value = false
        toast.default(t('menu.added-multiple-cocktails'))
    }).catch(() => {
        isLoading.value = false
    })
}

async function saveMenu() {
    isLoading.value = true

    const sortedCocktails = sortableInstances.value.flatMap(sortableInstance => sortableInstance.toArray())
    const items = categories.value.flatMap(cat => {
        return cat.items.map(item => ({
            id: item.id,
            type: item.type,
            category_name: cat.name,
            sort: sortedCocktails.findIndex(sortedId => sortedId == item.id) + 1,
            price: item.price.price,
            currency: item.price.currency,
        }))
    })

    if (items.length == 0) {
        toast.error(t('menu.no-cocktails-added'))
        isLoading.value = false

        return
    }

    const postData = {
        is_enabled: menu.value.is_enabled,
        items: items
    } as MenuRequest

    try {
        await BarAssistantClient.updateMenu(postData)
        refreshMenu()
        toast.default(t('menu.saved'))
    } catch (e: any) {
        toast.error(t('menu.update-error') + ': ' + e.message)
        return
    } finally {
        isLoading.value = false
    }
}

useTitle(t('menu.title'))
refreshMenu()
refreshBar()
</script>

<style scoped>
.menu-details {
    display: flex;
    gap: var(--gap-size-3);
    margin-bottom: 1rem;
}

.menu-qr-code {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

@media (max-width: 450px) {
    .menu-details {
        flex-direction: column;
    }
}

.menu-categories {
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-2);
    margin-top: 1rem;
}

.menu-category {
    padding: var(--gap-size-3);
}

@media (max-width: 450px) {
    .menu-category {
        padding: var(--gap-size-2);
    }
}

.dark-theme .menu-category {
    background-color: rgba(0, 0, 0, .15);
    border-bottom: 1px solid rgba(255, 255, 255, .1);
    box-shadow:
        inset 0px 0.4px 0.5px hsl(var(--shadow-color-dark) / 0.25),
        inset 0px 1.1px 1.2px -0.8px hsl(var(--shadow-color-dark) / 0.25),
        inset 0px 2.6px 2.9px -1.7px hsl(var(--shadow-color-dark) / 0.25),
        inset 0px 6.3px 7.1px -2.5px hsl(var(--shadow-color-dark) / 0.25);
}

.menu-category-cocktails {
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-2);
    margin-top: var(--gap-size-4);
}

.menu-category__cocktail {
    display: flex;
    gap: var(--gap-size-3);
    padding: var(--gap-size-3);
}

@media (max-width: 450px) {
    .menu-category__cocktail {
        gap: var(--gap-size-2);
        padding: var(--gap-size-2);
    }
}

.menu-category__cocktail .drag-handle {
    height: auto;
}

.menu-category__cocktail__content {
    display: flex;
    flex-direction: row;
    width: 100%;
}

@media (max-width: 450px) {
    .menu-category__cocktail__content {
        flex-direction: column;
    }
}

.menu-category__cocktail__content__title {
    margin-bottom: 0.5em;
}

.menu-category__cocktail__content__price {
    display: flex;
    margin-left: auto;
    gap: var(--gap-size-2);
    flex-shrink: 0;
}

@media (max-width: 450px) {
    .menu-category__cocktail__content__price {
        margin-top: 0.5rem;
        margin-left: 0;
    }
}

.menu-category__cocktail__content p {
    font-size: 0.85rem;
    color: var(--clr-gray-700);
}

.dark-theme .menu-category__cocktail__content small {
    color: var(--clr-gray-400);
}

.menu-category__cocktail__content a {
    font-size: 0.85rem;
}

.menu-category__cocktail .form-group {
    max-width: 100px;
    margin-bottom: 0;
}

.menu-category__cocktail .form-group .form-input {
    width: 100%;
}

.menu-url {
    background: var(--clr-gray-100);
    padding: var(--gap-size-2);
    font-weight: var(--fw-bold);
    border-radius: var(--radius-1);
    width: 100%;
}

.menu-url a {
    font-weight: var(--fw-bold);
}

.menu-item-type {
    display: inline-block;
    /*padding: 1px 4px;
    font-size: 0.75rem;
    border-radius: var(--radius-1);
    text-decoration: none;*/
}

.menu-item-type.menu-item-type--cocktail {
    background-color: #E6DBF0;
    color: #3a304d;
}

.menu-item-type.menu-item-type--ingredient {
    background-color: #f0dbe6;
    color: #4d3042;
}

.dark-theme .menu-item-type.menu-item-type--cocktail {
    background-color: #3a304d;
    color: #E6DBF0;
}

.dark-theme .menu-item-type.menu-item-type--ingredient {
    background-color: #4d3042;
    color: #f0dbe6;
}
</style>
