<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ dialogTitle }}</div>
        <div class="form-group">
            <label class="form-label form-label--required" for="name">{{ $t('name') }}:</label>
            <input id="name" v-model="glass.name" class="form-input" type="text" required>
        </div>
        <div class="form-group">
            <label class="form-label" for="description">{{ $t('description') }}:</label>
            <textarea id="description" v-model="glass.description" rows="3" class="form-input"></textarea>
        </div>
        <div style="display: flex; gap: 0.5rem;">
            <div class="form-group" style="flex-basis: 300px;">
                <label class="form-label" for="volume">{{ $t('volume') }}:</label>
                <input id="volume" v-model="glass.volume" class="form-input" type="text" style="width: 100%;">
            </div>
            <div class="form-group" style="flex-basis: 100%;">
                <label class="form-label" for="volume_units">{{ $t('units') }}:</label>
                <input id="volume_units" v-model="glass.volume_units" class="form-input" type="text" style="width: 100%;">
            </div>
        </div>
        <ImageUpload ref="imagesUpload" :images="glass.images ?? []" :max-images="1" />
        <div class="dialog-actions">
            <button class="button button--outline" @click.prevent="$emit('glassDialogClosed')">{{ $t('cancel') }}</button>
            <button class="button button--dark" type="submit">{{ $t('save') }}</button>
        </div>
    </form>
</template>

<script setup lang="ts">
import BarAssistantClient from '@/api/BarAssistantClient'
import OverlayLoader from '@/components/OverlayLoader.vue'
import ImageUpload from '@/components/ImageUpload.vue'
import type { components } from '@/api/api'
import { ref, useTemplateRef } from 'vue'
import { useSaltRimToast } from '@/composables/toast'
import { useI18n } from 'vue-i18n'

type Glass = components['schemas']['Glass']

const props = defineProps({
    sourceGlass: {
        type: Object as () => Glass,
        default: () => ({}),
    },
    dialogTitle: {
        type: String,
        default: '',
    },
})
const emit = defineEmits(['glassDialogClosed'])
const { t } = useI18n()
const toast = useSaltRimToast()
const isLoading = ref(false)
const glass = ref<Glass>(props.sourceGlass)
const imagesUpload = useTemplateRef('imagesUpload')

async function submit() {
    isLoading.value = true

    const postData = {
        name: glass.value.name,
        description: glass.value.description,
        volume: glass.value.volume,
        volume_units: glass.value.volume_units,
        images: [],
    } as components['schemas']['GlassRequest']

    if (imagesUpload.value) {
        const imageResources = await imagesUpload.value.save().catch(() => {
            toast.error(`${t('imageupload.error')}`)
        }) || []

        if (imageResources.length > 0) {
            postData.images = imageResources.map(img => img.id)
        }
    }

    if (glass.value.id) {
        BarAssistantClient.updateGlass(glass.value.id, postData).then(() => {
            isLoading.value = false
            toast.default(t('glass-type.update-success'))
            emit('glassDialogClosed')
        }).catch(e => {
            toast.error(e.message)
            isLoading.value = false
        })
    } else {
        BarAssistantClient.saveGlass(postData).then(() => {
            isLoading.value = false
            toast.default(t('glass-type.add-success'))
            emit('glassDialogClosed')
        }).catch(e => {
            toast.error(e.message)
            isLoading.value = false
        })
    }
}
</script>
