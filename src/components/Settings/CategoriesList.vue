<template>
    <PageHeader>
        Ingredient categories
        <template #actions>
            <Dialog v-model="showDialog">
                <template #trigger>
                    <button type="button" class="button button--outline" @click.prevent="openDialog('Add category', {})">Add category</button>
                </template>
                <template #dialog>
                    <CategoryForm :source-category="editCategory" :dialog-title="dialogTitle" @category-dialog-closed="refreshCategories" />
                </template>
            </Dialog>
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
                            <th>Name / Description</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="category in categories">
                            <td>
                                <a href="#" @click.prevent="openDialog('Edit category', category)">{{ category.name }}</a>
                                <br>
                                <small>{{ category.description }}</small>
                            </td>
                            <td style="text-align: right;">
                                <a class="list-group__action" href="#" @click.prevent="deleteCategory(category)">Delete</a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import ApiRequests from "@/ApiRequests";
import OverlayLoader from '@/components/OverlayLoader.vue'
import PageHeader from '@/components/PageHeader.vue'
import Navigation from '@/components/Settings/Navigation.vue'
import Dialog from '@/components/Dialog/Dialog.vue'
import CategoryForm from '@/components/Settings/CategoryForm.vue'

export default {
    components: {
        OverlayLoader,
        Navigation,
        PageHeader,
        Dialog,
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
        document.title = `Ingredient categories \u22C5 Salt Rim`

        this.refreshCategories()
    },
    methods: {
        refreshCategories() {
            this.showDialog = false;
            this.isLoading = true;
            ApiRequests.fetchIngredientCategories().then(data => {
                this.categories = data;
                this.isLoading = false;
            }).catch(e => {
                this.$toast.error(e.message);
            })
        },
        openDialog(title, obj) {
            this.dialogTitle = title
            this.editCategory = obj
            this.showDialog = true;
        },
        deleteCategory(category) {
            this.$confirm(`This will permanently category with name "${category.name}".`, {
                onResolved: (dialog) => {
                    this.isLoading = true
                    dialog.close();
                    ApiRequests.deleteIngredientCategory(category.id).then(() => {
                        this.isLoading = false;
                        this.$toast.default(`Ingredient category deleted successfully.`);
                        this.refreshCategories()
                    }).catch(e => {
                        this.$toast.error(e.message);
                        this.isLoading = false;
                    })
                }
            });
        }
    }
}
</script>
