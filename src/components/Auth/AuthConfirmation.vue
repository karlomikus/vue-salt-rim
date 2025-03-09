<template>
    <div></div>
</template>

<script setup lang="ts">
import BarAssistantClient from '@/api/BarAssistantClient'
import { useSaltRimToast } from '@/composables/toast';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useSaltRimToast()

BarAssistantClient.confirmAccount(parseInt(route.params.id.toString()), route.params.hash.toString()).then(() => {
    toast.default(t('auth.account-confirmed'))
    router.push('/login')
}).catch(e => {
    toast.error(e.message)
    router.push('/login')
})
</script>
