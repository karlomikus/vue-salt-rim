<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ $t('exports.dialog-title') }}</div>
        <div class="form-group">
            <label class="form-label form-label--required" for="name">{{ $t('bars.bar') }}:</label>
            <select id="glass" v-model="exportModel.bar_id" class="form-select">
                <option :value="undefined" disabled>{{ $t('exports.bar-select') }}...</option>
                <option v-for="bar in bars" :key="bar.id" :value="bar.id">{{ bar.name }}</option>
            </select>
        </div>
        <div class="alert alert--warning">{{ $t('exports.export-notice') }}</div>
        <div class="dialog-actions">
            <button class="button button--outline" @click.prevent="$emit('exportDialogClosed')">{{ $t('cancel') }}</button>
            <button class="button button--dark" type="submit">{{ $t('start') }}</button>
        </div>
    </form>
</template>

<script>
import ApiRequests from '@/ApiRequests'
import OverlayLoader from '@/components/OverlayLoader.vue'

export default {
    components: {
        OverlayLoader
    },
    emits: ['exportDialogClosed'],
    data() {
        return {
            isLoading: false,
            exportModel: {},
        }
    },
    created() {
        this.refreshBars();
    },
    methods: {
        refreshBars() {
            this.isLoading = true
            ApiRequests.fetchBars().then(data => {
                this.bars = data.filter(bar => {
                    // Show only owned bars
                    return bar.access.can_delete
                })
                this.isLoading = false
            }).catch(e => {
                this.$toast.error(e.message)
                this.isLoading = false
            })
        },
        submit() {
            this.isLoading = true

            const postData = {
                bar_id: this.exportModel.bar_id,
            }

            ApiRequests.saveExport(postData).then(() => {
                this.isLoading = false
                this.$toast.default(this.$t('exports.start-success'))
                this.$emit('exportDialogClosed')
            }).catch(e => {
                this.$toast.error(e.message)
                this.isLoading = false
            })
        }
    }
}
</script>
