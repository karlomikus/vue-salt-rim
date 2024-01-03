<template>
    <PageHeader>
        {{ $t('profile') }}
    </PageHeader>
    <div class="settings-page">
        <div class="settings-page__nav">
            <Navigation />
        </div>
        <form class="settings-page__content" @submit.prevent="submit">
            <OverlayLoader v-if="isLoading" />
            <h3 style="margin-top: 0;" class="form-section-title">{{ $t('profile-information') }}</h3>
            <div class="block-container block-container--padded">
                <div class="form-group">
                    <label class="form-label form-label--required" for="name">{{ $t('user.name') }}:</label>
                    <input id="name" v-model="user.name" class="form-input" type="text" required>
                </div>
                <div class="form-group">
                    <label class="form-label form-label--required" for="email">{{ $t('email') }}:</label>
                    <input id="email" v-model="user.email" class="form-input" type="email" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="ui-language">{{ $t('ui-language') }}:</label>
                    <select id="ui-language" v-model="currentLocale" class="form-select">
                        <option v-for="locale in $i18n.availableLocales" :key="locale" :value="locale">{{ $t('locales.' + locale) }}</option>
                    </select>
                </div>
            </div>
            <h3 class="form-section-title">{{ $t('password') }}</h3>
            <div class="block-container block-container--padded">
                <div class="form-group">
                    <label class="form-label" for="new-password">{{ $t('new-password') }}:</label>
                    <input id="new-password" v-model="user.password" class="form-input" type="password">
                </div>
                <div class="form-group">
                    <label class="form-label" for="repeat-new-password">{{ $t('repeat-password') }}:</label>
                    <input id="repeat-new-password" v-model="user.repeatPassword" class="form-input" type="password">
                </div>
            </div>
            <template v-if="appState.bar.id">
                <h3 class="form-section-title">{{ $t('bars.bar') }}</h3>
                <div class="block-container block-container--padded">
                    <label class="form-checkbox">
                        <input v-model="user.is_shelf_public" :value="true" type="checkbox">
                        <span>{{ $t('profile-public-shelf') }}</span>
                    </label>
                    <label class="form-checkbox">
                        <input v-model="user.use_parent_as_substitute" :value="true" type="checkbox">
                        <span>{{ $t('profile-use-parent-as-substitute') }}</span>
                    </label>
                </div>
            </template>
            <h3 class="form-section-title">{{ $t('data') }}</h3>
            <div class="block-container block-container--padded">
                <!-- <button class="button button--outline" type="button" @click="downloadAccountData">{{ $t('download-account-data') }}</button>
                <br>
                <br> -->
                <button class="button button--outline button--danger" type="button" @click="deleteAccount">{{ $t('delete-my-account') }}</button>
            </div>
            <div class="form-actions">
                <button class="button button--dark" type="submit">{{ $t('save') }}</button>
            </div>
        </form>
    </div>
</template>

<script>
import ApiRequests from './../../ApiRequests.js'
import OverlayLoader from '@/components/OverlayLoader.vue'
import PageHeader from '@/components/PageHeader.vue'
import Navigation from '@/components/Settings/SettingsNavigation.vue'
import AppState from './../../AppState'

export default {
    components: {
        OverlayLoader,
        Navigation,
        PageHeader
    },
    data() {
        return {
            appState: new AppState(),
            isLoading: false,
            user: {
                is_shelf_public: false,
                use_parent_as_substitute: false,
            },
            currentLocale: this.$i18n.locale
        }
    },
    created() {
        document.title = `${this.$t('profile')} \u22C5 ${this.site_title}`

        this.isLoading = true

        ApiRequests.fetchUser().then(data => {
            this.user = data
            if (this.appState.bar.id) {
                const barMembership = data.memberships.filter(m => m.bar_id == this.appState.bar.id)
                this.user.is_shelf_public = barMembership.length > 0 ? barMembership[0].is_shelf_public : false
                this.user.use_parent_as_substitute = barMembership.length > 0 ? barMembership[0].use_parent_as_substitute : false
            }
            this.isLoading = false
        }).catch(e => {
            this.$toast.error(e.message)
            this.isLoading = false
        })
    },
    methods: {
        submit() {
            this.isLoading = true

            const postData = {
                email: this.user.email,
                name: this.user.name,
                password: this.user.password,
                password_confirmation: this.user.repeatPassword,
            }

            const appState = new AppState()

            if (this.currentLocale) {
                appState.setLanguage(this.currentLocale)
                this.$i18n.locale = this.currentLocale
            }

            if (appState.bar.id) {
                postData.bar_id = appState.bar.id
                postData.is_shelf_public = this.user.is_shelf_public
                postData.use_parent_as_substitute = this.user.use_parent_as_substitute
            }

            ApiRequests.updateUser(postData).then(data => {
                appState.setUser(data)
                this.isLoading = false
                this.$toast.default(this.$t('profile-updated'))
                this.user.password = null
                this.user.repeatPassword = null
            }).catch(e => {
                this.isLoading = false
                this.$toast.error(e.message)
            })
        },
        deleteAccount() {
            const appState = new AppState()

            this.$confirm(this.$t('users.confirm-delete', { name: this.user.name }), {
                onResolved: (dialog) => {
                    dialog.close()
                    this.isLoading = true
                    ApiRequests.deleteUser(this.user.id).then(() => {
                        this.isLoading = false
                        appState.clear()
                        this.$router.push({ name: 'login' })
                    }).catch(e => {
                        this.isLoading = false
                        this.$toast.error(e.message)
                    })
                }
            })
        }
    }
}
</script>
<style scoped>
.account-actions {
    display: flex;
    gap: var(--gap-size-3);
}
</style>
