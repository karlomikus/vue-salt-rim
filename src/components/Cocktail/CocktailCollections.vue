<template>
    <div class="cocktail-collections-wrapper">
        <OverlayLoader v-if="isLoading" />
        <a href="#" v-for="collection in collections">{{ collection.name }}</a>
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
