<template>
  LOGIN
  <button type="button" @click="login">Login</button>
</template>

<script>
import Auth from '../Auth'

const auth = new Auth();

export default {
    methods: {
        login() {
            auth.login('admin@example.com', 'password');
        }
    }
}
</script>
