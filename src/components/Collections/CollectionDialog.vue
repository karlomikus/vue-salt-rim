<template>
    <div>
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ $t(title) }}</div>
        <div class="dialog-content">
            <form action="">
                <div class="form-group">
                    <label class="form-label" for="dialog-collection-id">{{ $t('collections.collection') }}:</label>
                    <select id="dialog-collection-id" v-model="collectionId" class="form-select">
                        <option :value="null"> - {{ $t('collections.create') }} - </option>
                        <option v-for="collection in collections" :key="collection.id" :value="collection.id">{{ collection.name }}</option>
                    </select>
                </div>
                <template v-if="!collectionId">
                    <div class="form-group">
                        <label class="form-label" for="dialog-collection-name">{{ $t('name') }}:</label>
                        <input id="dialog-collection-name" v-model="newCollection.name" class="form-input" type="text">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="dialog-collection-description">{{ $t('description') }}:</label>
                        <textarea id="dialog-collection-description" v-model="newCollection.description" rows="5" class="form-input"></textarea>
                    </div>
                </template>
            </form>
        </div>
        <div class="dialog-actions" style="margin-top: 1rem;">
            <button type="button" class="button button--outline" @click="$emit('collectionDialogClosed')">{{ $t('cancel') }}</button>
            <button v-if="isPartOfCollection" type="button" class="button button--dark" @click="removeCocktailFromCollection">{{ $t('remove-cocktail-from-collection') }}</button>
            <button v-else type="button" class="button button--dark" @click="saveAndClose">
                {{ $t('collections.add-to') }} <template v-if="cocktails.length > 1">({{ cocktails.length }} {{ $t('cocktails.title') }})</template>
            </button>
        </div>
    </div>
</template>

<script>
import ApiRequests from './../../ApiRequests.js'
import OverlayLoader from './../OverlayLoader.vue'

export default {
    components: {
        OverlayLoader,
    },
    props: {
        cocktails: {
            type: Array,
            default() {
                return []
            }
        },
        cocktailCollections: {
            type: Array,
            default() {
                return []
            }
        },
        title: {
            type: String,
            default: 'collections.add-to'
        }
    },
    emits: ['collectionDialogClosed'],
    data() {
        return {
            isLoading: false,
            collections: [],
            newCollection: {},
            collectionId: null
        }
    },
    computed: {
        isPartOfCollection() {
            if (!this.collectionId) {
                return false
            }

            return this.cocktailCollections.find((val) => val.id == this.collectionId)
        }
    },
    mounted() {
        this.fetchCollections()
    },
    methods: {
        fetchCollections() {
            this.isLoading = true
            ApiRequests.fetchCollections().then(data => {
                this.isLoading = false
                this.collections = data
            })
        },
        removeCocktailFromCollection() {
            this.$confirm(this.$t('collections.confirm-remove-cocktail'), {
                onResolved: (dialog) => {
                    this.isLoading = true
                    dialog.close()
                    ApiRequests.removeCocktailFromCollection(this.collectionId, this.cocktails[0]).then(() => {
                        this.$toast.default(this.$t('collections.cocktail-remove-success'))
                        this.$emit('collectionDialogClosed')
                        this.isLoading = false
                    }).catch(e => {
                        this.$toast.error(e.message)
                        this.isLoading = false
                    })
                }
            })
        },
        saveAndClose() {
            if (this.collectionId) {
                this.isLoading = true
                ApiRequests.addCocktailsToCollection(this.collectionId, this.cocktails).then(() => {
                    this.isLoading = false
                    this.$toast.default(this.$t('collections.cocktail-add-success'))
                    this.$emit('collectionDialogClosed')
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false
                })
            } else {
                this.isLoading = true
                this.newCollection.cocktails = this.cocktails
                ApiRequests.saveCollection(this.newCollection).then(collectionData => {
                    this.isLoading = false
                    this.$toast.default(this.$t('collections.cocktail-add-success'))
                    this.collectionId = collectionData.id
                    this.$emit('collectionDialogClosed')
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false
                })
            }
        }
    }
}
</script>
