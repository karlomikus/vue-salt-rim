<template>
    <PageHeader>
        {{ $t('your-shopping-list') }}
        <template #actions>
            <RouterLink class="button button--outline" target="_blank" :to="{ name: 'print.shopping-list' }">{{ $t('print') }}</RouterLink>
        </template>
    </PageHeader>
    <OverlayLoader v-if="isLoading"></OverlayLoader>
    <IngredientListContainer v-if="shoppingListIngredients.length > 0">
        <IngredientListItem
            v-for="ingredient in shoppingListIngredients"
            :ingredient="ingredient"
            :key="ingredient.id"
            @removedFromShoppingList="removeIngFromList(ingredient)"
            @addedToShelf="removeIngFromList(ingredient)" />
    </IngredientListContainer>
    <div class="empty-state" v-else>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M4 16V4H2V2h3a1 1 0 0 1 1 1v12h12.438l2-8H8V5h13.72a1 1 0 0 1 .97 1.243l-2.5 10a1 1 0 0 1-.97.757H5a1 1 0 0 1-1-1zm2 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm12 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
        </svg>
        <p>Ingredients you are missing will be shown here.</p>
    </div>
</template>

<script>
import ApiRequests from '@/ApiRequests';
import IngredientListItem from '@/components/Ingredient/IngredientListItem.vue'
import IngredientListContainer from '@/components/Ingredient/IngredientListContainer.vue'
import OverlayLoader from '@/components/OverlayLoader.vue'
import PageHeader from '@/components/PageHeader.vue'

export default {
    data: () => ({
        isLoading: false,
        shoppingListIngredients: [],
    }),
    components: {
        IngredientListItem,
        IngredientListContainer,
        OverlayLoader,
        PageHeader,
    },
    created() {
        document.title = `Cocktails you can make \u22C5 ${this.site_title}`

        this.isLoading = true;

        ApiRequests.fetchIngredients({'filter[on_shopping_list]': true}).then(data => {
            this.isLoading = false;
            this.shoppingListIngredients = data
        }).catch(e => {
            this.isLoading = false;
            this.$toast.error('An error occured while fetching ingredients on your shopping list from a server.');
        })
    },
    methods: {
        removeIngFromList(ingredient) {
            this.shoppingListIngredients.splice(this.shoppingListIngredients.indexOf(ingredient), 1)
        },
    }
}
</script>
