<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading"></OverlayLoader>
        <PageHeader>
            {{ $t('bars.bar') }}
        </PageHeader>
        <h3 class="form-section-title">{{ $t('information') }}</h3>
        <div class="block-container block-container--padded">
            <div class="form-group">
                <label class="form-label form-label--required" for="name">{{ $t('name') }}:</label>
                <input id="name" v-model="bar.name" class="form-input" type="text" required @input="skipSlugGenerationFromName == false ? updateSlug($event) : true" @blur="skipSlugGenerationFromName = true">
            </div>
            <div class="form-group">
                <label class="form-label" for="subtitle">{{ $t('subtitle') }}:</label>
                <input id="subtitle" v-model="bar.subtitle" class="form-input" type="text">
            </div>
            <div class="form-group">
                <label class="form-label" for="bar-default-data">{{ $t('bars.default-data') }}:</label>
                <template v-if="!bar.id">
                    <select id="bar-default-data" v-model="selectedOptions" class="form-select" required>
                        <option v-for="option in importOptions" :key="option.value" :value="option.value">{{ option.name }}</option>
                        <option :value="undefined">{{ $t('bars.no-default.data') }}</option>
                    </select>
                </template>
                <div v-else>
                    <button type="button" class="button button--outline" @click="runBarDatapackSync"><OverlayLoader v-if="isDataSyncRunning" />{{ $t('bars.sync-data') }}</button>
                </div>
            </div>
            <div class="sr-grid sr-grid--2-col">
                <div class="form-group">
                    <label class="form-label" for="bar-units">{{ $t('default-units') }}:</label>
                    <select id="bar-units" v-model="bar.settings.default_units" class="form-select" required>
                        <option :value="undefined">{{ $t('no-default-units') }}</option>
                        <option v-for="unit in availableUnits" :key="unit.value" :value="unit.value">{{ unit.text }}</option>
                    </select>
                    <p class="form-input-hint">{{ $t('bar.default-units-hint') }}</p>
                </div>
                <div class="form-group">
                    <label class="form-label" for="default-currency">{{ $t('default-currency') }}:</label>
                    <input id="default-currency" v-model="bar.settings.default_currency" class="form-input" type="text">
                    <p class="form-input-hint">{{ $t('bar.default-currency-hint') }}</p>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label" for="slug">{{ $t('bar.url') }}:</label>
                <input id="slug" v-model="bar.slug" class="form-input" type="text" @blur="updateSlug">
                <p class="form-input-hint">
                    {{ $t('bar.url-menu-hint') }} <span v-show="urlWithSlug">{{ $t('bar.url-help', {url: urlWithSlug}) }}</span>
                </p>
            </div>
            <div class="form-group">
                <label class="form-label" for="description">{{ $t('description') }}:</label>
                <textarea id="description" v-model="bar.description" rows="5" class="form-input"></textarea>
            </div>
            <div class="form-group">
                <label class="form-checkbox" for="toggle-invite">
                    <input id="toggle-invite" v-model="enableInvites" type="checkbox" :value="true">
                    <span>{{ $t('bars.enable-invites') }}</span>
                </label>
            </div>
            <div class="form-group">
                <label class="form-checkbox" for="toggle-is-public">
                    <input id="toggle-is-public" v-model="bar.is_public" type="checkbox" :value="true">
                    <span>{{ $t('bars.is-public') }}</span>
                </label>
            </div>
            <div class="form-group" v-if="bar.id">
                <div class="alert alert--info">
                    <p>This action helps synchronize your search data with the actual data. It also recalculates all cocktail ABVs and ingredient materialized paths. You can run this action manually, but it is limited to once every 10 minutes. Regular execution is not necessary, you should only run this if you notice problems with incorrect data.</p>
                    <button type="button" class="button button--dark" @click="runBarOptimize"><OverlayLoader v-if="isOptimizationRunning" />{{ $t('bars.optimize') }}</button>
                </div>
            </div>
        </div>
        <h3 class="form-section-title">{{ $t('bars.logo') }}</h3>
        <ImageUpload ref="imagesUpload" :images="bar.images ?? []" :max-images="1" />
        <div class="form-actions">
            <RouterLink class="button button--outline" :to="{ name: 'bars' }">{{ $t('cancel') }}</RouterLink>
            <button type="submit" class="button button--dark">{{ $t('save') }}</button>
        </div>
    </form>
