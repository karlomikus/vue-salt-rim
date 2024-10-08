<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ dialogTitle }}</div>
        <div class="form-group">
            <label class="form-label form-label--required" for="name">{{ $t('users.display-name') }}:</label>
            <input id="name" v-model="user.name" class="form-input" type="text" required>
        </div>
        <div class="form-group">
            <label class="form-label form-label--required" for="email">{{ $t('email') }}:</label>
            <input id="email" v-model="user.email" class="form-input" type="email" required>
        </div>
        <div class="form-group">
            <label class="form-label" :class="{ 'form-label--required': !user.id }" for="password">
                <template v-if="!user.id">
                    {{ $t('password') }}:
                </template>
                <template v-else>
                    {{ $t('update-password') }}:
                </template>
            </label>
            <input id="password" v-model="user.password" class="form-input" type="password" :required="!user.id">
        </div>
        <div class="form-group">
            <label class="form-label">{{ $t('users.role') }}:</label>
            <div class="user-roles">
                <SaltRimRadio v-for="role in roles" :key="role.id" v-model="user.role.role_id" :value="role.id" :title="role.name" :description="role.description"></SaltRimRadio>
            </div>
        </div>
        <div class="dialog-actions">
            <button class="button button--outline" @click.prevent="$emit('userDialogClosed')">{{ $t('cancel') }}</button>
            <button class="button button--dark" type="submit">{{ $t('save') }}</button>
        </div>
    </form>
</template>

<script>
import BarAssistantClient from '@/api/BarAssistantClient'
import OverlayLoader from './../OverlayLoader.vue'
import SaltRimRadio from './../SaltRimRadio.vue'

export default {
    components: {
        OverlayLoader,
        SaltRimRadio
    },
    props: {
        sourceUser: {
            type: Object,
            default() {
                return {
                    role: {}
                }
            }
        },
        dialogTitle: {
            type: String,
            default: ''
        },
    },
    emits: ['userDialogClosed'],
    data() {
        return {
            isLoading: false,
            user: this.sourceUser,
            roles: [
                { id: 1, name: this.$t('roles.name.Admin'), description: this.$t('roles.description.Admin') },
                { id: 2, name: this.$t('roles.name.Moderator'), description: this.$t('roles.description.Moderator') },
                { id: 3, name: this.$t('roles.name.General'), description: this.$t('roles.description.General') },
                { id: 4, name: this.$t('roles.name.Guest'), description: this.$t('roles.description.Guest') },
            ]
        }
    },
    methods: {
        submit() {
            this.isLoading = true

            const postData = {
                name: this.user.name,
                email: this.user.email,
                role_id: this.user.role.role_id,
            }

            if (this.user.id) {
                if (this.user.password) {
                    postData.password = this.user.password
                }

                BarAssistantClient.updateUser(this.user.id, postData).then(() => {
                    this.isLoading = false
                    this.$toast.default(this.$t('users.update-success'))
                    this.$emit('userDialogClosed')
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false
                })
            } else {
                postData.password = this.user.password
                BarAssistantClient.saveUser(postData).then(() => {
                    this.isLoading = false
                    this.$toast.default(this.$t('users.add-success'))
                    this.$emit('userDialogClosed')
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false
                })
            }
        }
    }
}
</script>

<style scoped>
.user-roles {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--gap-size-2);
}

@media (max-width: 450px) {
    .user-roles {
        grid-template-columns: 1fr;
    }
}
</style>
