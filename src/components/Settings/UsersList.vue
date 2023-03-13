<template>
    <PageHeader>
        Users
        <template #actions>
            <Dialog v-model="showDialog">
                <template #trigger>
                    <button type="button" class="button button--outline" @click.prevent="openDialog('Add user', {})">Add user</button>
                </template>
                <template #dialog>
                    <UserForm :source-user="editUser" :dialog-title="dialogTitle" @user-dialog-closed="refreshUsers" />
                </template>
            </Dialog>
        </template>
    </PageHeader>
    <div class="settings-page">
        <div class="settings-page__nav">
            <Navigation />
        </div>
        <div class="settings-page__content">
            <OverlayLoader v-if="isLoading" />
            <div class="block-container block-container--padded">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Name / Email</th>
                            <th>Administrator</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in users">
                            <td>
                                <a href="#" @click.prevent="openDialog('Edit user', user)">{{ user.name }}</a>
                                <br>
                                <small>{{ user.email }}</small>
                            </td>
                            <td>
                                <template v-if="user.is_admin">
                                    ✅
                                </template>
                                <template v-else>
                                    ❌
                                </template>
                            </td>
                            <td style="text-align: right;">
                                <a class="list-group__action" href="#" @click.prevent="deleteUser(user)">Delete</a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import ApiRequests from "@/ApiRequests";
import OverlayLoader from '@/components/OverlayLoader.vue'
import PageHeader from '@/components/PageHeader.vue'
import Navigation from '@/components/Settings/Navigation.vue'
import Dialog from '@/components/Dialog/Dialog.vue'
import UserForm from '@/components/Settings/UserForm.vue'

export default {
    components: {
        OverlayLoader,
        Navigation,
        PageHeader,
        Dialog,
        UserForm
    },
    data() {
        return {
            isLoading: false,
            showDialog: false,
            dialogTitle: 'User data',
            editUser: {},
            users: [],
        }
    },
    created() {
        document.title = `Users \u22C5 Salt Rim`

        this.refreshUsers()
    },
    methods: {
        refreshUsers() {
            this.showDialog = false
            this.isLoading = true;
            ApiRequests.fetchUsers().then(data => {
                this.users = data;
                this.isLoading = false;
            }).catch(e => {
                this.$toast.error(e.message);
            })
        },
        openDialog(title, obj) {
            this.dialogTitle = title
            this.editUser = obj
            this.showDialog = true;
        },
        deleteUser(user) {
            this.$confirm(`This will permanently delete user with name "${user.name}".`, {
                onResolved: (dialog) => {
                    this.isLoading = true
                    dialog.close()
                    ApiRequests.deleteUser(user.id).then(() => {
                        this.isLoading = false;
                        this.$toast.default(`User deleted successfully.`);
                        this.refreshUsers()
                    }).catch(e => {
                        this.$toast.error(e.message);
                        this.isLoading = false;
                    })
                }
            });
        }
    }
}
</script>
