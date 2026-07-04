<template>
    <div>
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ t("public-dialog.title") }}</div>
        <SubscriptionCheck>Subscribe to "Mixologist" plan to share your cocktail recipes!</SubscriptionCheck>
        <p class="public-url">{{ publicUrl }}</p>
        <p v-show="publicData.public_at != null">{{ t("public-dialog.public_at", { date: createdDate }) }}</p>
        <div class="dialog-actions" style="margin-top: 1rem">
            <button type="button" class="button button--outline" @click="emit('publicDialogClosed')">{{ t("close") }}</button>
            <button v-if="publicData.public_id" type="button" class="button button--outline" @click="deletePublicLink">
                {{ t("public-dialog.action-delete") }}
            </button>
            <button v-else type="button" class="button button--outline" @click="generatePublicLink">{{ t("public-dialog.action-generate") }}</button>
            <button type="button" class="button button--dark" :disabled="!publicData.public_at" @click="copyLink">{{ t("public-dialog.action-copy") }}</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useSaltRimToast } from "@/composables/toast";
import BarAssistantClient from "@/api/BarAssistantClient";
import OverlayLoader from "./../OverlayLoader.vue";
import SubscriptionCheck from "../SubscriptionCheck.vue";
import type { components } from "@/api/api";

type Cocktail = components["schemas"]["Cocktail"];

const props = defineProps<{
    cocktail: Cocktail;
}>();

const emit = defineEmits<{
    publicDialogClosed: [];
}>();

const { t, d } = useI18n();
const toast = useSaltRimToast();

const isLoading = ref(false);
const publicData = ref<{ public_id: string | null; public_at: string | null }>({
    public_id: props.cocktail.public_id,
    public_at: props.cocktail.public_at,
});

const host = window.location.host;
const protocol = window.location.protocol;

const publicUrl = computed(() => {
    if (!publicData.value.public_id) {
        return t("public-dialog.missing");
    }

    return `${protocol}//${host}/e/cocktail/${publicData.value.public_id}/${props.cocktail.slug}`;
});

const createdDate = computed(() => {
    if (!publicData.value.public_at) {
        return null;
    }

    const date = new Date(publicData.value.public_at);

    return d(date, "long");
});

async function generatePublicLink() {
    isLoading.value = true;
    try {
        await BarAssistantClient.savePublicCocktailLink(props.cocktail.id);
        const cocktail = await BarAssistantClient.getCocktail(props.cocktail.id.toString());
        if (cocktail) {
            publicData.value = {
                public_id: cocktail.data.public_id,
                public_at: cocktail.data.public_at,
            };
        }
    } catch (e) {
        toast.error((e as Error).message);
    } finally {
        isLoading.value = false;
    }
}

async function deletePublicLink() {
    isLoading.value = true;
    try {
        await BarAssistantClient.deletePublicCocktailLink(props.cocktail.id);
        publicData.value = {
            public_id: null,
            public_at: null,
        };
    } catch (e) {
        toast.error((e as Error).message);
    } finally {
        isLoading.value = false;
    }
}

async function copyLink() {
    try {
        await navigator.clipboard.writeText(publicUrl.value);
        toast.default(t("public-dialog.toasts.copy-success"));
    } catch {
        toast.error(t("public-dialog.toasts.copy-fail"));
    }
}
</script>

<style scoped>
.public-url {
    background: var(--clr-gray-100);
    padding: 0.5rem;
    font-weight: var(--fw-bold);
    font-size: 1.25rem;
    font-family: monospace;
    border-radius: var(--radius-1);
}

.dark-theme .public-url {
    background: var(--clr-gray-900);
}
</style>
