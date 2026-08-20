import { ref, readonly } from "vue";
import BarAssistantClient from "@/api/BarAssistantClient";
import { useSaltRimToast } from "@/composables/toast";
import { useI18n } from "vue-i18n";

export function useMembers() {
    const isLoading = ref(false);
    const toast = useSaltRimToast();
    const { t } = useI18n();

    async function leaveBar(memberId: number, barId?: number) {
        isLoading.value = true;
        try {
            await BarAssistantClient.leaveBar(memberId, barId);
            toast.default(t("bars.leave-success"));
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            isLoading.value = false;
        }
    }

    return {
        isLoading: readonly(isLoading),
        leaveBar,
    };
}