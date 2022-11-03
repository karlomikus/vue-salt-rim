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
            <div class="form-group">
                <label class="form-label" for="email">Email:</label>
                <input class="form-input" type="email" id="email" v-model="email" required>
            </div>
            <div class="form-group">
                <label class="form-label" for="password">Password:</label>
                <input class="form-input" type="password" id="password" v-model="password" required>
            </div>
            <p>Bar Assistant server: <strong>{{ baServer }}</strong></p>
            <div style="text-align: right;">
                <button type="submit" class="button button--dark">Login</button>
            </div>
        </form>
    </div>
</template>

<script>
import Auth from '../Auth'
import ApiRequests from '@/ApiRequests';

const api = new ApiRequests();

export default {
    data() {
        return {
            email: null,
            password: null,
            baServer: window.srConfig.API_URL
        }
    },
    methods: {
        login() {
            const redirectPath = this.$route.query.redirect || '/'

            api.fetchLoginToken(this.email, this.password).then(token => {
                Auth.rememberToken(token)
                api.fetchUser().then(userData => {
                    Auth.rememberUser(userData)

                    this.$router.push(redirectPath);
                })
            }).catch(errorResponse => {
                errorResponse.json().then(body => {
                    this.$toast.error(body.message)
                })
            });
        }
    }
}
</script>

<style scope>
.login-page {
    background-color: var(--color-site-header);
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 10px;
}

.login-page form {
    margin-top: 20px;
    background-color: var(--color-bg);
    width: 100%;
    max-width: 400px;
    padding: 30px;
    border-radius: 20px;
}
</style>
