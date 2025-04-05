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
            <div class="api-abilities">
                <div class="api-ability">
                    <h4>{{ $t('cocktail.cocktails') }}</h4>
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
                    <h4>{{ $t('ingredient.ingredients') }}</h4>
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
                <div class="api-ability">
                    <h4>{{ $t('bars.title') }}</h4>
                    <div class="api-ability__options">
                        <label class="form-checkbox">
                            <input v-model="apiKey.abilities" type="checkbox" value="bars.read">
                            <span>{{ $t('api.read') }}</span>
                        </label>
                        <label class="form-checkbox">
                            <input v-model="apiKey.abilities" type="checkbox" value="bars.write">
                            <span>{{ $t('api.write') }}</span>
                        </label>
                    </div>
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
                <button type="button" class="button button--dark" @click="doCopy">{{ $t('copy') }}</button>
            </div>
            <div class="dialog-actions">
                <button class="button button--outline" @click.prevent="$emit('apiKeyDialogClosed')">{{ $t('close') }}</button>
            </div>
        </template>
    </form>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSaltRimToast } from '@/composables/toast';
import BarAssistantClient from '@/api/BarAssistantClient';
import OverlayLoader from '../OverlayLoader.vue'
import type { components } from '@/api/api'
import { useClipboard } from '@vueuse/core';

type PersonalAccessToken = components['schemas']['PersonalAccessToken']
type PersonalAccessTokenRequest = components['schemas']['PersonalAccessTokenRequest']

const isLoading = ref(false)
const tokenInput = useTemplateRef<HTMLInputElement>('tokenInput')
const plainTextToken = ref<string | null>(null)
const toast = useSaltRimToast()
const { t } = useI18n()
const apiKey = ref<PersonalAccessToken>({
    abilities: [] as string[],
} as PersonalAccessToken)

function submit() {
    isLoading.value = true

    const postData = {
        name: apiKey.value.name,
        expires_at: apiKey.value.expires_at,
        abilities: apiKey.value.abilities,
    } as PersonalAccessTokenRequest

    BarAssistantClient.saveToken(postData).then((resp) => {
        isLoading.value = false
        plainTextToken.value = resp?.data.token ?? null
        toast.default(t('api.add-success'))
    }).catch(e => {
        toast.error(e.message)
        isLoading.value = false
    })
}

function selectAll() {
    if (!tokenInput.value) {
        return
    }

    tokenInput.value.select()
    tokenInput.value.setSelectionRange(0, 99999)
}

function doCopy() {
    selectAll()

    const { copy, copied, isSupported } = useClipboard()

    if (!isSupported.value) {
        toast.error(t('permissions.clipboard-error'))
        return
    }

    copy(plainTextToken.value ?? '')

    if (copied.value) {
        toast.default(t('api.key-copied'))
    }
}
</script>

<style scoped>
.api-abilities {
    margin-top: var(--gap-size-2);
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-2);
}

.api-ability {
    display: flex;
    gap: var(--gap-size-2);
}

.api-ability__options {
    margin-left: auto;
    display: flex;
    gap: var(--gap-size-3);
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