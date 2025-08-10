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

<script>
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

export default {
    components: {
        OverlayLoader,
        Navigation,
        PageHeader,
        PriceCategoryForm,
        SaltRimDialog,
        EmptyState,
        SubscriptionCheck,
    },
    data() {
        return {
            appState: new AppState(),
            isLoading: false,
            showDialog: false,
            dialogTitle: 'Price category data',
            editPriceCategory: {},
            categories: [],
        }
    },
    computed: {
        showCreateAction() {
            return this.appState.isSubscribed() || (!this.appState.isSubscribed() && this.categories.length < 1)
        }
    },
    created() {
        useTitle(this.$t('prices.price-categories'))

        this.refreshCategories()
    },
    methods: {
        refreshCategories() {
            this.showDialog = false
            this.isLoading = true
            BarAssistantClient.getPriceCategories().then(resp => {
                this.categories = resp.data
                this.isLoading = false
            }).catch(e => {
                this.$toast.error(e.message)
            })
        },
        openDialog(title, obj) {
            this.dialogTitle = title
            this.editPriceCategory = obj
            this.showDialog = true
        },
        deletePriceCategory(category) {
            this.$confirm(this.$t('price.category-confirm-delete', {name: category.name}), {
                onResolved: (dialog) => {
                    this.isLoading = true
                    dialog.close()
                    BarAssistantClient.deletePriceCategory(category.id).then(() => {
                        this.isLoading = false
                        this.$toast.default(this.$t('price.category-delete-success'))
                        this.refreshCategories()
                    }).catch(e => {
                        this.$toast.error(e.message)
                        this.isLoading = false
                    })
                }
            })
        }
    }
}
</script>
