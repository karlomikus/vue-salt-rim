<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ dialogTitle }}</div>
        <div class="form-group">
            <label class="form-label form-label--required" for="email">{{ $t("email") }}:</label>
            <input id="email" v-model="user.email" class="form-input" type="email" :disabled="user.id != null" required />
        </div>
        <div class="form-group">
            <label class="form-label">{{ $t("users.role") }}:</label>
            <div class="user-roles">
                <SaltRimRadio v-for="role in roles" :key="role.id" v-model="user.role.id" :value="role.id" :title="role.name" :description="role.description"></SaltRimRadio>
            </div>
        </div>
        <div class="dialog-actions">
            <button class="button button--outline" @click.prevent="$emit('userDialogClosed')">{{ $t("cancel") }}</button>
            <button class="button button--dark" type="submit">{{ $t("save") }}</button>
        </div>
    </form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import BarAssistantClient from "@/api/BarAssistantClient";
import OverlayLoader from "@/components/OverlayLoader.vue";
import SaltRimRadio from "@/components/SaltRimRadio.vue";
import { useSaltRimToast } from "@/composables/toast";

type User = { id?: number; email?: string; role?: { id?: number } };

const props = withDefaults(defineProps<{ sourceUser?: User; dialogTitle?: string }>(), {
    sourceUser: () => ({ role: {} }),
    dialogTitle: "",
});
const { t } = useI18n();
const toast = useSaltRimToast();

const emit = defineEmits<{ userDialogClosed: [] }>();

const isLoading = ref(false);
const user = ref<User>(props.sourceUser);
const roles = [
    { id: 1, name: t("roles.name.Admin"), description: t("roles.description.Admin") },
    { id: 3, name: t("roles.name.General"), description: t("roles.description.General") },
    { id: 4, name: t("roles.name.Guest"), description: t("roles.description.Guest") },
];

function submit() {
    isLoading.value = true;

    if (user.value.id) {
        const postData = {
            email: user.value.email ?? "",
            role_id: user.value.role?.id ?? 0,
        };

        BarAssistantClient.updateMember(user.value.id, postData)
            .then(() => {
                toast.default(t("users.update-success"));
                emit("userDialogClosed");
            })
            .catch(() => {
                toast.error("Unable to update a member.");
            })
            .finally(() => {
                isLoading.value = false;
            });
    } else {
        const postData = {
            email: user.value.email ?? "",
            role_id: user.value.role?.id ?? 0,
        };

        BarAssistantClient.saveMember(postData)
            .then(() => {
                toast.default(t("users.add-success"));
                emit("userDialogClosed");
            })
            .catch(() => {
                toast.error("Unable to add a member. Make sure the user exists and is not already a member.");
            })
            .finally(() => {
                isLoading.value = false;
            });
    }
}
</script>

<style scoped>
.user-roles {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--gap-size-2);
}

@media (max-width: 450px) {
    .user-roles {
        grid-template-columns: 1fr;
    }
}
</style>
