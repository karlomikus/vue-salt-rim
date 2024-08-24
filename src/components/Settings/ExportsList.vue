<template>
    <PageHeader>
        {{ $t('exports.title') }}
        <template #actions>
            <SaltRimDialog v-model="showDialog">
                <template #trigger>
                    <button type="button" class="button button--dark" @click.prevent="showDialog = true">{{ $t('exports.start') }}</button>
                </template>
                <template #dialog>
                    <ExportForm @export-dialog-closed="refreshExports" />
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
            <div v-if="barExports.length > 0" class="block-container block-container--padded" style="overflow: scroll;">
                <table class="table">
                    <thead>
                        <tr>
                            <th>{{ $t('created') }} / {{ $t('bars.bar') }}</th>
                            <th>{{ $t('status') }}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="ex in barExports" :key="ex.id">
                            <td>
                                <DateFormatter :date="ex.created_at" format="long"></DateFormatter>
                                <br>
                                <small>{{ ex.bar_name }}</small>
                            </td>
                            <td>
                                <span v-if="ex.is_done">{{ $t('exports.finished') }}</span>
                                <span v-else>{{ $t('exports.processing') }}</span>
                            </td>
                            <td style="text-align: right;">
                                <a class="list-group__action" href="#" @click.prevent="deleteExport(ex)">{{ $t('remove') }}</a>
                                &middot;
                                <a class="list-group__action" href="#" @click.prevent="downloadExport(ex)">{{ $t('download') }}</a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <EmptyState v-else>
                <template #icon>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M22 4C22 3.44772 21.5523 3 21 3H3C2.44772 3 2 3.44772 2 4V20C2 20.5523 2.44772 21 3 21H21C21.5523 21 22 20.5523 22 20V4ZM4 15H7.41604C8.1876 16.7659 9.94968 18 12 18C14.0503 18 15.8124 16.7659 16.584 15H20V19H4V15ZM4 5H20V13H15C15 14.6569 13.6569 16 12 16C10.3431 16 9 14.6569 9 13H4V5ZM16 11H13V14H11V11H8L12 6.5L16 11Z"></path></svg>
                </template>
                <template #default>
                    {{ $t('exports.empty') }}
                </template>
            </EmptyState>
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
import ExportForm from './ExportForm.vue'
import EmptyState from '../EmptyState.vue'
import BarAssistantClient from '@/api/BarAssistantClient'

export default {
    components: {
        OverlayLoader,
        SettingsNavigation,
        PageHeader,
        SaltRimDialog,
        DateFormatter,
        ExportForm,
        EmptyState,
    },
    data() {
        return {
            isLoading: false,
            showDialog: false,
            barExports: [],
        }
    },
    created() {
        document.title = `${this.$t('exports.title')} \u22C5 ${this.site_title}`

        this.refreshExports()
    },
    methods: {
        refreshExports() {
            this.showDialog = false

            this.isLoading = true
            ApiRequests.fetchExports().then(data => {
                this.barExports = data
                this.isLoading = false
            }).catch(e => {
                this.$toast.error(e.message)
            })
        },
        deleteExport(ex) {
            this.$confirm(this.$t('exports.confirm-delete'), {
                onResolved: (dialog) => {
                    this.isLoading = true
                    dialog.close()
                    ApiRequests.removeExport(ex.id).then(() => {
                        this.isLoading = false
                        this.$toast.default(this.$t('exports.delete-success'))
                        this.refreshExports()
                    }).catch(e => {
                        this.$toast.error(e.message)
                        this.isLoading = false
                    })
                }
            })
        },
        downloadExport(ex) {
            this.isLoading = true
            BarAssistantClient.generateExportDownloadURL(ex.id).then(resp => {
                this.isLoading = false
                window.open(resp.data.url, '_blank').focus();
            }).catch(e => {
                this.$toast.error(e.message)
                this.isLoading = false
            })
        }
    }
}
</script>
