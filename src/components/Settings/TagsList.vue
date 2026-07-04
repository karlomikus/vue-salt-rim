<template>
    <PageHeader>
        {{ $t("tag.tags") }}
        <template #actions>
            <SaltRimDialog v-model="showDialog">
                <template #trigger>
                    <button type="button" class="button button--dark" @click.prevent="openDialog($t('tag.add'), {})">{{ $t("tag.add") }}</button>
                </template>
                <template #dialog>
                    <TagForm :source-tag="editTag" :dialog-title="dialogTitle" @tag-dialog-closed="refreshTags" />
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
            <div v-if="tags.length > 0" class="block-container block-container--padded">
                <table class="table">
                    <thead>
                        <tr>
                            <th>{{ $t("name") }}</th>
                            <th>{{ $t("cocktail.cocktails") }}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="tag in tags" :key="tag.id">
                            <td>
                                <a href="#" @click.prevent="openDialog($t('tag.edit'), tag)">{{ tag.name }}</a>
                            </td>
                            <td>{{ tag.cocktails_count }}</td>
                            <td style="text-align: right">
                                <a class="list-group__action" href="#" @click.prevent="deleteTag(tag)">{{ $t("remove") }}</a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <EmptyState v-else>
                {{ $t("empty-state-default") }}
            </EmptyState>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import OverlayLoader from "@/components/OverlayLoader.vue";
import PageHeader from "@/components/PageHeader.vue";
import Navigation from "@/components/Settings/SettingsNavigation.vue";
import SaltRimDialog from "@/components/Dialog/SaltRimDialog.vue";
import TagForm from "@/components/Settings/TagForm.vue";
import EmptyState from "@/components/EmptyState.vue";
import BarAssistantClient from "@/api/BarAssistantClient";
import { useTitle } from "@/composables/title";
import { useSaltRimToast } from "@/composables/toast";
import { useConfirm } from "@/composables/confirm";
import type { components } from "@/api/api";

type Tag = components["schemas"]["Tag"];

const { t } = useI18n();
const toast = useSaltRimToast();
const confirm = useConfirm();

const isLoading = ref(false);
const showDialog = ref(false);
const dialogTitle = ref("Tags data");
const editTag = ref<Partial<Tag>>({});
const tags = ref<Tag[]>([]);

useTitle(t("tag.tags"));

refreshTags();

async function refreshTags() {
    showDialog.value = false;
    isLoading.value = true;
    BarAssistantClient.getTags()
        .then((resp) => {
            tags.value = resp?.data ?? [];
            isLoading.value = false;
        })
        .catch((e) => {
            toast.error(e.message);
            isLoading.value = false;
        });
}

function openDialog(title: string, obj: Partial<Tag>) {
    dialogTitle.value = title;
    editTag.value = obj;
    showDialog.value = true;
}

function deleteTag(tag: Tag) {
    confirm.show(t("tag.confirm-delete", { name: tag.name }), {
        onResolved: (dialog: { close: () => void }) => {
            isLoading.value = true;
            dialog.close();
            BarAssistantClient.deleteTag(tag.id)
                .then(() => {
                    isLoading.value = false;
                    toast.default(t("tag.delete-success"));
                    refreshTags();
                })
                .catch((e) => {
                    toast.error(e.message);
                    isLoading.value = false;
                });
        },
    });
}
</script>
