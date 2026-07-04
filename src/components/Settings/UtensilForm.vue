<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ dialogTitle }}</div>
        <div class="form-group">
            <label class="form-label form-label--required" for="name">{{ $t("name") }}:</label>
            <input id="name" v-model="utensil.name" class="form-input" type="text" required />
        </div>
        <div class="form-group">
            <label class="form-label" for="description">{{ $t("description") }}:</label>
            <textarea id="description" v-model="utensil.description" rows="5" class="form-input"></textarea>
        </div>
        <div class="dialog-actions">
            <button class="button button--outline" @click.prevent="$emit('utensilDialogClosed')">{{ $t("cancel") }}</button>
            <button class="button button--dark" type="submit">{{ $t("save") }}</button>
        </div>
    </form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import BarAssistantClient from "@/api/BarAssistantClient";
import OverlayLoader from "@/components/OverlayLoader.vue";
import { useSaltRimToast } from "@/composables/toast";

type Utensil = { id?: number; name?: string; description?: string };

const props = withDefaults(defineProps<{ sourceData?: Utensil; dialogTitle?: string }>(), {
    sourceData: () => ({}),
    dialogTitle: "",
});
const { t } = useI18n();
const toast = useSaltRimToast();

const emit = defineEmits<{ utensilDialogClosed: [] }>();

const isLoading = ref(false);
const utensil = ref<Utensil>(props.sourceData);

function submit() {
    isLoading.value = true;

    const postData = {
        name: utensil.value.name ?? "",
        description: utensil.value.description,
    };

    if (utensil.value.id) {
        BarAssistantClient.updateUtensil(utensil.value.id, postData)
            .then(() => {
                isLoading.value = false;
                toast.default(t("utensils.update-success"));
                emit("utensilDialogClosed");
            })
            .catch((e) => {
                toast.error(e.message);
                isLoading.value = false;
            });
    } else {
        BarAssistantClient.saveUtensil(postData)
            .then(() => {
                isLoading.value = false;
                toast.default(t("utensils.add-success"));
                emit("utensilDialogClosed");
            })
            .catch((e) => {
                toast.error(e.message);
                isLoading.value = false;
            });
    }
}
</script>
