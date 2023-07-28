<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ dialogTitle }}</div>
        <div class="form-group">
            <label class="form-label form-label--required" for="name">{{ $t('name') }}:</label>
            <input class="form-input" type="text" id="name" v-model="collection.name" required>
        </div>
        <div class="form-group">
            <label class="form-label" for="description">{{ $t('description') }}:</label>
            <textarea rows="5" class="form-input" id="description" v-model="collection.description"></textarea>
        </div>
        <div class="dialog-actions">
            <button class="button button--outline" @click.prevent="$emit('collectionDialogClosed')">{{ $t('cancel') }}</button>
            <button class="button button--dark" type="submit">{{ $t('save') }}</button>
        </div>
    </form>
</template>

<script>
import ApiRequests from "@/ApiRequests";
import OverlayLoader from '@/components/OverlayLoader.vue'

export default {
    props: ['sourceCollection', 'dialogTitle'],
    data() {
        return {
            isLoading: false,
            collectionId: null,
            collection: this.sourceCollection,
        };
    },
    components: {
        OverlayLoader
    },
    methods: {
        submit() {
            this.isLoading = true;

            const postData = {
                name: this.collection.name,
                description: this.collection.description,
            };

            if (this.collection.id) {
                ApiRequests.updateCollection(this.collection.id, postData).then(data => {
                    this.isLoading = false;
                    this.$toast.default(this.$t('category.update-success'));
                    this.$emit('collectionDialogClosed')
                }).catch(e => {
                    this.$toast.error(e.message);
                    this.isLoading = false;
                })
            } else {
                ApiRequests.saveCollection(postData).then(data => {
                    this.isLoading = false;
                    this.$toast.default(this.$t('category.add-success'));
                    this.$emit('collectionDialogClosed')
                }).catch(e => {
                    this.$toast.error(e.message);
                    this.isLoading = false;
                })
            }
        }
    }
}
</script>
