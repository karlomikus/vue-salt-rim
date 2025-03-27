<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BarAssistantClient from '@/api/BarAssistantClient'
import ProviderList from './ProviderList.vue'
import SiteLogo from './../Layout/SiteLogo.vue'
import AppState from '../../AppState'
import type { components } from '@/api/api'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useSaltRimToast } from '@/composables/toast'
import SaltRimSpinner from '../SaltRimSpinner.vue'
import { useI18n } from 'vue-i18n'

type ServerVersion = components["schemas"]["ServerVersion"]
type SSOProvider = components["schemas"]["SSOProvider"]

const { t } = useI18n()
const toast = useSaltRimToast();
const router = useRouter()
const apiServerAvailable = ref<boolean|null>(null)
const isLoading = ref(false)
const isLoadingAuth = ref(false)
const email = ref<null | string>(null)
const password = ref<null | string>(null)
const rememberMe = ref(localStorage.getItem('sr_remember_login') ?? true)
const baServer = window.srConfig.API_URL
const registrationAllowed = window.srConfig.ALLOW_REGISTRATION && window.srConfig.ALLOW_REGISTRATION === 'false' ? false : true
const server = ref<ServerVersion>()
const providers = ref<SSOProvider[]>()

const isDemo = computed(() => {
    return window.srConfig.ENV === 'demo'
})

const showForgotPassword = computed(() => {
    return window.srConfig.MAILS_ENABLED === true
})

const enabledProviders = computed(() => {
    return providers.value?.filter(p => p.enabled) ?? []
})

watch(rememberMe, (newVal) => {
    localStorage.setItem('sr_remember_login', newVal.toString())
}, { immediate: true })

async function checkServerStatus() {
    isLoading.value = true
    try {
        providers.value = (await BarAssistantClient.getProvidersList())?.data ?? []
        server.value = (await BarAssistantClient.getServerVersion())?.data
        apiServerAvailable.value = true
    } catch (e: any) {
        apiServerAvailable.value = false
    } finally {
        isLoading.value = false
    }

    if (isDemo.value) {
        email.value = 'admin@example.com'
        password.value = 'password'
    }
}

async function login() {
    isLoadingAuth.value = true
    const appState = new AppState()

    if (email.value == null || password.value == null) {
        toast.default('Please provide valid login information')

        return
    }

    try {
        const token = (await BarAssistantClient.getLoginToken(email.value, password.value))?.data.token

        if (token) {
            if (server.value) {
                appState.setServerSettings(server.value.is_feeds_enabled, server.value.is_password_login_enabled)
            }
            const redirectUrl = await useAuth(token)
            router.push(redirectUrl)
        }
    } catch (e: any) {
        toast.default(e.message)
        appState.forgetUser()
        isLoadingAuth.value = false
        return
    } finally {
        isLoadingAuth.value = false
    }
}

checkServerStatus()
</script>

<template>
    <div class="login-page">
        <SiteLogo></SiteLogo>
        <form @submit.prevent="login" class="login-page__form">
            <div style="text-align: center;" v-if="isLoading">
                <SaltRimSpinner :size="64"></SaltRimSpinner>
            </div>
            <template v-if="apiServerAvailable === true">
                <div v-if="isDemo" class="login-page__demo-notice">
                    Welcome to Bar Assistant Demo instance. Use <code>admin@example.com</code> as email, and <code>password</code> as password to login.
                </div>
                <template v-if="server?.is_password_login_enabled ?? true">
                    <div class="form-group">
                        <label class="form-label" for="email">{{ t('email') }}:</label>
                        <input id="email" v-model="email" class="form-input" type="email" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label form-label--forgot-password" for="password">{{ t('password') }}: <RouterLink v-if="showForgotPassword" :to="{name: 'forgot-password'}">Forgot password?</RouterLink></label>
                        <input id="password" v-model="password" class="form-input" type="password" required>
                    </div>
                    <div class="form-group">
                        <label class="form-checkbox" for="share-in-bar">
                            <input id="share-in-bar" v-model="rememberMe" type="checkbox" :value="true">
                            <span>{{ t('remember-me') }}</span>
                        </label>
                    </div>
                    <div class="login-page__form__actions">
                        <SaltRimSpinner v-if="isLoadingAuth" :size="32" style="margin-right: auto;"></SaltRimSpinner>
                        <RouterLink v-if="registrationAllowed" class="button button--outline" :to="{ name: 'register' }">{{ t('register') }}</RouterLink>
                        <button type="submit" class="button button--dark" style="margin-left: 5px;">{{ t('login') }}</button>
                    </div>
                </template>
                <template v-if="providers && enabledProviders.length > 0">
                    <div class="login-or-separator" v-if="server?.is_password_login_enabled ?? true">
                        <div class="login-or-separator__line"></div>
                        <span class="login-or-separator__text">{{ t('or') }}</span>
                        <div class="login-or-separator__line"></div>
                    </div>
                    <ProviderList :providers="enabledProviders"></ProviderList>
                </template>
            </template>
            <p v-if="apiServerAvailable === false">
                Unable to connect to "{{ baServer }}" API server. Make sure the server is running and accessible. Check your browser console for more information.
                <br>
                <a href="https://docs.barassistant.app/faq/" target="_blank">Click here to learn more</a>
            </p>
        </form>
    </div>
</template>

<style scoped>
.login-page__demo-notice {
    text-wrap: balance;
}

.login-page__demo-notice code {
    color: var(--clr-accent-700);
    background-color: var(--clr-accent-100);
}

.form-label--forgot-password {
    display: flex;
    flex-direction: wrap;
}

.form-label--forgot-password a {
    margin-left: auto;
    font-size: 0.85rem;
}

.login-page__form {
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-3);
}

.login-page__form > .form-group {
    margin-bottom: 0;
}

.login-page__form__actions {
    text-align: right;
    justify-content: end;
    display: flex;
}

.login-or-separator {
    display: flex;
    align-items: center;
}

.login-or-separator__line {
    flex: 1;
    height: 1px;
    background-color: var(--clr-dark-main-200);
}

.login-or-separator__text {
    margin: 0 1rem;
    text-transform: uppercase;
    font-size: 0.85rem;
    color: var(--clr-dark-main-500);
}
</style>
