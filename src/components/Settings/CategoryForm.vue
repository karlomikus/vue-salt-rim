<template>
    <PageHeader>
        Ingredient category information
    </PageHeader>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <div class="form-group">
            <label class="form-label form-label--required" for="name">Name:</label>
            <input class="form-input" type="text" id="name" v-model="category.name" required placeholder="Category name...">
        </div>
        <div class="form-group">
            <label class="form-label" for="description">Description:</label>
            <textarea rows="5" class="form-input" id="description" v-model="category.description" placeholder="Category description..."></textarea>
        </div>
        <div class="form-actions">
            <RouterLink class="button button--outline" :to="{ name: 'settings.categories' }">Cancel</RouterLink>
            <button class="button button--dark" type="submit">Save</button>
        </div>
    </form>
</template>

<script>
import ApiRequests from "@/ApiRequests";
import OverlayLoader from '@/components/OverlayLoader.vue'
import PageHeader from '@/components/PageHeader.vue'

export default {
    data() {
        return {
            isLoading: false,
            categoryId: null,
            category: {},
        };
    },
    components: {
        OverlayLoader,
        PageHeader
    },
    created() {
        document.title = `Ingredient category information \u22C5 Salt Rim`

        this.categoryId = this.$route.query.id || null;

        if (this.categoryId) {
            this.isLoading = true;

            ApiRequests.fetchIngredientCategory(this.categoryId).then(data => {
                this.isLoading = false
                this.category = data;
            }).catch(e => {
                this.isLoading = false
                this.$toast.error(e.message)
            })
        }
    },
    methods: {
        submit() {
            this.isLoading = true;

            const postData = {
                name: this.category.name,
                description: this.category.description,
            };

            if (this.categoryId) {
                ApiRequests.updateIngredientCategory(this.categoryId, postData).then(data => {
                    this.isLoading = false;
                    this.$toast.default(`Ingredient category updated successfully.`);
                    this.$router.push({ name: 'settings.categories' })
                }).catch(e => {
                    this.$toast.error(e.message);
                    this.isLoading = false;
                })
            } else {
                ApiRequests.saveIngredientCategory(postData).then(data => {
                    this.isLoading = false;
                    this.$toast.default(`Ingredient category added successfully.`);
                    this.$router.push({ name: 'settings.categories' })
                }).catch(e => {
                    this.$toast.error(e.message);
                    this.isLoading = false;
                })
            }
        }
    }
}
</script>

<style scope>

</style>
