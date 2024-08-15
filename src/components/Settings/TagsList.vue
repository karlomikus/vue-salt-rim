<template>
    <PageHeader>
        {{ $t('tag.tags') }}
        <template #actions>
            <SaltRimDialog v-model="showDialog">
                <template #trigger>
                    <button type="button" class="button button--dark" @click.prevent="openDialog($t('tag.add'), {})">{{ $t('tag.add') }}</button>
                </template>
                <template #dialog>
                    <TagForm :source-tag="editTag" :dialog-title="dialogTitle" @tag-dialog-closed="refreshTags" />
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
            <div v-if="tags.length > 0" class="block-container block-container--padded">
                <table class="table">
                    <thead>
                        <tr>
                            <th>{{ $t('name') }}</th>
                            <th>{{ $t('cocktail.cocktails') }}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="tag in tags" :key="tag.id">
                            <td>
                                <a href="#" @click.prevent="openDialog($t('tag.edit'), tag)">{{ tag.name }}</a>
                            </td>
                            <td>{{ tag.cocktails_count }}</td>
                            <td style="text-align: right;">
                                <a class="list-group__action" href="#" @click.prevent="deleteTag(tag)">{{ $t('remove') }}</a>
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

<script>
import OverlayLoader from './../OverlayLoader.vue'
import PageHeader from './../PageHeader.vue'
import Navigation from './../Settings/SettingsNavigation.vue'
import SaltRimDialog from './../Dialog/SaltRimDialog.vue'
import TagForm from './../Settings/TagForm.vue'
import EmptyState from './../EmptyState.vue'
import BarAssistantClient from './../../api/BarAssistantClient'

export default {
    components: {
        OverlayLoader,
        Navigation,
        PageHeader,
        TagForm,
        SaltRimDialog,
        EmptyState
    },
    data() {
        return {
            isLoading: false,
            showDialog: false,
            dialogTitle: 'Tags data',
            editTag: {},
            tags: [],
        }
    },
    created() {
        document.title = `${this.$t('tag.tags')} \u22C5 ${this.site_title}`

        this.refreshTags()
    },
    methods: {
        async refreshTags() {
            this.showDialog = false
            this.isLoading = true
            BarAssistantClient.getTags().then(resp => {
                this.tags = resp?.data
                this.isLoading = false
            }).catch(e => {
                this.$toast.error(e.message)
                this.isLoading = false
            })
        },
        openDialog(title, obj) {
            this.dialogTitle = title
            this.editTag = obj
            this.showDialog = true
        },
        deleteTag(tag) {
            this.$confirm(this.$t('tag.confirm-delete', {name: tag.name}), {
                onResolved: (dialog) => {
                    this.isLoading = true
                    dialog.close()
                    BarAssistantClient.deleteTag(tag.id).then(() => {
                        this.isLoading = false
                        this.$toast.default(this.$t('tag.delete-success'))
                        this.refreshTags()
                    }).catch(e => {
                        this.$toast.error(e.message)
                        this.isLoading = false
                    })
                }
            })
        }
    }
}
</script>
