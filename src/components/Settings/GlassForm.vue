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
        <div class="dialog-actions">
            <button class="button button--outline" @click.prevent="$emit('glassDialogClosed')">{{ $t('cancel') }}</button>
            <button class="button button--dark" type="submit">{{ $t('save') }}</button>
        </div>
    </form>
</template>

<script>
import ApiRequests from "@/ApiRequests";
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
        };
    },
    methods: {
        submit() {
            this.isLoading = true;

            const postData = {
                name: this.glass.name,
                description: this.glass.description,
            };

            if (this.glass.id) {
                ApiRequests.updateGlass(this.glass.id, postData).then(() => {
                    this.isLoading = false;
                    this.$toast.default(this.$t('glass-type.update-success'));
                    this.$emit('glassDialogClosed')
                }).catch(e => {
                    this.$toast.error(e.message);
                    this.isLoading = false;
                })
            } else {
                ApiRequests.saveGlass(postData).then(() => {
                    this.isLoading = false;
                    this.$toast.default(this.$t('glass-type.add-success'));
                    this.$emit('glassDialogClosed')
                }).catch(e => {
                    this.$toast.error(e.message);
                    this.isLoading = false;
                })
            }
        }
    }
}
</script>
