<template>
    <PageHeader>
        {{ $t("utensils.title") }}
        <template #actions>
            <SaltRimDialog v-model="showDialog">
                <template #trigger>
                    <button type="button" class="button button--dark" @click.prevent="openDialog($t('utensils.add'), {})">{{ $t("utensils.add") }}</button>
                </template>
                <template #dialog>
                    <UtensilForm :source-data="editUtensil" :dialog-title="dialogTitle" @utensil-dialog-closed="refreshUtensils" />
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
                <table class="table">
                    <thead>
                        <tr>
                            <th>{{ $t("name") }} / {{ $t("description") }}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="utensil in utensils" :key="utensil.id">
                            <td>
                                <a href="#" @click.prevent="openDialog($t('utensils.edit'), utensil)">{{ utensil.name }}</a>
                                <br />
                                <small>{{ overflowText(utensil.description, 100) }}</small>
                            </td>
                            <td style="text-align: right">
                                <a class="list-group__action" href="#" @click.prevent="deleteUtensil(utensil)">{{ $t("remove") }}</a>
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
import UtensilForm from "@/components/Settings/UtensilForm.vue";
import { useTitle } from "@/composables/title";
import { useSaltRimToast } from "@/composables/toast";
import { useConfirm } from "@/composables/confirm";
import type { components } from "@/api/api";

type Utensil = components["schemas"]["Utensil"];

const { t } = useI18n();
const toast = useSaltRimToast();
const confirm = useConfirm();

const isLoading = ref(false);
const showDialog = ref(false);
const dialogTitle = ref("Utensil data");
const editUtensil = ref<Partial<Utensil>>({});
const utensils = ref<Utensil[]>([]);

useTitle(t("utensils.title"));

refreshUtensils();

function refreshUtensils() {
    showDialog.value = false;
    isLoading.value = true;
    BarAssistantClient.getUtensils()
        .then((resp) => {
            utensils.value = resp.data ?? [];
            isLoading.value = false;
        })
        .catch((e) => {
            toast.error(e.message);
        });
}

function openDialog(title: string, obj: Partial<Utensil>) {
    dialogTitle.value = title;
    editUtensil.value = obj;
    showDialog.value = true;
}

function deleteUtensil(utensil: Utensil) {
    confirm.show(t("utensils.confirm-delete", { name: utensil.name }), {
        onResolved: (dialog: { close: () => void }) => {
            isLoading.value = true;
            dialog.close();
            BarAssistantClient.deleteUtensil(utensil.id)
                .then(() => {
                    isLoading.value = false;
                    toast.default(t("utensils.delete-success"));
                    refreshUtensils();
                })
                .catch((e) => {
                    toast.error(e.message);
                    isLoading.value = false;
                });
        },
    });
}

function overflowText(input: string | null, len: number) {
    if (!input) {
        return input;
    }

    return input.length > len ? `${input.substring(0, len)}...` : input;
}
</script>
