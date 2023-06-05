<template>
    <div>
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ $t('generate-image-dialog.preview') }}</div>
        <div class="image-download-preview">
            <img v-if="imagePayload" :src="imagePayload" alt="">
            <div v-else class="image-export-wrapper" ref="exportElement">
                <PublicRecipe :cocktail="cocktail" :currentUnit="currentUnit" :hideUnits="true" :hideHeader="features.hideHeader" :hideFooter="features.hideFooter"></PublicRecipe>
            </div>
        </div>
        <!-- <div style="margin: 1rem 0;">
            <Checkbox v-model="features.hideHeader" id="id-features-hide-logo">{{ $t('generate-image-dialog.hide-header') }}</Checkbox>
            <Checkbox v-model="features.hideFooter" id="id-features-hide-logo">{{ $t('generate-image-dialog.hide-footer') }}</Checkbox>
        </div> -->
        <div class="dialog-actions" style="margin-top: 1rem;">
            <button type="button" class="button button--outline" @click="$emit('publicDialogClosed')">{{ $t('cancel') }}</button>
            <button v-if="shareEnabled" type="button" class="button button--outline" @click="shareAction">{{ $t('share') }}</button>
            <a v-if="imagePayload" :href="imagePayload" :download="fileName" class="button button--dark">{{ $t('download') }}</a>
        </div>
    </div>
</template>

<script>
import OverlayLoader from '@/components/OverlayLoader.vue'
import PublicRecipe from '@/components/Cocktail/PublicRecipe.vue'
import Checkbox from '@/components/Checkbox.vue';
import * as htmlToImage from 'html-to-image';

export default {
    props: ['cocktail'],
    data() {
        return {
            isLoading: false,
            imagePayload: null,
            currentUnit: 'ml',
            shareEnabled: false,
            features: {
                hideHeader: true,
                hideFooter: false,
            }
        }
    },
    components: {
        OverlayLoader,
        PublicRecipe,
        Checkbox
    },
    // watch: {
    //     features: {
    //         handler() {
    //             this.$nextTick(() => {
    //                 this.generateImage();
    //             })
    //         },
    //         deep: true
    //     }
    // },
    computed: {
        fileName() {
            return this.cocktail.slug + '.png';
        }
    },
    mounted() {
        if (localStorage.getItem('defaultUnit')) {
            this.currentUnit = localStorage.getItem('defaultUnit')
        }

        if ("share" in navigator) {
            this.shareEnabled = true;
        }

        this.generateImage();
    },
    methods: {
        generateImage() {
            this.isLoading = true;
            htmlToImage.toPng(this.$refs.exportElement, {
                pixelRatio: 1,
                cacheBust: true
            }).then((dataUrl) => {
                this.isLoading = false;
                this.imagePayload = dataUrl;
            }).catch((e) => {
                this.isLoading = false;
                console.error(e)
                this.$toast.error(this.$t('generate-image-dialog.generation-failed'));
            });
        },
        async shareAction() {
            const blobData = await (await fetch(this.imagePayload)).blob()
            const file = new File([blobData], this.fileName, {type: 'image/png'})

            try {
                await navigator.share({
                    title: this.cocktail.name,
                    text: this.cocktail.description,
                    files: [file]
                });
            } catch (err) {
                console.error(err)
            }
        }
    }
};
</script>

<style scoped>
.image-download-preview {
    overflow: scroll;
    max-height: 350px;
}
</style>
