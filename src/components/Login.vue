<template>
    <form @submit.prevent="login">
        <label for="email">Email:</label>
        <input type="text" id="email" v-model="email">
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password">
        <button type="submit" class="button">Login</button>
    </form>
</template>

<script>
import Auth from '../Auth'

const auth = new Auth();

export default {
    data() {
        return {
            email: null,
            password: null,
        }
    },
    methods: {
        login() {
            auth.login(this.email, this.password).then(() => {
                window.location.href = "/"
            });
        }
    }
}
</script>
