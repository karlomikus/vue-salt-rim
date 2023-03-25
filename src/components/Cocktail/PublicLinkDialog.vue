<template>
    <div>
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ $t('public-dialog.title') }}</div>
        <p class="public-url">{{ publicUrl }}</p>
        <p v-show="publicData.public_at != null">{{ $t('public-dialog.public_at', {date: createdDate}) }}</p>
        <div class="dialog-actions" style="margin-top: 1rem;">
            <button type="button" class="button button--outline" @click="$emit('publicDialogClosed')">{{ $t('cancel') }}</button>
            <button v-if="publicData.public_id" type="button" class="button button--outline" @click="deletePublicLink">{{ $t('public-dialog.action-delete') }}</button>
            <button v-else type="button" class="button button--outline" @click="generatePublicLink">{{ $t('public-dialog.action-generate') }}</button>
            <button type="button" class="button button--dark" @click="copyLink" :disabled="!publicData.public_at">{{ $t('public-dialog.action-copy') }}</button>
        </div>
    </div>
</template>

<script>
import ApiRequests from '@/ApiRequests';
import OverlayLoader from '@/components/OverlayLoader.vue'
import dayjs from 'dayjs'

export default {
    props: ['cocktail'],
    data() {
        return {
            isLoading: false,
            publicData: {},
            host: window.location.host,
            protocol: window.location.protocol
        }
    },
    components: {
        OverlayLoader,
    },
    computed: {
        publicUrl() {
            if (!this.publicData.public_id) {
                return this.$t('public-dialog.missing');
            }

            return `${this.protocol}//${this.host}/e/cocktail/${this.publicData.public_id}/${this.cocktail.slug}`;
        },
        createdDate() {
            const date = dayjs(this.publicData.public_at).toDate();

            return this.$d(date, 'long');
        }
    },
    mounted() {
        this.generatePublicLink()
    },
    methods: {
        generatePublicLink() {
            this.isLoading = true
            ApiRequests.createPublicLink(this.cocktail.id).then(data => {
                this.publicData = data
                this.isLoading = false
            }).catch(e => {
                this.$toast.error(e.message);
                this.isLoading = false
            })
        },
        deletePublicLink() {
            this.isLoading = true
            ApiRequests.deletePublicLink(this.cocktail.id).then(data => {
                this.publicData = data
                this.isLoading = false
            }).catch(e => {
                this.$toast.error(e.message);
                this.isLoading = false
            })
        },
        copyLink() {
            navigator.clipboard.writeText(this.publicUrl).then(() => {
                this.$toast.default(this.$t('public-dialog.toasts.copy-success'));
            }, () => {
                this.$toast.error(this.$t('public-dialog.toasts.copy-fail'));
            });
        }
    }
};
</script>

<style scoped>
.public-url {
    background: var(--clr-gray-100);
    padding: 0.5rem;
    font-weight: var(--fw-bold);
    font-size: 1.25rem;
    font-family: monospace;
    border-radius: 0.25rem;
}
</style>
