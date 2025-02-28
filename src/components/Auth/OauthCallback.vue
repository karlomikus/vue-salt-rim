<script setup lang="ts">
import { ref } from 'vue'
import BarAssistantClient from '@/api/BarAssistantClient'
import SiteLogo from './../Layout/SiteLogo.vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useSaltRimToast } from '@/composables/toast.js'
import SaltRimSpinner from '../SaltRimSpinner.vue'
import { useI18n } from 'vue-i18n'
import type { components } from '@/api/api'

type Provider = components["schemas"]["OauthProvider"]

const { t } = useI18n()
const isLoading = ref(false)
const toast = useSaltRimToast();
const route = useRoute()
const router = useRouter()

async function authViaSSO() {
    isLoading.value = true

    const code = route.query.code
    const provider = sessionStorage.getItem('sr_sso_provider')
    if (!provider || !code) {
        toast.error(t('sso.auth-error'))
        router.push('/login')
        return;
    }

    sessionStorage.removeItem('sr_sso_provider')

    const token = (await BarAssistantClient.getSSOCallback(provider as Provider, code.toString()))?.data.token

    if (token) {
        const redirectUrl = await useAuth(token)

        router.push(redirectUrl)
    }
}

authViaSSO()
</script>

<template>
    <div class="login-page">
        <SiteLogo></SiteLogo>
        <form style="text-align: center;">
            <h2>{{ t('sso.title') }}</h2>
            <div>
                <SaltRimSpinner :size="64"></SaltRimSpinner>
            </div>
            Authenticating user...
        </form>
    </div>
</template>