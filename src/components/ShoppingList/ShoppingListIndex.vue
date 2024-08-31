<script setup lang="ts">
import { ref } from 'vue'
import BarAssistantClient from '@/api/BarAssistantClient';
import PageHeader from '@/components/PageHeader.vue'
import UnitHandler from '@/UnitHandler';
import Dropdown from '../SaltRimDropdown.vue';

import type { components } from '@/api/api'
import AppState from '@/AppState';
type ShoppingList = components["schemas"]["ShoppingList"]
type Ingredient = components["schemas"]["Ingredient"]
interface ShoppingListItemWithFullIngredient extends ShoppingList {
    ingredientRef: Ingredient
}

const appState = new AppState()
const shoppingList = ref([] as ShoppingList[])
const ingredients = ref([] as Ingredient[])
const list = ref([] as ShoppingListItemWithFullIngredient[])

refreshShoppingList()

async function refreshShoppingList() {
    shoppingList.value = (await BarAssistantClient.getShoppingList(appState.user.id))?.data ?? []
    ingredients.value = (await BarAssistantClient.getIngredients({
        'filter[id]': shoppingList.value.map(shoppingListItem => shoppingListItem.ingredient.id).join(','),
        include: 'category,prices',
    }))?.data ?? []
    list.value = shoppingList.value.map(sl => {
        return {...sl, ingredientRef: ingredients.value.find(i => i.id === sl.ingredient.id)} as ShoppingListItemWithFullIngredient
    })
}
</script>

<template>
    <PageHeader>
        {{ $t('your-shopping-list') }}
        <template #actions>
            <Dropdown>
                <template #default="{ toggleDropdown }">
                    <button type="button" class="button button--outline" @click="toggleDropdown">{{ $t('share') }}</button>
                </template>
                <template #content>
                    <RouterLink class="dropdown-menu__item" target="_blank" :to="{ name: 'print.shopping-list' }">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M6 19H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h3V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v4h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-3v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-2zm0-2v-1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1h2V9H4v8h2zM8 4v3h8V4H8zm0 13v3h8v-3H8zm-3-7h3v2H5v-2z" />
                        </svg>
                        {{ $t('print') }}
                    </RouterLink>
                    <a class="dropdown-menu__item" href="#copy" @click.prevent="shareFromFormat('markdown')">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                            <path d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM4 5V19H20V5H4ZM7 15.5H5V8.5H7L9 10.5L11 8.5H13V15.5H11V11.5L9 13.5L7 11.5V15.5ZM18 12.5H20L17 15.5L14 12.5H16V8.5H18V12.5Z"></path>
                        </svg>
                        {{ $t('share.copy-md') }}
                    </a>
                </template>
            </Dropdown>
        </template>
    </PageHeader>
    <div class="shopping-list">
        <div class="block-container block-container--padded shopping-list__item" v-for="shoppingListItem in list" :key="shoppingListItem.ingredient.id">
            <div>
                <RouterLink :to="{ name: 'ingredients.show', params: { id: shoppingListItem.ingredientRef.slug }}">{{ shoppingListItem.ingredientRef.name }}</RouterLink>
                <br>
                <small>{{ shoppingListItem.ingredientRef.category?.name }} &middot; Qty: {{ shoppingListItem.quantity }}</small>
                <ul class="shopping-list__item__prices">
                    <li v-for="ingredientPrice in shoppingListItem.ingredientRef.prices">
                        {{ ingredientPrice.price_category.name }}: <strong>{{ UnitHandler.formatPrice(ingredientPrice.price.price, ingredientPrice.price_category.currency) }}</strong> &middot; {{ ingredientPrice.amount }}{{ ingredientPrice.units }}
                    </li>
                </ul>
            </div>
            <div class="shopping-list__quantity-actions">
                <button type="button" class="button button--outline button--icon" @click="shoppingListItem.quantity--"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 11V13H19V11H5Z"></path></svg></button>
                <input type="text" v-model="shoppingListItem.quantity" class="form-input">
                <button type="button" class="button button--outline button--icon" @click="shoppingListItem.quantity++"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path></svg></button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.shopping-list__quantity-actions {
    display: flex;
    gap: var(--gap-size-1);
    max-width: 170px;
    margin-left: auto;
}

.shopping-list__item {
    display: flex;
    flex-wrap: wrap;
}

.shopping-list__item a {
    font-size: 1.25em;
}

.shopping-list__item small {
    color: var(--clr-gray-500);
}

.shopping-list__item__prices {
    list-style: none;
    padding: 0;
    margin: 0;
}
</style>