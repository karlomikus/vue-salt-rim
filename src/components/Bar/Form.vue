<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading"></OverlayLoader>
        <div class="dialog-title">Create or join a bar</div>
        <div class="dialog-content">
            <div class="form-group">
                <label class="form-label form-label--required" for="name">{{ $t('name') }}:</label>
                <input class="form-input" type="text" id="name" v-model="bar.name" required>
            </div>
            <div class="form-group">
                <label class="form-label" for="subtitle">{{ $t('subtitle') }}:</label>
                <input class="form-input" type="text" id="subtitle" v-model="bar.subtitle">
            </div>
            <div class="form-group">
                <label class="form-label" for="description">{{ $t('description') }}:</label>
                <textarea rows="5" class="form-input" id="description" v-model="bar.description"></textarea>
            </div>
        </div>
        <div class="dialog-actions" style="margin-top: 1rem">
            <button type="button" class="button button--outline" @click="$emit('dialogClosed')">{{ $t('cancel') }}</button>
            <button type="submit" class="button button--dark">{{ $t('save') }}</button>
        </div>
    </form>
</template>
<script>
import ApiRequests from './../../ApiRequests';
import OverlayLoader from './../OverlayLoader.vue';

export default {
    data() {
        return {
            isLoading: false,
            bar: {}
        }
    },
    components: {
        OverlayLoader
    },
    methods: {
        submit() {
            this.isLoading = true;
            ApiRequests.saveBar({
                name: this.bar.name,
                subtitle: this.bar.subtitle,
                description: this.bar.description,
            }).then(() => {
                this.isLoading = false;
                this.$toast.default(this.$t('bars.add-success', {name: this.bar.name}));
                this.$emit('dialogClosed')
                this.$emit('barCreated')
            })
        }
    }
}
</script>
