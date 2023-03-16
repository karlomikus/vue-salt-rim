<template>
    <div>
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">Cocktail public link</div>
        <p class="public-url">{{ publicUrl }}</p>
        <p v-show="publicData.public_at != null">Made public on: {{ createdDate }}</p>
        <div class="dialog-actions" style="margin-top: 1rem;">
            <button type="button" class="button button--outline" @click="$emit('publicDialogClosed')">Cancel</button>
            <button v-if="publicData.public_id" type="button" class="button button--outline" @click="deletePublicLink">Delete link</button>
            <button v-else type="button" class="button button--outline" @click="generatePublicLink">Generate link</button>
            <button type="button" class="button button--dark" @click="copyLink" :disabled="!publicData.public_at">Copy link</button>
        </div>
    </div>
</template>

<script>
import ApiRequests from '@/ApiRequests';
import OverlayLoader from '@/components/OverlayLoader.vue'
import * as dayjs from 'dayjs'

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
                return `No public link available`;
            }

            return `${this.protocol}//${this.host}/e/cocktail/${this.publicData.public_id}/${this.cocktail.slug}`;
        },
        createdDate() {
            return dayjs(this.publicData.public_at).format('YYYY-MM-DD HH:mm');
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
                this.$toast.default(`Cocktail public URL copied.`);
            }, () => {
                this.$toast.error(`Unable to write link to clipboard!`);
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
