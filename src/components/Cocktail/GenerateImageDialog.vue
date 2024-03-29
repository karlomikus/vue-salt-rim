<template>
    <div>
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ $t('generate-image-dialog.preview') }}</div>
        <div class="image-download-preview">
            <img v-if="imagePayload" :src="imagePayload" alt="">
            <div v-else ref="exportElement" class="image-export-wrapper">
                <PublicRecipe :cocktail="cocktail" :hide-units="true" :hide-header="features.hideHeader" :hide-footer="features.hideFooter"></PublicRecipe>
            </div>
        </div>
        <div class="dialog-actions">
            <button type="button" class="button button--outline" @click="$emit('generateImageDialogClosed')">{{ $t('close') }}</button>
            <button v-if="shareEnabled" type="button" class="button button--outline" @click="shareAction">{{ $t('share.title') }}</button>
            <a v-if="imagePayload" :href="imagePayload" :download="fileName" class="button button--dark">{{ $t('download') }}</a>
        </div>
    </div>
</template>

<script>
import * as htmlToImage from 'html-to-image'
import OverlayLoader from './../OverlayLoader.vue'
import PublicRecipe from './PublicRecipe.vue'

export default {
    components: {
        OverlayLoader,
        PublicRecipe,
    },
    props: {
        cocktail: {
            type: Object,
            default() {
                return {}
            }
        },
    },
    emits: ['generateImageDialogClosed'],
    data() {
        return {
            isLoading: false,
            imagePayload: null,
            shareEnabled: false,
            features: {
                hideHeader: true,
                hideFooter: false,
            }
        }
    },
    computed: {
        fileName() {
            return this.cocktail.slug + '.png'
        }
    },
    mounted() {
        if ('share' in navigator) {
            this.shareEnabled = true
        }

        this.generateImage()
    },
    methods: {
        generateImage() {
            this.isLoading = true
            htmlToImage.toPng(this.$refs.exportElement, {
                pixelRatio: 1,
                cacheBust: true,
                fetchRequestInit: {
                    cache: 'no-cache',
                },
            }).then((dataUrl) => {
                this.isLoading = false
                this.imagePayload = dataUrl
            }).catch(() => {
                this.isLoading = false
                this.$toast.error(this.$t('generate-image-dialog.generation-failed'))
            })
        },
        async shareAction() {
            const blobData = await (await fetch(this.imagePayload)).blob()
            const file = new File([blobData], this.fileName, {type: 'image/png'})

            try {
                await navigator.share({
                    title: this.cocktail.name,
                    text: this.cocktail.description,
                    files: [file]
                })
            } catch {
                // Do nothing
            }
        }
    }
}
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
