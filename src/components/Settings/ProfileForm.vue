<template>
    <PageHeader>
        {{ $t("profile") }}
    </PageHeader>
    <div class="settings-page">
        <div class="settings-page__nav">
            <Navigation />
        </div>
        <form class="settings-page__content" @submit.prevent="submit">
            <OverlayLoader v-if="isLoading" />
            <h3 style="margin-top: 0" class="form-section-title">{{ $t("profile-information") }}</h3>
            <div class="block-container block-container--padded">
                <div class="form-group">
                    <label class="form-label form-label--required" for="name">{{ $t("users.display-name") }}:</label>
                    <input id="name" v-model="user.name" class="form-input" type="text" required />
                </div>
                <div class="form-group">
                    <label class="form-label form-label--required" for="email">{{ $t("email") }}:</label>
                    <input id="email" v-model="user.email" class="form-input" type="email" required />
                </div>
                <div class="form-group">
                    <label class="form-label" for="ui-language">{{ $t("ui-language") }}:</label>
                    <select id="ui-language" v-model="currentLocale" class="form-select">
                        <option v-for="locale in sortedLocales" :key="locale" :value="locale">{{ $t("locales." + locale) }} ({{ locale }})</option>
                    </select>
                    <p class="form-input-hint">
                        <a href="https://crowdin.com/project/bar-assistant" target="_blank">{{ $t("locales.help") }}</a>
                    </p>
                </div>
                <div class="form-group">
                    <label class="form-label" for="ui-language">{{ $t("ui-theme") }}:</label>
                    <select id="ui-theme" v-model="currentTheme" class="form-select">
                        <option v-for="theme in themes" :key="theme" :value="theme">{{ $t("theme-" + theme) }}</option>
                    </select>
                </div>
                <SaltRimDialog v-model="showPasswordDialog">
                    <template #trigger>
                        <button type="button" class="button button--dark" @click.prevent="showPasswordDialog = true">{{ $t("change-password") }}</button>
                    </template>
                    <template #dialog>
                        <div class="dialog-title">{{ $t("password") }}</div>
                        <div class="form-group">
                            <label class="form-label" for="new-password">{{ $t("current-password") }}:</label>
                            <input id="new-password" v-model="currentPassword" class="form-input" type="password" />
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="new-password">{{ $t("new-password") }}:</label>
                            <input id="new-password" v-model="user.password" class="form-input" type="password" />
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="repeat-new-password">{{ $t("repeat-password") }}:</label>
                            <input id="repeat-new-password" v-model="user.repeatPassword" class="form-input" type="password" />
                        </div>
                        <div class="dialog-actions">
                            <button class="button button--outline" @click.prevent="showPasswordDialog = false">{{ $t("cancel") }}</button>
                            <button class="button button--dark" type="button" @click="submitPaswordChange">{{ $t("save") }}</button>
                        </div>
                    </template>
                </SaltRimDialog>
            </div>
            <template v-if="user.oauth_credentials && user.oauth_credentials.length > 0">
                <h3 class="form-section-title">{{ $t("sso.profile-providers") }}</h3>
                <div class="block-container block-container--padded">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>{{ $t("sso.provider-name") }}</th>
                                <th>{{ $t("sso.created-date") }}</th>
                                <th>{{ $t("sso.is-configured") }}</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="cred in user.oauth_credentials" :key="cred.provider.name">
                                <td>{{ cred.provider.display_name }}</td>
                                <td :title="cred.created_at">{{ $d(cred.created_at, "short") }}</td>
                                <td>{{ cred.provider.enabled ? $t("sso.provider-enabled") : $t("sso.provider-disabled") }}</td>
                                <td style="text-align: right">
                                    <a class="list-group__action" href="#" @click.prevent="deleteSSOAccount(cred)">{{ $t("sso.delete-account") }}</a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </template>
            <h3 class="form-section-title">{{ $t("data") }}</h3>
            <div class="block-container block-container--padded">
                <button class="button button--danger" type="button" @click="deleteAccount">{{ $t("delete-my-account") }}</button>
            </div>
            <div class="form-actions">
                <button class="button button--dark" type="submit">{{ $t("save") }}</button>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import BarAssistantClient from "@/api/BarAssistantClient";
import OverlayLoader from "@/components/OverlayLoader.vue";
import PageHeader from "@/components/PageHeader.vue";
import Navigation from "@/components/Settings/SettingsNavigation.vue";
import AppState from "@/AppState";
import SaltRimDialog from "@/components/Dialog/SaltRimDialog.vue";
import { useTitle } from "@/composables/title";
import { useSaltRimToast } from "@/composables/toast";
import { useConfirm } from "@/composables/confirm";
import type { components } from "@/api/api";

