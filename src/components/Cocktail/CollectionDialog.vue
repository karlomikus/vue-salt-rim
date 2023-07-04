<template>
    <div>
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ $t('collections.add-to') }}</div>
        <div class="dialog-content">
            <form action="">
                <div class="form-group">
                    <label class="form-label" for="dialog-collection-id">{{ $t('collections.collection') }}:</label>
                    <select class="form-select" id="dialog-collection-id" v-model="collection">
                        <option :value="{}"> - {{ $t('collections.create') }} - </option>
                        <option v-for="collection in collections" :value="collection">{{ collection.name }}</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="dialog-collection-name">{{ $t('name') }}:</label>
                    <input class="form-input" type="text" id="dialog-collection-name" v-model="collection.name">
                </div>
                <div class="form-group">
                    <label class="form-label" for="dialog-collection-description">{{ $t('description') }}:</label>
                    <textarea rows="5" class="form-input" id="dialog-collection-description" v-model="collection.description"></textarea>
                </div>
            </form>
        </div>
        <div class="dialog-actions" style="margin-top: 1rem;">
            <button type="button" class="button button--outline" @click="$emit('collectionDialogClosed')">{{ $t('cancel') }}</button>
            <button type="button" class="button button--dark" @click="saveAndClose">{{ $t('collections.add-cocktail') }}</button>
        </div>
    </div>
</template>

<script>
import ApiRequests from '@/ApiRequests';
import OverlayLoader from '@/components/OverlayLoader.vue'

export default {
    props: ['cocktail'],
    data() {
        return {
            isLoading: false,
            collections: [],
            collection: {}
        }
    },
    components: {
        OverlayLoader,
    },
    mounted() {
        this.fetchCollections()
    },
    methods: {
        fetchCollections() {
            ApiRequests.fetchCollections().then(data => {
                this.collections = data
            })
        },
        add() {
            console.log('adding')
            ApiRequests.putCocktailInCollection(this.collection.id, this.cocktail.id).then(data => {
                this.$emit('collectionDialogClosed')
            })
        },
        saveAndClose() {
            if (this.collection.id) {
                ApiRequests.updateCollection(this.collection.id, this.collection).then(collectionData => {
                    this.add();
                })
            } else {
                ApiRequests.saveCollection(this.collection).then(collectionData => {
                    this.collection = collectionData
                    this.add();
                })
            }
        }
    }
};
</script>
