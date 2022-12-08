<template>
    <PageHeader>
        Glass type information
    </PageHeader>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <div class="form-group">
            <label class="form-label form-label--required" for="name">Name:</label>
            <input class="form-input" type="text" id="name" v-model="glass.name" required placeholder="Glass name...">
        </div>
        <div class="form-group">
            <label class="form-label" for="description">Description:</label>
            <textarea rows="5" class="form-input" id="description" v-model="glass.description" placeholder="Glass description..."></textarea>
        </div>
        <div class="form-actions">
            <RouterLink class="button button--outline" :to="{ name: 'settings.glasses' }">Cancel</RouterLink>
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
            glassId: null,
            glass: {},
        };
    },
    components: {
        OverlayLoader,
        PageHeader
    },
    created() {
        document.title = `Glass type information \u22C5 Salt Rim`

        this.glassId = this.$route.query.id || null;

        if (this.glassId) {
            this.isLoading = true;

            ApiRequests.fetchGlass(this.glassId).then(data => {
                this.isLoading = false
                this.glass = data;
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
                name: this.glass.name,
                description: this.glass.description,
            };

            if (this.glassId) {
                ApiRequests.updateGlass(this.glassId, postData).then(() => {
                    this.isLoading = false;
                    this.$toast.default(`Glass updated successfully.`);
                    this.$router.push({ name: 'settings.glasses' })
                }).catch(e => {
                    this.$toast.error(e.message);
                    this.isLoading = false;
                })
            } else {
                ApiRequests.saveGlass(postData).then(() => {
                    this.isLoading = false;
                    this.$toast.default(`Glass added successfully.`);
                    this.$router.push({ name: 'settings.glasses' })
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
