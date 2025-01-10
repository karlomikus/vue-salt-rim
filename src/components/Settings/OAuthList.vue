<template>
    <PageHeader>
        {{ $t('api.oauth') }}
    </PageHeader>
    <div class="settings-page">
        <div class="settings-page__nav">
            <SettingsNavigation />
        </div>
        <div class="settings-page__content">
            <OverlayLoader v-if="isLoading" />
            <div class="block-container block-container--padded" style="overflow: scroll;">
                <table class="table">
                    <thead>
                        <tr>
                            <th>{{ $t('api.oauth-provider') }}</th>
                            <th>{{ $t('api.oauth-id') }}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="account in accounts" :key="account.id">
                            <td class="settings__oauth__provider">
                                <img :src="`/oauth-icons/${account.icon}`" alt="oauth login icon" width="24"
                                    height="24">
                                <div>
                                    <span>{{ account.name }}</span>
                                    <small>
                                        <DateFormatter :date="account.createdAt"></DateFormatter>
                                    </small>
                                </div>
                            </td>
                            <td>
                                {{ account.userId }}
                            </td>
                            <td style="text-align: right;">
                                <a class="list-group__action" href="#" @click.prevent="deleteAccount(account)">{{
                                    $t('api.oauth-unlink')
                                    }}</a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import BarAssistantClient from '@/api/BarAssistantClient'
import OverlayLoader from '../OverlayLoader.vue'
import PageHeader from '../PageHeader.vue'
import SettingsNavigation from './SettingsNavigation.vue'
import DateFormatter from '../DateFormatter.vue'
import { useTitle } from '@/composables/title'
import AppState from '../../AppState.js'

export default {
    components: {
        OverlayLoader,
        SettingsNavigation,
        PageHeader,
        DateFormatter,
    },
    data() {
        return {
            appState: new AppState(),
            isLoading: false,
            accounts: [],
        }
    },
    created() {
        useTitle(this.$t('api.oauth'))
        this.getAccounts()
    },
    methods: {
        async getAccounts() {
            this.isLoading = true;
            try {
                this.accounts = (await BarAssistantClient.getOAuthAccounts()).data
            } catch (err) {
                this.$toast.error(err.message)
            }
            this.isLoading = false;
        },
        async deleteAccount(account) {
            this.$confirm(this.$t('api.oauth-unlink-confirm', { name: account.name }), {
                onResolved: async (dialog) => {
                    this.isLoading = true
                    dialog.close()
                    try {
                        await BarAssistantClient.unlinkOAuthAccount(account.id)
                        this.$toast.default(this.$t('api.oauth-unlink-success'))
                        return this.getAccounts()
                    } catch (err) {
                        this.$toast.error(e.message)
                        this.isLoading = false
                    }
                }
            })
        }
    }
}
</script>

<style scoped>
.settings__oauth__provider {
    display: flex;
    align-items: center;
    gap: 1rem;
}
</style>