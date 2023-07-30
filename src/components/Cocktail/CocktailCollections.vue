<template>
    <div class="cocktail-collections-wrapper">
        <OverlayLoader v-if="isLoading" />
        <RouterLink class="block-container cocktail-collections__item" v-for="collection in collections" :to="{ name: 'cocktails', query: {'filter[collection_id]': collection.id} }">
            {{ collection.name }}
        </RouterLink>
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
            ApiRequests.fetchCollections({'filter[cocktail_id]': this.cocktail.id}).then(data => {
                this.collections = data
                this.isLoading = false;
            }).catch(() => {
                this.collections = []
                this.isLoading = false;
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
</style>
