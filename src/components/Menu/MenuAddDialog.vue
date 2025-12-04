<template>
    <div>
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ title }}</div>
        <div class="dialog-content">
            <form action="">
                <div class="form-group">
                    <label class="form-label" for="dialog-collection-id">{{ $t('menu.category-title') }}:</label>
                    <select id="dialog-collection-id" v-model="existingSelectedCategoryName" class="form-select">
                        <option :value="null"> - {{ $t('menu.add-category') }} - </option>
                        <option v-for="category in menuCategories" :key="category.name" :value="category.name">{{ category.name }}</option>
                    </select>
                </div>
                <template v-if="!existingSelectedCategoryName">
                    <div class="form-group">
                        <label class="form-label" for="dialog-collection-name">{{ $t('name') }}:</label>
                        <input id="dialog-collection-name" v-model="newCategoryName" class="form-input" type="text" ref="collectionName">
                    </div>
                </template>
            </form>
        </div>
        <div class="dialog-actions" style="margin-top: 1rem;">
            <button type="button" class="button button--outline" @click="$emit('menuAddDialogClosed')">{{ $t('cancel') }}</button>
            <button type="button" class="button button--dark" @click="saveAndClose">
                {{ $t('menu.add-to') }} <template v-if="items.length > 1">({{ items.length }} {{ $t('menu.menu-items') }})</template>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import BarAssistantClient from '@/api/BarAssistantClient';
import OverlayLoader from './../OverlayLoader.vue'
import { computed, ref } from 'vue';
import type { components } from '@/api/api'

type Menu = components['schemas']['Menu']
type MenuRequest = components['schemas']['MenuRequest']
type MenuItemRequest = components['schemas']['MenuRequest']['items'][0]
type MenuCategories = components['schemas']['Menu']['categories']

const props = defineProps<{
    items: number[],
    menuItemType: 'cocktail' | 'ingredient',
    title: string
}>()

const emits = defineEmits<{
    (e: 'menuAddDialogClosed'): void
}>()

const isLoading = ref(false)
const existingSelectedCategoryName = ref<string | null>(null)
const newCategoryName = ref<string | null>(null)
const menu = ref<Menu | null>(null)

const getMenu = async () => {
    isLoading.value = true
    try {
        const resp = await BarAssistantClient.getMenu()
        if (resp)
            menu.value = resp.data
    } catch (e: any) {
        console.error(e.message)
    } finally {
        isLoading.value = false
    }
}

const menuCategories = computed((): MenuCategories => {
    return menu.value ? menu.value.categories : []
})

const findCategoryByName = (name: string): MenuCategories[0] | null => {
    if (!menu.value)
        return null
    for (const category of menu.value.categories) {
        if (category.name === name)
            return category
    }
    return null
}

const saveAndClose = async () => {
    if (menu.value == null)
        return

    isLoading.value = true
    try {
        const existingCategory = newCategoryName.value ? findCategoryByName(newCategoryName.value) : null
        const existingCategoryLastSort = existingCategory ? existingCategory.items.reduce((max, item) => item.sort > max ? item.sort : max, 0) : 0
        const guessedCurrency = menu.value.categories.length > 0 && menu.value.categories[0].items.length > 0
            ? menu.value.categories[0].items[0].price.currency
            : 'EUR'

        const newItems = props.items.filter(itemId => {
            // If item is already in menu, skip it
            for (const category of menu.value!.categories) {
                if (category.items.some(item => item.id === itemId))
                    return false
            }
            return true
        }).map((itemId, idx): MenuItemRequest => ({
            id: itemId,
            type: props.menuItemType,
            category_name: newCategoryName.value || existingSelectedCategoryName.value || 'Uncategorized',
            sort: existingCategoryLastSort + idx + 1,
            price: 0.0,
            currency: guessedCurrency,
        }))

        const existingItems = menu.value.categories.flatMap(cat => {
            return cat.items.map(item => ({
                id: item.id,
                type: item.type,
                category_name: cat.name,
                sort: item.sort,
                price: item.price.price,
                currency: item.price.currency,
            }))
        })

        const postData = {
            is_enabled: menu.value.is_enabled,
            items: existingItems.concat(newItems),
        } as MenuRequest


        await BarAssistantClient.updateMenu(postData)
        emits('menuAddDialogClosed')
    } catch (e: any) {
        console.error(e.message)
    } finally {
        isLoading.value = false
    }
}

getMenu()
</script>
