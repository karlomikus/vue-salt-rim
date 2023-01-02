<template>
    <PageHeader>
        User information
    </PageHeader>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <div class="form-group">
            <label class="form-label form-label--required" for="name">Name:</label>
            <input class="form-input" type="text" id="name" v-model="user.name" required placeholder="User name...">
        </div>
        <div class="form-group">
            <label class="form-label form-label--required" for="email">Email:</label>
            <input class="form-input" type="email" id="email" v-model="user.email" required placeholder="Email...">
        </div>
        <div class="form-group">
            <label class="form-label" :class="{'form-label--required': !user.id}" for="password">
                <template v-if="!user.id">
                    Password:
                </template>
                <template v-else>
                    Update password:
                </template>
            </label>
            <input class="form-input" type="password" id="password" v-model="user.password" :required="!user.id" placeholder="Password...">
        </div>
        <div class="form-group">
            <label class="form-label" for="admin">
                <input type="checkbox" id="admin" v-model="user.is_admin" :value="true"> Is administrator
            </label>
        </div>
        <div class="form-actions">
            <RouterLink class="button button--outline" :to="{ name: 'settings.users' }">Cancel</RouterLink>
            <button class="button button--dark" type="submit">Save</button>
        </div>
    </form>
</template>

<script>
import ApiRequests from "@/ApiRequests";
import OverlayLoader from '@/components/OverlayLoader.vue'
import PageHeader from '@/components/PageHeader.vue'

export default {
    data() {
        return {
            isLoading: false,
            userId: null,
            user: {},
        };
    },
    components: {
        OverlayLoader,
        PageHeader
    },
    created() {
        document.title = `User information \u22C5 Salt Rim`

        this.userId = this.$route.query.id || null;

        if (this.userId) {
            this.isLoading = true;

            ApiRequests.fetchUserById(this.userId).then(data => {
                this.isLoading = false
                this.user = data;
            }).catch(e => {
                this.isLoading = false
                this.$toast.error(e.message)
            })
        }
    },
    methods: {
        submit() {
            this.isLoading = true;

            const postData = {
                name: this.user.name,
                email: this.user.email,
                is_admin: this.user.is_admin || false,
            };

            if (this.userId) {
                if (this.user.password) {
                    postData.password = this.user.password;
                }

                ApiRequests.updateUserById(this.userId, postData).then(() => {
                    this.isLoading = false;
                    this.$toast.default(`User updated successfully.`);
                    this.$router.push({ name: 'settings.users' })
                }).catch(e => {
                    this.$toast.error(e.message);
                    this.isLoading = false;
                })
            } else {
                postData.password = this.user.password;
                ApiRequests.saveUser(postData).then(() => {
                    this.isLoading = false;
                    this.$toast.default(`User added successfully.`);
                    this.$router.push({ name: 'settings.users' })
                }).catch(e => {
                    this.$toast.error(e.message);
                    this.isLoading = false;
                })
            }
        }
    }
}
</script>

<style scope>

</style>
