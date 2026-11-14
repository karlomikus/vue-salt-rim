import { ref, readonly } from "vue";
import BarAssistantClient from "@/api/BarAssistantClient";
import type { components } from "@/api/api";
import type { SearchResults } from "@/api/SearchResults";
import { useSaltRimToast } from "@/composables/toast";
import { useI18n } from "vue-i18n";
import AppState from "@/AppState";

type ShelfPhotoResult = components["schemas"]["ShelfPhotoResultResource"];
type SearchResult = SearchResults["ingredient"];

export function useShelfPhotoScan() {
    const result = ref<ShelfPhotoResult | null>(null);
    const isLoading = ref(false);
    const toast = useSaltRimToast();
    const appState = new AppState();
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

    async function matchUnmatched(name: string, ingredient: SearchResult) {
        if (!result.value) {
            return false;
        }

        isLoading.value = true;
        try {
            await BarAssistantClient.addToBarShelf(appState.bar.id, { ingredients: [ingredient.id] });

            result.value.unmatched = result.value.unmatched.filter((unmatched) => unmatched !== name);
            if (!result.value.stocked.some((stocked) => stocked.id === ingredient.id)) {
                result.value.stocked.push({
                    id: ingredient.id,
                    slug: ingredient.slug,
                    name: ingredient.name,
                    image: {
                        id: 0,
                        file_path: ingredient.image_url ?? "",
                        url: ingredient.image_url ?? "",
                        copyright: null,
                        sort: 0,
                        thumb_url: ingredient.image_url ?? "",
                        placeholder_hash: "",
                    },
                });
            }

            toast.default(t("ingredient.bar-shelf-add-success", { name: ingredient.name }));
            return true;
        } catch (e: any) {
            toast.error(e.message ?? t("server-error"));
            return false;
        } finally {
            isLoading.value = false;
        }
    }

    return {
        result: result,
        isLoading: readonly(isLoading),
        scanShelf,
        matchUnmatched,
    };
}
