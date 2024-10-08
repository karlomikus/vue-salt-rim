<script setup>
import { ref } from 'vue'
import { useSaltRimToast } from './../../composables/toast'
import BarAssistantClient from '@/api/BarAssistantClient'
import OverlayLoader from '@/components/OverlayLoader.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const emit = defineEmits(['categoryDialogClosed'])
const toast = useSaltRimToast()
const props = defineProps({
    sourceCategory: {
        type: Object,
        default() {
            return {}
        }
    },
    dialogTitle: {
        type: String,
        default: ''
    },
})

const isLoading = ref(false)
const category = ref(props.sourceCategory)

function submit() {
    isLoading.value = true

    const postData = {
        name: category.value.name,
        description: category.value.description,
    }

    if (category.value.id) {
        BarAssistantClient.updateIngredientCategory(category.value.id, postData).then(resp => {
            isLoading.value = false
            toast.default(t('category.update-success'))
            emit('categoryDialogClosed', resp.data)
        }).catch(e => {
            toast.error(e.message)
            isLoading.value = false
        })
    } else {
        BarAssistantClient.saveIngredientCategory(postData).then(resp => {
            isLoading.value = false
            toast.default(t('category.add-success'))
            emit('categoryDialogClosed', resp.data)
        }).catch(e => {
            toast.error(e.message)
            isLoading.value = false
        })
    }
}
</script>

<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ dialogTitle }}</div>
        <div class="form-group">
            <label class="form-label form-label--required" for="name">{{ t('name') }}:</label>
            <input id="name" v-model="category.name" class="form-input" type="text" required>
        </div>
        <div class="form-group">
            <label class="form-label" for="description">{{ t('description') }}:</label>
            <textarea id="description" v-model="category.description" rows="5" class="form-input"></textarea>
        </div>
        <div class="dialog-actions">
            <button class="button button--outline" @click.prevent="$emit('categoryDialogClosed')">{{ t('cancel') }}</button>
            <button class="button button--dark" type="submit">{{ t('save') }}</button>
        </div>
    </form>
</template>
