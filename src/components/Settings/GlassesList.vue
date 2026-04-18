<template>
    <PageHeader>
        {{ $t('glass-type.types') }}
        <template #actions>
            <SaltRimDialog v-model="showDialog">
                <template #trigger>
                    <button type="button" class="button button--dark" @click.prevent="openDialog($t('glass-type.add'), {} as Glass)">{{ $t('glass-type.add') }}</button>
                </template>
                <template #dialog>
                    <GlassForm :source-glass="editGlass" :dialog-title="dialogTitle" @glass-dialog-closed="refreshGlasses" />
                </template>
            </SaltRimDialog>
        </template>
    </PageHeader>
    <div class="settings-page">
        <div class="settings-page__nav">
            <Navigation />
        </div>
        <div class="settings-page__content">
            <OverlayLoader v-if="isLoading" />
            <div class="block-container block-container--padded">
                <table class="table">
                    <thead>
                        <tr>
                            <th>{{ $t('name') }} / {{ $t('description') }}</th>
                            <th>{{ $t('cocktail.cocktails') }}</th>
                            <th>{{ $t('glass-type.volume') }}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="glass in glasses" :key="glass.id">
                            <td>
                                <div class="glass-with-image">
                                    <img v-if="glass.images.length > 0" :src="glass.images[0].url" :alt="glass.images[0].copyright ?? 'Image of glassware'" />
                                    <div>
                                        <a href="#" @click.prevent="openDialog($t('glass-type.edit'), glass)">{{ glass.name }}</a>
                                        <br>
                                        <small>{{ glass.description }}</small>
                                    </div>
                                </div>
                            </td>
                            <td>{{ glass.cocktails_count }}</td>
                            <td v-if="glass.volume > 0">{{ glass.volume }} {{ glass.volume_units }}</td>
                            <td v-else>n/a</td>
                            <td style="text-align: right;">
                                <a class="list-group__action" href="#" @click.prevent="deleteGlass(glass)">{{ $t('remove') }}</a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import BarAssistantClient from '@/api/BarAssistantClient'
import OverlayLoader from '@/components/OverlayLoader.vue'
import PageHeader from '@/components/PageHeader.vue'
import Navigation from '@/components/Settings/SettingsNavigation.vue'
import SaltRimDialog from '@/components/Dialog/SaltRimDialog.vue'
import GlassForm from '@/components/Settings/GlassForm.vue'
import { useTitle } from '@/composables/title'
import { onMounted, ref } from 'vue'
import type { components } from '@/api/api'
import { useI18n } from 'vue-i18n'
import { useConfirm } from '@/composables/confirm'
import { useSaltRimToast } from '@/composables/toast'

type Glass = components['schemas']['Glass']

const isLoading = ref(false)
const showDialog = ref(false)
const dialogTitle = ref('Glass data')
const editGlass = ref({} as Glass)
const glasses = ref([] as Glass[])

const { t } = useI18n()
const confirm = useConfirm()
const toast = useSaltRimToast()

async function refreshGlasses() {
    showDialog.value = false
    isLoading.value = true

    try {
        const resp = await BarAssistantClient.getGlasses()
        glasses.value = resp?.data ?? []
    } catch (e: any) {
        toast.error(e.message)
    } finally {
        isLoading.value = false
    }
}

function openDialog(title: string, obj: Glass) {
    dialogTitle.value = title
    editGlass.value = obj
    showDialog.value = true
}

function deleteGlass(glass: Glass) {
    confirm.show(t('glass-type.confirm-delete', { name: glass.name }), {
        onResolved: (dialog: any) => {
            isLoading.value = true
            dialog.close()

            BarAssistantClient.deleteGlass(glass.id).then(() => {
                isLoading.value = false
                toast.default(t('glass-type.delete-success'))
                refreshGlasses()
            }).catch((e: any) => {
                toast.error(e.message)
                isLoading.value = false
            })
        }
    })
}

useTitle(t('glass-type.types'))

onMounted(() => {
    refreshGlasses()
})
</script>

<style scoped>
.glass-with-image {
    display: flex;
    align-items: center;
}
.glass-with-image img {
    margin-right: 10px;
    border-radius: 4px;
    max-width: 50px;
    max-height: 50px;
}
</style>
