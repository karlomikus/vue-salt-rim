<script setup lang="ts">
// @ts-nocheck
import { ref, onMounted, watch, computed } from 'vue'
import Sortable from 'sortablejs'
import { useI18n } from 'vue-i18n';
import { useConfirm } from '@/composables/confirm';
import { useSaltRimToast } from '@/composables/toast';
import { useFileDialog } from '@vueuse/core';
import OverlayLoader from './OverlayLoader.vue'
import SaltRimDialog from './Dialog/SaltRimDialog.vue';
import ImageEditor from './ImageEditor.vue';
import { thumbHashToDataURL } from 'thumbhash'

import type { components } from '@/api/api'
import BarAssistantClient from '@/api/BarAssistantClient';
type Image = components["schemas"]["Image"]
type ImageRequest = components["schemas"]["ImageRequest"]
type ImageWithBase64ImportFile = Image & { file?: string | null }

interface ImageViewModel {
    id: number | null;
    file: Blob | File | string | null;
    preview: string;
    fileName: string;
    copyright: string | null;
    sort: number;
    hash?: string | null;
}

defineExpose({
    save
})

const toast = useSaltRimToast()
const confirm = useConfirm()
const { t } = useI18n()
const isLoading = ref(false)
const imageList = ref(null)
const sortable = ref(null)
const imageDialogs = ref<{
    [key: number]: boolean;
}>({})
const images = ref([] as ImageViewModel[])
const props = withDefaults(defineProps<{
    maxImages: number;
    images: ImageWithBase64ImportFile[];
}>(), {
    maxImages: 10,
})
const hasMaxImages = computed(() => images.value.length >= props.maxImages)

watch(() => props.images, () => {
    for (const img of props.images) {
        const vmImage = {
            id: img.id,
            file: img.file ?? null,
            preview: img.url,
            fileName: img.file_path,
            copyright: img.copyright,
            sort: img.sort,
            hash: img.placeholder_hash,
        }

        images.value.push(vmImage)
    }
})

const { open, onChange } = useFileDialog({
    accept: 'image/*',
})

onMounted(() => {
    initSortable()
})

onChange((files) => {
    if (!files) {
        return
    }

    for (const file of files) {
        if (hasMaxImages.value) {
            return
        }

        images.value.push({
            id: null,
            file: file,
            preview: URL.createObjectURL(file),
            fileName: file.name,
            copyright: null,
            sort: 1,
        })
    }
})

function initSortable() {
    sortable.value = Sortable.create(imageList.value, {
        handle: '.drag-handle',
        ghostClass: 'block-container--placeholder',
        animation: 150
    })
}

function removeImage(image: ImageViewModel) {
    confirm.show(t('imageupload.delete-confirm'), {
        onResolved: (dialog: any) => {
            if (!image.id) {
                dialog.close()
                images.value.splice(images.value.findIndex(i => i == image), 1)
                return;
            }

            dialog.close()
            isLoading.value = true
            BarAssistantClient.deleteImage(image.id).then(() => {
                isLoading.value = false
                toast.default(t('imageupload.delete-success'))
                images.value.splice(images.value.findIndex(i => i == image), 1)
            }).catch(() => {
                isLoading.value = false
                toast.default(t('imageupload.delete-fail'))
            })
        }
    })
}

function getHashAsImage(img: ImageViewModel): string {
    if (!img.hash) {
        return ''
    }

    return thumbHashToDataURL(Uint8Array.from(atob(img.hash), c => c.charCodeAt(0)))
}

async function save() {
    if (!sortable.value) {
        return;
    }

    const request = [] as ImageRequest[]

    const sortedImageList = sortable.value.toArray()
    for (const img of images.value) {
        const newSort = sortedImageList.findIndex(sortedId => sortedId == img.fileName) + 1
        const imageRequest = {
            id: img.id ?? null,
            copyright: img.copyright,
            sort: newSort,
            image: img.file,
        }

        request.push(imageRequest)
    }

    return (await BarAssistantClient.uploadImages(request))?.data
}
</script>
<template>
    <div class="block-container block-container--padded block-container--inset image-upload">
        <OverlayLoader v-if="isLoading" />
        <div class="image-upload__actions">
            <button type="button" @click="open()" class="button button--dark">{{ t('imageupload.browse') }}</button>
            <br>
            {{ t('imageupload.validation', {max: '50MB'}) }} &middot; {{ t('imageupload.status', {current: images.length, max: maxImages}) }}
        </div>
        <div class="image-upload__images" ref="imageList">
            <div class="block-container block-container--padded image-upload__images__item" v-for="(img, idx) in images" :key="idx" :data-id="img.fileName">
                <div class="drag-handle"></div>
                <div class="image-upload__images__item__image">
                    <img :src="img.preview" alt="Cocktail image">
                </div>
                <div class="image-upload__images__item__actions">
                    <label class="form-label" :for="'copyright-' + idx">{{ t('filename') }}:</label>
                    <p>{{ img.fileName }}</p>
                    <label class="form-label" :for="'copyright-' + idx">{{ t('imageupload.copyright') }}:</label>
                    <input :id="'copyright-' + idx" v-model="img.copyright" class="form-input form-input--small" type="text" :placeholder="t('placeholder.image-copyright')">
                    <div>
                        <a href="#" @click.prevent="removeImage(img)">{{ t('remove') }}</a>
                        &middot;
                        <SaltRimDialog v-model="imageDialogs[idx]">
                            <template #trigger>
                                <a href="#" @click.prevent="imageDialogs[idx] = !imageDialogs[idx]">{{ t('image-editor.edit-image') }}</a>
                            </template>
                            <template #dialog>
                                <ImageEditor v-model="images[idx]" @image-dialog-closed="imageDialogs[idx] = false"></ImageEditor>
                            </template>
                        </SaltRimDialog>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.image-upload__actions {
    margin-bottom: var(--gap-size-3);
}

.image-upload__images {
    display: grid;
    row-gap: var(--gap-size-3);
}

.image-upload__images__item {
    display: flex;
    padding: 1rem;
    gap: var(--gap-size-3);
}

.image-upload__images__item img {
    width: 100px;
}
</style>