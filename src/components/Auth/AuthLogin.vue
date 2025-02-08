<template>
    <div class="login-page">
        <SiteLogo></SiteLogo>
        <form @submit.prevent="login">
            <div v-if="isDemo" class="login-page__demo-notice">
                Welcome to Bar Assistant Demo instance. Use <code>admin@example.com</code> as email, and <code>password</code> as password to login.
            </div>
            <div class="form-group">
                <label class="form-label" for="email">{{ $t('email') }}:</label>
                <input id="email" v-model="email" class="form-input" type="email" required>
            </div>
            <div class="form-group">
                <label class="form-label form-label--forgot-password" for="password">{{ $t('password') }}: <RouterLink v-if="showForgotPassword" :to="{name: 'forgot-password'}">Forgot password?</RouterLink></label>
                <input id="password" v-model="password" class="form-input" type="password" required>
            </div>
            <div class="form-group">
                <label class="form-checkbox" for="share-in-bar">
                    <input id="share-in-bar" v-model="rememberMe" type="checkbox" :value="true">
                    <span>{{ $t('remember-me') }}</span>
                </label>
            </div>
            <div class="server-status" v-if="!baServerAvailable">
                <div class="server-status__status">
                    Unable to connect to "{{ baServer }}" API server. <a href="https://docs.barassistant.app/faq/" target="_blank">Learn more</a>.
                </div>
            </div>
            <div v-if="baServerAvailable && localLoginEnabled" style="text-align: right; margin-top: 20px;">
                <RouterLink v-if="registrationAllowed" class="button button--outline" :to="{ name: 'register' }">{{
                    $t('register') }}</RouterLink>
                <button type="submit" class="button button--dark" style="margin-left: 5px;"
                    :disabled="!baServerAvailable">{{ $t('login') }}</button>
            </div>
            <div v-if="baServerAvailable && oauthLoginEnabled" class="login-page__oauth-login">
                <button v-for="provider in providers" key="provider.name" @click="oauthLogin(provider)" :class="[
                    'button',
                    'button--outline',
                    'login-page__oauth-login-button',
                    `login-page__oauth-login-button-${provider.type}`
                ]" type="button">
                    <img :src="`/oauth-icons/${provider.icon}`" alt="oauth login icon" width="24" height="24">
                    <span>{{ $t('auth.login-oauth', { name: provider.name }) }}</span>
                </button>
            </div>
        </form>
    </div>
</template>

<script>
import BarAssistantClient from '@/api/BarAssistantClient'
import OverlayLoader from './../OverlayLoader.vue'
import SiteLogo from './../Layout/SiteLogo.vue'
import AppState from './../../AppState'
import { createUserManager, PROVIDER_ID_KEY } from '@/api/OIDC';
import { initAppState } from '@/api/Auth';

export default {
    components: {
        OverlayLoader,
        SiteLogo
    },
    data() {
        return {
            isLoading: false,
            email: null,
            password: null,
            rememberMe: localStorage.getItem('sr_remember_login') ?? true,
            baServer: window.srConfig.API_URL,
            registrationAllowed: window.srConfig.ALLOW_REGISTRATION !== false,
            server: {},
            providers: [],
            localLoginEnabled: false,
            oauthLoginEnabled: false,
            oauthLoginSelfRegistrationEnabled: false,
        }
    },
    computed: {
        baServerAvailable() {
            return this.server.version != null
        },
        isDemo() {
            return window.srConfig.ENV === 'demo'
        },
        showForgotPassword() {
            return window.srConfig.MAILS_ENABLED === true
        },
    },
    watch: {
        rememberMe: {
            handler(newVal) {
                localStorage.setItem('sr_remember_login', newVal)
            },
            immediate: true
        }
    },
    async created() {
        this.isLoading = true

        try {
            const [serverVersion, authConfig] = await Promise.all([
                BarAssistantClient.getServerVersion(),
                BarAssistantClient.getAuthConfig(),
            ])

            this.server = serverVersion.data
            this.localLoginEnabled = authConfig.data.localLoginEnabled
            this.oauthLoginEnabled = authConfig.data.oauthLoginEnabled
            this.providers = authConfig.data.oauthProviders

            this.isLoading = false

            if (this.isDemo) {
                this.email = 'admin@example.com'
                this.password = 'password'
            }
        } catch (err) {
            this.isLoading = false
        }
    },
    methods: {
        async login() {
            this.isLoading = true
            const appState = new AppState()

            try {
                const token = await BarAssistantClient.getLoginToken(this.email, this.password)

                const redirectPath = await initAppState({
                    token: token.data.token,
                    appState: appState,
                    redirectPath: this.$route.query.redirect,
                })

                this.$router.push(redirectPath)
            } catch (err) {
                appState.forgetUser()
                this.isLoading = false
                this.$toast.error(err.message)
            }
        },
        oauthLogin(provider) {
            localStorage.setItem(PROVIDER_ID_KEY, provider.id)
            createUserManager(provider).signinRedirect()
        }
    }
}
</script>

<style scoped>
.server-status {
    background: #fff;
    margin-bottom: 1rem;
    padding: 0.5rem;
    border-radius: var(--radius-1);
    box-shadow: var(--shadow-elevation-medium);
}

.dark-theme .server-status {
    background-image: var(--clr-dark-main-950);
    border: 0;
}

.server-status__title {
    font-size: 0.75rem;
}

.server-status__url {
    font-weight: var(--fw-bold);
}

.server-status__status {
    font-size: 0.85rem;
}

.login-page__demo-notice {
    font-size: 0.8rem;
    margin-bottom: 1rem;
}

.login-page__demo-notice code {
    color: var(--clr-accent-700);
}

.login-page__oauth-login {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: center;
    margin-top: 2rem;
}

.form-label--forgot-password {
    display: flex;
    flex-direction: wrap;
}

.form-label--forgot-password a {
    margin-left: auto;
    font-size: 0.85rem;
}

.login-page__oauth-login-button {
    display: flex;
}

.login-page__oauth-login-button img {
    margin-right: auto;
}

.login-page__oauth-login-button span {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
}

.login-page__oauth-login-button-google {
    background: #fff;
    color: var(--clr-gray-950);
}

.login-page__oauth-login-button-facebook {
    background: #3b5998;
    color: #fff;
}

.login-page__oauth-login-button-facebook:hover {
    color: #fff;
}

.login-page__oauth-login-button-oidc {
    background: #fff;
    color: var(--clr-gray-950)
}
</style>
