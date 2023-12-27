<template>
    <div class="image-upload">
        <OverlayLoader v-if="isLoading" />
        <div class="form-group">
            <label class="image-upload__select" for="images">
                <div class="image-upload__select__icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z" /><path d="M4 19h16v-7h2v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-8h2v7zm9-10v7h-2V9H6l6-6 6 6h-5z" /></svg>
                </div>
                <p>
                    {{ $t('imageupload.browse') }}<br>
                    {{ $t('imageupload.validation') }}<br>
                    {{ $t('imageupload.status', {current: images.length, max: maxImages}) }}
                </p>
            </label>
            <input id="images" class="form-input" type="file" accept="image/*" :multiple="multiple" :disabled="hasMaxImages" @change="fileInputChanged">
        </div>
        <div ref="imageList" class="image-upload__list">
            <div v-for="(img, idx) in images" :key="idx" class="block-container image-upload__list__item" :data-id="img.file_path">
                <div class="drag-handle"></div>
                <div class="image-upload__list__item__image">
                    <img :src="img.url" alt="Cocktail image">
                    <a href="#" @click.prevent="removeImage(img)">{{ $t('remove') }}</a>
                    &middot;
                    <SaltRimDialog v-model="showImageEditDialogs[idx]">
                        <template #trigger>
                            <a href="#" @click.prevent="showImageEditDialogs[idx] = !showImageEditDialogs[idx]">{{ $t('image-editor.edit-image') }}</a>
                        </template>
                        <template #dialog>
                            <ImageEditor v-model="images[idx]" @image-dialog-closed="showImageEditDialogs[idx] = false"></ImageEditor>
                        </template>
                    </SaltRimDialog>
                </div>
                <div class="image-upload__list__item__actions">
                    <label class="form-label" :for="'copyright-' + idx">{{ $t('image-copyright') }}:</label>
                    <input :id="'copyright-' + idx" v-model="img.copyright" class="form-input form-input--small" type="text" :placeholder="$t('placeholder.image-copyright')">
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import ApiRequests from '@/ApiRequests'
import Sortable from 'sortablejs'
import OverlayLoader from './OverlayLoader.vue'
import ImageEditor from './ImageEditor.vue'
import SaltRimDialog from './Dialog/SaltRimDialog.vue'

export default {
    components: {
        OverlayLoader,
        ImageEditor,
        SaltRimDialog,
    },
    props: {
        value: {
            type: Array,
            default() {
                return []
            }
        },
        maxImages: {
            type: Number,
            default: 10
        }
    },
    data() {
        return {
            isLoading: false,
            images: this.value,
            sortable: null,
            showImageEditDialogs: {},
        }
    },
    computed: {
        hasMaxImages() {
            return this.images.length >= this.maxImages
        },
        multiple() {
            return this.maxImages > 1
        }
    },
    watch: {
        value(newVal) {
            this.images = newVal
        }
    },
    mounted() {
        this.sortable = Sortable.create(this.$refs.imageList, {
            handle: '.drag-handle',
            ghostClass: 'block-container--placeholder',
            animation: 150
        })
    },
    methods: {
        fileInputChanged(evt) {
            const readFile = (file) => {
                const reader = new FileReader()
                reader.onload = () => {
                    if (this.hasMaxImages) {
                        return
                    }

                    this.images.push({
                        id: null,
                        file: file,
                        file_path: file.name,
                        url: reader.result,
                        copyright: null,
                        sort: 0,
                    })
                }

                reader.readAsDataURL(file)
            }
            
            for (const file of evt.target.files) {
                readFile(file)
            }

            evt.target.value = ''
        },
        async uploadPictures() {
            const sortedImageList = this.sortable.toArray()
            let uploadedImages = []

            const newImagesFormData = new FormData()
            for (let i = 0; i < this.images.length; i++) {
                const img = this.images[i]
                const newSort = sortedImageList.findIndex(sortedId => sortedId == img.file_path) + 1

                if (img.id) {
                    const updateImageFormData = new FormData()
                    if (img.update_file == true) {
                        if (img.file instanceof File || img.file instanceof Blob) {
                            updateImageFormData.append('image', img.file)
                        } else {
                            updateImageFormData.append('image_url', img.file)
                        }
                    }
                    updateImageFormData.append('copyright', img.copyright ? img.copyright : '')
                    updateImageFormData.append('sort', newSort)
                    uploadedImages.push(await ApiRequests.updateSingleImage(img.id, updateImageFormData))
                } else {
                    if (img.file instanceof File || img.file instanceof Blob) {
                        newImagesFormData.append('images[' + i + '][image]', img.file)
                    } else {
                        newImagesFormData.append('images[' + i + '][image_url]', img.file)
                    }
                    newImagesFormData.append('images[' + i + '][copyright]', img.copyright ? img.copyright : '')
                    newImagesFormData.append('images[' + i + '][sort]', newSort)
                }
            }

            if (Array.from(newImagesFormData.values()).length > 0) {
                const newImages = await ApiRequests.uploadImages(newImagesFormData)
                uploadedImages = [...uploadedImages, ...newImages]
            }

            return Promise.resolve(uploadedImages)
        },
        removeImage(img) {
            if (!img.id) {
                this.images.splice(
                    this.images.findIndex(i => i == img),
                    1
                )

                return
            }

            this.$confirm(this.$t('imageupload.delete-confirm'), {
                onResolved: (dialog) => {
                    dialog.close()
                    this.isLoading = true
                    ApiRequests.deleteImage(img.id).then(() => {
                        this.isLoading = false
                        this.$toast.default(this.$t('imageupload.delete-success'))
                        this.images.splice(
                            this.images.findIndex(i => i == img),
                            1
                        )
                    }).catch(() => {
                        this.isLoading = false
                        this.$toast.default(this.$t('imageupload.delete-fail'))
                    })
                }
            })
        }
    }
}
</script>

