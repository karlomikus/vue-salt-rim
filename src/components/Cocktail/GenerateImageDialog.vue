<template>
    <div>
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ $t("generate-image-dialog.preview") }}</div>
        <div class="image-download-preview">
            <img v-if="imagePayload" :src="imagePayload" alt="" />
            <div v-else ref="exportElement" class="image-export-wrapper">
                <CocktailRecipeImage :cocktail="cocktail" :hide-units="true" :hide-header="features.hideHeader" :hide-footer="features.hideFooter"></CocktailRecipeImage>
            </div>
        </div>
        <div class="dialog-actions">
            <button type="button" class="button button--outline" @click="$emit('generateImageDialogClosed')">{{ $t("close") }}</button>
            <button v-if="shareEnabled" type="button" class="button button--outline" @click="shareAction">{{ $t("share.title") }}</button>
            <a v-if="imagePayload" :href="imagePayload" :download="fileName" class="button button--dark">{{ $t("download") }}</a>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from "vue";
import { useI18n } from "vue-i18n";
import * as htmlToImage from "html-to-image";
import OverlayLoader from "@/components/OverlayLoader.vue";
import CocktailRecipeImage from "@/components/Cocktail/CocktailRecipeImage.vue";
import { useSaltRimToast } from "@/composables/toast";

type ImageCocktail = {
    slug?: string;
    name?: string;
    description?: string;
};

const props = withDefaults(defineProps<{ cocktail?: Partial<ImageCocktail> }>(), {
    cocktail: () => ({}),
});
const { t } = useI18n();
const toast = useSaltRimToast();

const emit = defineEmits<{ generateImageDialogClosed: [] }>();

const isLoading = ref(false);
const imagePayload = ref<string | null>(null);
const shareEnabled = ref(false);
const features = reactive({
    hideHeader: true,
    hideFooter: false,
});
const exportElement = ref<HTMLDivElement>();

const fileName = computed(() => (props.cocktail.slug ?? "cocktail") + ".png");

function generateImage() {
    isLoading.value = true;
    htmlToImage
        .toPng(exportElement.value as HTMLElement, {
            pixelRatio: 1,
            cacheBust: true,
            fetchRequestInit: {
                cache: "no-cache",
            },
        })
        .then((dataUrl) => {
            isLoading.value = false;
            imagePayload.value = dataUrl;
        })
        .catch(() => {
            isLoading.value = false;
            toast.error(t("generate-image-dialog.generation-failed"));
        });
}

async function shareAction() {
    const blobData = await (await fetch(imagePayload.value as string)).blob();
    const file = new File([blobData], fileName.value, { type: "image/png" });

    try {
        await navigator.share({
            title: props.cocktail.name,
            text: props.cocktail.description,
            files: [file],
        });
    } catch {
        // Do nothing
    }
}

onMounted(() => {
    if ("share" in navigator) {
        shareEnabled.value = true;
    }

    generateImage();
});
</script>

<style scoped>
.image-download-preview {
    overflow: scroll;
    max-height: 350px;
}

.image-download-preview img {
    width: 100%;
}
</style>
