<template>
    <form @submit.prevent="submit" novalidate>
        <h2 class="page-subtitle">Profile</h2>
        <div class="form-group">
            <label class="form-label form-label--required" for="name">Name:</label>
            <input class="form-input" type="text" id="name" v-model="user.name" required placeholder="Your name...">
        </div>
        <div class="form-group">
            <label class="form-label form-label--required" for="name">Email:</label>
            <input class="form-input" type="text" id="name" v-model="user.email" required placeholder="Enter your email...">
        </div>
        <div class="form-actions">
            <!-- <RouterLink class="button button--outline" :to="{ name: 'cocktails.show', params: { id: cocktailId } }" v-if="cocktailId">Cancel</RouterLink>
            <RouterLink class="button button--outline" :to="{ name: 'cocktails' }" v-else>Cancel</RouterLink>
            <button class="button button--dark" type="submit">Save</button> -->
        </div>
    </form>
</template>

<script>
import ApiRequests from "../../ApiRequests";

export default {
    data() {
        return {
            isLoading: false,
            user: {},
        };
    },
    created() {
        document.title = `Edit profile \u22C5 Salt Rim`

        this.isLoading = true;

        ApiRequests.fetchUser().then(data => {
            this.user = data
        })
    },
    methods: {
    }
}
</script>

<style scope>

</style>
