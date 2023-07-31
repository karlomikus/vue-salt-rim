<template>
    <PageHeader>
        {{ $t('ingredients') }}
        <template #actions>
            <RouterLink class="button button--dark" :to="{ name: 'ingredients.form' }">{{ $t('ingredient.add') }}</RouterLink>
        </template>
    </PageHeader>
    <p class="page-description">{{ $t('ingredients.page.description') }}</p>
    <div class="resource-search-wrapper">
        <OverlayLoader v-if="isLoading" />
        <div class="resource-search">
            <div class="resource-search__refinements">
                <div class="resource-search__refinements__body">
                    <h3 class="page-subtitle" style="margin-top: 0">{{ $t('filters') }}</h3>
                    <!-- <Refinement :title="$t('your-collections')" :refinements="refineCollections" id="collection" v-model="activeFilters.collections" v-if="refineCollections.length > 0" @change="updateRouterPath"></Refinement> -->
                </div>
            </div>
        </div>
    </div>
    <IngredientGridContainer style="margin-top: 1rem;">
        <IngredientGridItem v-for="ingredient in ingredients" :ingredient="ingredient" :user-ingredients="[]" :shopping-list="[]" :key="ingredient.id" />
    </IngredientGridContainer>
    <div style="text-align: center; margin: 20px 0;">
        <button class="button button--dark" v-if="!isLastPage" @click="refineNext">
            {{ $t('show-more') }}
        </button>
    </div>
</template>

<script>
import OverlayLoader from './../OverlayLoader.vue'
import ApiRequests from './../../ApiRequests.js'
import Checkbox from './../Checkbox.vue'
import IngredientGridContainer from './../Ingredient/IngredientGridContainer.vue'
import IngredientGridItem from './../Ingredient/IngredientGridItem.vue'
import PageHeader from './../PageHeader.vue'
import Auth from './../../Auth.js';
import Refinement from './../Search/Refinement.vue';
import CollectionDialog from './../Cocktail/CollectionDialog.vue';
import Dialog from './../Dialog/Dialog.vue'
import qs from 'qs';

export default {
    data() {
        return {
            isLoading: false,
            meta: {},
            ingredients: [],
        }
    },
    components: {
        IngredientGridItem,
        IngredientGridContainer,
        PageHeader
    },
    created() {
        document.title = `${this.$t('ingredients')} \u22C5 ${this.site_title}`

        this.fetchRefinements();

        this.refreshIngredients();
    },
    computed: {
    },
    methods: {
        fetchRefinements() {
        },
        refreshIngredients() {
            this.isLoading = true;
            ApiRequests.fetchIngredients().then(resp => {
                this.ingredients = resp.data
                this.meta = resp.meta
                this.isLoading = false;
            }).catch(e => {
                this.$toast.error(e.message);
                this.isLoading = false;
            })
        },
    }
}
</script>

<style scoped>

</style>
