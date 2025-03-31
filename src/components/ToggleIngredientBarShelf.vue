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
const { t } = useI18n()
const toast = useSaltRimToast()
const props = defineProps<{
    ingredient: IngredientBasic
}>()

function toggle() {
    isLoading.value = true
    const postData = {
        ingredients: [props.ingredient.id]
    }

    if (model.value) {
        BarAssistantClient.removeFromBarShelf(appState.bar.id, postData).then(() => {
            toast.default(t('ingredient.bar-shelf-remove-success', { name: props.ingredient.name }))
            model.value = false
            isLoading.value = false
        }).catch(e => {
            toast.error(e.message)
            isLoading.value = false
        })
    } else {
        BarAssistantClient.addToBarShelf(appState.bar.id, postData).then(() => {
            toast.default(t('ingredient.bar-shelf-add-success', { name: props.ingredient.name }))
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
            <a v-if="!model" href="#" @click.prevent="toggle">{{ t('ingredient.add-to-bar-shelf') }}</a>
            <a v-else href="#" @click.prevent="toggle">{{ t('ingredient.remove-from-bar-shelf') }}</a>
        </template>
        <span v-else>{{ t('loading') }}...</span>
    </slot>
</template>
