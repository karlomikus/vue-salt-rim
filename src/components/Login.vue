<template>
    <div class="login-page">
        <div class="site-logo">
            <div class="site-logo__image">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M11 19v-5.111L3 5V3h18v2l-8 8.889V19h5v2H6v-2h5zM7.49 7h9.02l1.8-2H5.69l1.8 2z" />
                </svg>
            </div>
            <h1 class="site-logo__title">
                Salt Rim
                <span>Your personal bar assistant</span>
            </h1>
        </div>
        <form @submit.prevent="login">
            <OverlayLoader v-if="isLoading"></OverlayLoader>
            <div class="form-group">
                <label class="form-label" for="email">Email:</label>
                <input class="form-input" type="email" id="email" v-model="email" required>
            </div>
            <div class="form-group">
                <label class="form-label" for="password">Password:</label>
                <input class="form-input" type="password" id="password" v-model="password" required>
            </div>
            <p>
                Bar Assistant server:<br>
                <strong>{{ baServer }}</strong><br>
                <template v-if="server.version">
                    Status: Available &middot; {{ server.version }}
                </template>
                <template v-else>
                    Status: Not available
                </template>
            </p>
            <div style="text-align: right; margin-top: 20px;">
                <RouterLink class="button button--outline" :to="{ name: 'register' }">Register</RouterLink>
                <button type="submit" class="button button--dark" style="margin-left: 5px;">Login</button>
            </div>
        </form>
    </div>
</template>

<script>
import Auth from '../Auth'
import ApiRequests from '@/ApiRequests';
import OverlayLoader from '@/components/OverlayLoader.vue';

export default {
    data() {
        return {
            isLoading: false,
            email: null,
            password: null,
            baServer: window.srConfig.API_URL,
            server: {}
        }
    },
    components: {
        OverlayLoader: OverlayLoader
    },
    created() {
        this.isLoading = true
        ApiRequests.fetchApiVersion().then(data => {
            this.server = data
            this.isLoading = false
        }).catch(() => {
            this.isLoading = false
        })
    },
    methods: {
        login() {
            this.isLoading = true
            const redirectPath = this.$route.query.redirect || '/'

            ApiRequests.fetchLoginToken(this.email, this.password).then(token => {
                Auth.rememberToken(token)
                ApiRequests.fetchUser().then(userData => {
                    Auth.rememberUser(userData)

                    this.$router.push(redirectPath);
                })
            }).catch(e => {
                this.isLoading = false
                this.$toast.error(e.message)
            });
        }
    }
}
</script>
