<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading"></OverlayLoader>
        <div class="dialog-title">{{ $t('bars.join') }}</div>
        <div class="dialog-content">
            <p style="margin-bottom: 1rem;">
                {{ $t('bars.join-notice') }}
            </p>
            <div class="form-group">
                <label class="form-label form-label--required" for="bar-invite-code">{{ $t('bars.invite-code') }}:</label>
                <input id="bar-invite-code" v-model="inviteCode" class="form-input" type="text" required>
            </div>
        </div>
        <div class="dialog-actions" style="margin-top: 1rem">
            <button type="button" class="button button--outline" @click="$emit('dialogClosed')">{{ $t('cancel') }}</button>
            <button type="submit" class="button button--dark">{{ $t('save') }}</button>
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
    emits: ['dialogClosed', 'barJoined'],
    data() {
        return {
            isLoading: false,
            inviteCode: null,
        }
    },
    methods: {
        submit() {
            this.isLoading = true
            ApiRequests.joinBar({
                invite_code: this.inviteCode,
            }).then(data => {
                this.isLoading = false
                this.$toast.default(this.$t('bars.join-success', { name: data.name }))
                this.$emit('dialogClosed')
                this.$emit('barJoined')
            }).catch(() => {
                this.isLoading = false
                this.$toast.error(this.$t('bars.join-error'))
            })
        }
    }
}
</script>
