<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ dialogTitle }}</div>
        <div class="form-group">
            <label class="form-label form-label--required" for="name">{{ $t('name') }}:</label>
            <input id="name" v-model="method.name" class="form-input" type="text" required>
        </div>
        <div class="form-group">
            <label class="form-label form-label--required" for="dilution_percentage">{{ $t('cocktail-methods.dilution-percentage') }} (%):</label>
            <input id="dilution_percentage" v-model="method.dilution_percentage" class="form-input" type="text" required>
        </div>
        <div class="dialog-actions">
            <button class="button button--outline" @click.prevent="emit('methodDialogClosed')">{{ $t('cancel') }}</button>
            <button class="button button--dark" type="submit">{{ $t('save') }}</button>
        </div>
    </form>
</template>

<script setup lang="ts">
import BarAssistantClient from '@/api/BarAssistantClient'
import OverlayLoader from '@/components/OverlayLoader.vue'
import type { components } from '@/api/api'
type CocktailMethod = components['schemas']['CocktailMethod']
import { ref } from 'vue'
import { useSaltRimToast } from '@/composables/toast'
import { useI18n } from 'vue-i18n'

const props = defineProps({
    sourceMethod: {
        type: Object as () => CocktailMethod,
        default: () => ({}),
    },
    dialogTitle: {
        type: String,
        default: '',
    },
})
const isLoading = ref(false)
const dialogTitle = ref(props.dialogTitle)
const method = ref<CocktailMethod>(props.sourceMethod)
const emit = defineEmits(['methodDialogClosed'])
const toast = useSaltRimToast()
const { t } = useI18n()

function submit() {
    isLoading.value = true

    const postData = {
        name: method.value.name,
        dilution_percentage: method.value.dilution_percentage,
    }

    if (method.value.id) {
        BarAssistantClient.updateCocktailMethod(method.value.id, postData).then(() => {
            isLoading.value = false
            toast.default(t('cocktail-methods.update-success'))
            emit('methodDialogClosed')
        }).catch(e => {
            toast.error(e.message)
            isLoading.value = false
        })
    } else {
        BarAssistantClient.saveCocktailMethod(postData).then(() => {
            isLoading.value = false
            toast.default(t('cocktail-methods.add-success'))
            emit('methodDialogClosed')
        }).catch(e => {
            toast.error(e.message)
            isLoading.value = false
        })
    }
}
</script>
