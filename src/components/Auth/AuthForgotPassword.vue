<template>
    <div class="login-page">
        <SiteLogo></SiteLogo>
        <form @submit.prevent="requestPasswordReset">
            <OverlayLoader v-if="isLoading"></OverlayLoader>
            <h2>{{ $t('auth.password-forgot') }}</h2>
            <p style="margin-bottom: 1rem; font-size: 0.85rem; line-height: 1.4;">{{ $t('auth.password-forgot-help-text') }}</p>
            <div class="form-group">
                <label class="form-label" for="email">{{ $t('email') }}:</label>
                <input id="email" v-model="email" class="form-input" type="email" required>
            </div>
            <div style="text-align: right; margin-top: 20px;">
                <RouterLink class="button button--outline" :to="{ name: 'login' }">{{ $t('cancel') }}</RouterLink>
                <button type="submit" class="button button--dark" style="margin-left: 5px;">{{ $t('continue') }}</button>
            </div>
        </form>
    </div>
</template>

<script>
import BarAssistantClient from '@/api/BarAssistantClient';
import OverlayLoader from './../OverlayLoader.vue'
import SiteLogo from './../Layout/SiteLogo.vue'

export default {
    components: {
        OverlayLoader,
        SiteLogo
    },
    data() {
        return {
            isLoading: false,
            email: null,
        }
    },
    methods: {
        requestPasswordReset() {
            this.isLoading = true
            BarAssistantClient.requestPasswordResetEmail(this.email).then(() => {
                this.$toast.default(this.$t('auth.reset-email-sent'))
                this.$router.push('/login')
            }).catch(() => {
                this.isLoading = false
                this.$toast.default(this.$t('auth.reset-email-sent'))
                this.$router.push('/login')
            })
        }
    }
}
</script>
