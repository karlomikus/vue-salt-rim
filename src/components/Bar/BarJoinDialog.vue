<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading"></OverlayLoader>
        <div class="dialog-title">{{ $t("bars.join") }}</div>
        <div class="dialog-content">
            <div class="alert alert--info" style="margin: 0 0 1rem 0">
                <h3>{{ $t("information") }}</h3>
                <p>{{ $t("bars.join-notice") }}</p>
            </div>
            <div class="form-group">
                <label class="form-label form-label--required" for="bar-invite-code">{{ $t("bars.invite-code") }}:</label>
                <input id="bar-invite-code" v-model="inviteCode" class="form-input" type="text" required />
            </div>
        </div>
        <div class="dialog-actions" style="margin-top: 1rem">
            <button type="button" class="button button--outline" @click="$emit('dialogClosed')">{{ $t("cancel") }}</button>
            <button type="submit" class="button button--dark">{{ $t("join") }}</button>
        </div>
    </form>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import OverlayLoader from "@/components/OverlayLoader.vue";
import BarAssistantClient from "@/api/BarAssistantClient";
import { useSaltRimToast } from "@/composables/toast";

const route = useRoute();
const { t } = useI18n();
const toast = useSaltRimToast();

const emit = defineEmits<{ dialogClosed: []; barJoined: [] }>();

const isLoading = ref(false);
const inviteCode = ref<string | null>((route.params.invite as string) || null);

function submit() {
    isLoading.value = true;
    BarAssistantClient.joinBar(inviteCode.value ?? "")
        .then((resp) => {
            isLoading.value = false;
            toast.default(t("bars.join-success", { name: resp.data.name }));
            emit("dialogClosed");
            emit("barJoined");
        })
        .catch(() => {
            isLoading.value = false;
            toast.error(t("bars.join-error"));
        });
}
</script>
