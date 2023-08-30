<template>
    <div class="similar-cocktails-wrapper">
        <OverlayLoader v-if="isLoading" />
        <CocktailListContainer v-if="similarCocktails.length > 0" v-slot="observer">
            <CocktailListItem v-for="cocktail in similarCocktails" :key="cocktail.id" :cocktail="cocktail" :observer="observer" />
        </CocktailListContainer>
        <div v-else class="empty-state">
            <p>{{ $t('no-cocktails') }}</p>
        </div>
    </div>
</template>
<script>
import ApiRequests from '@/ApiRequests';
import CocktailListItem from '@/components/Cocktail/CocktailListItem.vue'
import CocktailListContainer from '@/components/Cocktail/CocktailListContainer.vue'
import OverlayLoader from '@/components/OverlayLoader.vue'

export default {
    components: {
        CocktailListItem,
        CocktailListContainer,
        OverlayLoader
    },
    props: {
        fromCocktail: {
            type: Object,
            default() {
                return {}
            }
        }
    },
    data() {
        return {
            isLoading: false,
            similarCocktails: []
        };
    },
    watch: {
        fromCocktail() {
            this.fetchRelated()
        }
    },
    created() {
        this.fetchRelated();
    },
    methods: {
        fetchRelated() {
            this.isLoading = true;
            ApiRequests.fetchSimilarCocktails(this.fromCocktail.id).then(data => {
                this.similarCocktails = data
                this.isLoading = false;
            }).catch(() => {
                this.similarCocktails = []
                this.isLoading = false;
            })
        },
    }
}
</script>
