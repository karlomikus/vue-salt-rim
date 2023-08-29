<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading"></OverlayLoader>
        <div class="dialog-title">{{ $t('bars.join') }}</div>
        <div class="dialog-content">
            <div class="form-group">
                <label class="form-label form-label--required" for="bar-invite-code">{{ $t('bars.invite-code') }}:</label>
                <input class="form-input" type="text" id="bar-invite-code" v-model="inviteCode" required>
            </div>
        </div>
        <div class="dialog-actions" style="margin-top: 1rem">
            <button type="button" class="button button--outline" @click="$emit('dialogClosed')">{{ $t('cancel') }}</button>
            <button type="submit" class="button button--dark">{{ $t('save') }}</button>
        </div>
    </form>
</template>
<script>
import ApiRequests from './../../ApiRequests';
import OverlayLoader from './../OverlayLoader.vue';

export default {
    data() {
        return {
            isLoading: false,
            inviteCode: null,
        }
    },
    components: {
        OverlayLoader
    },
    methods: {
        submit() {
            this.isLoading = true;
            ApiRequests.joinBar({
                invite_code: this.inviteCode,
            }).then(data => {
                this.isLoading = false;
                this.$toast.default(this.$t('bars.join-success', { name: data.name }));
                this.$emit('dialogClosed')
                this.$emit('barJoined')
            }).catch(e => {
                this.$toast.error(e.message);
            })
        }
    }
}
</script>
