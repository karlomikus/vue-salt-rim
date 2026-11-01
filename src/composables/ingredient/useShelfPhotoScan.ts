import { ref, readonly, computed } from "vue";
import BarAssistantClient from "@/api/BarAssistantClient";
import type { components } from "@/api/api";
import { useSaltRimToast } from "@/composables/toast";
import { useI18n } from "vue-i18n";

export type TasteDescriptor = components["schemas"]["TasteDescriptor"];

export function useShelfPhotoScan() {
    const result = ref<components["schemas"]["ShelfPhotoResultResource"] | null>(null);
    const isLoading = ref(false);
    const toast = useSaltRimToast();
    const MAX_PHOTOS = 10;
    const { t } = useI18n();

    async function scanShelf(files: File[]) {
        if (files.length < 1 || files.length > MAX_PHOTOS) {
            return;
        }
        isLoading.value = true;
        try {
            const resp = await BarAssistantClient.identifyShelfFromPhoto(files);
            if (!resp || !resp.data) {
                toast.error(t("server-error"));
                return;
            }
            result.value = resp.data;
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            isLoading.value = false;
        }
    }

    return {
        result: result,
        isLoading: readonly(isLoading),
        scanShelf,
    };
}
