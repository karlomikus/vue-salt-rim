<template>
    <PageHeader>
        {{ $t('api.tokens') }}
        <template #actions>
            <SaltRimDialog v-model="showDialog">
                <template #trigger>
                    <button type="button" class="button button--dark" @click.prevent="showDialog = true">{{ $t('api.add') }}</button>
                </template>
                <template #dialog>
                    <APIForm @api-key-dialog-closed="refreshTokens" />
                </template>
            </SaltRimDialog>
        </template>
    </PageHeader>
    <div class="settings-page">
        <div class="settings-page__nav">
            <SettingsNavigation />
        </div>
        <div class="settings-page__content">
            <OverlayLoader v-if="isLoading" />
            <SubscriptionCheck>Subscribe to "Mixologist" plan to gain access to API token management!</SubscriptionCheck>
            <div class="block-container block-container--padded" style="overflow: scroll;">
                <table class="table">
                    <thead>
                        <tr>
                            <th>{{ $t('name') }} / {{ $t('created') }}</th>
                            <th>{{ $t('api.abilities') }}</th>
                            <th>{{ $t('last_used_at') }}</th>
                            <th>{{ $t('expires_at') }}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="token in tokens" :key="token.id">
                            <td>
                                {{ token.name }}
                                <br>
                                <small><DateFormatter :date="token.created_at"></DateFormatter></small>
                            </td>
                            <td>
                                <ul class="chips-list">
                                    <li v-for="ability in token.abilities" :key="ability" class="chip">{{ ability }}</li>
                                </ul>
                            </td>
                            <td><DateFormatter v-if="token.last_used_at" :date="token.last_used_at"></DateFormatter></td>
                            <td><DateFormatter v-if="token.expires_at" :date="token.expires_at"></DateFormatter></td>
                            <td style="text-align: right;">
                                <a class="list-group__action" href="#" @click.prevent="deleteToken(token)">{{ $t('revoke') }}</a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import ApiRequests from '../../ApiRequests'
import OverlayLoader from '../OverlayLoader.vue'
import PageHeader from '../PageHeader.vue'
import SettingsNavigation from './SettingsNavigation.vue'
import SaltRimDialog from '../Dialog/SaltRimDialog.vue'
import DateFormatter from '../DateFormatter.vue'
import APIForm from './APIForm.vue'
import SubscriptionCheck from '../SubscriptionCheck.vue'

export default {
    components: {
        OverlayLoader,
        SettingsNavigation,
        PageHeader,
        SaltRimDialog,
        DateFormatter,
        APIForm,
        SubscriptionCheck,
    },
    data() {
        return {
            isLoading: false,
            showDialog: false,
            tokens: [],
        }
    },
    created() {
        document.title = `${this.$t('api.tokens')} \u22C5 ${this.site_title}`

        this.refreshTokens()
    },
    methods: {
        refreshTokens() {
            this.showDialog = false

            this.isLoading = true
            ApiRequests.fetchTokens().then(data => {
                this.tokens = data
                this.isLoading = false
            }).catch(e => {
                this.$toast.error(e.message)
            })
        },
        deleteToken(token) {
            this.$confirm(this.$t('api.confirm-revoke', {name: token.name}), {
                onResolved: (dialog) => {
                    this.isLoading = true
                    dialog.close()
                    ApiRequests.removeToken(token.id).then(() => {
                        this.isLoading = false
                        this.$toast.default(this.$t('api.revoke-success'))
                        this.refreshTokens()
                    }).catch(e => {
                        this.$toast.error(e.message)
                        this.isLoading = false
                    })
                }
            })
        }
    }
}
</script>
