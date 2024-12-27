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
const isDragover = ref(false)
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

onChange(files => handleFiles(files))

function handleFiles(files: FileList | null) {
    if (!files) {
        return
    }

    for (const file of files) {
        if (hasMaxImages.value || !file.type.startsWith('image/')) {
            return
        }

        const previewUrl = URL.createObjectURL(file)

        images.value.push({
            id: null,
            file: file,
            preview: previewUrl,
            fileName: file.name,
            copyright: null,
            sort: 1,
        })
    }
}

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

function handleDrop(e: DropEvent): void {
    e.preventDefault()
    isDragover.value = false
    handleFiles(e.dataTransfer.files)
}

function handleDragover(e: DragEvent): void {
    e.preventDefault()
    isDragover.value = true
}

function handleDragend(e: DragEvent): void {
    isDragover.value = false
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
        URL.revokeObjectURL(img.preview)
    }

    return (await BarAssistantClient.uploadImages(request))?.data
}
</script>
<template>
    <div class="block-container block-container--padded block-container--inset image-upload" :class="{'block-container--placeholder': isDragover}" @drop="handleDrop" @dragover="handleDragover" @dragleave="handleDragend" @dragend="handleDragend">
        <OverlayLoader v-if="isLoading" />
        <div class="image-upload__images" ref="imageList">
            <div v-if="images.length == 0" class="image-upload__images__onboard">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M216,40H72A16,16,0,0,0,56,56V72H40A16,16,0,0,0,24,88V200a16,16,0,0,0,16,16H184a16,16,0,0,0,16-16V184h16a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM72,56H216v62.75l-10.07-10.06a16,16,0,0,0-22.63,0l-20,20-44-44a16,16,0,0,0-22.62,0L72,109.37ZM184,200H40V88H56v80a16,16,0,0,0,16,16H184Zm32-32H72V132l36-36,49.66,49.66a8,8,0,0,0,11.31,0L194.63,120,216,141.38V168ZM160,84a12,12,0,1,1,12,12A12,12,0,0,1,160,84Z"></path></svg>
                <p>No images attached. Start by uploading your first image.</p>
            </div>
            <div class="block-container block-container--padded image-upload__images__item" v-for="(img, idx) in images" :key="idx" :data-id="img.fileName">
                <div class="drag-handle"></div>
                <div class="image-upload__images__item__container">
                    <div class="image-upload__images__item__image">
                        <img :src="img.preview" alt="Cocktail image">
                    </div>
                    <div class="image-upload__images__item__actions">
                        <label class="form-label" :for="'filename-' + idx">{{ t('filename') }}:</label>
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
        <div class="image-upload__actions">
            <button :disabled="hasMaxImages" type="button" @click="open()" class="button button--dark">{{ t('imageupload.browse') }}</button>
            <br>
            {{ t('imageupload.validation', {max: '50MB'}) }} &middot; {{ t('imageupload.status', {current: images.length, max: maxImages}) }}
        </div>
    </div>
</template>

<style scoped>
.image-upload--dragover {
    background-color: red;
}

.image-upload__images {
    margin-bottom: var(--gap-size-3);
    display: grid;
    row-gap: var(--gap-size-1);
}

.image-upload__images__item {
    display: flex;
    padding: 1rem;
    gap: var(--gap-size-3);
}

.image-upload__images__item img {
    width: 100px;
}

.image-upload__images__item__container {
    display: flex;
    gap: var(--gap-size-3);
    flex-direction: row;
}

@media (max-width: 450px) {
    .image-upload__images__item__container {
        flex-direction: column;
        gap: var(--gap-size-2);
    }
}

.image-upload__actions {
    text-align: center;
}

.image-upload__images__onboard {
    text-align: center;
}

.image-upload__images__onboard p {
    max-width: 400px;
    margin: 0 auto;
}

.image-upload__images__onboard svg {
    height: 64px;
    fill: var(--clr-gray-700);
}
</style>