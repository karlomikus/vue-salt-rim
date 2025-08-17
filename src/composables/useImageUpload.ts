import ImageUpload from "@/components/ImageUpload.vue";
import { useSaltRimToast } from "@/composables/toast";
import { useI18n } from "vue-i18n";
import type { components } from "@/api/api";

type ImageUploadComponent = InstanceType<typeof ImageUpload>;
type Image = components["schemas"]["Image"];

export function useImageUpload() {
    const toast = useSaltRimToast();
    const { t } = useI18n();

    const saveImages = async (
        imageUpload: ImageUploadComponent,
    ): Promise<Image[]> => {
        try {
            const imageResources =
                (await imageUpload.save().catch(() => {
                    toast.error(`${t("imageupload.error")}`);
                    return [];
                })) || [];

            return imageResources;
        } catch (error) {
            toast.error(`${t("imageupload.error")}`);

            return [];
        }
    };

    return {
        saveImages,
    };
}
