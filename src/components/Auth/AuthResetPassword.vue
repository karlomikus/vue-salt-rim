<template>
    <div class="login-page">
        <SiteLogo></SiteLogo>
        <form @submit.prevent="requestPasswordReset">
            <OverlayLoader v-if="isLoading"></OverlayLoader>
            <h2 style="margin-bottom: 1rem;">{{ $t('auth.reset-password') }}</h2>
            <div class="form-group">
                <label class="form-label form-label--required" for="email">{{ $t('email') }}:</label>
                <input id="email" v-model="reset.email" class="form-input" type="email" required>
            </div>
            <div class="form-group">
                <label class="form-label form-label--required" for="password">{{ $t('password') }}:</label>
                <input id="password" v-model="reset.password" class="form-input" type="password" required>
            </div>
            <div class="form-group">
                <label class="form-label form-label--required" for="password-repeat">{{ $t('repeat-password') }}:</label>
                <input id="password-repeat" v-model="reset.passwordRepeat" class="form-input" type="password" required>
            </div>
            <div style="text-align: right; margin-top: 20px;">
                <RouterLink class="button button--outline" :to="{ name: 'login' }">{{ $t('cancel') }}</RouterLink>
                <button type="submit" class="button button--dark" style="margin-left: 5px;">{{ $t('auth.reset-password-reset') }}</button>
            </div>
        </form>
    </div>
</template>

<script>
import ApiRequests from './../../ApiRequests.js'
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
            reset: {},
        }
    },
    methods: {
        requestPasswordReset() {
            const token = this.$route.query.token || null

            const postData = {
                'token': token,
                'email': this.reset.email,
                'password': this.reset.password,
                'password_confirmation': this.reset.passwordRepeat,
            }

            this.isLoading = true
            ApiRequests.passwordReset(postData).then(() => {
                this.$toast.default(this.$t('auth.password-reset-success'))
                this.$router.push('/login')
            }).catch(() => {
                this.isLoading = false
                this.$toast.error(this.$t('auth.password-reset-error'))
            })
        }
    }
}
</script>
