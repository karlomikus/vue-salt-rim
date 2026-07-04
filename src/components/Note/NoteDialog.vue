<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ $t("note-dialog.title") }}</div>
        <div class="form-group">
            <label class="form-label" for="note">{{ $t("content") }}:</label>
            <textarea id="note" v-model="note.note" rows="5" class="form-input" ref="noteInput"></textarea>
        </div>
        <div class="dialog-actions">
            <button class="button button--outline" @click.prevent="$emit('noteDialogClosed')">{{ $t("cancel") }}</button>
            <button class="button button--dark" type="submit">{{ $t("save") }}</button>
        </div>
    </form>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import BarAssistantClient from "@/api/BarAssistantClient";
import OverlayLoader from "@/components/OverlayLoader.vue";
import { useSaltRimToast } from "@/composables/toast";
import type { components } from "@/api/api";

const props = withDefaults(defineProps<{ resourceId?: number; resource?: string }>(), {
    resourceId: 0,
    resource: "",
});
const { t } = useI18n();
const toast = useSaltRimToast();

const emit = defineEmits<{ noteDialogClosed: [] }>();

const isLoading = ref(false);
const note = ref<Partial<components["schemas"]["Note"]>>({ note: "" });
const noteInput = ref<HTMLTextAreaElement>();

onMounted(() => {
    noteInput.value?.focus();
});

function submit() {
    isLoading.value = true;
    BarAssistantClient.saveNote({
        note: note.value.note ?? "",
        resource_id: props.resourceId,
        resource: props.resource,
    })
        .then(() => {
            toast.default(t("note-added"));
            isLoading.value = false;
            emit("noteDialogClosed");
        })
        .catch((e) => {
            toast.error(e.message);
            isLoading.value = false;
        });
}
</script>
