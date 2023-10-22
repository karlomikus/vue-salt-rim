<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ dialogTitle }}</div>
        <div class="form-group">
            <label class="form-label form-label--required" for="name">{{ $t('name') }}:</label>
            <input id="name" v-model="collection.name" class="form-input" type="text" required>
        </div>
        <div class="form-group">
            <label class="form-label" for="description">{{ $t('description') }}:</label>
            <textarea id="description" v-model="collection.description" rows="5" class="form-input"></textarea>
        </div>
        <div class="form-group">
            <label class="form-checkbox" for="share-in-bar">
                <input id="share-in-bar" v-model="collection.is_bar_shared" type="checkbox" :value="true">
                <span>{{ $t('collections.share-in-bar') }}</span>
            </label>
        </div>
        <div class="dialog-actions">
            <button class="button button--outline" @click.prevent="$emit('collectionDialogClosed')">{{ $t('cancel') }}</button>
            <button class="button button--dark" type="submit">{{ $t('save') }}</button>
        </div>
    </form>
</template>

<script>
import ApiRequests from './../../ApiRequests'
import OverlayLoader from './../OverlayLoader.vue'

export default {
    components: {
        OverlayLoader
    },
    props: {
        dialogTitle: {
            type: String,
            default: ''
        },
        sourceCollection: {
            type: Object,
            default() {
                return {}
            }
        }
    },
    emits: ['collectionDialogClosed'],
    data() {
        return {
            isLoading: false,
            collection: this.sourceCollection,
        }
    },
    methods: {
        submit() {
            this.isLoading = true

            const postData = {
                name: this.collection.name,
                description: this.collection.description,
                is_bar_shared: this.collection.is_bar_shared,
            }

            if (this.collection.id) {
                ApiRequests.updateCollection(this.collection.id, postData).then(() => {
                    this.isLoading = false
                    this.$toast.default(this.$t('collections.update-success'))
                    this.$emit('collectionDialogClosed')
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false
                })
            } else {
                ApiRequests.saveCollection(postData).then(() => {
                    this.isLoading = false
                    this.$toast.default(this.$t('collections.add-success'))
                    this.$emit('collectionDialogClosed')
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false
                })
            }
        }
    }
}
</script>