type Profile = components["schemas"]["Profile"];
type EditableProfile = Profile & { password?: string | null; repeatPassword?: string | null };
type OauthCredential = components["schemas"]["OauthCredential"];

const appState = new AppState();
const router = useRouter();
const { t, locale, availableLocales } = useI18n();
const toast = useSaltRimToast();
const confirm = useConfirm();

const isLoading = ref(false);
const user = ref<EditableProfile>({} as EditableProfile);
const themes = ["light", "dark"];
const showPasswordDialog = ref(false);
const currentTheme = ref<string | null | undefined>(null);
const currentPassword = ref<string | null>(null);
const currentLocale = ref<string | null | undefined>(locale.value);

const sortedLocales = computed(() => {
    return [...availableLocales].sort((a, b) => {
        return a.localeCompare(b);
    });
});

useTitle(t("profile"));

refreshProfile();

async function refreshProfile() {
    isLoading.value = true;

    try {
        const resp = await BarAssistantClient.getProfile();
        if (!resp) {
            throw new Error();
        }

        user.value = resp.data as EditableProfile;

        if (resp.data.settings && resp.data.settings.theme) {
            currentTheme.value = resp.data.settings.theme;
        } else {
            currentTheme.value = appState.theme;
        }

        if (resp.data.settings && resp.data.settings.language) {
            currentLocale.value = resp.data.settings.language;
        } else {
            currentLocale.value = appState.language;
        }
    } catch (e: any) {
        toast.error(e.message);
    } finally {
        isLoading.value = false;
    }
}

function submit() {
    isLoading.value = true;

    const postData: components["schemas"]["ProfileRequest"] = {
        email: user.value.email,
        name: user.value.name,
        settings: {
            theme: currentTheme.value ?? null,
            language: null,
        },
    };

    const appState = new AppState();

    if (currentLocale.value) {
        appState.setLanguage(currentLocale.value);
        locale.value = currentLocale.value;
        postData.settings!.language = currentLocale.value;
    }

    BarAssistantClient.updateProfile(postData)
        .then((resp) => {
            appState.setUser(resp.data);
            isLoading.value = false;
            toast.default(t("profile-updated"));
        })
        .catch((e) => {
            isLoading.value = false;
            toast.error(e.message);
        });
}

function submitPaswordChange() {
    if (!currentPassword.value) {
        toast.error(t("profile.current-password-required"));
        return;
    }

    if (!user.value.password) {
        toast.error(t("profile.new-password-required"));
        return;
    }

    if (user.value.password !== user.value.repeatPassword) {
        toast.error(t("profile.passwords-do-not-match"));
        return;
    }

    BarAssistantClient.changePassword({
        current_password: currentPassword.value,
        new_password: user.value.password,
        new_password_confirmation: user.value.repeatPassword,
    } as unknown as components["schemas"]["ChangePasswordRequest"])
        .then(() => {
            toast.default(t("profile-updated"));
            user.value.password = null;
            user.value.repeatPassword = null;
            currentPassword.value = null;
            showPasswordDialog.value = false;
        })
        .catch((e) => {
            toast.error(e.message);
        })
        .finally(() => {
            isLoading.value = false;
        });
}

function deleteSSOAccount(cred: OauthCredential) {
    confirm.show(t("sso.confirm-delete", { name: cred.provider.display_name }), {
        onResolved: (dialog: { close: () => void }) => {
            dialog.close();
            isLoading.value = true;
            BarAssistantClient.deleteProfileSSOCredentials(cred.provider.name as components["schemas"]["OauthProvider"])
                .then(() => {
                    isLoading.value = false;
                    toast.default(t("sso.delete-success"));

                    refreshProfile();
                })
                .catch((e) => {
                    isLoading.value = false;
                    toast.error(e.message);
                });
        },
    });
}

function deleteAccount() {
    const appState = new AppState();

    confirm.show(t("users.confirm-delete", { name: user.value.name }), {
        onResolved: (dialog: { close: () => void }) => {
            dialog.close();
            isLoading.value = true;
            (BarAssistantClient as unknown as { deleteUser: (id: number) => Promise<unknown> })
                .deleteUser(user.value.id)
                .then(() => {
                    isLoading.value = false;
                    appState.clear();
                    router.push({ name: "login" });
                })
                .catch((e) => {
                    isLoading.value = false;
                    toast.error(e.message);
                });
        },
    });
}
</script>
<style scoped>
.account-actions {
    display: flex;
    gap: var(--gap-size-3);
}
</style>
