<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSaltRimToast } from './../composables/toast'
import BarAssistantClient from '@/api/BarAssistantClient'
import AppState from '@/AppState'
import type { components } from '@/api/api'

type IngredientBasic = components["schemas"]["IngredientBasic"]

const appState = new AppState();
const isLoading = ref(false)
const model = defineModel<boolean>({required: true})
const emit = defineEmits(['listUpdated'])
const { t } = useI18n()
const toast = useSaltRimToast()
const props = defineProps<{
    ingredient: IngredientBasic
}>()

function toggle() {
    isLoading.value = true
    const postData = {
        ingredients: [{id: props.ingredient.id, qunatity: 1}]
    }

    if (model.value) {
        BarAssistantClient.removeFromShoppingList(appState.user.id, postData).then(() => {
            toast.default(t('ingredient.list-remove-success', { name: props.ingredient.name }))
            emit('listUpdated', {on_list: false, ingredient: props.ingredient})
            model.value = false
            isLoading.value = false
        }).catch(e => {
            toast.error(e.message)
            isLoading.value = false
        })
    } else {
        BarAssistantClient.addToShoppingList(appState.user.id, postData).then(() => {
            toast.default(t('ingredient.list-add-success', { name: props.ingredient.name }))
            emit('listUpdated', {on_list: true, ingredient: props.ingredient})
            model.value = true
            isLoading.value = false
        }).catch(e => {
            toast.error(e.message)
            isLoading.value = false
        })
    }
}
</script>
<template>
    <slot :is-loading="isLoading" :in-list="model" :toggle="toggle">
        <template v-if="!isLoading">
            <a v-if="!model" href="#" @click.prevent="toggle">{{ t('ingredient.add-to-list') }}</a>
            <a v-else href="#" @click.prevent="toggle">{{ t('ingredient.remove-from-list') }}</a>
        </template>
        <span v-else>{{ t('loading') }}...</span>
    </slot>
</template>