</template>
<script setup lang="ts">
import { ref, computed, useTemplateRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTitle } from '@/composables/title'
import { useSaltRimToast } from '@/composables/toast'
import { useConfirm } from '@/composables/confirm'
import AppState from '../../AppState'
import OverlayLoader from './../OverlayLoader.vue'
import PageHeader from './../PageHeader.vue'
import slug from 'slug'
import BarAssistantClient from '@/api/BarAssistantClient'
import ImageUpload from '../ImageUpload.vue'
import { barBus } from '@/composables/eventBus'
import type { components } from '@/api/api'
import { useImageUpload } from '@/composables/useImageUpload';

type Bar = components['schemas']['Bar']
type BarRequest = components['schemas']['BarRequest']
type BarOptionsEnum = components['schemas']['BarOptionsEnum']

const toast = useSaltRimToast()
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const uploader = useImageUpload()
const bar = ref<Bar>({
    settings: {}
} as Bar)
const confirm = useConfirm()
const imagesUpload = useTemplateRef('imagesUpload')
const isLoading = ref(false)
const skipSlugGenerationFromName = ref(false)
const selectedOptions = ref<BarOptionsEnum>('cocktails')
const enableInvites = ref(true)
const isOptimizationRunning = ref(false)
const isDataSyncRunning = ref(false)
const availableUnits = ref([
    { value: 'ml', text: t('unit.ml-full') },
    { value: 'oz', text: t('unit.oz-full') },
    { value: 'cl', text: t('unit.cl-full') },
])
const importOptions = ref([
    { name: t('bars.import-base-cocktails'), value: 'cocktails' as BarOptionsEnum },
    { name: t('bars.import-base-ingredients'), value: 'ingredients' as BarOptionsEnum },
])

const urlWithSlug = computed(() => {
    if (!bar.value.slug) {
        return null
    }

    return `${window.location.origin}/bars/${slug(bar.value.slug)}`
})

function updateSlug(e: any) {
    if (bar.value.id) {
        return
    }

    bar.value.slug = slug(e.target.value)
}

async function submit() {
    let postSlug = null
    if (bar.value.slug) {
        postSlug = slug(bar.value.slug)
    }

    const postData = {
        name: bar.value.name,
        subtitle: bar.value.subtitle,
        description: bar.value.description,
        enable_invites: enableInvites.value,
        is_public: bar.value.is_public,
        slug: postSlug,
        default_units: bar.value.settings.default_units,
        default_currency: bar.value.settings.default_currency,
        images: [],
    } as BarRequest;

    if (imagesUpload.value) {
        const imageResources = await uploader.saveImages(imagesUpload.value)
        postData.images = imageResources.map((img: any) => img.id)
    }

    const appState = new AppState()

    isLoading.value = true
    if (bar.value.id) {
        try {
            const data = (await BarAssistantClient.updateBar(bar.value.id, postData))?.data ?? null
            if (data) {
                appState.setBar(data)
                toast.default(t('bars.edit-success', { name: data.name }))
                barBus.emit('barUpdated', data)
                router.push({ name: 'bars' })
            }
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            isLoading.value = false
        }
    } else {
        if (selectedOptions.value) {
            postData.options = selectedOptions.value
        }

        try {
            const data = (await BarAssistantClient.saveBar(postData))?.data ?? null
            if (data) {
                toast.default(t('bars.add-success', { name: data.name }))
                router.push({ name: 'bars' })
            }
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            isLoading.value = false
        }
    }
}

async function runBarOptimize() {
    confirm.show(t('bars.confirm-optimization'), {
        onResolved: async (dialog: any) => {
            isOptimizationRunning.value = true
            toast.default(t('bars.optimization-started', { name: bar.value.name }))
            dialog.close()
            await BarAssistantClient.optimizeBar(bar.value.id)
            isOptimizationRunning.value = false
        }
    })
}

async function runBarDatapackSync() {
    confirm.show(t('bars.confirm-datapack-sync'), {
        onResolved: async (dialog: any) => {
            isDataSyncRunning.value = true
            toast.default(t('bars.datapack-sync-started', { name: bar.value.name }))
            dialog.close()
            await BarAssistantClient.datapackSync(bar.value.id)
            isDataSyncRunning.value = false
        }
    })
}

async function init() {
    useTitle(t('bars.bar'))

    const barId = route.query.id || null

    if (barId) {
        isLoading.value = true
        try {
            bar.value = (await BarAssistantClient.getBar(parseInt(barId.toString())))?.data ?? {} as Bar
            enableInvites.value = bar.value.invite_code != null
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            isLoading.value = false
        }
    }
}

init()
</script>
