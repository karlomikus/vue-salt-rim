<template>
    <PageHeader>
        Tags
        <template #actions>
            <RouterLink class="button button--outline" :to="{name: 'settings.tags.form'}">Add category</RouterLink>
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
                        <th>Name</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="tag in tags">
                        <td>
                            <RouterLink :to="{name: 'settings.tags.form', query: {id: tag.id}}">{{ tag.name }}</RouterLink>
                        </td>
                        <td style="text-align: right;">
                            <a class="list-group__action" href="#" @click.prevent="deleteTag(tag.id)">Delete</a>
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
            tags: [],
        }
    },
    created() {
        document.title = `Tags \u22C5 Salt Rim`

        this.refreshTags()
    },
    methods: {
        refreshTags() {
            this.isLoading = true;
            ApiRequests.fetchTags().then(data => {
                this.tags = data;
                this.isLoading = false;
            }).catch(e => {
                this.$toast.error(e.message);
            })
        },
        deleteTag(id) {
            this.$confirm('This will permanently delete this tag.', {
                onResolved: (dialog) => {
                    this.isLoading = true
                    dialog.close()
                    ApiRequests.deleteTag(id).then(() => {
                        this.isLoading = false;
                        this.$toast.default(`Tag deleted successfully.`);
                        this.$router.push({ name: 'settings.tags' })
                        this.refreshTags()
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
