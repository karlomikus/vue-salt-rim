<template>
    <PageHeader>
        {{ $t('shelf.cocktails') }}
    </PageHeader>
    <OverlayLoader v-if="isLoading"></OverlayLoader>
    <CocktailListContainer v-if="cocktails.length > 0" v-slot="observer">
        <CocktailListItem v-for="cocktail in cocktails" :cocktail="cocktail" :key="cocktail.id" :observer="observer" />
    </CocktailListContainer>
    <div v-else class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" d="M0 0H24V24H0z" />
            <path d="M19.243 4.757c1.462 1.466 2.012 3.493 1.65 5.38.568.16 1.106.463 1.554.908 1.404 1.394 1.404 3.654 0 5.047L17 21.5l-3.022-3L11 21.485 2.52 12.993C.417 10.637.496 7.019 2.757 4.757c2.265-2.264 5.888-2.34 8.244-.228 2.349-2.109 5.979-2.039 8.242.228zm-6.281 7.708c-.616.611-.616 1.597 0 2.208L17 18.682l4.038-4.009c.616-.611.616-1.597 0-2.208-.624-.62-1.642-.62-2.268.002l-1.772 1.754-1.407-1.396-.363-.36c-.624-.62-1.642-.62-2.266 0zm-8.79-6.293c-1.49 1.49-1.565 3.875-.192 5.451L11 18.654l1.559-1.562-1.006-1c-1.404-1.393-1.404-3.653 0-5.047 1.404-1.393 3.68-1.393 5.084 0l.363.36.363-.36c.425-.421.93-.715 1.465-.882.416-1.367.078-2.912-1.001-3.993-1.5-1.502-3.92-1.563-5.49-.153l-1.335 1.198-1.336-1.197c-1.575-1.412-3.99-1.35-5.494.154z" />
        </svg>
    </div>
</template>

<script>
import ApiRequests from '@/ApiRequests';
import CocktailListItem from '@/components/Cocktail/CocktailListItem.vue'
import CocktailListContainer from '@/components/Cocktail/CocktailListContainer.vue'
import OverlayLoader from '@/components/OverlayLoader.vue'
import PageHeader from '@/components/PageHeader.vue'

export default {
    data: () => ({
        isLoading: false,
        cocktails: [],
    }),
    components: {
        CocktailListItem,
        CocktailListContainer,
        OverlayLoader,
        PageHeader,
    },
    created() {
        document.title = `Cocktails you can make \u22C5 Salt Rim`

        this.isLoading = true;

        ApiRequests.fetchShelfCocktails().then(data => {
            this.isLoading = false;
            this.cocktails = data
        }).catch(e => {
            this.isLoading = false;
            this.$toast.error('An error occured while fetching cocktails you can make from a server.');
        })
    }
}
</script>
