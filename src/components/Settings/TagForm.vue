<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ dialogTitle }}</div>
        <div class="form-group">
            <label class="form-label form-label--required" for="name">{{ $t('name') }}:</label>
            <input id="name" v-model="tag.name" class="form-input" type="text" required>
        </div>
        <div class="dialog-actions">
            <button class="button button--outline" @click.prevent="$emit('tagDialogClosed')">{{ $t('cancel') }}</button>
            <button class="button button--dark" type="submit">{{ $t('save') }}</button>
        </div>
    </form>
</template>

<script>
import OverlayLoader from '@/components/OverlayLoader.vue'
import BarAssistantClient from '@/api/BarAssistantClient'

export default {
    components: {
        OverlayLoader,
    },
    props: {
        sourceTag: {
            type: Object,
            default() {
                return {}
            }
        },
        dialogTitle: {
            type: String,
            default: ''
        },
    },
    emits: ['tagDialogClosed'],
    data() {
        return {
            isLoading: false,
            tag: this.sourceTag,
        }
    },
    methods: {
        submit() {
            this.isLoading = true

            const postData = {
                name: this.tag.name
            }

            if (this.tag.id) {
                BarAssistantClient.updateTag(this.tag.id, postData).then(() => {
                    this.isLoading = false
                    this.$toast.default(this.$t('tag.update-success'))
                    this.$emit('tagDialogClosed')
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false
                })
            } else {
                BarAssistantClient.saveTag(postData).then(() => {
                    this.isLoading = false
                    this.$toast.default(this.$t('tag.add-success'))
                    this.$emit('tagDialogClosed')
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false
                })
            }
        }
    }
}
</script>
