<template>
    <div class="login-page">
        <SiteLogo></SiteLogo>
        <form @submit.prevent="register">
            <OverlayLoader v-if="isLoading"></OverlayLoader>
            <div class="form-group">
                <label class="form-label form-label--required" for="email">{{ $t('email') }}:</label>
                <input id="email" v-model="newUser.email" class="form-input" type="email" required>
            </div>
            <div class="form-group">
                <label class="form-label form-label--required" for="password">{{ $t('password') }}:</label>
                <input id="password" v-model="newUser.password" class="form-input" type="password" required>
            </div>
            <div class="form-group">
                <label class="form-label form-label--required" for="password-repeat">{{ $t('repeat-password') }}:</label>
                <input id="password-repeat" v-model="newUser.passwordRepeat" class="form-input" type="password" required>
            </div>
            <div class="form-group">
                <label class="form-label form-label--required" for="name">{{ $t('user.name') }}:</label>
                <input id="name" v-model="newUser.name" class="form-input" type="text" required>
            </div>
            <div style="text-align: right; margin-top: 20px;">
                <RouterLink class="button button--outline" :to="{ name: 'login' }">{{ $t('cancel') }}</RouterLink>
                <button type="submit" class="button button--dark" style="margin-left: 5px;">{{ $t('register') }}</button>
            </div>
        </form>
    </div>
</template>

<script>
import ApiRequests from './../../ApiRequests.js';
import OverlayLoader from './../OverlayLoader.vue';
import SiteLogo from './../Layout/SiteLogo.vue';

export default {
    components: {
        OverlayLoader,
        SiteLogo
    },
    data() {
        return {
            isLoading: false,
            newUser: {}
        }
    },
    methods: {
        register() {
            const postData = {
                'email': this.newUser.email,
                'password': this.newUser.password,
                'name': this.newUser.name,
            };

            if (this.newUser.password != this.newUser.passwordRepeat) {
                this.$toast.error(this.$t('passwords-not-match'))
                return;
            }

            this.isLoading = true
            ApiRequests.registerNewUser(postData).then(() => {
                this.$toast.default(this.$t('register-success'))
                this.$router.push('/login');
            }).catch(e => {
                this.isLoading = false
                this.$toast.error(e.message)
            });
        }
    }
}
</script>
