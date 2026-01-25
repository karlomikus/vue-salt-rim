<template>
    <button v-if="shouldShowButton" type="button" class="button button--ai" @click="startGenerate" :title="title" :disabled="isLoading">
        <IconAI v-show="!isLoading" />
        <SaltRimSpinner v-show="isLoading" fill="#4d0724"/>
    </button>
</template>

<script setup lang="ts">
import IconAI from '../Icons/IconAI.vue'
import { computed, ref } from 'vue'
import SaltRimSpinner from '../SaltRimSpinner.vue';

const isLoading = ref(false)

const {
    callFn,
    title = 'Generate with AI',
    showButton = true,
} = defineProps<{
    callFn: () => Promise<any>,
    title?: string,
    showButton?: boolean,
}>()

const emit = defineEmits<{
    (e: 'beforeGeneration'): void
    (e: 'afterGeneration'): void
}>()

const shouldShowButton = computed(() => {
    return showButton && callFn
})

const startGenerate = async () => {
    isLoading.value = true
    emit('beforeGeneration')

    try {
        await callFn()
    } catch (error) {
        console.error('AI generation error:', error)
    } finally {
        emit('afterGeneration')
        isLoading.value = false
    }
}
</script>
