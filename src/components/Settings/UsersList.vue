<template>
    <PageHeader>
        Users
        <template #actions>
            <RouterLink class="button button--outline" :to="{name: 'settings.users.form'}">Add user</RouterLink>
        </template>
    </PageHeader>
    <div class="settings-page">
        <div class="settings-page__nav">
            <Navigation />
        </div>
        <div class="settings-page__content">
            <OverlayLoader v-if="isLoading" />
            <table class="table">
                <thead>
                    <tr>
                        <th>Name / Email</th>
                        <th>Admin</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in users">
                        <td>
                            <RouterLink :to="{name: 'settings.users.form', query: {id: user.id}}">{{ user.name }}</RouterLink>
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
                            <a class="list-group__action" href="#" @click.prevent="deleteUser(user.id)">Delete</a>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import ApiRequests from "@/ApiRequests";
import OverlayLoader from '@/components/OverlayLoader.vue'
import PageHeader from '@/components/PageHeader.vue'
import Navigation from '@/components/Settings/Navigation.vue'

export default {
    components: {
        OverlayLoader,
        Navigation,
        PageHeader
    },
    data() {
        return {
            isLoading: false,
            users: [],
        }
    },
    created() {
        document.title = `Users \u22C5 Salt Rim`

        this.refreshUsers()
    },
    methods: {
        refreshUsers() {
            this.isLoading = true;
            ApiRequests.fetchUsers().then(data => {
                this.users = data;
                this.isLoading = false;
            }).catch(e => {
                this.$toast.error(e.message);
            })
        },
        deleteUser(id) {
            if (confirm('Are you sure you want to delete this user?')) {
                this.isLoading = true
                ApiRequests.deleteUser(id).then(() => {
                    this.isLoading = false;
                    this.$toast.default(`User deleted successfully.`);
                    this.$router.push({ name: 'settings.users' })
                    this.refreshUsers()
                }).catch(e => {
                    this.$toast.error(e.message);
                    this.isLoading = false;
                })
            }
        }
    }
}
</script>
