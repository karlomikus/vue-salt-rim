<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ dialogTitle }}</div>
        <div class="form-group">
            <label class="form-label form-label--required" for="name">{{ $t("name") }}:</label>
            <input id="name" v-model="tag.name" class="form-input" type="text" required />
        </div>
        <div class="dialog-actions">
            <button class="button button--outline" @click.prevent="$emit('tagDialogClosed')">{{ $t("cancel") }}</button>
            <button class="button button--dark" type="submit">{{ $t("save") }}</button>
        </div>
    </form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import OverlayLoader from "@/components/OverlayLoader.vue";
import BarAssistantClient from "@/api/BarAssistantClient";
import { useSaltRimToast } from "@/composables/toast";

type Tag = { id?: number; name?: string };

const props = withDefaults(defineProps<{ sourceTag?: Tag; dialogTitle?: string }>(), {
    sourceTag: () => ({}),
    dialogTitle: "",
});
const { t } = useI18n();
const toast = useSaltRimToast();

const emit = defineEmits<{ tagDialogClosed: [] }>();

const isLoading = ref(false);
const tag = ref<Tag>(props.sourceTag);

function submit() {
    isLoading.value = true;

    const postData = {
        name: tag.value.name ?? "",
    };

    if (tag.value.id) {
        BarAssistantClient.updateTag(tag.value.id, postData)
            .then(() => {
                isLoading.value = false;
                toast.default(t("tag.update-success"));
                emit("tagDialogClosed");
            })
            .catch((e) => {
                toast.error(e.message);
                isLoading.value = false;
            });
    } else {
        BarAssistantClient.saveTag(postData)
            .then(() => {
                isLoading.value = false;
                toast.default(t("tag.add-success"));
                emit("tagDialogClosed");
            })
            .catch((e) => {
                toast.error(e.message);
                isLoading.value = false;
            });
    }
}
</script>
