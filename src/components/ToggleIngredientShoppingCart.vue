<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSaltRimToast } from './../composables/toast'
import OverlayLoader from './OverlayLoader.vue'
import BarAssistantClient from '@/api/BarAssistantClient'
import AppState from '@/AppState'
import type { components } from '@/api/api'

type IngredientBasic = components["schemas"]["IngredientBasic"]

const appState = new AppState();
const isLoading = ref(false)
const emit = defineEmits(['listUpdated'])
const { t } = useI18n()
const toast = useSaltRimToast()
const props = defineProps<{
    ingredient: IngredientBasic
    status: boolean
}>()
const isInShoppingList = ref(props.status)

function toggle() {
    isLoading.value = true
    const postData = {
        ingredients: [{id: props.ingredient.id, qunatity: 1}]
    }

    if (isInShoppingList.value) {
        BarAssistantClient.removeFromShoppingList(appState.user.id, postData).then(() => {
            toast.default(t('ingredient.list-remove-success', { name: props.ingredient.name }))
            emit('listUpdated', {on_list: false, ingredient: props.ingredient})
            isInShoppingList.value = false
            isLoading.value = false
        }).catch(e => {
            toast.error(e.message)
            isLoading.value = false
        })
    } else {
        BarAssistantClient.addToShoppingList(appState.user.id, postData).then(() => {
            toast.default(t('ingredient.list-add-success', { name: props.ingredient.name }))
            emit('listUpdated', {on_list: true, ingredient: props.ingredient})
            isInShoppingList.value = true
            isLoading.value = false
        }).catch(e => {
            toast.error(e.message)
            isLoading.value = false
        })
    }
}
</script>
<template>
    <OverlayLoader v-if="isLoading"></OverlayLoader>
    <a v-if="!isInShoppingList" href="#" @click.prevent="toggle">{{ $t('ingredient.add-to-list') }}</a>
    <a v-else href="#" @click.prevent="toggle">{{ $t('ingredient.remove-from-list') }}</a>
</template>
