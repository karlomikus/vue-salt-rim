<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ dialogTitle }}</div>
        <div class="form-group">
            <label class="form-label form-label--required" for="name">Name:</label>
            <input class="form-input" type="text" id="name" v-model="tag.name" required placeholder="Tag name...">
        </div>
        <div class="dialog-actions">
            <button class="button button--outline" @click.prevent="$emit('tagDialogClosed')">Cancel</button>
            <button class="button button--dark" type="submit">Save</button>
        </div>
    </form>
</template>

<script>
import ApiRequests from "@/ApiRequests";
import OverlayLoader from '@/components/OverlayLoader.vue'
import PageHeader from '@/components/PageHeader.vue'

export default {
    props: ['sourceTag', 'dialogTitle'],
    data() {
        return {
            isLoading: false,
            tag: this.sourceTag,
        };
    },
    components: {
        OverlayLoader,
        PageHeader
    },
    methods: {
        submit() {
            this.isLoading = true;

            const postData = {
                name: this.tag.name,
            };

            if (this.tag.id) {
                ApiRequests.updateTag(this.tag.id, postData).then(() => {
                    this.isLoading = false;
                    this.$toast.default(`Tag updated successfully.`);
                    this.$emit('tagDialogClosed')
                }).catch(e => {
                    this.$toast.error(e.message);
                    this.isLoading = false;
                })
            } else {
                ApiRequests.saveTag(postData).then(() => {
                    this.isLoading = false;
                    this.$toast.default(`Tag added successfully.`);
                    this.$emit('tagDialogClosed')
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
