<script setup lang="ts">
import { ref } from 'vue'
import PageHeader from '../PageHeader.vue'
import SaltRimRadio from '../SaltRimRadio.vue'
import OverlayLoader from '../OverlayLoader.vue'
import BarAssistantClient from '@/api/BarAssistantClient'
import SubscriptionCheck from '../SubscriptionCheck.vue'
import { useI18n } from 'vue-i18n'
import { useSaltRimToast } from '@/composables/toast.js'
import { useRouter } from 'vue-router'
import { useTitle } from '@/composables/title'

const { t } = useI18n()
const router = useRouter()
const toast = useSaltRimToast()
const importType = ref('text')
const source = ref('')
const file = ref<File | null>()
const isLoading = ref(false)

useTitle(t('ingredient.import'))

async function onFileChanged($event: Event) {
    const target = $event.target as HTMLInputElement;
    if (target && target.files) {
        file.value = target.files[0];
    }
}

async function importIngredients() {
    isLoading.value = true
    toast.default(t('ingredient.csv-import-started'));
    if (file.value) {
        try {
            (await BarAssistantClient.importIngredientsAsCSVFile(file.value))
        } catch (e: any) {
            toast.default(e.message)
            isLoading.value = false
            return
        }
    } else {
        try {
            (await BarAssistantClient.importIngredientsAsCSVBody(source.value))
        } catch (e: any) {
            toast.default(e.message)
            isLoading.value = false
            return
        }
    }
    isLoading.value = false
    router.push({ name: 'ingredients' })
}
</script>
<template>
    <form>
        <PageHeader>
            {{ t('ingredient.import') }}
        </PageHeader>
        <SubscriptionCheck>Subscribe to "Mixologist" plan to unlock bulk ingredient import!</SubscriptionCheck>
        <h3 class="form-section-title">{{ t('import.type') }}</h3>
        <div class="block-container block-container--padded">
            <div class="form-group">
                <label class="form-label form-label--required">{{ t('type') }}:</label>
                <div class="import-types">
                    <SaltRimRadio v-model="importType" :title="t('import.type-csv-text-title')" :description="t('import.type-csv-text-description')" value="text"></SaltRimRadio>
                    <SaltRimRadio v-model="importType" :title="t('import.type-csv-file-title')" :description="t('import.type-csv-file-description')" value="file"></SaltRimRadio>
                </div>
            </div>
            <div class="ingredient-csv-import-notice">
                <p>Source CSV has the following guidelines:</p>
                <ul>
                    <li>It is recommended to use UTF-8 charset</li>
                    <li>It must contain header row with the following field names: <code>name</code>, <code>strength</code>, <code>description</code>, <code>origin</code>, <code>color</code>, <code>sugar_g_per_ml</code>, <code>acidity</code>, <code>distillery</code></li>
                    <li>Header row field names are not case sensitive</li>
                    <li>Header row fields are not order sensitive</li>
                    <li>Fields must be comma <code>,</code> separated</li>
                    <li>Use double quotes <code>"</code> if you need to enclose strings</li>
                    <li>Data can have empty fields</li>
                    <li>Number of fields must match the number of columns</li>
                    <li>Categories will be matched by name, if they do not exist, they will be created</li>
                    <li>Depending on server configuration, import can be run in the background once started</li>
                </ul>
                <p>Here is an example of valid CSV:</p>
                <div class="ingredient-csv-import-notice__example">
                    name,strength,description,origin,color,sugar_g_per_ml,acidity,distillery
                    <br>
                    Campari,40,Bitter liquer,Italy,#008800,,,
                    <br>
                    Whiskey,,,,,,,
                </div>
            </div>
            <div v-if="importType === 'file'" class="form-group">
                <label class="form-label form-label--required" for="import-source">{{ t('source') }}:</label>
                <input id="import-source" type="file" class="form-input" required @change="onFileChanged($event)">
            </div>
            <div v-else class="form-group">
                <label class="form-label form-label--required" for="import-source">{{ t('source') }}:</label>
                <textarea id="import-source" v-model="source" class="form-input" rows="14" required></textarea>
            </div>
            <div style="display: flex; gap: var(--gap-size-2); justify-content: flex-end;">
                <button type="button" class="button button--dark" @click.prevent="importIngredients" :disabled="isLoading"><OverlayLoader v-if="isLoading" />{{ t('import.start') }}</button>
            </div>
        </div>
    </form>
</template>

<style scoped>
.import-types {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr;
    gap: var(--gap-size-2);
}

@media (max-width: 450px) {
    .import-types {
        grid-template-columns: 1fr;
    }
}
.ingredient-csv-import-notice {
    margin-bottom: var(--gap-size-3);
}
.ingredient-csv-import-notice ul code {
    font-family: monospace;
    background-color: var(--clr-gray-100);
    color: var(--clr-gray-700);
}
.ingredient-csv-import-notice__example {
    font-family: monospace;
    padding: var(--gap-size-2);
    background-color: var(--clr-gray-100);
    color: var(--clr-gray-700);
    overflow: auto;
}
</style>