<template>
    <div class="login-page">
        <SiteLogo noLink />

        <div class="card">

            <SaltRimSpinner v-if="isLoading" />

            <div class="oidc-callback__error" v-if="error">
                <span class="oidc-callback__error__message">{{ error }}</span>
                <span>
                    <RouterLink to="/login">{{ $t('auth.login-again') }}</RouterLink>
                </span>
            </div>

            <div class="oidc-callback__success" v-if="isSuccess">
                <span class="oidc-callback__success__message">{{ $t('auth.redirecting') }}</span>
            </div>

        </div>

    </div>
</template>

<script>
import AppState from '../../AppState'
import SiteLogo from '../Layout/SiteLogo.vue';
import SaltRimSpinner from '../SaltRimSpinner.vue';
import { RouterLink } from 'vue-router';
import BarAssistantClient from '@/api/BarAssistantClient';
import { PROVIDER_ID_KEY } from '@/api/OIDC';
import { initAppState } from '@/api/Auth';

export default {
    components: {
        SaltRimSpinner,
        SiteLogo
    },
    data() {
        return {
            isLoading: true,
            isSuccess: false,
            error: null,
        }
    },
    async created() {
        const config = await BarAssistantClient.getAuthConfig()

        const code = new URLSearchParams(window.location.search).get('code')
        const state = new URLSearchParams(window.location.search).get('state')

        if (!code || !state) {
            this.error = 'Error: Code or state missing'
            this.isLoading = false
            return
        }

        const providerId = localStorage.getItem(PROVIDER_ID_KEY)

        if (!providerId) {
            this.error = 'Error: Provider missing in storage'
            this.isLoading = false
            return
        }

        const provider = config.data.oauthProviders.find(p => p.id === providerId)

        if (!provider) {
            this.error = 'Error: Provider not found in configuration'
            this.isLoading = false
            return
        }

        const fromLocalStorage = localStorage.getItem(`oidc.${state}`)

        if (!fromLocalStorage) {
            this.error = 'Error: Invalid state'
            this.isLoading = false
            return
        }

        const verifier = JSON.parse(fromLocalStorage).code_verifier

        if (!verifier) {
            this.error = 'Error: Code verifier missing'
            this.isLoading = false
            return
        }

        const appState = new AppState()

        try {
            await BarAssistantClient.loginWithOAuth(
                providerId,
                code,
                verifier
            )

            this.isSuccess = true
            this.isLoading = false

            const redirectPath = await initAppState({
                appState,
                redirectPath: this.$route.query.redirect,
            })

            // make sure we don't send a token to the server
            appState.setToken(null)

            this.$router.push(redirectPath)
        } catch (e) {
            appState.forgetUser()
            this.error = e.message
            this.isLoading = false
        }

    },
}
</script>

<style scoped>
.card {
    text-align: center;
    margin-top: 20px;
    background: var(--clr-lp-form-bg);
    width: 100%;
    max-width: 400px;
    padding: 30px;
    border-radius: var(--radius-3);
    border-top: 3px solid #fff;
    box-shadow: var(--shadow-elevation-high-dark);
}

.oidc-callback__error {
    display: flex;
    flex-direction: column;
    gap: 1rem
}

.oidc-callback__error__message {
    color: var(--clr-red);
}

.oidc-callback__options {
    text-align: left;
}

.oidc-callback__options__create-new {
    text-align: center;
}

.oidc-callback__form {
    margin: 0;
    background: none;
    max-width: unset;
    padding: 0;
    border: none;
    box-shadow: none;
}

.oidc-callback__form h2 {
    margin-bottom: 1rem;
}

.oidc-callback__form__buttons {
    text-align: right;
}
</style>
