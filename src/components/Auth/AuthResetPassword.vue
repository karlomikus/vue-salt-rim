<template>
    <div class="login-page">
        <SiteLogo></SiteLogo>
        <form @submit.prevent="requestPasswordReset">
            <OverlayLoader v-if="isLoading"></OverlayLoader>
            <h2 style="margin-bottom: 1rem">{{ $t("auth.reset-password") }}</h2>
            <div class="form-group">
                <label class="form-label form-label--required" for="email">{{ $t("email") }}:</label>
                <input id="email" v-model="reset.email" class="form-input" type="email" required />
            </div>
            <div class="form-group">
                <label class="form-label form-label--required" for="password">{{ $t("password") }}:</label>
                <input id="password" v-model="reset.password" class="form-input" type="password" required />
            </div>
            <div class="form-group">
                <label class="form-label form-label--required" for="password-repeat">{{ $t("repeat-password") }}:</label>
                <input id="password-repeat" v-model="reset.passwordRepeat" class="form-input" type="password" required />
            </div>
            <div style="text-align: right; margin-top: 20px">
                <RouterLink class="button button--outline" :to="{ name: 'login' }">{{ $t("cancel") }}</RouterLink>
                <button type="submit" class="button button--dark" style="margin-left: 5px">{{ $t("auth.reset-password-reset") }}</button>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import BarAssistantClient from "@/api/BarAssistantClient";
import OverlayLoader from "@/components/OverlayLoader.vue";
import SiteLogo from "@/components/Layout/SiteLogo.vue";
import { useSaltRimToast } from "@/composables/toast";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const toast = useSaltRimToast();

const isLoading = ref(false);
const reset = ref<{ email?: string; password?: string; passwordRepeat?: string }>({});

function requestPasswordReset() {
    const token = (route.query.token as string) || null;

    const postData = {
        token: token,
        email: reset.value.email,
        password: reset.value.password,
        password_confirmation: reset.value.passwordRepeat,
    };

    isLoading.value = true;
    BarAssistantClient.resetPassword(postData)
        .then(() => {
            toast.default(t("auth.password-reset-success"));
            router.push("/login");
        })
        .catch(() => {
            isLoading.value = false;
            toast.error(t("auth.password-reset-error"));
        });
}
</script>
