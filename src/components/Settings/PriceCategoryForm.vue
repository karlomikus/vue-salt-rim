<script setup>
import { ref } from 'vue'
import { useSaltRimToast } from '../../composables/toast'
import BarAssistantClient from '@/api/BarAssistantClient'
import OverlayLoader from '@/components/OverlayLoader.vue'
import { useI18n } from 'vue-i18n'
import AppState from '../../AppState'

const appState = new AppState()
const { t } = useI18n()
const emit = defineEmits(['formClosed'])
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

if (appState.bar.settings && appState.bar.settings.default_currency) {
    category.value.currency = appState.bar.settings.default_currency
}

function submit() {
    isLoading.value = true

    const postData = {
        name: category.value.name,
        currency: category.value.currency,
        description: category.value.description,
    }

    if (category.value.id) {
        BarAssistantClient.updatePriceCategory(category.value.id, postData).then(resp => {
            isLoading.value = false
            toast.default(t('prices.price-category-update-success'))
            emit('formClosed', resp.data)
        }).catch(e => {
            toast.error(e.message)
            isLoading.value = false
        })
    } else {
        BarAssistantClient.savePriceCategory(postData).then(resp => {
            isLoading.value = false
            toast.default(t('prices.price-category-add-success'))
            emit('formClosed', resp.data)
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
            <input id="name" v-model="category.name" class="form-input" type="text" placeholder="Online (Amazon), In-Store, Wholesale..." required>
        </div>
        <div class="form-group">
            <label class="form-label form-label--required" for="currency">{{ t('price.currency') }}:</label>
            <input id="currency" v-model="category.currency" class="form-input" type="text" placeholder="EUR, USD, CAD, JPY..." required>
            <p class="form-input-hint"><a href="https://en.wikipedia.org/wiki/ISO_4217#List_of_ISO_4217_currency_codes" target="_blank">{{ $t('price.currency-format-notice') }}</a></p>
        </div>
        <div class="form-group">
            <label class="form-label" for="description">{{ t('description') }}:</label>
            <textarea id="description" v-model="category.description" rows="5" class="form-input"></textarea>
        </div>
        <div class="dialog-actions">
            <button class="button button--outline" @click.prevent="$emit('formClosed')">{{ t('cancel') }}</button>
            <button class="button button--dark" type="submit">{{ t('save') }}</button>
        </div>
    </form>
</template>
