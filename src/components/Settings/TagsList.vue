<template>
    <PageHeader>
        {{ $t('tags') }}
        <template #actions>
            <Dialog v-model="showDialog">
                <template #trigger>
                    <button type="button" class="button button--outline" @click.prevent="openDialog($t('tag.add'), {})">{{ $t('tag.add') }}</button>
                </template>
                <template #dialog>
                    <TagForm :source-tag="editTag" :dialog-title="dialogTitle" @tag-dialog-closed="refreshTags" />
                </template>
            </Dialog>
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
                            <th>{{ $t('name') }}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="tag in tags">
                            <td>
                                <a href="#" @click.prevent="openDialog($t('tag.edit'), tag)">{{ tag.name }}</a>
                            </td>
                            <td style="text-align: right;">
                                <a class="list-group__action" href="#" @click.prevent="deleteTag(tag)">{{ $t('remove') }}</a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import ApiRequests from "@/ApiRequests";
import OverlayLoader from '@/components/OverlayLoader.vue'
import PageHeader from '@/components/PageHeader.vue'
import Navigation from '@/components/Settings/Navigation.vue'
import Dialog from '@/components/Dialog/Dialog.vue'
import TagForm from '@/components/Settings/TagForm.vue'

export default {
    components: {
        OverlayLoader,
        Navigation,
        PageHeader,
        TagForm,
        Dialog
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
        document.title = `${this.$t('tags')} \u22C5 Salt Rim`

        this.refreshTags()
    },
    methods: {
        refreshTags() {
            this.showDialog = false
            this.isLoading = true;
            ApiRequests.fetchTags().then(data => {
                this.tags = data;
                this.isLoading = false;
            }).catch(e => {
                this.$toast.error(e.message);
            })
        },
        openDialog(title, obj) {
            this.dialogTitle = title
            this.editTag = obj
            this.showDialog = true;
        },
        deleteTag(tag) {
            this.$confirm(this.$t('tag.confirm-delete', {name: tag.name}), {
                onResolved: (dialog) => {
                    this.isLoading = true
                    dialog.close()
                    ApiRequests.deleteTag(tag.id).then(() => {
                        this.isLoading = false;
                        this.$toast.default(this.$t('tag.delete-success'));
                        this.refreshTags()
                    }).catch(e => {
                        this.$toast.error(e.message);
                        this.isLoading = false;
                    })
                }
            });
        }
    }
}
</script>
