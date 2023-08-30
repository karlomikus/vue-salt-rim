<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading"></OverlayLoader>
        <div class="dialog-title">{{ $t('bars.add') }}</div>
        <div class="dialog-content">
            <div class="form-group">
                <label class="form-label form-label--required" for="name">{{ $t('name') }}:</label>
                <input id="name" v-model="bar.name" class="form-input" type="text" required>
            </div>
            <div class="form-group">
                <label class="form-label" for="subtitle">{{ $t('subtitle') }}:</label>
                <input id="subtitle" v-model="bar.subtitle" class="form-input" type="text">
            </div>
            <div class="form-group">
                <label class="form-label" for="description">{{ $t('description') }}:</label>
                <textarea id="description" v-model="bar.description" rows="5" class="form-input"></textarea>
            </div>
            <div class="form-group">
                <label class="form-checkbox" for="toggle-invite">
                    <input id="toggle-invite" v-model="bar.enableInvites" type="checkbox" :value="true">
                    <span>Enable invites</span>
                </label>
                <label v-for="option in importOptions" :key="option.value" class="form-checkbox">
                    <input v-model="bar.options" type="checkbox" :value="option.value">
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
import ApiRequests from './../../ApiRequests'
import OverlayLoader from './../OverlayLoader.vue'

export default {
    components: {
        OverlayLoader
    },
    emits: ['dialogClosed', 'barCreated'],
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
    methods: {
        submit() {
            this.isLoading = true
            ApiRequests.saveBar({
                name: this.bar.name,
                subtitle: this.bar.subtitle,
                description: this.bar.description,
            }).then(() => {
                this.isLoading = false
                this.$toast.default(this.$t('bars.add-success', { name: this.bar.name }))
                this.$emit('dialogClosed')
                this.$emit('barCreated')
            })
        }
    }
}
</script>
