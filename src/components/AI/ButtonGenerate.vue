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
import { type Schema } from "ai";

const isLoading = ref(false)

const {
    prompt,
    format,
    title = 'Generate with AI',
} = defineProps<{
    prompt: string,
    format: Schema,
    title?: string,
}>()

const emit = defineEmits<{
    (e: 'beforeGeneration'): void
    (e: 'afterGeneration', result: any): void
}>()

const provider = useLLM()

const shouldShowButton = computed(() => {
    return provider.settings.host && provider.settings.model && prompt && prompt.length > 2
})

const startGenerate = async () => {
    isLoading.value = true
    emit('beforeGeneration')
    await provider.generate(prompt, format)
    const result = provider.response.value
    emit('afterGeneration', result)
    isLoading.value = false
}
</script>
