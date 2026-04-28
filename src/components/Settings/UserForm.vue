<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ dialogTitle }}</div>
        <div class="form-group">
            <label class="form-label form-label--required" for="email">{{ $t('email') }}:</label>
            <input id="email" v-model="user.email" class="form-input" type="email" required>
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
                email: this.user.email,
                role_id: this.user.role.role_id,
            }

            BarAssistantClient.saveMember(postData).then(() => {
                this.$toast.default(this.$t('users.add-success'))
                this.$emit('userDialogClosed')
            }).catch(e => {
                this.$toast.error('Unable to add a member. Make sure the user exists and is not already a member.')
            }).finally(() => {
                this.isLoading = false
            })
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
