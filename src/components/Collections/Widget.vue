<template>
    <div class="cocktail-collections-wrapper">
        <OverlayLoader v-if="isLoading" />
        <div class="block-container cocktail-collections__item" v-for="collection in collections">
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
import ApiRequests from './../../ApiRequests.js';
import OverlayLoader from './../OverlayLoader.vue'

export default {
    props: {
        cocktail: {
            type: Object,
            default: {}
        }
    },
    emits: ['cocktailRemovedFromCollection'],
    data() {
        return {
            isLoading: false,
            collections: []
        };
    },
    components: {
        OverlayLoader
    },
    watch: {
        cocktail() {
            this.fetchCocktailCollections()
        }
    },
    created() {
        this.fetchCocktailCollections();
    },
    methods: {
        fetchCocktailCollections() {
            this.isLoading = true;
            ApiRequests.fetchCollections({ 'filter[cocktail_id]': this.cocktail.id }).then(data => {
                this.collections = data
                this.isLoading = false;
            }).catch(() => {
                this.collections = []
                this.isLoading = false;
            })
        },
        removeCocktailFromCollection(collectionId) {
            this.$confirm(this.$t('collections.confirm-remove-cocktail'), {
                onResolved: (dialog) => {
                    this.isLoading = true;
                    dialog.close();
                    ApiRequests.removeCocktailFromCollection(collectionId, this.cocktail.id).then(() => {
                        this.$toast.default(this.$t('collections.cocktail-remove-success'))
                        this.$emit('cocktailRemovedFromCollection', {id: this.cocktail.id})
                        this.isLoading = false
                    }).catch(e => {
                        this.$toast.error(e.message)
                        this.isLoading = false
                    })
                }
            });
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
