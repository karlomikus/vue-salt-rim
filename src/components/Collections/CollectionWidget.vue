<template>
    <div class="cocktail-collections-wrapper">
        <OverlayLoader v-if="isLoading" />
        <EmptyState v-if="collections.length == 0">
            <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
                    <path d="M12 1L21.5 6.5V17.5L12 23L2.5 17.5V6.5L12 1ZM5.49388 7.0777L13.0001 11.4234V20.11L19.5 16.3469V7.65311L12 3.311L5.49388 7.0777ZM4.5 8.81329V16.3469L11.0001 20.1101V12.5765L4.5 8.81329Z"></path>
                </svg>
            </template>
            {{ $t('cocktail-no-collection') }}
        </EmptyState>
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
    </div>
</template>
<script>
import ApiRequests from './../../ApiRequests.js'
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
    emits: ['cocktailRemovedFromCollection'],
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
            ApiRequests.fetchCollections({ 'filter[cocktail_id]': this.cocktail.id }).then(data => {
                this.collections = data
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
                    ApiRequests.removeCocktailFromCollection(collectionId, this.cocktail.id).then(() => {
                        this.$toast.default(this.$t('collections.cocktail-remove-success'))
                        this.$emit('cocktailRemovedFromCollection', { id: this.cocktail.id })
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
