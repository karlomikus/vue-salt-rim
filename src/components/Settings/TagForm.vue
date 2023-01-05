<template>
    <PageHeader>
        Tag information
    </PageHeader>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <div class="form-group">
            <label class="form-label form-label--required" for="name">Name:</label>
            <input class="form-input" type="text" id="name" v-model="tag.name" required placeholder="Tag name...">
        </div>
        <div class="form-actions">
            <RouterLink class="button button--outline" :to="{ name: 'settings.tags' }">Cancel</RouterLink>
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
            tagId: null,
            tag: {},
        };
    },
    components: {
        OverlayLoader,
        PageHeader
    },
    created() {
        document.title = `Tag information \u22C5 Salt Rim`

        this.tagId = this.$route.query.id || null;

        if (this.tagId) {
            this.isLoading = true;

            ApiRequests.fetchTag(this.tagId).then(data => {
                this.isLoading = false
                this.tag = data;
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
                name: this.tag.name,
            };

            if (this.tagId) {
                ApiRequests.updateTag(this.tagId, postData).then(() => {
                    this.isLoading = false;
                    this.$toast.default(`Tag updated successfully.`);
                    this.$router.push({ name: 'settings.tags' })
                }).catch(e => {
                    this.$toast.error(e.message);
                    this.isLoading = false;
                })
            } else {
                ApiRequests.saveTag(postData).then(() => {
                    this.isLoading = false;
                    this.$toast.default(`Tag added successfully.`);
                    this.$router.push({ name: 'settings.tags' })
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
