<template>
    <div class="login-page">
        <Logo></Logo>
        <form @submit.prevent="register">
            <OverlayLoader v-if="isLoading"></OverlayLoader>
            <div class="form-group">
                <label class="form-label form-label--required" for="email">Email:</label>
                <input class="form-input" type="email" id="email" v-model="newUser.email" required>
            </div>
            <div class="form-group">
                <label class="form-label form-label--required" for="password">Password:</label>
                <input class="form-input" type="password" id="password" v-model="newUser.password" required>
            </div>
            <div class="form-group">
                <label class="form-label form-label--required" for="password-repeat">Repeat password:</label>
                <input class="form-input" type="password" id="password-repeat" v-model="newUser.passwordRepeat" required>
            </div>
            <div class="form-group">
                <label class="form-label form-label--required" for="name">Name:</label>
                <input class="form-input" type="text" id="name" v-model="newUser.name" required>
            </div>
            <div style="text-align: right; margin-top: 20px;">
                <RouterLink class="button button--outline" :to="{ name: 'login' }">Cancel</RouterLink>
                <button type="submit" class="button button--dark" style="margin-left: 5px;">Register</button>
            </div>
        </form>
    </div>
</template>

<script>
import ApiRequests from '@/ApiRequests';
import OverlayLoader from '@/components/OverlayLoader.vue';
import Logo from '@/components/Logo.vue';

export default {
    data() {
        return {
            isLoading: false,
            newUser: {}
        }
    },
    components: {
        OverlayLoader,
        Logo
    },
    methods: {
        register() {
            const postData = {
                'email': this.newUser.email,
                'password': this.newUser.password,
                'name': this.newUser.name,
            };

            if (this.newUser.password != this.newUser.passwordRepeat) {
                this.$toast.error('Passwords do not match!')
                return;
            }

            this.isLoading = true
            ApiRequests.registerNewUser(postData).then(() => {
                this.$toast.default('You are now registered, you can now login with your information!')
                this.$router.push('/login');
            }).catch(e => {
                this.isLoading = false
                this.$toast.error(e.message)
            });
        }
    }
}
</script>
