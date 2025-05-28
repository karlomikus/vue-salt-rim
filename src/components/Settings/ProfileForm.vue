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
                    <label class="form-label form-label--required" for="name">{{ $t('users.display-name') }}:</label>
                    <input id="name" v-model="user.name" class="form-input" type="text" required>
                </div>
                <div class="form-group">
                    <label class="form-label form-label--required" for="email">{{ $t('email') }}:</label>
                    <input id="email" v-model="user.email" class="form-input" type="email" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="ui-language">{{ $t('ui-language') }}:</label>
                    <select id="ui-language" v-model="currentLocale" class="form-select">
                        <option v-for="locale in sortedLocales" :key="locale" :value="locale">{{ $t('locales.' + locale) }} ({{ locale }})</option>
                    </select>
                    <p class="form-input-hint"><a href="https://crowdin.com/project/bar-assistant" target="_blank">{{ $t('locales.help') }}</a></p>
                </div>
                <div class="form-group">
                    <label class="form-label" for="ui-language">{{ $t('ui-theme') }}:</label>
                    <select id="ui-theme" v-model="currentTheme" class="form-select">
                        <option v-for="theme in themes" :key="theme" :value="theme">{{ $t('theme-' + theme) }}</option>
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
            <template v-if="user.oauth_credentials && user.oauth_credentials.length > 0">
                <h3 class="form-section-title">{{ $t('sso.profile-providers') }}</h3>
                <div class="block-container block-container--padded">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>{{ $t('sso.provider-name') }}</th>
                                <th>{{ $t('sso.created-date') }}</th>
                                <th>{{ $t('sso.is-configured') }}</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="cred in user.oauth_credentials" :key="cred.provider.name">
                                <td>{{ cred.provider.display_name }}</td>
                                <td :title="cred.created_at">{{ $d(cred.created_at, 'short') }}</td>
                                <td>{{ cred.provider.enabled ? $t('sso.provider-enabled') : $t('sso.provider-disabled') }}</td>
                                <td style="text-align: right;">
                                    <a class="list-group__action" href="#" @click.prevent="deleteSSOAccount(cred)">{{ $t('sso.delete-account') }}</a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </template>
            <template v-if="appState.bar.id">
                <h3 class="form-section-title">{{ $t('bars.bar') }}</h3>
                <div class="block-container block-container--padded">
                    <div class="form-group">
                        <SaltRimCheckbox id="parent-ingredient-checkbox" v-model="user.is_shelf_public" :label="$t('profile-public-shelf')" :description="$t('profile-public-shelf-description')"></SaltRimCheckbox>
                    </div>
                </div>
            </template>
            <h3 class="form-section-title">{{ $t('data') }}</h3>
            <div class="block-container block-container--padded">
                <button class="button button--outline button--danger" type="button" @click="deleteAccount">{{ $t('delete-my-account') }}</button>
            </div>
            <div class="form-actions">
                <button class="button button--dark" type="submit">{{ $t('save') }}</button>
            </div>
        </form>
    </div>
</template>

<script>
import BarAssistantClient from '@/api/BarAssistantClient'
import OverlayLoader from '@/components/OverlayLoader.vue'
import PageHeader from '@/components/PageHeader.vue'
import Navigation from '@/components/Settings/SettingsNavigation.vue'
import AppState from '../../AppState'
import SaltRimCheckbox from '../SaltRimCheckbox.vue'
import { useTitle } from '@/composables/title'

export default {
    components: {
        OverlayLoader,
        Navigation,
        PageHeader,
        SaltRimCheckbox
    },
    data() {
        return {
            appState: new AppState(),
            isLoading: false,
            user: {
                is_shelf_public: false,
            },
            themes: ['light', 'dark'],
            currentTheme: null,
            currentLocale: this.$i18n.locale
        }
    },
    created() {
        useTitle(this.$t('profile'))

        this.refreshProfile()
    },
    computed: {
        sortedLocales() {
            return this.$i18n.availableLocales.sort((a, b) => {
                return a.localeCompare(b)
            })
        }
    },
    methods: {
        async refreshProfile() {
            this.isLoading = true

            BarAssistantClient.getProfile().then(resp => {
                this.user = resp.data
                if (this.appState.bar.id) {
                    const barMembership = resp.data.memberships.filter(m => m.bar_id == this.appState.bar.id)
                    this.user.is_shelf_public = barMembership.length > 0 ? barMembership[0].is_shelf_public : false
                }

                if (resp.data.settings && resp.data.settings.theme) {
                    this.currentTheme = resp.data.settings.theme
                } else {
                    this.currentTheme = this.appState.theme
                }

                if (resp.data.settings && resp.data.settings.language) {
                    this.currentLocale = resp.data.settings.language
                } else {
                    this.currentLocale = this.appState.language
                }

                this.isLoading = false
            }).catch(e => {
                this.$toast.error(e.message)
                this.isLoading = false
            })
        },
        submit() {
            this.isLoading = true

            const postData = {
                email: this.user.email,
                name: this.user.name,
                password: this.user.password,
                password_confirmation: this.user.repeatPassword,
                settings: {
                    theme: this.currentTheme,
                    language: null,
                },
            }

            const appState = new AppState()

            if (this.currentLocale) {
                appState.setLanguage(this.currentLocale)
                this.$i18n.locale = this.currentLocale
                postData.settings.language = this.currentLocale
            }

            if (appState.bar.id) {
                postData.bar_id = appState.bar.id
                postData.is_shelf_public = this.user.is_shelf_public
            }

            BarAssistantClient.updateProfile(postData).then(resp => {
                appState.setUser(resp.data)
                this.isLoading = false
                this.$toast.default(this.$t('profile-updated'))
                this.user.password = null
                this.user.repeatPassword = null
            }).catch(e => {
                this.isLoading = false
                this.$toast.error(e.message)
            })
        },
        deleteSSOAccount(cred) {
            this.$confirm(this.$t('sso.confirm-delete', { name: cred.provider.display_name }), {
                onResolved: (dialog) => {
                    dialog.close()
                    this.isLoading = true
                    BarAssistantClient.deleteProfileSSOCredentials(cred.provider.name).then(() => {
                        this.isLoading = false
                        this.$toast.default(this.$t('sso.delete-success'))

                        this.refreshProfile()
                    }).catch(e => {
                        this.isLoading = false
                        this.$toast.error(e.message)
                    })
                }
            })
        },
        deleteAccount() {
            const appState = new AppState()

            this.$confirm(this.$t('users.confirm-delete', { name: this.user.name }), {
                onResolved: (dialog) => {
                    dialog.close()
                    this.isLoading = true
                    BarAssistantClient.deleteUser(this.user.id).then(() => {
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
