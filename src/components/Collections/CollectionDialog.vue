<template>
    <div>
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ $t(title) }}</div>
        <div class="dialog-content">
            <SubscriptionCheck v-if="collections.length >= 3">Subscribe to "Mixologist" plan to create unlimited collections!</SubscriptionCheck>
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
                        <input id="dialog-collection-name" v-model="newCollection.name" class="form-input" type="text" ref="collectionName">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="dialog-collection-description">{{ $t('description') }}:</label>
                        <textarea id="dialog-collection-description" v-model="newCollection.description" rows="5" class="form-input"></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-checkbox" for="share-in-bar">
                            <input id="share-in-bar" v-model="newCollection.is_bar_shared" type="checkbox" :value="true">
                            <span>{{ $t('collections.share-in-bar') }}</span>
                        </label>
                    </div>
                </template>
            </form>
        </div>
        <div class="dialog-actions" style="margin-top: 1rem;">
            <button type="button" class="button button--outline" @click="$emit('collectionDialogClosed')">{{ $t('cancel') }}</button>
            <button v-if="isPartOfCollection" type="button" class="button button--dark" @click="removeCocktailFromCollection">{{ $t('remove-cocktail-from-collection') }}</button>
            <button v-else type="button" class="button button--dark" @click="saveAndClose">
                {{ $t('collections.add-to') }} <template v-if="cocktails.length > 1">({{ cocktails.length }} {{ $t('cocktail.cocktails') }})</template>
            </button>
        </div>
    </div>
</template>

<script>
import BarAssistantClient from '@/api/BarAssistantClient';
import OverlayLoader from './../OverlayLoader.vue'
import SubscriptionCheck from '../SubscriptionCheck.vue'

export default {
    components: {
        OverlayLoader,
        SubscriptionCheck,
    },
    props: {
        cocktails: {
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
            if (!this.collectionId || !this.isManagingSingleCocktail) {
                return false
            }

            return this.cocktailCollections.find((val) => val.id == this.collectionId)
        },
        cocktailCollections() {
            if (this.isManagingSingleCocktail) {
                return this.collections.filter(collection => collection.cocktails.some(cocktail => cocktail.id == this.cocktails[0]))
            }

            return this.collections
        },
        isManagingSingleCocktail() {
            return this.cocktails.length == 1
        }
    },
    mounted() {
        this.$refs.collectionName.focus()
        this.fetchCollections()
    },
    methods: {
        fetchCollections() {
            this.isLoading = true
            BarAssistantClient.getCollections({include: 'cocktails'}).then(resp => {
                this.isLoading = false
                this.collections = resp.data
            })
        },
        removeCocktailFromCollection() {
            if (!this.isManagingSingleCocktail) {
                return false
            }

            this.$confirm(this.$t('collections.confirm-remove-cocktail'), {
                onResolved: (dialog) => {
                    this.isLoading = true
                    dialog.close()
                    const existingCollectionCocktailIds = this.collections.find(c => c.id == this.collectionId).cocktails.map(c => c.id)
                    existingCollectionCocktailIds.splice(existingCollectionCocktailIds.indexOf(this.cocktails[0]), 1)
                    BarAssistantClient.syncCollectionCocktails(this.collectionId, existingCollectionCocktailIds).then(() => {
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
                const existingCollectionCocktailIds = this.collections.find(c => c.id == this.collectionId).cocktails.map(c => c.id)
                const newCocktailCollections = existingCollectionCocktailIds.concat(this.cocktails)
                this.isLoading = true
                BarAssistantClient.syncCollectionCocktails(this.collectionId, newCocktailCollections).then(() => {
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
                BarAssistantClient.saveCollection(this.newCollection).then(resp => {
                    this.isLoading = false
                    this.$toast.default(this.$t('collections.cocktail-add-success'))
                    this.collectionId = resp.data.id
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
