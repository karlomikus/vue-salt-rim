<template>
    <button v-if="shouldShowButton" type="button" class="button button--ai" @click="startGenerate" :title="title" :disabled="isLoading">
        <IconAI v-show="!isLoading" />
        <SaltRimSpinner v-show="isLoading" fill="#4d0724"/>
    </button>
</template>

<script setup lang="ts">
import { useLLM } from '@/composables/useGenerativeAI'
import IconAI from '../Icons/IconAI.vue'
import { computed, ref } from 'vue'
import SaltRimSpinner from '../SaltRimSpinner.vue';

const isLoading = ref(false)

const {
    prompt,
    title = 'Generate with AI',
    format = 'json'
} = defineProps<{
    prompt: string,
    title?: string,
    format?: string | object
}>()

const emit = defineEmits<{
    (e: 'beforeGeneration'): void
    (e: 'afterGeneration', result: any): void
}>()

const provider = useLLM()

const shouldShowButton = computed(() => {
    return provider.settings.host && provider.settings.model && prompt && prompt.length > 2
})

const startGenerate = () => {
    isLoading.value = true
    emit('beforeGeneration')
    provider.generate(prompt, {
        format: format
    }).then(() => {
        const result = JSON.parse(provider.response.value)
        emit('afterGeneration', result)
        isLoading.value = false
    }).catch((error) => {
        console.error('Error during generation:', error)
        isLoading.value = false
    })
}
</script>
