<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading"></OverlayLoader>
        <div class="dialog-title">{{ $t('bars.add') }}</div>
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
            <div class="form-group">
                <label class="form-checkbox" for="toggle-invite">
                    <input type="checkbox" id="toggle-invite" :value="true" v-model="bar.enableInvites">
                    <span>Enable invites</span>
                </label>
                <label class="form-checkbox" v-for="option in importOptions">
                    <input type="checkbox" :value="option.value" v-model="bar.options">
                    <span>{{ option.name }}</span>
                </label>
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
            bar: {
                enableInvites: true,
                options: [
                    'cocktails',
                    'ingredients',
                    'glasses',
                    'methods',
                    'utensils',
                    'categories',
                ],
            },
            importOptions: [
                { name: 'cocktails', value: 'cocktails' },
                { name: 'ingredients', value: 'ingredients' },
                { name: 'glasses', value: 'glasses' },
                { name: 'methods', value: 'methods' },
                { name: 'utensils', value: 'utensils' },
                { name: 'categories', value: 'categories' },
            ]
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
                this.$toast.default(this.$t('bars.add-success', { name: this.bar.name }));
                this.$emit('dialogClosed')
                this.$emit('barCreated')
            })
        }
    }
}
</script>
