<script setup lang="ts">
import { ref, computed } from 'vue'
import PageHeader from './../PageHeader.vue'
import OverlayLoader from './../OverlayLoader.vue'
import SaltRimDialog from './../Dialog/SaltRimDialog.vue'
import { useI18n } from 'vue-i18n'
import { parseUserJson, getFirstItemNames, importInChunks, type DuplicateAction, downloadJson, importSingle } from '@/composables/useBulkImport'
import AppState from '@/AppState'

const { t } = useI18n()
const appState = new AppState()

type Tab = 'upload' | 'paste'
const activeTab = ref<Tab>('upload')
const duplicateAction = ref<DuplicateAction>('none')

const fileInput = ref<File | null>(null)
const pasteInput = ref<string>('')
const parseError = ref<string | null>(null)
const parsedPayload = ref<any>(null)
const isArray = ref(false)
const isParsing = ref(false)

const previewCount = computed(() => Array.isArray(parsedPayload.value) ? parsedPayload.value.length : (parsedPayload.value ? 1 : 0))
const previewNames = computed(() => Array.isArray(parsedPayload.value) ? getFirstItemNames(parsedPayload.value, 10) : [])

const isImporting = ref(false)
const progressProcessed = ref(0)
const totals = ref({ total: 0, created: 0, skipped: 0, overwritten: 0, failed: 0 })
const results = ref<any[]>([])

const largeFileWarning = computed(() => {
    const f = fileInput.value
    if (!f) return null
    const tenMb = 10 * 1024 * 1024
    return f.size > tenMb ? 'Selected file exceeds 10MB; parsing may be slow.' : null
})

function onFileChange(e: Event) {
    const input = e.target as HTMLInputElement
    if (input && input.files && input.files[0]) {
        fileInput.value = input.files[0]
    } else {
        fileInput.value = null
    }
}

async function handleParse() {
    parseError.value = null
    parsedPayload.value = null
    isArray.value = false
    isParsing.value = true
    try {
        if (activeTab.value === 'upload') {
            if (!fileInput.value) throw new Error('Please select a JSON file')
            const { payload, isArray: arr } = await parseUserJson(fileInput.value)
            parsedPayload.value = payload
            isArray.value = arr
        } else {
            if (!pasteInput.value || pasteInput.value.trim() === '') throw new Error('Please paste JSON payload')
            const { payload, isArray: arr } = await parseUserJson(pasteInput.value)
            parsedPayload.value = payload
            isArray.value = arr
        }
    } catch (e: any) {
        parseError.value = e?.message ?? 'Invalid JSON'
    } finally {
        isParsing.value = false
    }
}

async function startImport() {
    if (!parsedPayload.value) return
    isImporting.value = true
    progressProcessed.value = 0
    totals.value = { total: isArray.value ? parsedPayload.value.length : 1, created: 0, skipped: 0, overwritten: 0, failed: 0 }
    results.value = []

    try {
        if (!isArray.value) {
            const single = await importSingle(parsedPayload.value, duplicateAction.value)
            if (single.ok) {
                totals.value.created = 1
                results.value.push({ status: 'created', name: single.data?.name ?? null, index: 0 })
            } else {
                totals.value.failed = 1
                results.value.push({ status: 'failed', name: parsedPayload.value?.recipe?.name ?? null, error: single.error, index: 0 })
            }
            progressProcessed.value = 1
            return
        }

        const data = await importInChunks({
            items: parsedPayload.value,
            duplicateAction: duplicateAction.value,
            chunkSize: 25,
            concurrency: 1,
            onProgress: (u) => {
                progressProcessed.value = u.processed
                totals.value = u.counts
            },
        })
        results.value = data.items
        totals.value = data.counts
        progressProcessed.value = data.counts.total
    } finally {
        isImporting.value = false
    }
}

const progressPercent = computed(() => {
    if (totals.value.total === 0) return 0
    return Math.round((progressProcessed.value / totals.value.total) * 100)
})

function exportFailed() {
    if (!Array.isArray(parsedPayload.value)) return
    const failed = results.value.filter(r => r.status === 'failed').map((r: any) => parsedPayload.value[r.index])
    downloadJson('failed-cocktails.json', failed)
}

function goToCreated() {
    window.location.href = '/cocktails'
}
</script>

