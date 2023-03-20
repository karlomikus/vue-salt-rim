<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ dialogTitle }}</div>
        <div class="form-group">
            <label class="form-label form-label--required" for="name">{{ $t('name') }}:</label>
            <input class="form-input" type="text" id="name" v-model="tag.name" required>
        </div>
        <div class="dialog-actions">
            <button class="button button--outline" @click.prevent="$emit('tagDialogClosed')">{{ $t('cancel') }}</button>
            <button class="button button--dark" type="submit">{{ $t('save') }}</button>
        </div>
    </form>
</template>

<script>
import ApiRequests from "@/ApiRequests";
import OverlayLoader from '@/components/OverlayLoader.vue'

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
                    this.$toast.default(this.$t('tag.update-success'));
                    this.$emit('tagDialogClosed')
                }).catch(e => {
                    this.$toast.error(e.message);
                    this.isLoading = false;
                })
            } else {
                ApiRequests.saveTag(postData).then(() => {
                    this.isLoading = false;
                    this.$toast.default(this.$t('tag.add-success'));
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
