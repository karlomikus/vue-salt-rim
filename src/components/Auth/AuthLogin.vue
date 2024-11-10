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
            <div v-if="baServerAvailable" style="text-align: right; margin-top: 20px;">
                <RouterLink v-if="registrationAllowed" class="button button--outline" :to="{ name: 'register' }">{{ $t('register') }}</RouterLink>
                <button type="submit" class="button button--dark" style="margin-left: 5px;" :disabled="!baServerAvailable">{{ $t('login') }}</button>
                <button type="button" class="button button--dark" @click="loginWithOidc" style="margin-left: 5px;" :disabled="!baServerAvailable">{{ $t('OIDC') }}</button>
            </div>
        </form>
    </div>
</template>

<script>
import BarAssistantClient from '@/api/BarAssistantClient'
import OverlayLoader from './../OverlayLoader.vue'
import SiteLogo from './../Layout/SiteLogo.vue'
import AppState from './../../AppState'

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
            registrationAllowed: window.srConfig.ALLOW_REGISTRATION && window.srConfig.ALLOW_REGISTRATION === 'false' ? false : true,
            server: {},
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
        }
    },
    watch: {
        rememberMe: {
            handler(newVal) {
                localStorage.setItem('sr_remember_login', newVal)
            },
            immediate: true
        }
    },
    created() {
        this.checkIfOidcRedirectBack();
        this.isLoading = true
        BarAssistantClient.getServerVersion().then(resp => {
            this.server = resp.data
            this.isLoading = false

            if (this.isDemo) {
                this.email = 'admin@example.com'
                this.password = 'password'
            }
        }).catch(() => {
            this.isLoading = false
        })
    },
    methods: {
        login() {
            this.isLoading = true
            const appState = new AppState()
            let redirectPath = this.$route.query.redirect

            BarAssistantClient.getLoginToken(this.email, this.password).then(resp => {
                appState.setToken(resp.data.token)
                BarAssistantClient.getProfile().then(profileResp => {
                    appState.setUser(profileResp.data)

                    BarAssistantClient.getBars().then(barsResp => {
                        if (redirectPath == undefined) {
                            if (barsResp.data.length == 1) {
                                appState.setBar(barsResp.data[0])
                                redirectPath = '/'
                            } else {
                                redirectPath = '/bars'
                            }
                        }
                        
                        this.$router.push(redirectPath)
                    })
                }).catch(e => {
                    appState.forgetUser()
                    this.isLoading = false
                    this.$toast.error(e.message)
                })
            }).catch(e => {
                this.isLoading = false
                this.$toast.error(e.message)
            })
        },
        async loginWithOidc() {
            const appState = new AppState();
            let redirectUrl = window.location.origin;
            try {
                const oidcResponse = await BarAssistantClient.oidc(redirectUrl, 'web');
                appState.setOidcCode(oidcResponse.data.code)
                window.location.href = oidcResponse.data.auth_url;
            } catch (e) {
                this.isLoading = false;
                this.$toast.error(e.message);
            }
        },
        async checkIfOidcRedirectBack() {
            const appState = new AppState();
            const oidcCode = appState.getOidcCode();
            if (oidcCode && oidcCode.length > 0) {
                const tokenResp = await BarAssistantClient.oidcToken(oidcCode);
                console.log("tokenResp",tokenResp);

                if (tokenResp && tokenResp.data.token && tokenResp.data.token.length > 0) {
                    appState.forgetOidcCode()
                    appState.setToken(tokenResp.data.token);
                    const profileResp = await BarAssistantClient.getProfile();
                    appState.setUser(profileResp.data);
                    const barsResp = await BarAssistantClient.getBars();
                    let redirectPath;
                    if (!redirectPath) {
                        if (barsResp.data.length === 1) {
                            appState.setBar(barsResp.data[0]);
                            redirectPath = '/';
                        } else {
                            redirectPath = '/bars';
                        }
                    }
                    this.$router.push(redirectPath);
                }
            }
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

.form-label--forgot-password {
    display: flex;
    flex-direction: wrap;
}

.form-label--forgot-password a {
    margin-left: auto;
    font-size: 0.85rem;
}
</style>
