<template>
    <div class="image-upload">
        <OverlayLoader v-if="isLoading" />
        <div class="form-group">
            <label class="image-upload__select" for="images">
                <div class="image-upload__select__icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M4 19h16v-7h2v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-8h2v7zm9-10v7h-2V9H6l6-6 6 6h-5z"/></svg>
                </div>
                <p>
                    Click here to browse for images.<br>
                    PNG, JPG, WEBP or GIF &middot; Max 100MB<br>
                    Added <strong>{{ images.length }}/{{ maxImages }}</strong> images.
                </p>
            </label>
            <input class="form-input" type="file" id="images" accept="image/*" :multiple="multiple" @change="fileInputChanged" :disabled="hasMaxImages">
        </div>
        <div class="image-upload__list" ref="imageList">
            <div class="block-container image-upload__list__item" v-for="(img, idx) in images" :data-id="img.file_path">
                <div class="drag-handle"></div>
                <div class="image-upload__list__item__image">
                    <img :src="img.url" alt="Cocktail image">
                    <a href="#" @click.prevent="removeImage(img)">Remove</a>
                </div>
                <div class="image-upload__list__item__actions">
                    <label class="form-label" :for="'copyright-' + idx">Image copyright:</label>
                    <input class="form-input form-input--small" type="text" :id="'copyright-' + idx" v-model="img.copyright" placeholder="Image source URL or other reference...">
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import ApiRequests from "@/ApiRequests";
import Sortable from 'sortablejs';
import OverlayLoader from '@/components/OverlayLoader.vue'

export default {
    props: {
        value: {
            type: Array,
            default: []
        },
        maxImages: {
            type: Number,
            default: 10
        }
    },
    components: {
        OverlayLoader
    },
    watch: {
        value(newVal) {
            this.images = newVal
        }
    },
    data() {
        return {
            isLoading: false,
            images: this.value,
            sortable: null
        }
    },
    computed: {
        hasMaxImages() {
            return this.images.length >= this.maxImages
        },
        multiple() {
            return this.maxImages > 1;
        }
    },
    mounted() {
        this.sortable = Sortable.create(this.$refs.imageList, {
            handle: '.drag-handle',
            ghostClass: 'block-container--placeholder',
            animation: 150
        });
    },
    methods: {
        fileInputChanged(evt) {
            const readFile = (file) => {
                const reader = new FileReader();
                reader.onload = () => {
                    if (this.hasMaxImages) {
                        return;
                    }

                    this.images.push({
                        id: null,
                        file: file,
                        file_path: file.name,
                        url: reader.result,
                        copyright: null,
                        sort: 0,
                    })
                };

                reader.readAsDataURL(file);
            }
            
            for (const file of evt.target.files) {
                readFile(file);
            }

            evt.target.value = ''
        },
        async uploadPictures() {
            const sortedImageList = this.sortable.toArray();

            const formData = new FormData();
            for (let i = 0; i < this.images.length; i++) {
                const img = this.images[i];
                const newSort = sortedImageList.findIndex(sortedId => sortedId == img.file_path) + 1;

                if (img.id) {
                    const updateFormData = new FormData();
                    updateFormData.append('copyright', img.copyright ? img.copyright : '')
                    updateFormData.append('sort', newSort)
                    await ApiRequests.patchImage(img.id, updateFormData)
                } else {
                    formData.append('images[' + i + '][image]', img.file)
                    formData.append('images[' + i + '][copyright]', img.copyright ? img.copyright : '')
                    formData.append('images[' + i + '][sort]', newSort)
                }
            }

            if (Array.from(formData.values()).length > 0) {
                return ApiRequests.uploadImages(formData);
            }

            return Promise.resolve([]);
        },
        removeImage(img) {
            if (!img.id) {
                this.images.splice(
                    this.images.findIndex(i => i == img),
                    1
                );

                return;
            }

            this.$confirm(`This will permanently remove the image.`, {
                onResolved: (dialog) => {
                    dialog.close();
                    this.isLoading = true;
                    ApiRequests.deleteImage(img.id).then(() => {
                        this.isLoading = false;
                        this.$toast.default(`Image removed successfully.`);
                        this.images.splice(
                            this.images.findIndex(i => i == img),
                            1
                        );
                    }).catch(() => {
                        this.isLoading = false;
                        this.$toast.default(`Unable to remove the image.`);
                    })
                }
            });
        }
    }
}
</script>

<style scoped>
#images {
    display: none;
}

.image-upload {
    --image-upload-img-size: 80px;
}

@media (max-width: 450px) {
    .image-upload {
        --image-upload-img-size: 60px;
    }
}

.image-upload__select {
    border: 2px dashed var(--clr-red-300);
    border-radius: 4px;
    display: flex;
    background-color: rgba(255, 255, 255, .5);
    padding: 2rem;
    cursor: pointer;
}

@media (max-width: 450px) {
    .image-upload__select {
        flex-direction: column;
        text-align: center;
    }
}

.image-upload__select:is(:hover, :active, :focus) {
    border-color: var(--clr-red-500);
    background-color: #fff;
}

.image-upload__select__icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin-right: 1rem;
    flex-shrink: 0;
    background: var(--clr-red-100);
    display: flex;
    align-items: center;
    justify-content: center;
}

@media (max-width: 450px) {
    .image-upload__select__icon {
        margin: 0 auto 1rem auto;
    }
}

.image-upload__list {
    display: grid;
    row-gap: 1rem;
}

.image-upload__list__item {
    display: flex;
    padding: 1rem;
    gap: 1rem;
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
    gap: 0.25rem;
}

.image-upload__list__item__actions .form-input {
    width: 100%;
}
</style>
