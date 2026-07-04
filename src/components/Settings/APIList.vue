<template>
    <PageHeader>
        {{ $t("api.tokens") }}
        <template v-if="appState.isSubscribed()" #actions>
            <SaltRimDialog v-model="showDialog">
                <template #trigger>
                    <button type="button" class="button button--dark" @click.prevent="showDialog = true">{{ $t("api.add") }}</button>
                </template>
                <template #dialog>
                    <APIForm @api-key-dialog-closed="refreshTokens" />
                </template>
            </SaltRimDialog>
        </template>
    </PageHeader>
    <div class="settings-page">
        <div class="settings-page__nav">
            <SettingsNavigation />
        </div>
        <div class="settings-page__content">
            <OverlayLoader v-if="isLoading" />
            <SubscriptionCheck>Subscribe to "Mixologist" plan to gain access to API token management!</SubscriptionCheck>
            <div class="block-container block-container--padded" style="overflow: scroll">
                <table class="table">
                    <thead>
                        <tr>
                            <th>{{ $t("name") }} / {{ $t("created") }}</th>
                            <th>{{ $t("api.abilities") }}</th>
                            <th>{{ $t("last-used-at") }}</th>
                            <th>{{ $t("expires_at") }}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="token in tokens" :key="token.id">
                            <td>
                                {{ token.name }}
                                <br />
                                <small><DateFormatter :date="token.created_at"></DateFormatter></small>
                            </td>
                            <td>
                                <ul class="chips-list">
                                    <li v-for="ability in token.abilities" :key="ability" class="chip">{{ ability }}</li>
                                </ul>
                            </td>
                            <td><DateFormatter v-if="token.last_used_at" :date="token.last_used_at"></DateFormatter></td>
                            <td><DateFormatter v-if="token.expires_at" :date="token.expires_at"></DateFormatter></td>
                            <td style="text-align: right">
                                <a class="list-group__action" href="#" @click.prevent="deleteToken(token)">{{ $t("revoke") }}</a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import BarAssistantClient from "@/api/BarAssistantClient";
import OverlayLoader from "@/components/OverlayLoader.vue";
import PageHeader from "@/components/PageHeader.vue";
import SettingsNavigation from "@/components/Settings/SettingsNavigation.vue";
import SaltRimDialog from "@/components/Dialog/SaltRimDialog.vue";
import DateFormatter from "@/components/DateFormatter.vue";
import APIForm from "@/components/Settings/APIForm.vue";
import SubscriptionCheck from "@/components/SubscriptionCheck.vue";
import { useTitle } from "@/composables/title";
import AppState from "@/AppState";
import { useSaltRimToast } from "@/composables/toast";
import { useConfirm } from "@/composables/confirm";
import type { components } from "@/api/api";

type Token = components["schemas"]["PersonalAccessToken"];

const appState = new AppState();
const { t } = useI18n();
const toast = useSaltRimToast();
const confirm = useConfirm();

const isLoading = ref(false);
const showDialog = ref(false);
const tokens = ref<Token[]>([]);

useTitle(t("api.tokens"));

refreshTokens();

function refreshTokens() {
    showDialog.value = false;

    isLoading.value = true;
    BarAssistantClient.getTokens()
        .then((resp) => {
            tokens.value = resp.data ?? [];
            isLoading.value = false;
        })
        .catch((e) => {
            toast.error(e.message);
        });
}

function deleteToken(token: Token) {
    confirm.show(t("api.confirm-revoke", { name: token.name }), {
        onResolved: (dialog: { close: () => void }) => {
            isLoading.value = true;
            dialog.close();
            BarAssistantClient.deleteToken(token.id)
                .then(() => {
                    isLoading.value = false;
                    toast.default(t("api.revoke-success"));
                    refreshTokens();
                })
                .catch((e) => {
                    toast.error(e.message);
                    isLoading.value = false;
                });
        },
    });
}
</script>
