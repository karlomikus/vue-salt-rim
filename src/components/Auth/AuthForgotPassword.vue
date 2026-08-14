<script setup lang="ts">
import { ref } from "vue";
import BarAssistantClient from "@/api/BarAssistantClient";
import OverlayLoader from "./../OverlayLoader.vue";
import SiteLogo from "./../Layout/SiteLogo.vue";
import { useSaltRimToast } from "@/composables/toast";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const toast = useSaltRimToast();
const router = useRouter();

const isLoading = ref(false);
const email = ref<string | null>(null);

async function requestPasswordReset() {
    isLoading.value = true;
    try {
        await BarAssistantClient.requestPasswordResetEmail(email.value as string);
    } catch {
        // silently ignore errors
    }
    toast.default(t("auth.reset-email-sent"));
    router.push("/login");
}
</script>

<template>
    <div class="login-page">
        <SiteLogo></SiteLogo>
        <form @submit.prevent="requestPasswordReset">
            <OverlayLoader v-if="isLoading"></OverlayLoader>
            <h2>{{ t("auth.password-forgot") }}</h2>
            <p style="margin-bottom: 1rem; font-size: 0.85rem; line-height: 1.4">{{ t("auth.password-forgot-help-text") }}</p>
            <div class="form-group">
                <label class="form-label" for="email">{{ t("email") }}:</label>
                <input id="email" v-model="email" class="form-input" type="email" required />
            </div>
            <div style="text-align: right; margin-top: 20px">
                <RouterLink class="button button--outline" :to="{ name: 'login' }">{{ t("cancel") }}</RouterLink>
                <button type="submit" class="button button--dark" style="margin-left: 5px">{{ t("continue") }}</button>
            </div>
        </form>
    </div>
</template>
