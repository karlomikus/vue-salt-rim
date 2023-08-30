<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ $t('note-dialog.title') }}</div>
        <div class="form-group">
            <label class="form-label" for="note">{{ $t('content') }}:</label>
            <textarea id="note" v-model="note.note" rows="5" class="form-input"></textarea>
        </div>
        <div class="dialog-actions">
            <button class="button button--outline" @click.prevent="$emit('noteDialogClosed')">{{ $t('cancel') }}</button>
            <button class="button button--dark" type="submit">{{ $t('save') }}</button>
        </div>
    </form>
</template>

<script>
import ApiRequests from './../../ApiRequests.js';
import OverlayLoader from './../OverlayLoader.vue'

export default {
    components: {
        OverlayLoader,
    },
    props: {
        resourceId: {
            type: Number,
            default: 0
        },
        resource: {
            type: String,
            default: ''
        }
    },
    emits: ['noteDialogClosed'],
    data() {
        return {
            isLoading: false,
            note: {},
        }
    },
    methods: {
        submit() {
            this.isLoading = true
            ApiRequests.saveNote({
                note: this.note.note,
                resource_id: this.resourceId,
                resource: this.resource,
            }).then(() => {
                this.$toast.default(this.$t('note-added'));
                this.isLoading = false
                this.$emit('noteDialogClosed')
            }).catch(e => {
                this.$toast.error(e.message);
                this.isLoading = false
            })
        },
    }
};
</script>

<style scoped>
.public-url {
    background: var(--clr-gray-100);
    padding: 0.5rem;
    font-weight: var(--fw-bold);
    font-size: 1.25rem;
    font-family: monospace;
    border-radius: 0.25rem;
}

.dark-theme .public-url {
    background: var(--clr-gray-900);
}
</style>
