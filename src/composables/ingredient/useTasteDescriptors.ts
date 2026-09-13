import { ref, readonly } from "vue";
import BarAssistantClient from "@/api/BarAssistantClient";
import type { components } from "@/api/api";

export type TasteDescriptor = components["schemas"]["TasteDescriptor"];

export function useTasteDescriptors() {
    const descriptors = ref<TasteDescriptor[]>([]);
    const isLoading = ref(false);

    async function fetchDescriptors() {
        isLoading.value = true;
        try {
            descriptors.value = (await BarAssistantClient.getTasteDescriptors())?.data ?? [];
        } catch (e) {
        } finally {
            isLoading.value = false;
        }
    }

    return {
        descriptors: descriptors,
        isLoading: readonly(isLoading),
        fetchDescriptors,
    };
}
