<template>
    <div class="image-upload">
        <div class="form-group">
            <label class="image-upload__select" for="images">
                Click here to browse for images. Max file size is 100mb.<br>
                PNG, JPG, WEBP or GIF, rec. 1000x1000px<br>
                Added {{ images.length }}/{{ maxImages }} images.
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
    watch: {
        value(newVal) {
            this.images = newVal
        }
    },
    data() {
        return {
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

            if (!confirm(`Are you sure you want to delete this image?`)) {
                return;
            }

            ApiRequests.deleteImage(img.id).then(() => {
                this.$toast.default(`Image removed successfully.`);
                this.images.splice(
                    this.images.findIndex(i => i == img),
                    1
                );
            }).catch(() => {
                this.$toast.default(`Unable to remove the image.`);
            })
        }
    }
}
</script>

<style scoped>
#images {
    display: none;
}

.image-upload__select {
    border: 2px dashed var(--clr-red-300);
    border-radius: 4px;
    display: block;
    text-align: center;
    background-color: rgba(255, 255, 255, .5);
    padding: 2rem;
    cursor: pointer;
}

.image-upload__select:is(:hover, :active, :focus) {
    border-color: var(--clr-red-500);
}

.image-upload__list {
    display: grid;
    row-gap: 1rem;
}

.image-upload__list__item {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    gap: 1rem;
}

.image-upload__list__item__image {
    width: 80px;
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
    width: 100%;
}
</style>
