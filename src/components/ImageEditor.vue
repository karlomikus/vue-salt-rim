<template>
    <div>
        <OverlayLoader v-if="isLoading" />
        <SubscriptionCheck>Subscribe to "Mixologist" plan to enable image editing!</SubscriptionCheck>
        <div class="dialog-title">{{ $t('image-editor.title') }}</div>
        <div class="image-editor-container">
            <img ref="image" :src="modelValue.url">
        </div>
        <div class="image-editor-actions">
            <a href="#" @click.prevent="cropper.setDragMode('move')">{{ $t('image-editor.move') }}</a>
            &middot;
            <a href="#" @click.prevent="cropper.setDragMode('crop')">{{ $t('image-editor.crop') }}</a>
            &middot;
            <a href="#" @click.prevent="cropper.rotate(45)">{{ $t('image-editor.rotate') }} 45°</a>
            &middot;
            <a href="#" @click.prevent="cropper.rotate(-45)">{{ $t('image-editor.rotate') }} -45°</a>
            &middot;
            <a href="#" @click.prevent="cropper.scaleX(cropper.getData().scaleX * -1)">{{ $t('image-editor.flip-h') }}</a>
            &middot;
            <a href="#" @click.prevent="cropper.scaleY(cropper.getData().scaleY * -1)">{{ $t('image-editor.flip-v') }}</a>
        </div>
        <div class="dialog-actions">
            <button type="button" class="button button--outline" @click="$emit('imageDialogClosed')">{{ $t('close') }}</button>
            <button type="button" class="button button--dark" :disabled="!canEdit" @click="save">{{ $t('save') }}</button>
        </div>
    </div>
</template>
<script>
import Cropper from 'cropperjs'
import OverlayLoader from './OverlayLoader.vue'
import SubscriptionCheck from './SubscriptionCheck.vue'
import AppState from '../AppState'

export default {
    components: {
        OverlayLoader,
        SubscriptionCheck,
    },
    props: {
        modelValue: {
            type: Object,
            default() {
                return {}
            },
        },
    },
    emits: ['update:modelValue', 'imageDialogClosed'],
    data() {
        return {
            cropper: null,
        }
    },
    computed: {
        canEdit() {
            const appState = new AppState()
            if (!appState.isSubscribed()) {
                return false
            }

            return true
        }
    },
    mounted() {
        this.cropper = new Cropper(this.$refs.image, {
            viewMode: 1
        })
    },
    methods: {
        save() {
            if (!this.canEdit) {
                return
            }

            const croppedImage = this.cropper.getCroppedCanvas()

            this.$toast.default(this.$t('image-editor.edit-success'))

            croppedImage.toBlob(blob => {
                const newImage = Object.assign(this.modelValue, {url: croppedImage.toDataURL(), file: blob, update_file: true})
                this.$emit('update:modelValue', newImage)
                this.$emit('imageDialogClosed')
            })
        }
    }
}
</script>
<style>
.image-editor-container img {
    display: block;
    max-width: 100%;
    min-height: 500px;
}
</style>
