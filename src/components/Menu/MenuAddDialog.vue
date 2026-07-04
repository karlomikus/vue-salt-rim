<template>
    <div>
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ title }}</div>
        <div class="dialog-content">
            <form action="">
                <div class="form-group">
                    <label class="form-label" for="dialog-collection-id">{{ t("menu.category-title") }}:</label>
                    <select id="dialog-collection-id" v-model="existingSelectedCategoryName" class="form-select">
                        <option :value="null">- {{ t("menu.add-category") }} -</option>
                        <option v-for="category in menuCategories" :key="category.name" :value="category.name">{{ category.name }}</option>
                    </select>
                </div>
                <template v-if="!existingSelectedCategoryName">
                    <div class="form-group">
                        <label class="form-label" for="dialog-collection-name">{{ t("name") }}:</label>
                        <input id="dialog-collection-name" v-model="newCategoryName" class="form-input" type="text" ref="collectionName" />
                    </div>
                </template>
            </form>
        </div>
        <div class="dialog-actions" style="margin-top: 1rem">
            <button type="button" class="button button--outline" @click="$emit('menuAddDialogClosed')">{{ t("cancel") }}</button>
            <button type="button" class="button button--dark" @click="saveAndClose" :disabled="isLoading || (!existingSelectedCategoryName && !newCategoryName)">
                {{ t("menu.add-to") }} <template v-if="items.length > 1">({{ items.length }} {{ t("menu.menu-items") }})</template>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

import type { components } from "@/api/api";
import BarAssistantClient from "@/api/BarAssistantClient";
import { useSaltRimToast } from "@/composables/toast";
import OverlayLoader from "./../OverlayLoader.vue";

type Menu = components["schemas"]["Menu"];
type MenuRequest = components["schemas"]["MenuRequest"];
type MenuCategoryRequest = components["schemas"]["MenuCategoryRequest"];
type MenuItemRequest = components["schemas"]["MenuItemRequest"];
type MenuCategories = components["schemas"]["Menu"]["categories"];

const { t } = useI18n();
const toast = useSaltRimToast();

const props = defineProps<{
    items: number[];
    menuItemType: "cocktail" | "ingredient";
    title: string;
}>();

const emit = defineEmits<{
    (event: "menuAddDialogClosed"): void;
}>();

const isLoading = ref(false);
const existingSelectedCategoryName = ref<string | null>(null);
const newCategoryName = ref<string | null>(null);
const menu = ref<Menu | null>(null);
const collectionName = ref<HTMLInputElement | null>(null);

const menuCategories = computed((): MenuCategories => menu.value?.categories ?? []);

async function getMenu() {
    isLoading.value = true;

    try {
        const resp = await BarAssistantClient.getMenu();

        if (resp) {
            menu.value = resp.data;
        }
    } catch (e: any) {
        console.error(e.message);
    } finally {
        isLoading.value = false;
    }
}

function getGuessedCurrency(): string {
    const firstCategoryWithItems = menu.value?.categories.find((category) => category.items.length > 0);

    return firstCategoryWithItems?.items[0].price.currency ?? "EUR";
}

async function saveAndClose() {
    if (!menu.value) {
        return;
    }

    isLoading.value = true;

    try {
        const targetCategoryName = newCategoryName.value?.trim() || existingSelectedCategoryName.value || "Uncategorized";
        const existingMenuItemIds = new Set(menu.value.categories.flatMap((category) => category.items.map((item) => item.id)));

        const categories: MenuCategoryRequest[] = menu.value.categories.map((category, categoryIdx) => ({
            sort: category.sort || categoryIdx + 1,
            name: category.name,
            items: category.items.map((item) => ({
                id: item.id,
                type: item.type,
                sort: item.sort,
                price: item.price.price,
                currency: item.price.currency,
                is_bar_inventory_aware: item.is_bar_inventory_aware ?? false,
            })),
        }));

        let targetCategory = categories.find((category) => category.name === targetCategoryName);

        if (!targetCategory) {
            const nextCategorySort = categories.reduce((maxSort, category) => Math.max(maxSort, category.sort), 0) + 1;
            targetCategory = {
                sort: nextCategorySort,
                name: targetCategoryName,
                items: [],
            };
            categories.push(targetCategory);
        }

        const startingSortValue = targetCategory.items.reduce((maxSort, item) => Math.max(maxSort, item.sort), 0) + 1;
        const newItems = props.items
            .filter((itemId) => !existingMenuItemIds.has(itemId))
            .map((itemId, idx): MenuItemRequest => ({
                id: itemId,
                type: props.menuItemType,
                sort: startingSortValue + idx,
                price: 0,
                currency: getGuessedCurrency(),
                is_bar_inventory_aware: false,
            }));

        targetCategory.items.push(...newItems);

        const postData: MenuRequest = {
            is_enabled: menu.value.is_enabled,
            categories,
        };

        await BarAssistantClient.updateMenu(postData);
        emit("menuAddDialogClosed");
        toast.default(t("menu.saved"));
    } catch (e: any) {
        toast.error(e.message);
    } finally {
        isLoading.value = false;
    }
}

onMounted(() => {
    collectionName.value?.focus();
    getMenu();
});
</script>
