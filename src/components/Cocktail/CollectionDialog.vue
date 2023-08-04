<template>
    <div>
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ $t(title) }}</div>
        <div class="dialog-content">
            <form action="">
                <div class="form-group">
                    <label class="form-label" for="dialog-collection-id">{{ $t('collections.collection') }}:</label>
                    <select class="form-select" id="dialog-collection-id" v-model="collectionId">
                        <option :value="null"> - {{ $t('collections.create') }} - </option>
                        <option v-for="collection in collections" :value="collection.id">{{ collection.name }}</option>
                    </select>
                </div>
                <template v-if="!collectionId">
                    <div class="form-group">
                        <label class="form-label" for="dialog-collection-name">{{ $t('name') }}:</label>
                        <input class="form-input" type="text" id="dialog-collection-name" v-model="newCollection.name">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="dialog-collection-description">{{ $t('description') }}:</label>
                        <textarea rows="5" class="form-input" id="dialog-collection-description" v-model="newCollection.description"></textarea>
                    </div>
                </template>
            </form>
        </div>
        <div class="dialog-actions" style="margin-top: 1rem;">
            <button type="button" class="button button--outline" @click="$emit('collectionDialogClosed')">{{ $t('cancel') }}</button>
            <button v-if="isPartOfCollection" type="button" class="button button--dark" @click="removeCocktailFromCollection">{{ $t('remove-cocktail-from-collection') }}</button>
            <button v-else type="button" class="button button--dark" @click="saveAndClose">
                {{ $t('collections.add-to') }} <template v-if="cocktails.length > 1">({{ cocktails.length }} {{ $t('cocktails') }})</template>
            </button>
        </div>
    </div>
</template>

<script>
import ApiRequests from '@/ApiRequests';
import OverlayLoader from '@/components/OverlayLoader.vue'

export default {
    props: {
        cocktails: {
            type: Array,
            default: []
        },
        cocktailCollections: {
            type: Array,
            default: []
        },
        title: {
            type: String,
            default: 'collections.add-to'
        }
    },
    data() {
        return {
            isLoading: false,
            collections: [],
            newCollection: {},
            collectionId: null
        }
    },
    components: {
        OverlayLoader,
    },
    mounted() {
        this.fetchCollections()
    },
    computed: {
        isPartOfCollection() {
            if (!this.collectionId) {
                return false;
            }

            return this.cocktailCollections.find((val) => val.id == this.collectionId)
        }
    },
    methods: {
        fetchCollections() {
            this.isLoading = true;
            ApiRequests.fetchCollections().then(data => {
                this.isLoading = false;
                this.collections = data
            })
        },
        removeCocktailFromCollection() {
            this.$confirm(this.$t('collections.confirm-remove-cocktail'), {
                onResolved: (dialog) => {
                    this.isLoading = true;
                    dialog.close();
                    ApiRequests.removeCocktailFromCollection(this.collectionId, this.cocktails[0]).then(data => {
                        this.$toast.default(this.$t('collections.cocktail-remove-success'))
                        this.$emit('collectionDialogClosed')
                        this.$emit('refreshCocktail', {id: this.cocktails[0]})
                        this.isLoading = false
                    }).catch(e => {
                        this.$toast.error(e.message)
                        this.isLoading = false
                    })
                }
            });
        },
        saveAndClose() {
            if (this.collectionId) {
                this.isLoading = true;
                ApiRequests.addCocktailsToCollection(this.collectionId, this.cocktails).then(data => {
                    this.isLoading = false;
                    this.$toast.default(this.$t('collections.cocktail-add-success'))
                    this.$emit('collectionDialogClosed')
                    this.$emit('refreshCocktail')
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false
                })
            } else {
                this.isLoading = true;
                this.newCollection.cocktails = this.cocktails;
                ApiRequests.saveCollection(this.newCollection).then(collectionData => {
                    this.isLoading = false;
                    this.$toast.default(this.$t('collections.cocktail-add-success'))
                    this.collectionId = collectionData.id
                    this.$emit('collectionDialogClosed')
                    this.$emit('refreshCocktail')
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false
                })
            }
        }
    }
};
</script>
