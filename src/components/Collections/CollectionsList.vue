<template>
    <PageHeader>
        {{ $t('collections.title') }}
        <template #actions>
            <Dialog v-model="showDialog">
                <template #trigger>
                    <button type="button" class="button button--outline" @click.prevent="openDialog($t('collections.add'), {})">{{ $t('collections.add') }}</button>
                </template>
                <template #dialog>
                    <CollectionsForm :source-collection="editCollection" :dialog-title="dialogTitle" @collection-dialog-closed="refreshCollections" />
                </template>
            </Dialog>
        </template>
    </PageHeader>
    <div class="settings-page">
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
                        <tr v-for="collection in collections">
                            <td>
                                <a href="#" @click.prevent="openDialog($t('collections.edit'), collection)">{{ collection.name }}</a>
                                <br>
                                <small>{{ overflowText(collection.description, 100) }}</small>
                            </td>
                            <td style="text-align: right;">
                                <a class="list-group__action" href="#" @click.prevent="deleteCollection(collection)">{{ $t('remove') }}</a>
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
import CollectionsForm from './CollectionsForm.vue'

export default {
    components: {
        OverlayLoader,
        Navigation,
        PageHeader,
        Dialog,
        CollectionsForm
    },
    data() {
        return {
            isLoading: false,
            showDialog: false,
            dialogTitle: 'Collection data',
            editCollection: {},
            collections: [],
        }
    },
    created() {
        document.title = `${this.$t('collections.title')} \u22C5 ${this.site_title}`

        this.refreshCollections()
    },
    methods: {
        refreshCollections() {
            this.showDialog = false;
            this.isLoading = true;
            ApiRequests.fetchCollections().then(data => {
                this.collections = data;
                this.isLoading = false;
            }).catch(e => {
                this.$toast.error(e.message);
            })
        },
        openDialog(title, obj) {
            this.dialogTitle = title
            this.editCollection = obj
            this.showDialog = true;
        },
        deleteCollection(collection) {
            this.$confirm(this.$t('collections.confirm-delete', {name: collection.name}), {
                onResolved: (dialog) => {
                    this.isLoading = true
                    dialog.close();
                    ApiRequests.deleteCollection(collection.id).then(() => {
                        this.isLoading = false;
                        this.$toast.default(this.$t('collections.delete-success'));
                        this.refreshCollections()
                    }).catch(e => {
                        this.$toast.error(e.message);
                        this.isLoading = false;
                    })
                }
            });
        },
        overflowText(input, len) {
            if (!input) {
                return input
            };

            return input.length > len ? `${input.substring(0, len)}...` : input;
        }
    }
}
</script>
