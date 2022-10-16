<template>
    <div class="login-page">
        <form @submit.prevent="login">
            <div class="form-group">
                <label class="form-label" for="email">Email:</label>
                <input class="form-input" type="text" id="email" v-model="email">
            </div>
            <div class="form-group">
                <label class="form-label" for="password">Password:</label>
                <input class="form-input" type="password" id="password" v-model="password">
            </div>
            <button type="submit" class="button">Login</button>
        </form>
    </div>
</template>

<script>
import Auth from '../Auth'
import { useUserStore } from './../stores/user'

const auth = new Auth();

export default {
    setup() {
        const store = useUserStore()

        return {
            // you can return the whole store instance to use it in the template
            store,
        }
    },
    data() {
        return {
            email: null,
            password: null,
        }
    },
    methods: {
        login() {
            auth.login(this.email, this.password).then(() => {
                // this.store.setUser(resp)
                window.location.href = "/"
            });
        }
    }
}
</script>

<style scope>
.login-page {
    background-color: var(--color-site-header);
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.login-page form {
    background-color: var(--color-bg);
    width: 400px;
    padding: 30px;
    border-radius: 20px;
}
</style>
