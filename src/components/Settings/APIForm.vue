<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <template v-if="!plainTextToken">
            <div class="dialog-title">{{ $t('api.add') }}</div>
            <div class="form-group">
                <label class="form-label form-label--required" for="name">{{ $t('name') }}:</label>
                <input id="name" v-model="apiKey.name" class="form-input" type="text" required>
            </div>
            <div class="form-group">
                <label class="form-label" for="expires-at">{{ $t('expires_at') }}:</label>
                <input id="expires-at" v-model="apiKey.expires_at" class="form-input" type="date">
            </div>
            <label class="form-label form-label--required">{{ $t('api.abilities') }}:</label>
            <div class="api-ability">
                <h4>{{ $t('cocktails.title') }}</h4>
                <div class="api-ability__options">
                    <label class="form-checkbox">
                        <input v-model="apiKey.abilities" type="checkbox" value="cocktails.read">
                        <span>{{ $t('api.read') }}</span>
                    </label>
                    <label class="form-checkbox">
                        <input v-model="apiKey.abilities" type="checkbox" value="cocktails.write">
                        <span>{{ $t('api.write') }}</span>
                    </label>
                </div>
            </div>
            <div class="api-ability">
                <h4>{{ $t('ingredients.title') }}</h4>
                <div class="api-ability__options">
                    <label class="form-checkbox">
                        <input v-model="apiKey.abilities" type="checkbox" value="ingredients.read">
                        <span>{{ $t('api.read') }}</span>
                    </label>
                    <label class="form-checkbox">
                        <input v-model="apiKey.abilities" type="checkbox" value="ingredients.write">
                        <span>{{ $t('api.write') }}</span>
                    </label>
                </div>
            </div>
            <div class="dialog-actions">
                <button class="button button--outline" @click.prevent="$emit('apiKeyDialogClosed')">{{ $t('cancel') }}</button>
                <button class="button button--dark" type="submit">{{ $t('save') }}</button>
            </div>
        </template>
        <template v-else>
            <div class="dialog-title">{{ $t('api.save-token') }}</div>
            <div class="alert alert--warning">{{ $t('api.token-notice') }}</div>
            <div class="api-input">
                <input ref="tokenInput" v-model="plainTextToken" type="text" class="form-input" spellcheck="false" readonly @focus="selectAll">
                <button type="button" class="button button--dark" @click="copy">{{ $t('copy') }}</button>
            </div>
            <div class="dialog-actions">
                <button class="button button--outline" @click.prevent="$emit('apiKeyDialogClosed')">{{ $t('close') }}</button>
            </div>
        </template>
    </form>
</template>

<script>
import ApiRequests from '../../ApiRequests'
import OverlayLoader from '../OverlayLoader.vue'

export default {
    components: {
        OverlayLoader,
    },
    emits: ['apiKeyDialogClosed'],
    data() {
        return {
            isLoading: false,
            apiKey: {
                abilities: [],
            },
            plainTextToken: null,
        }
    },
    methods: {
        submit() {
            this.isLoading = true

            const postData = {
                name: this.apiKey.name,
                expires_at: this.apiKey.expires_at,
                abilities: this.apiKey.abilities,
            }

            ApiRequests.saveToken(postData).then((data) => {
                this.isLoading = false
                this.$toast.default(this.$t('api.add-success'))
                this.plainTextToken = data.token
            }).catch(e => {
                this.$toast.error(e.message)
                this.isLoading = false
            })
        },
        selectAll() {
            this.$refs.tokenInput.select()
            this.$refs.tokenInput.setSelectionRange(0, 99999)
        },
        copy() {
            this.selectAll(this.$refs.tokenInput)
            navigator.clipboard.writeText(this.plainTextToken).then(() => {
                this.$toast.default(this.$t('api.key-copied'))
            }, () => {
                this.$toast.error('Unable to copy')
            })
        }
    }
}
</script>

<style scoped>
.api-ability {
    display: flex;
    margin-top: var(--gap-size-2);
}

.api-ability__options {
    margin-left: auto;
    display: flex;
    gap: var(--gap-size-1);
}

.api-ability__options .form-checkbox {
    background-color: var(--clr-gray-100);
    border: 1px solid var(--clr-gray-200);
    box-shadow: inset 0 1px 0 var(--clr-gray-50);
    border-radius: 3px;
    padding: 2px 7px;
}

.api-input {
    margin-top: var(--gap-size-3);
    display: flex;
    gap: var(--gap-size-1);
    align-items: center;
}

.api-input .form-input {
    width: 100%;
}
</style>