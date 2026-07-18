<template>
    <div class="note">
        <h5 class="note-title">
            <DateFormatter :date="note.created_at" format="long" /> &middot; <a href="#" @click.prevent="deleteNote">{{ $t("remove") }}</a>
        </h5>
        <div class="note-content">{{ note.note }}</div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import BarAssistantClient from "@/api/BarAssistantClient";
import DateFormatter from "@/components/DateFormatter.vue";
import { useSaltRimToast } from "@/composables/toast";
import { useConfirm } from "@/composables/confirm";
import type { components } from "@/api/api";

const props = withDefaults(defineProps<{ note?: Partial<components["schemas"]["Note"]> }>(), {
    note: () => ({}),
});
const { t } = useI18n();
const toast = useSaltRimToast();
const confirm = useConfirm();

const emit = defineEmits<{ noteDeleted: [] }>();

function deleteNote() {
    confirm.show(t("note.confirm-delete"), {
        onResolved: (dialog: { close: () => void }) => {
            dialog.close();
            BarAssistantClient.deleteNote(props.note!.id!)
                .then(() => {
                    toast.default(t("note.delete-success"));
                    emit("noteDeleted");
                })
                .catch((e) => {
                    toast.error(e.message);
                });
        },
    });
}
</script>

<style scoped>
.note {
    margin-bottom: 1rem;
    border-radius: var(--radius-1);
}

.note:last-child {
    margin: 0;
}

.note-title {
    font-size: 0.75rem;
    opacity: 0.65;
}

.note-content {
    font-size: 1rem;
}
</style>
