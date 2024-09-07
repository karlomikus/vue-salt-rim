<template>
    <PageHeader>
        {{ $t('ingredient.categories') }}
        <template #actions>
            <SaltRimDialog v-model="showDialog">
                <template #trigger>
                    <button type="button" class="button button--dark" @click.prevent="openDialog($t('category.add'), {})">{{ $t('category.add') }}</button>
                </template>
                <template #dialog>
                    <CategoryForm :source-category="editCategory" :dialog-title="dialogTitle" @category-dialog-closed="refreshCategories" />
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
            <div class="block-container block-container--padded">
                <table class="table">
                    <thead>
                        <tr>
                            <th>{{ $t('name') }} / {{ $t('description') }}</th>
                            <th>{{ $t('ingredient.ingredients') }}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="category in categories" :key="category.id">
                            <td>
                                <a href="#" @click.prevent="openDialog($t('category.edit'), category)">{{ category.name }}</a>
                                <br>
                                <small>{{ overflowText(category.description, 100) }}</small>
                            </td>
                            <td>{{ category.ingredients_count }}</td>
                            <td style="text-align: right;">
                                <a class="list-group__action" href="#" @click.prevent="deleteCategory(category)">{{ $t('remove') }}</a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import ApiRequests from '@/ApiRequests'
import OverlayLoader from '@/components/OverlayLoader.vue'
import PageHeader from '@/components/PageHeader.vue'
import Navigation from '@/components/Settings/SettingsNavigation.vue'
import SaltRimDialog from '@/components/Dialog/SaltRimDialog.vue'
import CategoryForm from '@/components/Settings/CategoryForm.vue'
import { useTitle } from '@/composables/title'

export default {
    components: {
        OverlayLoader,
        Navigation,
        PageHeader,
        SaltRimDialog,
        CategoryForm
    },
    data() {
        return {
            isLoading: false,
            showDialog: false,
            dialogTitle: 'Category data',
            editCategory: {},
            categories: [],
        }
    },
    created() {
        useTitle(this.$t('ingredient.categories'))

        this.refreshCategories()
    },
    methods: {
        refreshCategories() {
            this.showDialog = false
            this.isLoading = true
            ApiRequests.fetchIngredientCategories().then(data => {
                this.categories = data
                this.isLoading = false
            }).catch(e => {
                this.$toast.error(e.message)
            })
        },
        openDialog(title, obj) {
            this.dialogTitle = title
            this.editCategory = obj
            this.showDialog = true
        },
        deleteCategory(category) {
            this.$confirm(this.$t('category.confirm-delete', {name: category.name}), {
                onResolved: (dialog) => {
                    this.isLoading = true
                    dialog.close()
                    ApiRequests.deleteIngredientCategory(category.id).then(() => {
                        this.isLoading = false
                        this.$toast.default(this.$t('ingredient-category.delete-success'))
                        this.refreshCategories()
                    }).catch(e => {
                        this.$toast.error(e.message)
                        this.isLoading = false
                    })
                }
            })
        },
        overflowText(input, len) {
            if (!input) {
                return input
            }

            return input.length > len ? `${input.substring(0, len)}...` : input
        }
    }
}
</script>
