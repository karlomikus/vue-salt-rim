<template>
    <PageHeader>
        {{ $t('prices.price-categories') }}
        <template v-if="showCreateAction" #actions>
            <SaltRimDialog v-model="showDialog">
                <template #trigger>
                    <button type="button" class="button button--dark" @click.prevent="openDialog($t('prices.add-price-category'), {})">{{ $t('prices.add-price-category') }}</button>
                </template>
                <template #dialog>
                    <PriceCategoryForm :source-category="editPriceCategory" :dialog-title="dialogTitle" @form-closed="refreshCategories" />
                </template>
            </SaltRimDialog>
        </template>
    </PageHeader>
    <div class="settings-page">
        <div class="settings-page__nav">
            <Navigation />
        </div>
        <div class="settings-page__content">
            <OverlayLoader v-if="isLoading" />
            <SubscriptionCheck>Subscribe to "Mixologist" plan to unlock unlimited price categories!</SubscriptionCheck>
            <div v-if="categories.length > 0" class="block-container block-container--padded">
                <table class="table">
                    <thead>
                        <tr>
                            <th>{{ $t('name') }} / {{ $t('description') }}</th>
                            <th>{{ $t('price.currency') }}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="priceCategory in categories" :key="priceCategory.id">
                            <td>
                                <a href="#" @click.prevent="openDialog($t('price.edit-category'), priceCategory)">{{ priceCategory.name }}</a>
                                <br>
                                <small>{{ priceCategory.description }}</small>
                            </td>
                            <td>{{ priceCategory.currency }}</td>
                            <td style="text-align: right;">
                                <a class="list-group__action" href="#" @click.prevent="deletePriceCategory(priceCategory)">{{ $t('remove') }}</a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <EmptyState v-else>
                <template #icon>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M10.9042 2.10025L20.8037 3.51446L22.2179 13.414L13.0255 22.6063C12.635 22.9969 12.0019 22.9969 11.6113 22.6063L1.71184 12.7069C1.32131 12.3163 1.32131 11.6832 1.71184 11.2926L10.9042 2.10025ZM11.6113 4.22157L3.83316 11.9997L12.3184 20.485L20.0966 12.7069L19.036 5.28223L11.6113 4.22157ZM13.7327 10.5855C12.9516 9.80448 12.9516 8.53815 13.7327 7.7571C14.5137 6.97606 15.78 6.97606 16.5611 7.7571C17.3421 8.53815 17.3421 9.80448 16.5611 10.5855C15.78 11.3666 14.5137 11.3666 13.7327 10.5855Z"></path></svg>
                </template>
                <template #default>
                    {{ $t('price.price-categories-empty') }}
                </template>
            </EmptyState>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import BarAssistantClient from '@/api/BarAssistantClient'
import OverlayLoader from '@/components/OverlayLoader.vue'
import PageHeader from '@/components/PageHeader.vue'
import Navigation from '@/components/Settings/SettingsNavigation.vue'
import SaltRimDialog from '@/components/Dialog/SaltRimDialog.vue'
import PriceCategoryForm from '@/components/Settings/PriceCategoryForm.vue'
import EmptyState from '../EmptyState.vue'
import { useTitle } from '@/composables/title'
import SubscriptionCheck from '../SubscriptionCheck.vue'
import AppState from '@/AppState'
import { useI18n } from 'vue-i18n'
import { useSaltRimToast } from '@/composables/toast'
import { useConfirm } from '@/composables/confirm'
import type { components } from '@/api/api'

const appState = new AppState()
const { t } = useI18n()
const toast = useSaltRimToast()
const confirm = useConfirm()

const isLoading = ref(false)
const showDialog = ref(false)
const dialogTitle = ref('')
const editPriceCategory = ref<components['schemas']['PriceCategory']>({} as components['schemas']['PriceCategory'])
const categories = ref<components['schemas']['PriceCategory'][]>([])

const showCreateAction = computed(() => {
    return appState.isSubscribed() || (!appState.isSubscribed() && categories.value.length < 1)
})

useTitle(t('prices.price-categories'))

onMounted(() => {
    refreshCategories()
})

function refreshCategories() {
    showDialog.value = false
    isLoading.value = true
    BarAssistantClient.getPriceCategories().then(resp => {
        categories.value = resp.data
        isLoading.value = false
    }).catch(e => {
        toast.error(e.message)
    })
}

function openDialog(title: string, obj: components['schemas']['PriceCategory']) {
    dialogTitle.value = title
    editPriceCategory.value = obj
    showDialog.value = true
}

function deletePriceCategory(category: components['schemas']['PriceCategory']) {
    confirm.show(t('price.category-confirm-delete', { name: category.name }), {
        onResolved: (dialog: any) => {
            isLoading.value = true
            dialog.close()
            BarAssistantClient.deletePriceCategory(category.id).then(() => {
                isLoading.value = false
                toast.default(t('price.category-delete-success'))
                refreshCategories()
            }).catch(e => {
                toast.error(e.message)
                isLoading.value = false
            })
        }
    })
}
</script>
