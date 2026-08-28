import { ref } from "vue";
import type { Ref } from "vue";
import BarAssistantClient from "@/api/BarAssistantClient";

const cache = new Map<string, Ref<string | null>>();

export function usePublicBarName(barId: string | undefined): Ref<string | null> {
    const name = ref<string | null>(null);

    if (!barId) {
        return name;
    }

    const cached = cache.get(barId);
    if (cached) {
        return cached;
    }

    cache.set(barId, name);
    BarAssistantClient.getPublicBar(barId)
        .then((resp) => {
            name.value = resp?.data?.name ?? null;
        })
        .catch(() => {
            name.value = null;
        });

    return name;
}