<style scoped>
#images {
    display: none;
}

.image-upload {
    --image-upload-img-size: 150px;
}

@media (max-width: 450px) {
    .image-upload {
        --image-upload-img-size: 100px;
    }
}

.image-upload__select {
    --iu-clr-bg: rgba(255, 255, 255, .5);
    --iu-clr-border: var(--clr-accent-300);
    border: 2px dashed var(--iu-clr-border);
    border-radius: var(--radius-2);
    display: flex;
    background: var(--iu-clr-bg);
    padding: 1rem;
    cursor: pointer;
}

.dark-theme .image-upload__select {
    --iu-clr-bg: var(--clr-dark-main-700);
    --iu-clr-border: var(--clr-dark-main-600);
}

@media (max-width: 450px) {
    .image-upload__select {
        flex-direction: column;
        text-align: center;
    }
}

.image-upload__select:is(:hover, :active, :focus) {
    border-color: var(--clr-accent-500);
    background-color: #fff;
}

.dark-theme .image-upload__select:is(:hover, :active, :focus) {
    background-color: var(--clr-dark-main-700);
}

.image-upload__select__icon {
    width: 60px;
    height: 60px;
    border-radius: var(--radius-round);
    margin-right: 1rem;
    flex-shrink: 0;
    background: var(--clr-accent-100);
    display: flex;
    align-items: center;
    justify-content: center;
}

.dark-theme .image-upload__select__icon {
    background: var(--clr-dark-main-800);
}

.dark-theme .image-upload__select__icon svg {
    fill: var(--clr-dark-main-300);
}

@media (max-width: 450px) {
    .image-upload__select__icon {
        margin: 0 auto 1rem auto;
    }
}

.image-upload__list {
    display: grid;
    row-gap: var(--gap-size-3);
}

.image-upload__list__item {
    display: flex;
    padding: 1rem;
    gap: var(--gap-size-3);
}

.image-upload__list__item__image {
    width: var(--image-upload-img-size);
    flex-shrink: 0;
    text-align: center;
    font-size: 0.85rem;
}

.image-upload__list__item__image img {
    width: 100%;
    height: auto;
    display: block;
}

.image-upload__list__item__actions {
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-1);
}

.image-upload__list__item__actions .form-input {
    width: 100%;
}
</style>
