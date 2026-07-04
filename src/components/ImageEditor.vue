<template>
    <div>
        <OverlayLoader v-if="isLoading" />
        <SubscriptionCheck>Subscribe to "Mixologist" plan to enable image editing!</SubscriptionCheck>
        <div class="dialog-title">{{ $t("image-editor.title") }}</div>
        <div class="image-editor-container">
            <img ref="image" :src="modelValue.preview" />
        </div>
        <div class="image-editor-actions">
            <a href="#" @click.prevent="cropper.setDragMode('move')">{{ $t("image-editor.move") }}</a>
            &middot;
            <a href="#" @click.prevent="cropper.setDragMode('crop')">{{ $t("image-editor.crop") }}</a>
            &middot;
            <a href="#" @click.prevent="cropper.rotate(45)">{{ $t("image-editor.rotate") }} 45°</a>
            &middot;
            <a href="#" @click.prevent="cropper.rotate(-45)">{{ $t("image-editor.rotate") }} -45°</a>
            &middot;
            <a href="#" @click.prevent="cropper.scaleX(cropper.getData().scaleX * -1)">{{ $t("image-editor.flip-h") }}</a>
            &middot;
            <a href="#" @click.prevent="cropper.scaleY(cropper.getData().scaleY * -1)">{{ $t("image-editor.flip-v") }}</a>
        </div>
        <div class="dialog-actions">
            <button type="button" class="button button--outline" @click="$emit('imageDialogClosed')">{{ $t("close") }}</button>
            <button type="button" class="button button--dark" :disabled="!canEdit" @click="save">{{ $t("save") }}</button>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import Cropper from "cropperjs";
import OverlayLoader from "@/components/OverlayLoader.vue";
import SubscriptionCheck from "@/components/SubscriptionCheck.vue";
import AppState from "@/AppState";
import { useSaltRimToast } from "@/composables/toast";

type ImageModel = {
    id?: number;
    file?: File | Blob | null;
    preview?: string;
    fileName?: string;
    copyright?: string;
    sort?: number;
};

const props = withDefaults(defineProps<{ modelValue?: ImageModel }>(), {
    modelValue: () => ({}),
});
const { t } = useI18n();
const toast = useSaltRimToast();

const emit = defineEmits<{ "update:modelValue": [value: ImageModel]; imageDialogClosed: [] }>();

const image = ref<HTMLImageElement>();
const cropper = ref<Cropper>(null as unknown as Cropper);

const canEdit = computed(() => {
    const appState = new AppState();
    if (!appState.isSubscribed()) {
        return false;
    }

    return true;
});

onMounted(() => {
    cropper.value = new Cropper(image.value as HTMLImageElement, {
        viewMode: 1,
    });
});

function save() {
    if (!canEdit.value) {
        return;
    }

    const croppedImage = cropper.value.getCroppedCanvas();
    if (!croppedImage) {
        return;
    }

    toast.default(t("image-editor.edit-success"));

    croppedImage.toBlob((blob) => {
        const newImage: ImageModel = {
            id: props.modelValue.id,
            file: blob,
            preview: croppedImage.toDataURL(),
            fileName: props.modelValue.fileName,
            copyright: props.modelValue.copyright,
            sort: props.modelValue.sort,
        };
        emit("update:modelValue", newImage);
        emit("imageDialogClosed");
    });
}
</script>
<style>
.image-editor-container img {
    display: block;
    max-width: 100%;
    min-height: 500px;
}
</style>
