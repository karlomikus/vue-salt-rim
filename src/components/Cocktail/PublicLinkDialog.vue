<template>
    <div>
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ $t('public-dialog.title') }}</div>
        <SubscriptionCheck>Subscribe to "Mixologist" plan to share your cocktail recipes!</SubscriptionCheck>
        <p class="public-url">{{ publicUrl }}</p>
        <p v-show="publicData.public_at != null">{{ $t('public-dialog.public_at', { date: createdDate }) }}</p>
        <div class="dialog-actions" style="margin-top: 1rem;">
            <button type="button" class="button button--outline" @click="$emit('publicDialogClosed')">{{ $t('close') }}</button>
            <button v-if="publicData.public_id" type="button" class="button button--outline" @click="deletePublicLink">{{ $t('public-dialog.action-delete') }}</button>
            <button v-else type="button" class="button button--outline" @click="generatePublicLink">{{ $t('public-dialog.action-generate') }}</button>
            <button type="button" class="button button--dark" :disabled="!publicData.public_at" @click="copyLink">{{ $t('public-dialog.action-copy') }}</button>
        </div>
    </div>
</template>

<script>
import ApiRequests from './../../ApiRequests.js'
import OverlayLoader from './../OverlayLoader.vue'
import dayjs from 'dayjs'
import SubscriptionCheck from '../SubscriptionCheck.vue'

export default {
    components: {
        OverlayLoader,
        SubscriptionCheck,
    },
    props: {
        cocktail: {
            type: Object,
            default() {
                return {}
            }
        },
    },
    emits: ['publicDialogClosed'],
    data() {
        return {
            isLoading: false,
            publicData: {
                public_id: this.cocktail.public_id,
                public_at: this.cocktail.public_at,
            },
            host: window.location.host,
            protocol: window.location.protocol
        }
    },
    computed: {
        publicUrl() {
            if (!this.publicData.public_id) {
                return this.$t('public-dialog.missing')
            }

            return `${this.protocol}//${this.host}/e/cocktail/${this.publicData.public_id}/${this.cocktail.slug}`
        },
        createdDate() {
            if (!this.publicData.public_at) {
                return null
            }

            const date = dayjs(this.publicData.public_at).toDate()

            return this.$d(date, 'long')
        }
    },
    methods: {
        generatePublicLink() {
            this.isLoading = true
            ApiRequests.createPublicLink(this.cocktail.id).then(data => {
                this.publicData = data
                this.isLoading = false
            }).catch(e => {
                this.$toast.error(e.message)
                this.isLoading = false
            })
        },
        deletePublicLink() {
            this.isLoading = true
            ApiRequests.deletePublicLink(this.cocktail.id).then(data => {
                this.publicData = data
                this.isLoading = false
            }).catch(e => {
                this.$toast.error(e.message)
                this.isLoading = false
            })
        },
        copyLink() {
            navigator.clipboard.writeText(this.publicUrl).then(() => {
                this.$toast.default(this.$t('public-dialog.toasts.copy-success'))
            }, () => {
                this.$toast.error(this.$t('public-dialog.toasts.copy-fail'))
            })
        }
    }
}
</script>

<style scoped>
.public-url {
    background: var(--clr-gray-100);
    padding: 0.5rem;
    font-weight: var(--fw-bold);
    font-size: 1.25rem;
    font-family: monospace;
    border-radius: var(--radius-1);
}

.dark-theme .public-url {
    background: var(--clr-gray-900);
}
</style>
