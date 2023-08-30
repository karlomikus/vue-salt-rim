<template>
    <div class="login-page">
        <SiteLogo></SiteLogo>
        <form @submit.prevent="register">
            <OverlayLoader v-if="isLoading"></OverlayLoader>
            <div class="form-group">
                <label class="form-label form-label--required" for="email">{{ $t('email') }}:</label>
                <input class="form-input" type="email" id="email" v-model="newUser.email" required>
            </div>
            <div class="form-group">
                <label class="form-label form-label--required" for="password">{{ $t('password') }}:</label>
                <input class="form-input" type="password" id="password" v-model="newUser.password" required>
            </div>
            <div class="form-group">
                <label class="form-label form-label--required" for="password-repeat">{{ $t('repeat-password') }}:</label>
                <input class="form-input" type="password" id="password-repeat" v-model="newUser.passwordRepeat" required>
            </div>
            <div class="form-group">
                <label class="form-label form-label--required" for="name">{{ $t('user.name') }}:</label>
                <input class="form-input" type="text" id="name" v-model="newUser.name" required>
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
    data() {
        return {
            isLoading: false,
            newUser: {}
        }
    },
    components: {
        OverlayLoader,
        SiteLogo
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
