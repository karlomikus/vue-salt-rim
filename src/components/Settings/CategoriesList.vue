<template>
    <PageHeader>
        Ingredient categories
        <template #actions>
            <RouterLink class="button button--outline" :to="{name: 'settings.categories.form'}">Add category</RouterLink>
        </template>
    </PageHeader>
    <div class="settings-page">
        <div class="settings-page__nav">
            <Navigation />
        </div>
        <div class="settings-page__content">
            <OverlayLoader v-if="isLoading" />
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
                            <RouterLink :to="{name: 'settings.categories.form', query: {id: category.id}}">{{ category.name }}</RouterLink>
                            <br>
                            <small>{{ category.description }}</small>
                        </td>
                        <td style="text-align: right;">
                            <a class="list-group__action" href="#" @click.prevent="deleteCategory(category.id)">Delete</a>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import ApiRequests from "@/ApiRequests";
import OverlayLoader from '@/components/OverlayLoader.vue'
import PageHeader from '@/components/PageHeader.vue'
import Navigation from '@/components/Settings/Navigation.vue'

export default {
    components: {
        OverlayLoader,
        Navigation,
        PageHeader
    },
    data() {
        return {
            isLoading: false,
            categories: [],
        }
    },
    created() {
        document.title = `Ingredient categories \u22C5 Salt Rim`

        this.refreshCategories()
    },
    methods: {
        refreshCategories() {
            this.isLoading = true;
            ApiRequests.fetchIngredientCategories().then(data => {
                this.categories = data;
                this.isLoading = false;
            }).catch(e => {
                this.$toast.error(e.message);
            })
        },
        deleteCategory(id) {
            this.$confirm('This will permanently delete this category.', {
                onResolved: (dialog) => {
                    this.isLoading = true
                    dialog.close();
                    ApiRequests.deleteIngredientCategory(id).then(() => {
                        this.isLoading = false;
                        this.$toast.default(`Ingredient category deleted successfully.`);
                        this.$router.push({ name: 'settings.categories' })
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
