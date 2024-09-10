<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ $t('exports.dialog-title') }}</div>
        <div class="form-group">
            <label class="form-label form-label--required" for="bar-name">{{ $t('bars.bar') }}:</label>
            <select id="bar-name" v-model="exportModel.bar_id" class="form-select">
                <option :value="undefined" disabled>{{ $t('exports.bar-select') }}...</option>
                <option v-for="bar in bars" :key="bar.id" :value="bar.id">{{ bar.name }}</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label form-label--required" for="export-type">{{ $t('type') }}:</label>
            <select id="export-type" v-model="exportModel.type" class="form-select">
                <option v-for="type in types" :key="type.id" :value="type.id">{{ type.name }}</option>
            </select>
            <p class="form-input-hint"><a href="#">{{ $t('exports.types-hint') }}</a></p>
        </div>
        <div class="form-group">
            <label class="form-label form-label--required" for="force-units">{{ $t('exports.force-units') }}:</label>
            <select id="force-units" v-model="exportModel.units" class="form-select">
                <option v-for="unit in units" :key="unit.id" :value="unit.id">{{ unit.name }}</option>
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
            exportModel: {
                type: 'schema',
                units: 'none',
            },
            types: [{
                id: 'datapack',
                name: 'Bar Assistant Datapack',
            }, {
                id: 'schema',
                name: 'JSON (Schema draft 2)',
            }, {
                id: 'xml',
                name: 'XML',
            }, {
                id: 'md',
                name: 'Markdown',
            }, {
                id: 'json-ld',
                name: 'Schema.org Recipe (JSON-LD)',
            }, {
                id: 'yaml',
                name: 'YAML',
            }],
            units: [{
                id: 'none',
                name: this.$t('unit.original'),
            }, {
                id: 'ml',
                name: this.$t('unit.ml-full'),
            }, {
                id: 'oz',
                name: this.$t('unit.oz-full'),
            }, {
                id: 'cl',
                name: this.$t('unit.cl-full'),
            }],
        }
    },
    created() {
        this.refreshBars()
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
                type: this.exportModel.type,
                units: this.exportModel.units,
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
