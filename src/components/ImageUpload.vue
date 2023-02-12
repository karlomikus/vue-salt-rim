<template>
    <div class="image-upload">
        <div class="form-group">
            <label class="form-label" for="images">Image:</label>
            <input class="form-input" type="file" id="images" accept="image/*" :multiple="multiple" @change="fileInputChanged" :disabled="hasMaxImages">
        </div>
        <div class="image-upload__list">
            <div class="image-upload__list__item" v-for="img in images">
                <div class="image-upload__list__item__image">
                    <img :src="img.url" :alt="img.filename">
                </div>
                <div class="image-upload__list__item__actions">
                    <div class="form-group">
                        <label class="form-label" for="copyright">Image copyright:</label>
                        <input class="form-input" type="text" id="copyright" v-model="img.copyright" placeholder="Image source URL or other reference...">
                    </div>
                    <button type="button" class="button button--dark button--small" @click="removeImage(img)">Remove</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import ApiRequests from "@/ApiRequests";

export default {
    props: {
        value: {
            type: Array,
            default: []
        },
        multiple: {
            type: Boolean,
            default: false
        }
    },
    watch: {
        value(newVal) {
            this.images = newVal
        }
    },
    data() {
        return {
            images: this.value
        }
    },
    computed: {
        hasMaxImages() {
            return this.multiple === false && this.images.length >= 1
        }
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
                        filename: file.name,
                        url: reader.result,
                        copyright: null
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
            const formData = new FormData();
            for (let i = 0; i < this.images.length; i++) {
                let img = this.images[i];

                if (img.id) {
                    const updateFormData = new FormData();
                    updateFormData.append('copyright', img.copyright ? img.copyright : '')
                    await ApiRequests.patchImage(img.id, updateFormData)
                } else {
                    formData.append('images[' + i + '][image]', img.file)
                    formData.append('images[' + i + '][copyright]', img.copyright ? img.copyright : '')
                }
            }

            if (Array.from(formData.values()).length > 0) {
                return ApiRequests.uploadImages(formData);
            }

            return Promise.resolve();
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
.image-upload__list {
    display: grid;
    row-gap: 10px;
}

.image-upload__list__item {
    display: flex;
    gap: 20px;
}

.image-upload__list__item__image {
    width: 100px;
    flex-shrink: 0;
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
