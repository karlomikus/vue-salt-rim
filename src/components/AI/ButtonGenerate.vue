<template>
    <button v-if="shouldShowButton" type="button" class="button button--ai" @click="startGenerate"><IconAI /></button>
</template>

<script setup lang="ts">
import { useLLM } from '@/composables/useGenerativeAI'
import IconAI from '../Icons/IconAI.vue'
import { computed } from 'vue'

const props = defineProps<{
    prompt: string,
    format?: string | object
}>()

const emit = defineEmits<{
    (e: 'beforeGeneration'): void
    (e: 'afterGeneration', result: any): void
}>()

const provider = useLLM()

const shouldShowButton = computed(() => {
    return window.srConfig.OLLAMA_HOST && window.srConfig.OLLAMA_MODEL && props.prompt && props.prompt.length > 2
})

const startGenerate = () => {
    emit('beforeGeneration')
    provider.generate(props.prompt, props.format ?? 'json').then(() => {
        const result = JSON.parse(provider.response.value)
        emit('afterGeneration', result)
    })
}
</script>