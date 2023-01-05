<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <div class="form-group">
            <label class="form-label form-label--required" for="name">Name:</label>
            <input class="form-input" type="text" id="name" v-model="user.name" required placeholder="Your name...">
        </div>
        <div class="form-group">
            <label class="form-label form-label--required" for="email">Email:</label>
            <input class="form-input" type="email" id="email" v-model="user.email" required placeholder="Enter your email...">
        </div>
        <div class="form-group">
            <label class="form-label" for="new-password">New password:</label>
            <input class="form-input" type="password" id="new-password" v-model="user.password" placeholder="Type your new password...">
        </div>
        <div class="form-group">
            <label class="form-label" for="repeat-new-password">Repeat password:</label>
            <input class="form-input" type="password" id="repeat-new-password" v-model="user.repeatPassword" placeholder="Repeat your new password...">
        </div>
        <div class="form-actions">
            <RouterLink class="button button--outline" :to="{ name: 'home' }">Cancel</RouterLink>
            <button class="button button--dark" type="submit">Save</button>
        </div>
    </form>
</template>

<script>
import ApiRequests from "../../ApiRequests";
import Auth from "../../Auth";
import OverlayLoader from './../OverlayLoader.vue'

export default {
    data() {
        return {
            isLoading: false,
            user: {},
        };
    },
    components: {
        OverlayLoader
    },
    created() {
        document.title = `Edit profile \u22C5 Salt Rim`

        this.isLoading = true;

        ApiRequests.fetchUser().then(data => {
            this.user = data
            this.isLoading = false;
        }).catch(e => {
            this.$toast.error(e.message);
            this.isLoading = false;
        })
    },
    methods: {
        submit() {
            this.isLoading = true;

            const postData = {
                email: this.user.email,
                name: this.user.name,
                password: this.user.password,
                password_confirmation: this.user.repeatPassword,
            };

            ApiRequests.updateUser(postData).then(data => {
                Auth.rememberUser(data);
                this.isLoading = false;
                this.$toast.default('Your profile is updated.');
                this.user.password = null;
                this.user.repeatPassword = null;
            }).catch(e => {
                this.isLoading = false;
                this.$toast.error(e.message);
            })
        }
    }
}
</script>

<style scope>

</style>
