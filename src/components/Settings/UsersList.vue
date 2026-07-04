<template>
    <PageHeader>
        {{ $t("users.title") }}
        <template v-if="appState.isSubscribed()" #actions>
            <SaltRimDialog v-model="showDialog">
                <template #trigger>
                    <button type="button" class="button button--dark" @click.prevent="openDialog($t('users.add'), { role: {} })">{{ $t("users.add") }}</button>
                </template>
                <template #dialog>
                    <UserForm :source-user="editUser" :dialog-title="dialogTitle" @user-dialog-closed="refreshUsers" />
                </template>
            </SaltRimDialog>
        </template>
    </PageHeader>
    <div class="settings-page">
        <div class="settings-page__nav">
            <Navigation />
        </div>
        <div class="settings-page__content">
            <OverlayLoader v-if="isLoading" />
            <div class="block-container block-container--padded">
                <SubscriptionCheck>Subscribe to "Mixologist" plan to gain access to user management!</SubscriptionCheck>
                <table class="table">
                    <thead>
                        <tr>
                            <th>{{ $t("users.display-name") }} / {{ $t("email") }}</th>
                            <th>{{ $t("users.role") }}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in users" :key="user.id">
                            <td>
                                <a href="#" @click.prevent="openDialog($t('users.edit'), user)">{{ user.name }}</a>
                                <br />
                                <small>{{ user.email }}</small>
                            </td>
                            <td>
                                {{ $t("roles.name." + user.role.name) }}
                            </td>
                            <td style="text-align: right">
                                <a v-if="user.id != appState.user.id" class="list-group__action" href="#" @click.prevent="deleteUser(user)">{{ $t("remove-from-bar") }}</a>
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
import Navigation from "@/components/Settings/SettingsNavigation.vue";
import SaltRimDialog from "@/components/Dialog/SaltRimDialog.vue";
import UserForm from "@/components/Settings/UserForm.vue";
import AppState from "@/AppState";
import SubscriptionCheck from "@/components/SubscriptionCheck.vue";
import { useTitle } from "@/composables/title";
import { useSaltRimToast } from "@/composables/toast";
import { useConfirm } from "@/composables/confirm";
import type { components } from "@/api/api";

type User = components["schemas"]["User"];
type EditUser = { id?: number; email?: string; name?: string; role?: { id?: number | null; name?: string | null } };

const appState = new AppState();
const { t } = useI18n();
const toast = useSaltRimToast();
const confirm = useConfirm();

const isLoading = ref(false);
const showDialog = ref(false);
const dialogTitle = ref("User data");
const editUser = ref<EditUser>({ role: {} });
const users = ref<User[]>([]);

useTitle(t("users.title"));

refreshUsers();

function refreshUsers() {
    showDialog.value = false;
    isLoading.value = true;
    BarAssistantClient.getUsers()
        .then((resp) => {
            users.value = resp.data ?? [];
            isLoading.value = false;
        })
        .catch((e) => {
            toast.error(e.message);
        });
}

function openDialog(title: string, obj: EditUser) {
    dialogTitle.value = title;
    editUser.value = obj;
    showDialog.value = true;
}

function deleteUser(user: User) {
    confirm.show(t("users.confirm-delete", { name: user.name }), {
        onResolved: (dialog: { close: () => void }) => {
            isLoading.value = true;
            dialog.close();
            BarAssistantClient.removeUserFromBar(user.id)
                .then(() => {
                    isLoading.value = false;
                    toast.default(t("users.delete-success"));
                    refreshUsers();
                })
                .catch((e) => {
                    toast.error(e.message);
                    isLoading.value = false;
                });
        },
    });
}
</script>
