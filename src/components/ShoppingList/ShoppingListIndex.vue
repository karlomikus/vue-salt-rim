<script setup lang="ts">
import { ref, watch } from "vue";
import { useThrottleFn } from "@vueuse/core";
import { useSaltRimToast } from "@/composables/toast";
import { useI18n } from "vue-i18n";
import BarAssistantClient from "@/api/BarAssistantClient";
import PageHeader from "@/components/PageHeader.vue";
import { unitHandler } from "@/composables/useUnits";
import ToggleIngredientShoppingCart from "../ToggleIngredientShoppingCart.vue";
import EmptyState from "../EmptyState.vue";
import OverlayLoader from "../OverlayLoader.vue";

import type { components } from "@/api/api";
import AppState from "../../AppState";
import { useTitle } from "@/composables/title";
type ShoppingList = components["schemas"]["ShoppingList"];
type ShoppingListRequest = components["schemas"]["ShoppingListRequest"];
type Ingredient = components["schemas"]["Ingredient"];
interface ShoppingListItemWithFullIngredient extends ShoppingList {
    ingredientRef: Ingredient;
}

const { t } = useI18n();
const toast = useSaltRimToast();
const isLoading = ref(false);
const appState = new AppState();
const shoppingList = ref([] as ShoppingList[]);
const ingredients = ref([] as Ingredient[]);
const list = ref([] as ShoppingListItemWithFullIngredient[]);

useTitle(t("your-shopping-list"));

refreshShoppingList();

watch(
    list,
    () => {
        throttleShoppingListUpdate();
    },
    {
        deep: true,
    },
);

const throttleShoppingListUpdate = useThrottleFn(
    () => {
        updateShoppingList();
    },
    700,
    true,
);

async function refreshShoppingList() {
    isLoading.value = true;
    shoppingList.value = (await BarAssistantClient.getShoppingList(appState.user.id))?.data ?? [];
    ingredients.value =
        (
            await BarAssistantClient.getIngredients({
                "filter[id]": shoppingList.value.map((shoppingListItem) => shoppingListItem.ingredient.id).join(","),
                include: "prices,ancestors",
                per_page: shoppingList.value.length,
            })
        )?.data ?? [];
    list.value = shoppingList.value.map((sl) => {
        return { ...sl, ingredientRef: ingredients.value.find((i) => i.id === sl.ingredient.id) } as ShoppingListItemWithFullIngredient;
    });
    isLoading.value = false;
}

async function updateShoppingList() {
    if (list.value.length === 0) {
        return;
    }

    const postData = {
        ingredients: list.value.map((l) => {
            return {
                id: l.ingredient.id,
                quantity: l.quantity,
            };
        }),
    } as ShoppingListRequest;

    try {
        await BarAssistantClient.addToShoppingList(appState.user.id, postData);
    } catch (e: any) {
        toast.error(e.message);
    }
}

function updateQuantity(shoppingListItem: ShoppingListItemWithFullIngredient, delta: number) {
    if (!shoppingListItem.quantity || shoppingListItem.quantity <= 0) {
        shoppingListItem.quantity = 1;
        return;
    }

    shoppingListItem.quantity = parseInt(shoppingListItem.quantity.toString()) + delta;
}

async function shareFromFormat(format: string) {
    BarAssistantClient.shareShoppingList(appState.user.id).then((resp) => {
        navigator.clipboard.writeText(resp?.data.content ?? "").then(
            () => {
                toast.default(t("share.format-copied"));
            },
            () => {
                toast.error(t("share.format-copy-failed"));
            },
        );
    });
}
</script>

<template>
    <PageHeader>
        {{ t("your-shopping-list") }}
        <template #actions>
            <button type="button" class="button button--outline" @click="shareFromFormat('markdown')">{{ t("share.copy-md") }}</button>
            <RouterLink class="button button--dark" target="_blank" :to="{ name: 'print.shopping-list' }">{{ t("print") }}</RouterLink>
        </template>
    </PageHeader>
    <div class="shopping-list">
        <OverlayLoader v-if="isLoading" />
        <EmptyState v-if="list.length <= 0">
            {{ t("shopping-list-empty") }}
        </EmptyState>
        <div v-else class="block-container block-container--padded shopping-list__item" v-for="shoppingListItem in list" :key="shoppingListItem.ingredient.id">
            <div>
                <RouterLink :to="{ name: 'ingredients.show', params: { id: shoppingListItem.ingredientRef.slug } }">{{ shoppingListItem.ingredientRef.name }}</RouterLink>
                <br />
                <small>{{ shoppingListItem.ingredientRef.hierarchy.path_to_self ?? t("uncategorized") }} &middot; Qty: {{ shoppingListItem.quantity }}</small>
                &middot;
                <ToggleIngredientShoppingCart :ingredient="shoppingListItem.ingredientRef" :model-value="true"></ToggleIngredientShoppingCart>
                <ul class="shopping-list__item__prices">
                    <li v-for="ingredientPrice in shoppingListItem.ingredientRef.prices" :key="ingredientPrice.price_category.id">
                        {{ ingredientPrice.price_category.name }}:
                        <strong>{{ unitHandler.formatPrice(ingredientPrice.price.price, ingredientPrice.price_category.currency) }}</strong> &middot; {{ ingredientPrice.amount
                        }}{{ ingredientPrice.units }}
                    </li>
                </ul>
            </div>
            <div class="shopping-list__quantity-actions">
                <button type="button" class="button button--input" @click="updateQuantity(shoppingListItem, -1)">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 11V13H19V11H5Z"></path></svg>
                </button>
                <input type="text" v-model="shoppingListItem.quantity" class="form-input" />
                <button type="button" class="button button--input" @click="updateQuantity(shoppingListItem, +1)">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path>
                    </svg>
                </button>
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
    padding: 1rem;
}

.shopping-list__item a {
    font-size: 1.25em;
}

.shopping-list__item small {
    color: var(--clr-gray-600);

    .dark-theme & {
        color: var(--clr-gray-400);
    }
}

.shopping-list__item__prices {
    list-style: none;
    padding: 0;
    margin: 0;
}

.shopping-list__quantity-actions svg {
    width: 24px;
    height: 24px;
}
</style>
