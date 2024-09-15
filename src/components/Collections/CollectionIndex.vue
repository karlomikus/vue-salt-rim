<template>
    <PageHeader>
        {{ $t('collections.title') }}
        <template #actions>
            <SaltRimDialog v-model="showDialog">
                <template #trigger>
                    <button v-if="(!appState.isSubscribed() && collections.length >= 3) == false" type="button" class="button button--dark" @click.prevent="openDialog($t('collections.add'), {})">{{ $t('collections.add') }}</button>
                    <div v-else></div>
                </template>
                <template #dialog>
                    <CollectionForm :source-collection="editCollection" :dialog-title="dialogTitle" @collection-dialog-closed="refreshCollections" />
                </template>
            </SaltRimDialog>
        </template>
    </PageHeader>
    <div>
        <OverlayLoader v-if="isLoading" />
        <div v-if="collections.length > 0">
            <SubscriptionCheck v-if="collections.length >= 3">Subscribe to "Mixologist" plan to create unlimited collections!</SubscriptionCheck>
            <div class="collections">
                <div v-for="collection in collections" :key="collection.id" class="block-container block-container--padded block-container--hover collections__collection">
                    <RouterLink class="collections__collection__title" :to="{ name: 'cocktails', query: { 'filter[collection_id]': collection.id } }">{{ collection.name }}</RouterLink>
                    <br>
                    <div class="collections__collection__content">
                        <small>
                            {{ collection.cocktails.length }} {{ $t('cocktail.cocktails') }}
                            <template v-if="collection.is_bar_shared">
                                &middot; {{ $t('collection-shared') }}
                            </template>
                        </small>
                        <br>
                        {{ $t('description') }}: {{ collection.description ? collection.description : 'n/a' }}
                    </div>
                    <div class="collections__collection__action">
                        <template v-if="collection.cocktails.length > 0">
                            <RouterLink :to="{name: 'collections.quantity-calculator', params: {id: collection.id}}">{{ $t('collections.quantitiy-calculator') }}</RouterLink>
                            &middot;
                        </template>
                        <a class="list-group__action" href="#" @click.prevent="openDialog($t('collections.edit'), collection)">{{ $t('edit') }}</a>
                        &middot;
                        <a class="list-group__action" href="#" @click.prevent="deleteCollection(collection)">{{ $t('remove') }}</a>
                    </div>
                </div>
            </div>
        </div>
        <EmptyState v-else>
            <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
                    <path d="M12 1L21.5 6.5V17.5L12 23L2.5 17.5V6.5L12 1ZM5.49388 7.0777L13.0001 11.4234V20.11L19.5 16.3469V7.65311L12 3.311L5.49388 7.0777ZM4.5 8.81329V16.3469L11.0001 20.1101V12.5765L4.5 8.81329Z"></path>
                </svg>
            </template>
            <template #default>
                {{ $t('missing-collections') }}
            </template>
        </EmptyState>
    </div>
</template>

<script>
import BarAssistantClient from '@/api/BarAssistantClient';
import OverlayLoader from './../OverlayLoader.vue'
import PageHeader from './../PageHeader.vue'
import SaltRimDialog from './../Dialog/SaltRimDialog.vue'
import CollectionForm from './CollectionForm.vue'
import EmptyState from './../EmptyState.vue'
import SubscriptionCheck from '../SubscriptionCheck.vue'
import AppState from '../../AppState'
import { useTitle } from '@/composables/title'

export default {
    components: {
        OverlayLoader,
        PageHeader,
        SaltRimDialog,
        CollectionForm,
        EmptyState,
        SubscriptionCheck,
    },
    data() {
        return {
            isLoading: false,
            showDialog: false,
            appState: new AppState(),
            dialogTitle: 'Collection data',
            editCollection: {},
            collections: [],
        }
    },
    created() {
        useTitle(this.$t('collections.title'))

        this.refreshCollections()
    },
    methods: {
        refreshCollections() {
            this.showDialog = false
            this.isLoading = true
            BarAssistantClient.getCollections({include: 'cocktails'}).then(resp => {
                this.collections = resp.data
                this.isLoading = false
            }).catch(e => {
                this.$toast.error(e.message)
            })
        },
        openDialog(title, obj) {
            this.dialogTitle = title
            this.editCollection = obj
            this.showDialog = true
        },
        deleteCollection(collection) {
            this.$confirm(this.$t('collections.confirm-delete', { name: collection.name }), {
                onResolved: (dialog) => {
                    this.isLoading = true
                    dialog.close()
                    BarAssistantClient.deleteCollection(collection.id).then(() => {
                        this.isLoading = false
                        localStorage.removeItem('collection_' + collection.id)
                        this.$toast.default(this.$t('collections.delete-success'))
                        this.refreshCollections()
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
<style scoped>
.collections {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--gap-size-2);
}

@media (max-width: 450px) {
    .collections {
        grid-template-columns: 1fr;
    }
}

.collections__collection__title {
    font-size: 1.25rem;
    font-weight: var(--fw-bold);
}

.collections__collection__action {
    margin-top: 1rem;
}

.collections__collection__content small {
    color: var(--clr-gray-500);
}
</style>