<template>
    <form @submit.prevent>
        <PageHeader>
            {{ t('cocktail.import') }} — Bulk
        </PageHeader>

        <div class="block-container block-container--padded">
            <div class="form-group">
                <div class="tabs">
                    <button type="button" class="button button--outline" :class="{ 'button--dark': activeTab==='upload' }" @click.prevent="activeTab='upload'">Upload JSON</button>
                    <button type="button" class="button button--outline" :class="{ 'button--dark': activeTab==='paste' }" @click.prevent="activeTab='paste'">Paste JSON</button>
                </div>
            </div>

            <div v-if="activeTab==='upload'" class="form-group">
                <label class="form-label">JSON file:</label>
                <input type="file" accept="application/json,.json" @change="onFileChange">
                <p v-if="largeFileWarning" class="form-input-hint">{{ largeFileWarning }}</p>
            </div>
            <div v-else class="form-group">
                <label class="form-label">JSON:</label>
                <textarea v-model="pasteInput" class="form-input" rows="12" placeholder='[{ "recipe": { "name": "..." } }, ...]'></textarea>
            </div>

            <div class="form-group">
                <label class="form-label">Duplicate strategy:</label>
                <label class="form-checkbox"><input v-model="duplicateAction" type="radio" value="none"> <span>None</span></label>
                <label class="form-checkbox"><input v-model="duplicateAction" type="radio" value="skip"> <span>Skip</span></label>
                <label class="form-checkbox"><input v-model="duplicateAction" type="radio" value="overwrite"> <span>Overwrite</span></label>
            </div>

            <div style="display: flex; gap: var(--gap-size-2);">
                <button type="button" class="button button--outline" @click.prevent="handleParse" :disabled="isParsing">
                    <OverlayLoader v-if="isParsing" /> Parse
                </button>
                <button type="button" class="button button--dark" @click.prevent="startImport" :disabled="!parsedPayload || isParsing || isImporting">
                    <OverlayLoader v-if="isImporting" /> Import
                </button>
            </div>

            <div v-if="parseError" class="alert alert--warning" style="margin-top: 1rem;">
                {{ parseError }}
            </div>

            <div v-if="parsedPayload" class="block-container block-container--padded" style="margin-top: 1rem;">
                <h3 class="page-subtitle">Preview</h3>
                <p>Detected: <strong>{{ isArray ? 'Array' : 'Single object' }}</strong>. Count: <strong>{{ previewCount }}</strong></p>
                <ul v-if="isArray && previewNames.length > 0">
                    <li v-for="(n, i) in previewNames" :key="i">{{ n }}</li>
                </ul>
                <p v-if="!isArray">This will use the single import path.</p>
            </div>

            <div v-if="totals.total > 0" class="block-container block-container--padded" style="margin-top: 1rem;">
                <h3 class="page-subtitle">Progress</h3>
                <div class="progress">
                    <div class="progress__bar" :style="{ width: progressPercent + '%' }"></div>
                </div>
                <p>{{ progressProcessed }} / {{ totals.total }} — created: {{ totals.created }}, skipped: {{ totals.skipped }}, overwritten: {{ totals.overwritten }}, failed: {{ totals.failed }}</p>

                <div class="form-actions" style="display:flex; gap: var(--gap-size-2);">
                    <button type="button" class="button button--outline" :disabled="!Array.isArray(parsedPayload) || results.length === 0 || totals.failed === 0" @click.prevent="exportFailed">Export failed items (.json)</button>
                    <button type="button" class="button button--dark" :disabled="totals.created === 0" @click.prevent="goToCreated">View created cocktails</button>
                </div>

                <div v-if="results.length > 0" class="results" style="margin-top: 1rem;">
                    <h3 class="page-subtitle">Results</h3>
                    <ul>
                        <li v-for="(r, i) in results" :key="i">
                            <strong>{{ r.name ?? ('Item #' + (r.index + 1)) }}</strong> — <span>{{ r.status }}</span>
                            <div v-if="r.status === 'failed' && r.error" class="form-input-hint">{{ r.error }}</div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </form>
</template>

<style scoped>
.tabs { display: flex; gap: var(--gap-size-2); }
.progress { width: 100%; background: var(--border-color); height: 8px; border-radius: 4px; overflow: hidden; }
.progress__bar { height: 100%; background: var(--accent-color); transition: width 0.2s ease; }
</style>

