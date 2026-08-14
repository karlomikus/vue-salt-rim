import { ref, readonly, computed } from "vue";
import BarAssistantClient from "@/api/BarAssistantClient";
import type { components } from "@/api/api";
import { useSaltRimToast } from "@/composables/toast";
import { useI18n } from "vue-i18n";

export type Bar = components["schemas"]["Bar"];

export function useBars() {
    const bars = ref<Bar[]>([]);
    const isLoading = ref(false);
    const toast = useSaltRimToast();
    const { t } = useI18n();

    async function fetchBars() {
        isLoading.value = true;
        try {
            bars.value = (await BarAssistantClient.getBars())?.data || [];
        } finally {
            isLoading.value = false;
        }
    }

    async function deleteBar(barId: number) {
        isLoading.value = true;
        try {
            await BarAssistantClient.deleteBar(barId);
            bars.value = bars.value.filter((bar) => bar.id !== barId);
            toast.default(t("bars.delete-success"));
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            isLoading.value = false;
        }
    }

    async function leaveBar(barId: number) {
        isLoading.value = true;
        try {
            await BarAssistantClient.leaveBar(barId);
            bars.value = bars.value.filter((bar) => bar.id !== barId);
            toast.default(t("bars.leave-success"));
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            isLoading.value = false;
        }
    }

    async function activateBar(barId: number) {
        isLoading.value = true;
        try {
            await BarAssistantClient.updateBarStatus(barId, "active");
            toast.default(t("bars.activation-success"));
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            isLoading.value = false;
        }
    }

    async function joinBar(inviteCode: string) {
        isLoading.value = true;
        try {
            const resp = await BarAssistantClient.joinBar(inviteCode);
            if (resp) {
                toast.default(t("bars.join-success", { name: resp.data.name }));
            }
            return resp;
        } catch {
            toast.error(t("bars.join-error"));
        } finally {
            isLoading.value = false;
        }
    }

    const groupedBars = computed<Record<string, Bar[]>>(() => {
        const res: Record<string, Bar[]> = {
            active: [],
            provisioning: [],
            deactivated: [],
        };

        bars.value.forEach((bar) => {
            // Fallback initialization if a non-standard status leaks in
            if (!res[bar.status]) {
                res[bar.status] = [];
            }

            res[bar.status].push(bar);
        });

        return res;
    });

    return {
        bars: readonly(bars),
        isLoading: readonly(isLoading),
        fetchBars,
        groupedBars,
        deleteBar,
        leaveBar,
        activateBar,
        joinBar,
    };
}
