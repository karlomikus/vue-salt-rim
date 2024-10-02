<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading"></OverlayLoader>
        <div class="dialog-title">{{ $t('bars.join') }}</div>
        <div class="dialog-content">
            <div class="alert alert--info" style="margin: 0 0 1rem 0;">
                <h3>{{ $t('information') }}</h3>
                <p>{{ $t('bars.join-notice') }}</p>
            </div>
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
import OverlayLoader from './../OverlayLoader.vue'
import BarAssistantClient from '@/api/BarAssistantClient';

export default {
    components: {
        OverlayLoader
    },
    emits: ['dialogClosed', 'barJoined'],
    data() {
        return {
            isLoading: false,
            inviteCode: this.$route.params.invite || null,
        }
    },
    methods: {
        submit() {
            this.isLoading = true
            BarAssistantClient.joinBar(this.inviteCode).then(resp => {
                this.isLoading = false
                this.$toast.default(this.$t('bars.join-success', { name: resp.data.name }))
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
