<template>
    <PageHeader>
        {{ $t('your-shopping-list') }}
        <template #actions>
            <Dropdown>
                <template v-slot:default="{ toggleDropdown }">
                    <button type="button" class="button button--dark" @click="toggleDropdown">{{ $t('share') }}</button>
                </template>
                <template #content>
                    <RouterLink class="dropdown-menu__item" target="_blank" :to="{ name: 'print.shopping-list' }">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M6 19H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h3V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v4h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-3v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-2zm0-2v-1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1h2V9H4v8h2zM8 4v3h8V4H8zm0 13v3h8v-3H8zm-3-7h3v2H5v-2z" />
                        </svg>
                        {{ $t('print') }}
                    </RouterLink>
                    <a class="dropdown-menu__item" href="#copy" @click.prevent="shareFromFormat('markdown')">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                            <path d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM4 5V19H20V5H4ZM7 15.5H5V8.5H7L9 10.5L11 8.5H13V15.5H11V11.5L9 13.5L7 11.5V15.5ZM18 12.5H20L17 15.5L14 12.5H16V8.5H18V12.5Z"></path>
                        </svg>
                        {{ $t('share-copy-md') }}
                    </a>
                </template>
            </Dropdown>
        </template>
    </PageHeader>
    <OverlayLoader v-if="isLoading"></OverlayLoader>
    <IngredientListContainer v-if="shoppingListIngredients.length > 0">
        <IngredientListItem v-for="ingredient in shoppingListIngredients" :ingredient="ingredient" :key="ingredient.id" @removedFromShoppingList="removeIngFromList(ingredient)" @addedToShelf="removeIngFromList(ingredient)" />
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
import ApiRequests from './../../ApiRequests';
import IngredientListItem from '@/components/Ingredient/IngredientListItem.vue'
import IngredientListContainer from '@/components/Ingredient/IngredientListContainer.vue'
import OverlayLoader from '@/components/OverlayLoader.vue'
import PageHeader from '@/components/PageHeader.vue'
import Dropdown from './../Dropdown.vue';

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
        Dropdown
    },
    created() {
        document.title = `Cocktails you can make \u22C5 ${this.site_title}`

        this.isLoading = true;

        ApiRequests.fetchIngredients({ 'filter[on_shopping_list]': true }).then(data => {
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
        shareFromFormat(format) {
            ApiRequests.shareShoppingList({ type: format }).then(data => {
                navigator.clipboard.writeText(data).then(() => {
                    this.$toast.default(this.$t('share-format-copied'));
                }, () => {
                    this.$toast.error(this.$t('share-format-copy-failed'));
                });
            })
        }
    }
}
</script>
