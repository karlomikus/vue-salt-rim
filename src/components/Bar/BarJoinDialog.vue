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
import OverlayLoader from "@/components/OverlayLoader.vue";
import { useBars } from "@/composables/bar/useBars";

const route = useRoute();
const { joinBar, isLoading } = useBars();

const emit = defineEmits<{ dialogClosed: []; barJoined: [] }>();

const inviteCode = ref<string | null>((route.params.invite as string) || null);

async function submit() {
    const result = await joinBar(inviteCode.value ?? "");
    if (result) {
        emit("dialogClosed");
        emit("barJoined");
    }
}
</script>
