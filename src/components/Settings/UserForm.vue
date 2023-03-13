<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ dialogTitle }}</div>
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
            <Checkbox id="admin" v-model="user.is_admin">Is administrator</Checkbox>
        </div>
        <div class="dialog-actions">
            <button class="button button--outline" @click.prevent="$emit('userDialogClosed')">Cancel</button>
            <button class="button button--dark" type="submit">Save</button>
        </div>
    </form>
</template>

<script>
import ApiRequests from "@/ApiRequests";
import OverlayLoader from '@/components/OverlayLoader.vue'
import Checkbox from '@/components/Checkbox.vue'

export default {
    props: ['sourceUser', 'dialogTitle'],
    data() {
        return {
            isLoading: false,
            user: this.sourceUser,
        };
    },
    components: {
        OverlayLoader,
        Checkbox
    },
    methods: {
        submit() {
            this.isLoading = true;

            const postData = {
                name: this.user.name,
                email: this.user.email,
                is_admin: this.user.is_admin || false,
            };

            if (this.user.id) {
                if (this.user.password) {
                    postData.password = this.user.password;
                }

                ApiRequests.updateUserById(this.user.id, postData).then(() => {
                    this.isLoading = false;
                    this.$toast.default(`User updated successfully.`);
                    this.$emit('userDialogClosed')
                }).catch(e => {
                    this.$toast.error(e.message);
                    this.isLoading = false;
                })
            } else {
                postData.password = this.user.password;
                ApiRequests.saveUser(postData).then(() => {
                    this.isLoading = false;
                    this.$toast.default(`User added successfully.`);
                    this.$emit('userDialogClosed')
                }).catch(e => {
                    this.$toast.error(e.message);
                    this.isLoading = false;
                })
            }
        }
    }
}
</script>
