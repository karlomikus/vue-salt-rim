<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ApiRequests from '../ApiRequests'
import { useSaltRimToast } from './../composables/toast'
import OverlayLoader from './OverlayLoader.vue'

const isLoading = ref(false)
const emit = defineEmits(['listUpdated'])
const { t } = useI18n()
const toast = useSaltRimToast()
const props = defineProps({
    ingredient: {
        type: Object,
        required: true
    },
    shoppingList: {
        type: Array,
        required: true
    }
})

const isInShoppingList = computed(() => {
    return props.shoppingList.includes(props.ingredient.id)
})

function toggle() {
    isLoading.value = true
    const postData = {
        ingredient_ids: [props.ingredient.id]
    }

    if (isInShoppingList.value) {
        ApiRequests.removeIngredientsFromShoppingList(postData).then(() => {
            toast.default(t('ingredient.list-remove-success', { name: props.ingredient.name }))
            emit('listUpdated', {on_list: false, ingredient: props.ingredient})
            isLoading.value = false
        }).catch(e => {
            toast.error(e.message)
            isLoading.value = false
        })
    } else {
        ApiRequests.addIngredientsToShoppingList(postData).then(() => {
            toast.default(t('ingredient.list-add-success', { name: props.ingredient.name }))
            emit('listUpdated', {on_list: true, ingredient: props.ingredient})
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
