<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BarAssistantClient from '@/api/BarAssistantClient'
import ProviderList from './ProviderList.vue'
import OverlayLoader from './../OverlayLoader.vue'
import SiteLogo from './../Layout/SiteLogo.vue'
import AppState from '../../AppState'
import type { components } from '@/api/api'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useSaltRimToast } from '@/composables/toast'
import SaltRimSpinner from '../SaltRimSpinner.vue'

type ServerVersion = components["schemas"]["ServerVersion"]
type SSOProvider = components["schemas"]["SSOProvider"]

const toast = useSaltRimToast();
const router = useRouter()
const isLoading = ref(false)
const isLoadingProviders = ref(false)
const email = ref<null | string>(null)
const password = ref<null | string>(null)
const rememberMe = ref(localStorage.getItem('sr_remember_login') ?? true)
const baServer = ref(window.srConfig.API_URL)
const registrationAllowed = ref(window.srConfig.ALLOW_REGISTRATION && window.srConfig.ALLOW_REGISTRATION === 'false' ? false : true)
const server = ref<ServerVersion>()
const providers = ref<SSOProvider[]>()

const baServerAvailable = computed(() => {
    return server.value?.version != null
})

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

async function refreshServerVersion() {
    fetchListOfProviders()
    isLoading.value = true
    server.value = (await BarAssistantClient.getServerVersion())?.data
    isLoading.value = false

    if (isDemo.value) {
        email.value = 'admin@example.com'
        password.value = 'password'
    }
}

async function fetchListOfProviders() {
    isLoadingProviders.value = true
    providers.value = (await BarAssistantClient.getProvidersList())?.data ?? []
    isLoadingProviders.value = false
}

async function login() {
    isLoading.value = true
    const appState = new AppState()

    if (email.value == null || password.value == null) {
        toast.default('Please provide valid login information')

        return
    }

    try {
        const token = (await BarAssistantClient.getLoginToken(email.value, password.value))?.data.token

        if (token) {
            const redirectUrl = await useAuth(token)
            router.push(redirectUrl)
        }
    } catch (e: any) {
        toast.default(e.message)
        appState.forgetUser()
        isLoading.value = false
        return
    } finally {
        isLoading.value = false
    }
}

refreshServerVersion()
</script>

<template>
    <div class="login-page">
        <SiteLogo></SiteLogo>
        <form @submit.prevent="login">
            <div v-if="isDemo" class="login-page__demo-notice">
                Welcome to Bar Assistant Demo instance. Use <code>admin@example.com</code> as email, and <code>password</code> as password to login.
            </div>
            <div v-if="baServerAvailable && providers && enabledProviders.length > 0">
                <OverlayLoader v-if="isLoadingProviders"></OverlayLoader>
                <ProviderList :providers="enabledProviders"></ProviderList>
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
            <div v-if="baServerAvailable" style="text-align: right; margin-top: 20px; justify-content: end; display: flex;">
                <SaltRimSpinner v-if="isLoading" :size="32" style="margin-right: auto;"></SaltRimSpinner>
                <RouterLink v-if="registrationAllowed" class="button button--outline" :to="{ name: 'register' }">{{ $t('register') }}</RouterLink>
                <button type="submit" class="button button--dark" style="margin-left: 5px;" :disabled="!baServerAvailable">{{ $t('login') }}</button>
            </div>
        </form>
    </div>
</template>

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
