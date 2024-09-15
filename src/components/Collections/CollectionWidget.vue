<template>
    <div class="cocktail-collections-wrapper">
        <OverlayLoader v-if="isLoading" />
        <EmptyState v-if="collections.length == 0">
            <template #icon><span></span></template>
            {{ $t('cocktail-no-collection') }}
            <br>
            <a href="#" @click.prevent="$emit('addToCollection')">{{ $t('collections.add-to') }}</a>
        </EmptyState>
        <template v-else>
            <div class="block-container block-container--inset" style="padding: 0.5rem">
                <div v-for="collection in collections" :key="collection.id" class="block-container cocktail-collections__item">
                    <h3>{{ collection.name }}</h3>
                    <div class="cocktail-collections__item__actions">
                        <RouterLink :to="{ name: 'cocktails', query: { 'filter[collection_id]': collection.id } }">
                            {{ $t('view') }}
                        </RouterLink>
                        &middot;
                        <a href="#" @click.prevent="removeCocktailFromCollection(collection.id)">
                            {{ $t('remove-cocktail-from-collection') }}
                        </a>
                    </div>
                </div>
                <a href="#" @click.prevent="$emit('addToCollection')">{{ $t('collections.add-to') }}</a>
            </div>
        </template>
    </div>
</template>
<script>
import BarAssistantClient from '@/api/BarAssistantClient';
import OverlayLoader from './../OverlayLoader.vue'
import EmptyState from '../EmptyState.vue'

export default {
    components: {
        OverlayLoader,
        EmptyState
    },
    props: {
        cocktail: {
            type: Object,
            default() {
                return {}
            }
        }
    },
    emits: ['cocktailRemovedFromCollection', 'addToCollection'],
    data() {
        return {
            isLoading: false,
            collections: []
        }
    },
    watch: {
        cocktail() {
            this.fetchCocktailCollections()
        }
    },
    created() {
        this.fetchCocktailCollections()
    },
    methods: {
        fetchCocktailCollections() {
            this.isLoading = true
            BarAssistantClient.getCollections({ 'filter[cocktail_id]': this.cocktail.id, include: 'cocktails' }).then(resp => {
                this.collections = resp.data
                this.isLoading = false
            }).catch(() => {
                this.collections = []
                this.isLoading = false
            })
        },
        removeCocktailFromCollection(collectionId) {
            this.$confirm(this.$t('collections.confirm-remove-cocktail'), {
                onResolved: (dialog) => {
                    this.isLoading = true
                    dialog.close()
                    const existingCollectionCocktailIds = this.collections.find(c => c.id == collectionId).cocktails.map(c => c.id)
                    existingCollectionCocktailIds.splice(existingCollectionCocktailIds.indexOf(this.cocktail.id), 1)
                    BarAssistantClient.syncCollectionCocktails(collectionId, existingCollectionCocktailIds).then(() => {
                        this.$toast.default(this.$t('collections.cocktail-remove-success'))
                        this.$emit('cocktailRemovedFromCollection', this.cocktail.slug)
                        this.isLoading = false
                    }).catch(e => {
                        this.$toast.error(e.message)
                        this.isLoading = false
                    })
                }
            })
        },
    }
}
</script>
<style scoped>
.cocktail-collections__item {
    display: block;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
}

.cocktail-collections__item__actions {
    font-size: 0.85rem;
}
</style>
