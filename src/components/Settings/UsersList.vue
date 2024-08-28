<template>
    <PageHeader>
        {{ $t('users.title') }}
        <template v-if="appState.isSubscribed()" #actions>
            <SaltRimDialog v-model="showDialog">
                <template #trigger>
                    <button type="button" class="button button--dark" @click.prevent="openDialog($t('users.add'), {role: {}})">{{ $t('users.add') }}</button>
                </template>
                <template #dialog>
                    <UserForm :source-user="editUser" :dialog-title="dialogTitle" @user-dialog-closed="refreshUsers" />
                </template>
            </SaltRimDialog>
        </template>
    </PageHeader>
    <div class="settings-page">
        <div class="settings-page__nav">
            <Navigation />
        </div>
        <div class="settings-page__content">
            <OverlayLoader v-if="isLoading" />
            <div class="block-container block-container--padded">
                <SubscriptionCheck>Subscribe to "Mixologist" plan to gain access to user management!</SubscriptionCheck>
                <table class="table">
                    <thead>
                        <tr>
                            <th>{{ $t('users.display-name') }} / {{ $t('email') }}</th>
                            <th>{{ $t('users.role') }}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in users" :key="user.id">
                            <td>
                                <a href="#" @click.prevent="openDialog($t('users.edit'), user)">{{ user.name }}</a>
                                <br>
                                <small>{{ user.email }}</small>
                            </td>
                            <td>
                                {{ $t('roles.name.' + user.role.role_name) }}
                            </td>
                            <td style="text-align: right;">
                                <a v-if="user.id != appState.user.id" class="list-group__action" href="#" @click.prevent="deleteUser(user)">{{ $t('remove-from-bar') }}</a>
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
import OverlayLoader from '@/components/OverlayLoader.vue'
import PageHeader from '@/components/PageHeader.vue'
import Navigation from '@/components/Settings/SettingsNavigation.vue'
import SaltRimDialog from '@/components/Dialog/SaltRimDialog.vue'
import UserForm from '@/components/Settings/UserForm.vue'
import AppState from './../../AppState.js'
import SubscriptionCheck from '../SubscriptionCheck.vue'

export default {
    components: {
        OverlayLoader,
        Navigation,
        PageHeader,
        SaltRimDialog,
        UserForm,
        SubscriptionCheck
    },
    data() {
        return {
            appState: new AppState(),
            isLoading: false,
            showDialog: false,
            dialogTitle: 'User data',
            editUser: {
                role: {}
            },
            users: [],
        }
    },
    created() {
        document.title = `${this.$t('users.title')} \u22C5 ${this.site_title}`

        this.refreshUsers()
    },
    methods: {
        refreshUsers() {
            this.showDialog = false
            this.isLoading = true
            BarAssistantClient.getUsers().then(resp => {
                this.users = resp.data
                this.isLoading = false
            }).catch(e => {
                this.$toast.error(e.message)
            })
        },
        openDialog(title, obj) {
            this.dialogTitle = title
            this.editUser = obj
            this.showDialog = true
        },
        deleteUser(user) {
            const appState = new AppState()
            this.$confirm(this.$t('users.confirm-delete', {name: user.name}), {
                onResolved: (dialog) => {
                    this.isLoading = true
                    dialog.close()
                    BarAssistantClient.removeUserFromBar(appState.bar.id, user.id).then(() => {
                        this.isLoading = false
                        this.$toast.default(this.$t('users.delete-success'))
                        this.refreshUsers()
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
