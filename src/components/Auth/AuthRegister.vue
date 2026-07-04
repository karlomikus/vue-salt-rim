<script setup lang="ts">
import { ref } from "vue";
import BarAssistantClient from "@/api/BarAssistantClient";
import OverlayLoader from "./../OverlayLoader.vue";
import SiteLogo from "./../Layout/SiteLogo.vue";
import type { components } from "@/api/api";
import { useSaltRimToast } from "@/composables/toast";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

type RegisterRequest = components["schemas"]["RegisterRequest"];

const { t } = useI18n();
const toast = useSaltRimToast();
const router = useRouter();

const isLoading = ref(false);
const email = ref<string | null>(null);
const password = ref<string | null>(null);
const passwordRepeat = ref<string | null>(null);
const name = ref<string | null>(null);

async function register() {
    if (password.value !== passwordRepeat.value) {
        toast.error(t("passwords-not-match"));
        return;
    }

    const postData: RegisterRequest = {
        email: email.value as string,
        password: password.value as string,
        name: name.value as string,
    };

    isLoading.value = true;
    try {
        await BarAssistantClient.register(postData);
        if (window.srConfig.MAILS_ENABLED === true) {
            toast.default(t("register-success-email"));
        } else {
            toast.default(t("register-success"));
        }
        router.push("/login");
    } catch (e: any) {
        isLoading.value = false;
        toast.error(e.message);
    }
}
</script>

<template>
    <div class="login-page">
        <SiteLogo></SiteLogo>
        <form @submit.prevent="register">
            <OverlayLoader v-if="isLoading"></OverlayLoader>
            <h2 style="margin-bottom: 1rem">{{ t("register") }}</h2>
            <div class="form-group">
                <label class="form-label form-label--required" for="email">{{ t("email") }}:</label>
                <input id="email" v-model="email" class="form-input" type="email" required />
            </div>
            <div class="form-group">
                <label class="form-label form-label--required" for="password">{{ t("password") }}:</label>
                <input id="password" v-model="password" class="form-input" type="password" required />
            </div>
            <div class="form-group">
                <label class="form-label form-label--required" for="password-repeat">{{ t("repeat-password") }}:</label>
                <input id="password-repeat" v-model="passwordRepeat" class="form-input" type="password" required />
            </div>
            <div class="form-group">
                <label class="form-label form-label--required" for="name">{{ t("users.display-name") }}:</label>
                <input id="name" v-model="name" class="form-input" type="text" required />
            </div>
            <div style="text-align: right; margin-top: 20px">
                <RouterLink class="button button--outline" :to="{ name: 'login' }">{{ t("cancel") }}</RouterLink>
                <button type="submit" class="button button--dark" style="margin-left: 5px">{{ t("register") }}</button>
            </div>
        </form>
    </div>
</template>
