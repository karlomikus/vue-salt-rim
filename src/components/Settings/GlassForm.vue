<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ dialogTitle }}</div>
        <div class="form-group">
            <label class="form-label form-label--required" for="name">{{ $t('name') }}:</label>
            <input id="name" v-model="glass.name" class="form-input" type="text" required>
        </div>
        <div class="form-group">
            <label class="form-label" for="description">{{ $t('description') }}:</label>
            <textarea id="description" v-model="glass.description" rows="5" class="form-input"></textarea>
        </div>
        <div style="display: flex; gap: 0.5rem;">
            <div class="form-group" style="flex-basis: 300px;">
                <label class="form-label" for="volume">{{ $t('volume') }}:</label>
                <input id="volume" v-model="glass.volume" class="form-input" type="text" style="width: 100%;">
            </div>
            <div class="form-group" style="flex-basis: 100%;">
                <label class="form-label" for="volume_units">{{ $t('units') }}:</label>
                <input id="volume_units" v-model="glass.volume_units" class="form-input" type="text" style="width: 100%;">
            </div>
        </div>
        <div class="dialog-actions">
            <button class="button button--outline" @click.prevent="$emit('glassDialogClosed')">{{ $t('cancel') }}</button>
            <button class="button button--dark" type="submit">{{ $t('save') }}</button>
        </div>
    </form>
</template>

<script>
import BarAssistantClient from '@/api/BarAssistantClient'
import OverlayLoader from '@/components/OverlayLoader.vue'

export default {
    components: {
        OverlayLoader,
    },
    props: {
        sourceGlass: {
            type: Object,
            default() {
                return {}
            }
        },
        dialogTitle: {
            type: String,
            default: ''
        },
    },
    emits: ['glassDialogClosed'],
    data() {
        return {
            isLoading: false,
            glass: this.sourceGlass,
        }
    },
    methods: {
        submit() {
            this.isLoading = true

            const postData = {
                name: this.glass.name,
                description: this.glass.description,
                volume: this.glass.volume,
                volume_units: this.glass.volume_units,
            }

            if (this.glass.id) {
                BarAssistantClient.updateGlass(this.glass.id, postData).then(() => {
                    this.isLoading = false
                    this.$toast.default(this.$t('glass-type.update-success'))
                    this.$emit('glassDialogClosed')
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false
                })
            } else {
                BarAssistantClient.saveGlass(postData).then(() => {
                    this.isLoading = false
                    this.$toast.default(this.$t('glass-type.add-success'))
                    this.$emit('glassDialogClosed')
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false
                })
            }
        }
    }
}
</script>
