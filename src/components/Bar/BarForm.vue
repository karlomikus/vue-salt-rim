<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading"></OverlayLoader>
        <PageHeader>
            {{ $t('bars.bar') }}
        </PageHeader>
        <div class="block-container block-container--padded">
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
                    <input id="toggle-invite" v-model="enableInvites" type="checkbox" :value="true">
                    <span>{{ $t('bars.enable-invites') }}</span>
                </label>
                <template v-if="!bar.id">
                    <label v-for="option in importOptions" :key="option.value" class="form-checkbox">
                        <input v-model="bar.options" type="checkbox" :value="option.value">
                        <span>{{ option.name }}</span>
                    </label>
                </template>
            </div>
        </div>
        <div class="form-actions">
            <RouterLink class="button button--outline" :to="{ name: 'bars' }">{{ $t('cancel') }}</RouterLink>
            <button type="submit" class="button button--dark">{{ $t('save') }}</button>
        </div>
    </form>
</template>
<script>
import ApiRequests from './../../ApiRequests'
import OverlayLoader from './../OverlayLoader.vue'
import PageHeader from './../PageHeader.vue'

export default {
    components: {
        OverlayLoader,
        PageHeader
    },
    data() {
        return {
            isLoading: false,
            bar: {},
            enableInvites: true,
            importOptions: [
                { name: 'bars.import-base-cocktails', value: 'cocktails' },
                { name: 'bars.import-base-ingredients', value: 'ingredients' },
                { name: 'bars.import-base-glasses', value: 'glasses' },
                { name: 'bars.import-base-methods', value: 'methods' },
                { name: 'bars.import-base-utensils', value: 'utensils' },
                { name: 'bars.import-base-categories', value: 'categories' },
            ]
        }
    },
    created() {
        document.title = `${this.$t('bars.bar')} \u22C5 ${this.site_title}`

        const barId = this.$route.query.id || null

        if (barId) {
            this.isLoading = true
            ApiRequests.fetchBar(barId).then(data => {
                this.isLoading = false
                this.bar = data
                this.enableInvites = data.invite_code != null
            }).catch(e => {
                this.isLoading = false
                this.$toast.error(e.message)
            })
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
            })
        }
    }
}
</script>
