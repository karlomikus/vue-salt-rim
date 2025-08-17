<template>
    <PageHeader>
        {{ $t('utensils.title') }}
        <template #actions>
            <SaltRimDialog v-model="showDialog">
                <template #trigger>
                    <button type="button" class="button button--dark" @click.prevent="openDialog($t('utensils.add'), {})">{{ $t('utensils.add') }}</button>
                </template>
                <template #dialog>
                    <UtensilForm :source-data="editUtensil" :dialog-title="dialogTitle" @utensil-dialog-closed="refreshUtensils" />
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
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="utensil in utensils" :key="utensil.id">
                            <td>
                                <a href="#" @click.prevent="openDialog($t('utensils.edit'), utensil)">{{ utensil.name }}</a>
                                <br>
                                <small>{{ overflowText(utensil.description, 100) }}</small>
                            </td>
                            <td style="text-align: right;">
                                <a class="list-group__action" href="#" @click.prevent="deleteUtensil(utensil)">{{ $t('remove') }}</a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import BarAssistantClient from '@/api/BarAssistantClient'
import OverlayLoader from './../OverlayLoader.vue'
import PageHeader from './../PageHeader.vue'
import Navigation from './../Settings/SettingsNavigation.vue'
import SaltRimDialog from './../Dialog/SaltRimDialog.vue'
import UtensilForm from './UtensilForm.vue'
import { useTitle } from '@/composables/title'

export default {
    components: {
        OverlayLoader,
        Navigation,
        PageHeader,
        SaltRimDialog,
        UtensilForm
    },
    data() {
        return {
            isLoading: false,
            showDialog: false,
            dialogTitle: 'Utensil data',
            editUtensil: {},
            utensils: [],
        }
    },
    created() {
        useTitle(this.$t('utensils.title'))

        this.refreshUtensils()
    },
    methods: {
        refreshUtensils() {
            this.showDialog = false
            this.isLoading = true
            BarAssistantClient.getUtensils().then(resp => {
                this.utensils = resp.data
                this.isLoading = false
            }).catch(e => {
                this.$toast.error(e.message)
            })
        },
        openDialog(title, obj) {
            this.dialogTitle = title
            this.editUtensil = obj
            this.showDialog = true
        },
        deleteUtensil(utensil) {
            this.$confirm(this.$t('utensils.confirm-delete', {name: utensil.name}), {
                onResolved: (dialog) => {
                    this.isLoading = true
                    dialog.close()
                    BarAssistantClient.deleteUtensil(utensil.id).then(() => {
                        this.isLoading = false
                        this.$toast.default(this.$t('utensils.delete-success'))
                        this.refreshUtensils()
                    }).catch(e => {
                        this.$toast.error(e.message)
                        this.isLoading = false
                    })
                }
            })
        },
        overflowText(input, len) {
            if (!input) {
                return input
            }

            return input.length > len ? `${input.substring(0, len)}...` : input
        }
    }
}
</script>
