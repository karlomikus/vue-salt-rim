<template>
    <PageHeader>
        {{ $t('cocktail-methods.cocktail-methods') }}
        <template #actions>
            <SaltRimDialog v-model="showDialog">
                <template #trigger>
                    <button type="button" class="button button--dark" @click.prevent="openDialog($t('cocktail-methods.add'), {} as CocktailMethod)">{{ $t('cocktail-methods.add') }}</button>
                </template>
                <template #dialog>
                    <CocktailMethodsForm :source-method="editMethod" :dialog-title="dialogTitle" @method-dialog-closed="refreshMethods" />
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
            <div v-if="methods.length > 0" class="block-container block-container--padded">
                <table class="table">
                    <thead>
                        <tr>
                            <th>{{ $t('name') }}</th>
                            <th>{{ $t('cocktail-methods.dilution-percentage') }}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="method in methods" :key="method.id">
                            <td>
                                <a href="#" @click.prevent="openDialog($t('cocktail-methods.edit'), method)">{{ method.name }}</a>
                            </td>
                            <td>{{ method.dilution_percentage }}%</td>
                            <td style="text-align: right;">
                                <a class="list-group__action" href="#" @click.prevent="deleteMethod(method)">{{ $t('remove') }}</a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <EmptyState v-else>
                {{ $t('empty-state-default') }}
            </EmptyState>
        </div>
    </div>
</template>

<script setup lang="ts">
import OverlayLoader from './../OverlayLoader.vue'
import PageHeader from './../PageHeader.vue'
import Navigation from './../Settings/SettingsNavigation.vue'
import SaltRimDialog from './../Dialog/SaltRimDialog.vue'
import CocktailMethodsForm from './../Settings/CocktailMethodsForm.vue'
import EmptyState from './../EmptyState.vue'
import BarAssistantClient from './../../api/BarAssistantClient'
import { useTitle } from '@/composables/title'
import { ref } from 'vue'
import type { components } from '@/api/api'
import { useI18n } from 'vue-i18n'
import { useConfirm } from '@/composables/confirm'
import { useSaltRimToast } from '@/composables/toast'

type CocktailMethod = components['schemas']['CocktailMethod']

const isLoading = ref(false);
const showDialog = ref(false);
const dialogTitle = ref('Tags data');
const editMethod = ref({} as CocktailMethod);
const methods = ref([] as CocktailMethod[]);
const { t } = useI18n()
const confirm = useConfirm()
const toast = useSaltRimToast()

async function refreshMethods() {
    showDialog.value = false
    isLoading.value = true

    const resp = (await BarAssistantClient.getCocktailMethods())?.data;
    if (!resp) {
        return
    }

    methods.value = resp
    isLoading.value = false
}

function openDialog(title: string, obj: CocktailMethod) {
    dialogTitle.value = title
    editMethod.value = obj
    showDialog.value = true
}

function deleteMethod(method: CocktailMethod) {
    confirm.show(t('cocktail-methods.confirm-delete', {name: method.name}), {
        onResolved: (dialog: any) => {
            isLoading.value = true
            dialog.close()
            BarAssistantClient.deleteCocktailMethod(method.id).then(() => {
                isLoading.value = false
                toast.default(t('cocktail-methods.delete-success'))
                refreshMethods()
            }).catch(e => {
                toast.error(e.message)
                isLoading.value = false
            })
        }
    })
}

useTitle(t('cocktail-methods.cocktail-methods'))

refreshMethods()
</script>
