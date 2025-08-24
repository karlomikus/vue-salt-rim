<template>
    <PageHeader>
        {{ $t('cocktail.cocktails') }}
        <template v-if="appState.isAdmin() || appState.isModerator() || appState.isGeneral()" #actions>
            <RouterLink class="button button--outline" :to="{ name: 'cocktails.scrape' }">{{ $t('cocktail.import') }}</RouterLink>
            <RouterLink class="button button--outline" :to="{ name: 'cocktails.import.bulk' }">Bulk Import</RouterLink>
            <RouterLink class="button button--dark" :to="{ name: 'cocktails.form' }">{{ $t('cocktail.add') }}</RouterLink>
        </template>
    </PageHeader>
    <div class="resource-search-wrapper">
        <div class="resource-search">
            <div v-show="showRefinements" class="resource-search__refinements" @click="handleClickAway">
                <div class="resource-search__refinements__body">
                    <h3 class="page-subtitle" style="margin-top: 0">{{ $t('filters') }}</h3>
                    <Refinement id="global" :title="$t('global')" :collapsable="false">
                        <div v-for="filter in availableRefinements.global" :key="filter.id" class="resource-search__refinements__refinement__item">
                            <input :id="'global-' + filter.id" v-model="activeFilters[filter.id]" type="checkbox" :value="filter.active" @change="updateRouterPath">
                            <label :for="'global-' + filter.id">{{ filter.name }}</label>
                        </div>
                        <SaltRimDialog v-model="showSpecificIngredientsModal">
                            <template #trigger>
                                <a href="#" @click.prevent="showSpecificIngredientsModal = true">{{ $t('search.ingredients') }} ({{ activeFilters.specific_ingredients.length }})</a>
                            </template>
                            <template #dialog>
                                <FilterIngredientsModal :search-token="appState.bar.search_token" :title="$t('search.select-specific-ingredients')" description="Shows recipes that contain all of the selected ingredients." :value="activeFilters.specific_ingredients" @close="updateSpecificIngredients"></FilterIngredientsModal>
                            </template>
                        </SaltRimDialog>
                        <br>
                        <SaltRimDialog v-model="showIgnoreIngredientsModal">
                            <template #trigger>
                                <a href="#" @click.prevent="showIgnoreIngredientsModal = true">{{ $t('search.ignore-ingredients') }} ({{ activeFilters.ignore_ingredients.length }})</a>
                            </template>
                            <template #dialog>
                                <FilterIngredientsModal :search-token="appState.bar.search_token" :title="$t('search.select-ingredients-to-ignore')" description="Shows recipes that do not contain all of the selected ingredients." :value="activeFilters.ignore_ingredients" @close="updateIgnoredIngredients"></FilterIngredientsModal>
                            </template>
                        </SaltRimDialog>
                    </Refinement>
                    <Refinement v-if="refineCollections.length > 0" id="collection" v-model="activeFilters.collection_id" :title="$t('collections.title')" :refinements="refineCollections" @change="updateRouterPath"></Refinement>
                    <Refinement v-if="refineUserShelves.length > 0" id="user_shelves" v-model="activeFilters.user_shelves" :title="$t('public-shelves')" :refinements="refineUserShelves" @change="updateRouterPath"></Refinement>
                    <Refinement id="users" v-model="activeFilters.created_user_id" :searchable="true" :title="$t('user-recipes')" :refinements="refineUsers" @change="updateRouterPath"></Refinement>
                    <Refinement id="main-ingredient" v-model="activeFilters.main_ingredient_id" :searchable="true" :title="$t('ingredient.main')" :refinements="refineMainIngredients" @change="updateRouterPath"></Refinement>
                    <Refinement id="method" v-model="activeFilters.cocktail_method_id" :title="$t('method.title')" :refinements="refineMethods" @change="updateRouterPath"></Refinement>
                    <Refinement id="abv" v-model="activeFilters.abv" :title="$t('strength')" :refinements="refineABV" type="radio" @change="updateRouterPath"></Refinement>
                    <Refinement id="tag" v-model="activeFilters.tag_id" :searchable="true" :title="$t('tag.tags')" :refinements="refineTags" @change="updateRouterPath"></Refinement>
                    <Refinement id="glass" v-model="activeFilters.glass_id" :title="$t('glass-type.title')" :refinements="refineGlasses" @change="updateRouterPath"></Refinement>
                    <Refinement id="total-ingredients" v-model="activeFilters.total_ingredients" :title="$t('total.ingredients')" :refinements="refineIngredientsCount" type="radio" @change="updateRouterPath"></Refinement>
                    <Refinement id="missing-bar-ingredients" v-model="activeFilters.missing_bar_ingredients" :title="$t('missing-ingredients') + ' (' + $t('bars.bar') + ')'" :refinements="refineMissingBarIngredients" type="radio" @change="updateRouterPath"></Refinement>
                    <Refinement id="missing-ingredients" v-model="activeFilters.missing_ingredients" :title="$t('missing-ingredients') + ' (' + $t('shelf.title') + ')'" :refinements="refineMissingIngredients" type="radio" @change="updateRouterPath"></Refinement>
                    <Refinement id="user-rating" v-model="activeFilters.user_rating_min" :title="$t('your-rating')" :refinements="refineRatings" type="radio" @change="updateRouterPath"></Refinement>
                    <Refinement id="avg-rating" v-model="activeFilters.average_rating_min" :title="$t('avg-rating')" :refinements="refineRatings" type="radio" @change="updateRouterPath"></Refinement>
                    <button class="button button--dark sm-show" type="button" @click="showRefinements = false">{{ $t('cancel') }}</button>
                </div>
            </div>
            <div class="resource-search__content">
                <div class="resource-search__content__filter">
                    <button type="button" class="button button--outline button--icon" @click.prevent="showRefinements = !showRefinements">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M6.17 18a3.001 3.001 0 0 1 5.66 0H22v2H11.83a3.001 3.001 0 0 1-5.66 0H2v-2h4.17zm6-7a3.001 3.001 0 0 1 5.66 0H22v2h-4.17a3.001 3.001 0 0 1-5.66 0H2v-2h10.17zm-6-7a3.001 3.001 0 0 1 5.66 0H22v2H11.83a3.001 3.001 0 0 1-5.66 0H2V4h4.17z" />
                        </svg>
                        <div v-show="totalActiveRefinements > 0" class="resource-search__content__filter__count">{{ totalActiveRefinements }}</div>
                    </button>
                    <input v-model="searchQuery" class="form-input" type="text" :placeholder="$t('placeholder.search-cocktails')" @input="debounceCocktailNameSearch" @keyup.enter="updateRouterPath">
                    <select v-model="sort" class="form-select" @change="updateRouterPath">
                        <option disabled>{{ $t('sort') }}:</option>
                        <option value="name">{{ $t('name') }}</option>
                        <option value="created_at">{{ $t('date-added') }}</option>
                        <option value="favorited_at">{{ $t('date-favorited') }}</option>
                        <option value="missing_ingredients">{{ $t('missing-ingredients') }}</option>
                        <option value="missing_bar_ingredients">{{ $t('missing-ingredients') }} ({{ $t('bars.bar')}})</option>
                        <option value="total_ingredients">{{ $t('total.ingredients') }}</option>
                        <option value="average_rating">{{ $t('average-rating') }}</option>
                        <option value="user_rating">{{ $t('user-rating') }}</option>
                        <option value="abv">{{ $t('ABV') }}</option>
                        <option value="random">{{ $t('sort-random') }}</option>
                    </select>
                    <select v-model="sort_dir" class="form-select" @change="updateRouterPath">
                        <option disabled>{{ $t('sort-direction') }}:</option>
                        <option value="">{{ $t('sort-asc') }}</option>
                        <option value="-">{{ $t('sort-desc') }}</option>
                    </select>
                    <select v-model="per_page" class="form-select" @change="updateRouterPath">
                        <option disabled>{{ $t('search.results-per-page') }}:</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                    <button type="button" class="button button--outline button--icon" :title="$t('cocktail.randomize')" @click.prevent="goToRandomCocktail">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M10.9979 1.58018C11.6178 1.22132 12.3822 1.22132 13.0021 1.58018L20.5021 5.92229C21.1197 6.27987 21.5 6.93946 21.5 7.65314V16.3469C21.5 17.0606 21.1197 17.7202 20.5021 18.0778L13.0021 22.4199C12.3822 22.7788 11.6178 22.7788 10.9979 22.4199L3.49793 18.0778C2.88029 17.7202 2.5 17.0606 2.5 16.3469V7.65314C2.5 6.93947 2.88029 6.27987 3.49793 5.92229L10.9979 1.58018ZM4.5 7.65314V7.65792L11.0021 11.4223C11.6197 11.7799 12 12.4395 12 13.1531V20.689L19.5 16.3469V7.65314L12 3.31104L4.5 7.65314ZM6.13208 12.3C6.13206 11.7477 5.74432 11.0761 5.26604 10.7999C4.78776 10.5238 4.40004 10.7476 4.40006 11.2999C4.40008 11.8522 4.78782 12.5238 5.2661 12.7999C5.74439 13.0761 6.1321 12.8523 6.13208 12.3ZM8.72899 18.7982C9.20728 19.0743 9.59499 18.8505 9.59497 18.2982C9.59495 17.7459 9.20721 17.0743 8.72893 16.7982C8.25065 16.522 7.86293 16.7459 7.86295 17.2982C7.86297 17.8504 8.25071 18.522 8.72899 18.7982ZM5.2661 16.799C5.74439 17.0751 6.1321 16.8513 6.13208 16.299C6.13206 15.7467 5.74432 15.0751 5.26604 14.799C4.78776 14.5228 4.40004 14.7467 4.40006 15.2989C4.40008 15.8512 4.78782 16.5228 5.2661 16.799ZM8.72851 14.7995C9.20679 15.0756 9.5945 14.8518 9.59448 14.2995C9.59446 13.7472 9.20673 13.0756 8.72844 12.7995C8.25016 12.5233 7.86245 12.7471 7.86246 13.2994C7.86248 13.8517 8.25022 14.5233 8.72851 14.7995ZM14.8979 8.00001C15.3762 7.72388 15.3762 7.27619 14.8979 7.00006C14.4196 6.72394 13.6441 6.72394 13.1658 7.00006C12.6875 7.27619 12.6875 7.72388 13.1658 8.00001C13.6441 8.27614 14.4196 8.27614 14.8979 8.00001ZM10.0981 7.00006C10.5764 7.27619 10.5764 7.72388 10.0981 8.00001C9.61982 8.27614 8.84434 8.27614 8.36604 8.00001C7.88774 7.72388 7.88774 7.27619 8.36604 7.00006C8.84434 6.72394 9.61982 6.72394 10.0981 7.00006ZM15.9954 15.3495C16.5932 15.0043 17.0779 14.1649 17.0779 13.4745C17.0779 12.7842 16.5933 12.5044 15.9955 12.8496C15.3977 13.1948 14.9131 14.0342 14.913 14.7246C14.913 15.4149 15.3976 15.6947 15.9954 15.3495Z"></path></svg>
                    </button>
                    <SaltRimDialog v-model="showCreateNewCollectionDialog">
                        <template #trigger>
                            <button type="button" class="button button--outline button--icon" :title="$t('collections.add')" @click.prevent="showCreateNewCollectionDialog = !showCreateNewCollectionDialog">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                    <path fill="none" d="M0 0h24v24H0z" />
                                    <path d="M12.414 5H21a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7.414l2 2zM4 5v14h16V7h-8.414l-2-2H4zm7 7V9h2v3h3v2h-3v3h-2v-3H8v-2h3z" />
                                </svg>
                            </button>
                        </template>
                        <template #dialog>
                            <CollectionDialog :title="$t('collections.add-from-query')" :cocktails="currentCocktailIds" @collection-dialog-closed="handleCollectionsDialogClosed" />
                        </template>
                    </SaltRimDialog>
                    <button v-show="totalActiveRefinements > 0" type="button" class="button button--outline button--icon" :title="$t('clear-filters')" @click.prevent="clearRefinements">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 10.5858L14.8284 7.75736L16.2426 9.17157L13.4142 12L16.2426 14.8284L14.8284 16.2426L12 13.4142L9.17157 16.2426L7.75736 14.8284L10.5858 12L7.75736 9.17157L9.17157 7.75736L12 10.5858Z"></path></svg>
                    </button>
                </div>
                <div>
                    <OverlayLoader v-if="isLoading" />
                    <CocktailGridContainer v-if="cocktails.length > 0" v-slot="{observer}">
                        <CocktailGridItem v-for="cocktail in cocktails" :key="cocktail.id" :cocktail="cocktail" :observer="observer" />
                    </CocktailGridContainer>
                    <EmptyState v-else style="margin-top: 1rem;">
                        <template #icon>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
                                <path d="M11 2C15.968 2 20 6.032 20 11C20 15.968 15.968 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2ZM11 18C14.8675 18 18 14.8675 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18ZM19.4853 18.0711L22.3137 20.8995L20.8995 22.3137L18.0711 19.4853L19.4853 18.0711Z"></path>
                            </svg>
                        </template>
                        {{ $t('cocktails-not-found') }}
                    </EmptyState>
                </div>
                <Pagination :meta="meta" @page-changed="handlePageChange"></Pagination>
            </div>
        </div>
    </div>
</template>

<script>
import OverlayLoader from './../OverlayLoader.vue'
import BarAssistantClient from '@/api/BarAssistantClient'
import CocktailGridItem from './CocktailGridItem.vue'
import CocktailGridContainer from './CocktailGridContainer.vue'
import PageHeader from './../PageHeader.vue'
import Refinement from './../Search/SearchRefinement.vue'
import Pagination from './../Search/SearchPagination.vue'
import CollectionDialog from './../Collections/CollectionDialog.vue'
import SaltRimDialog from './../Dialog/SaltRimDialog.vue'
import qs from 'qs'
import AppState from '../../AppState'
import EmptyState from './../EmptyState.vue'
import FilterIngredientsModal from '../Search/FilterIngredientsModal.vue'
import { useTitle } from '@/composables/title'

export default {
    components: {
        CocktailGridItem,
        CocktailGridContainer,
        PageHeader,
        OverlayLoader,
        Refinement,
        SaltRimDialog,
        CollectionDialog,
        Pagination,
        EmptyState,
        FilterIngredientsModal,
    },
    data() {
        return {
            appState: new AppState(),
            showCreateNewCollectionDialog: false,
            isLoading: false,
            showRefinements: false,
            showIgnoreIngredientsModal: false,
            showSpecificIngredientsModal: false,
            cocktails: [],
            favorites: [],
            searchQuery: null,
            sort: 'created_at',
            sort_dir: '-',
            meta: {},
            queryTimer: null,
            currentPage: 1,
            per_page: 50,
            availableRefinements: {
                global: [
                    { name: this.$t('bar_shelf.cocktails'), active: false, id: 'bar_shelf' },
                    { name: this.$t('shelf.cocktails'), active: false, id: 'on_shelf' },
                    { name: this.$t('my-favorites'), active: false, id: 'favorites' },
                    { name: this.$t('cocktail.shared'), active: false, id: 'is_public' },
                ],
                abv: [
                    { name: this.$t('non-alcoholic'), min: null, max: 2, id: 'abv_non_alcoholic' },
                    { name: this.$t('weak'), min: 2, max: 18, id: 'abv_weak' },
                    { name: this.$t('medium'), min: 18, max: 28, id: 'abv_medium' },
                    { name: this.$t('strong'), min: 28, max: null, id: 'abv_strong' },
                ],
                total_ingredients: [
                    { name: '>= 3 ' + this.$t('ingredient.ingredients'), active: false, id: '3' },
                    { name: '>= 5 ' + this.$t('ingredient.ingredients'), active: false, id: '5' },
                    { name: '>= 7 ' + this.$t('ingredient.ingredients'), active: false, id: '7' },
                ],
                missing_ingredients: [
                    { name: '1 ' + this.$t('ingredient.ingredients'), active: false, id: '1' },
                    { name: '2 ' + this.$t('ingredient.ingredients'), active: false, id: '2' },
                    { name: '>= 3 ' + this.$t('ingredient.ingredients'), active: false, id: '3' },
                ],
                missing_bar_ingredients: [
                    { name: '1 ' + this.$t('ingredient.ingredients'), active: false, id: '1' },
                    { name: '2 ' + this.$t('ingredient.ingredients'), active: false, id: '2' },
                    { name: '>= 3 ' + this.$t('ingredient.ingredients'), active: false, id: '3' },
                ],
                tags: [],
                glasses: [],
                methods: [],
                main_ingredients: [],
                collections: [],
                shared_collections: [],
                members: [],
            },
            activeFilters: {
                on_shelf: false,
                bar_shelf: false,
                favorites: false,
                is_public: false,
                tag_id: [],
                glass_id: [],
                cocktail_method_id: [],
                main_ingredient_id: [],
                collection_id: [],
                user_rating_min: null,
                average_rating_min: null,
                abv: null,
                total_ingredients: null,
                missing_ingredients: null,
                missing_bar_ingredients: null,
                user_shelves: [],
                created_user_id: [],
                ignore_ingredients: [],
                specific_ingredients: [],
                ingredient_id: [],
                ingredient_substitute_id: [],
                id: [],
            }
        }
    },
    computed: {
        sortWithDir: {
            set(val) {
                if (!val) {
                    return
                }
                if (val.startsWith('-')) {
                    this.sort_dir = '-'
                    this.sort = val.substring(1)
                } else {
                    this.sort_dir = ''
                    this.sort = val
                }
            },
            get() {
                return (this.sort != null && this.sort != '') ? this.sort_dir + this.sort : null
            }
        },
        refineMethods() {
            return this.availableRefinements.methods.map(m => {
                return {
                    id: m.id,
                    value: m.id,
                    name: m.name
                }
            })
        },
        refineGlasses() {
            return this.availableRefinements.glasses.map(m => {
                return {
                    id: m.id,
                    value: m.id,
                    name: m.name
                }
            })
        },
        refineTags() {
            return this.availableRefinements.tags.map(m => {
                return {
                    id: m.id,
                    value: m.id,
                    name: m.name
                }
            })
        },
        refineABV() {
            return this.availableRefinements.abv.map(m => {
                return {
                    id: m.id,
                    value: {min: m.min, max: m.max},
                    name: m.name
                }
            })
        },
        refineRatings() {
            return [1, 2, 3, 4, 5].map(r => {
                return {
                    id: r,
                    value: parseInt(r),
                    name: '>= ' + '★'.repeat(r)
                }
            })
        },
        refineMainIngredients() {
            return this.availableRefinements.main_ingredients.map(i => {
                return {
                    id: i.id,
                    value: i.id,
                    name: i.name
                }
            })
        },
        refineCollections() {
            const combinedCollections = [...new Set([...this.availableRefinements.collections, ...this.availableRefinements.shared_collections])]
            const uniqueCollections = combinedCollections.filter((v,i,a) => a.findIndex(v2 => (parseInt(v.id) == parseInt(v2.id))) == i)

            return uniqueCollections.map(m => {
                const author = m.created_user ? ` [${m.created_user.name}]` : ''

                return {
                    id: m.id,
                    value: m.id,
                    name: `${m.name}${author} (${m.cocktails.length})`
                }
            })
        },
        refineIngredientsCount() {
            return this.availableRefinements.total_ingredients.map(m => {
                return {
                    id: m.id,
                    value: m.id,
                    name: m.name
                }
            })
        },
        refineMissingIngredients() {
            return this.availableRefinements.missing_ingredients.map(m => {
                return {
                    id: m.id,
                    value: m.id,
                    name: m.name
                }
            })
        },
        refineMissingBarIngredients() {
            return this.availableRefinements.missing_bar_ingredients.map(m => {
                return {
                    id: m.id,
                    value: m.id,
                    name: m.name
                }
            })
        },
        refineUsers() {
            return this.availableRefinements.members.map(m => {
                return {
                    id: m.user_id,
                    value: m.user_id,
                    name: m.user_name
                }
            })
        },
        refineUserShelves() {
            return this.availableRefinements.members.filter(us => us.is_shelf_public == true && us.user_id != this.appState.user.id).map(m => {
                return {
                    id: m.user_id,
                    value: m.user_id,
                    name: m.user_name
                }
            })
        },
        currentCocktailIds() {
            return this.cocktails.map((c) => c.id)
        },
        totalActiveRefinements() {
            let total = 0

            Object.values(this.activeFilters).forEach(element => {
                if (Array.isArray(element) && element.length > 0) {
                    return total++
                }

                if (typeof element == 'boolean' && element == true) {
                    return total++
                }

                if (element !== null && !Array.isArray(element) && element !== false) {
                    return total++
                }
            })

            return total
        },
    },
    created() {
        useTitle(this.$t('cocktail.cocktails'))

        this.fetchRefinements()

        this.$watch(
            () => this.$route.query,
            () => {
                if (this.$route.name == 'cocktails') {
                    this.queryToState()
                    this.refreshCocktails()
                }
            },
            { immediate: true }
        )
    },
    methods: {
        fetchRefinements() {
            BarAssistantClient.getTags().then(resp => {
                this.availableRefinements.tags = resp.data
            })

            BarAssistantClient.getGlasses().then(resp => {
                this.availableRefinements.glasses = resp.data
            })

            BarAssistantClient.getCocktailMethods().then(resp => {
                this.availableRefinements.methods = resp.data
            })

            BarAssistantClient.getIngredients({'filter[main_ingredients]': true, per_page: 100}).then(resp => {
                this.availableRefinements.main_ingredients = resp.data
            })

            BarAssistantClient.getCollections({per_page: 100, include: 'cocktails'}).then(resp => {
                this.availableRefinements.collections = resp.data
            })

            BarAssistantClient.getBarMembers(this.appState.bar.id).then(resp => {
                this.availableRefinements.members = resp.data
            })

            BarAssistantClient.getSharedCollections(this.appState.bar.id).then(resp => {
                this.availableRefinements.shared_collections = resp.data
            })
        },
        updateRouterPath() {
            const query = this.stateToQuery()

            this.$router.push({
                query: query
            })
        },
        refreshCocktails() {
            const query = this.stateToQuery()
            query.include = 'ratings,ingredients.ingredient,tags,images'

            this.isLoading = true
            BarAssistantClient.getCocktails(query).then(async resp => {
                this.cocktails = resp.data
                this.meta = resp.meta
                this.isLoading = false
            }).catch(e => {
                this.$toast.error(e.message)
                this.isLoading = false
            })
        },
        handlePageChange(toPage) {
            this.currentPage = toPage
            this.updateRouterPath()
        },
        queryToState() {
            const state = qs.parse(this.$route.query)

            this.activeFilters.tag_id = state.filter && state.filter.tag_id ? String(state.filter.tag_id).split(',') : []
            this.activeFilters.cocktail_method_id = state.filter && state.filter.cocktail_method_id ? String(state.filter.cocktail_method_id).split(',') : []
            this.activeFilters.glass_id = state.filter && state.filter.glass_id ? String(state.filter.glass_id).split(',') : []
            this.activeFilters.main_ingredient_id = state.filter && state.filter.main_ingredient_id ? String(state.filter.main_ingredient_id).split(',') : []
            this.activeFilters.collection_id = state.filter && state.filter.collection_id ? String(state.filter.collection_id).split(',') : []
            this.activeFilters.user_shelves = state.filter && state.filter.user_shelves ? String(state.filter.user_shelves).split(',') : []
            this.activeFilters.created_user_id = state.filter && state.filter.created_user_id ? String(state.filter.created_user_id).split(',') : []
            this.activeFilters.on_shelf = state.filter && state.filter.on_shelf ? state.filter.on_shelf : null
            this.activeFilters.bar_shelf = state.filter && state.filter.bar_shelf ? state.filter.bar_shelf : null
            this.activeFilters.favorites = state.filter && state.filter.favorites ? state.filter.favorites : null
            this.activeFilters.is_public = state.filter && state.filter.is_public ? state.filter.is_public : null
            this.activeFilters.total_ingredients = state.filter && state.filter.total_ingredients ? state.filter.total_ingredients : null
            this.activeFilters.missing_ingredients = state.filter && state.filter.missing_ingredients ? state.filter.missing_ingredients : null
            this.activeFilters.missing_bar_ingredients = state.filter && state.filter.missing_bar_ingredients ? state.filter.missing_bar_ingredients : null
            this.activeFilters.ignore_ingredients = state.filter && state.filter.ignore_ingredients ? String(state.filter.ignore_ingredients).split(',') : []
            this.activeFilters.specific_ingredients = state.filter && state.filter.specific_ingredients ? String(state.filter.specific_ingredients).split(',') : []
            this.activeFilters.id = state.filter && state.filter.id ? String(state.filter.id).split(',') : []
            this.activeFilters.ingredient_id = state.filter && state.filter.ingredient_id ? String(state.filter.ingredient_id).split(',') : []
            this.activeFilters.ingredient_substitute_id = state.filter && state.filter.ingredient_substitute_id ? String(state.filter.ingredient_substitute_id).split(',') : []
            this.activeFilters.user_rating_min = state.filter && state.filter.user_rating_min ? state.filter.user_rating_min : null
            this.activeFilters.average_rating_min = state.filter && state.filter.average_rating_min ? state.filter.average_rating_min : null
            this.searchQuery = state.filter && state.filter.name ? state.filter.name : null
            if (state.filter && (state.filter.abv_min || state.filter.abv_max)) {
                this.activeFilters.abv = { min: state.filter.abv_min ? state.filter.abv_min : null, max: state.filter.abv_max ? state.filter.abv_max : null }
            }

            if (state.per_page) {
                this.per_page = state.per_page
            }

            if (state.page) {
                this.currentPage = state.page
            }

            if (state.sort) {
                this.sortWithDir = state.sort
            }
        },
        stateToQuery() {
            const query = {
                per_page: this.per_page,
                page: this.currentPage,
                sort: this.sortWithDir
            }

            const filters = {
                name: (this.searchQuery != null && this.searchQuery != '') ? this.searchQuery : null,
                on_shelf: this.activeFilters.on_shelf,
                bar_shelf: this.activeFilters.bar_shelf,
                favorites: this.activeFilters.favorites,
                is_public: this.activeFilters.is_public,
                user_rating_min: this.activeFilters.user_rating_min ? this.activeFilters.user_rating_min : null,
                average_rating_min: this.activeFilters.average_rating_min ? this.activeFilters.average_rating_min : null,
                total_ingredients: this.activeFilters.total_ingredients ? this.activeFilters.total_ingredients : null,
                missing_ingredients: this.activeFilters.missing_ingredients ? this.activeFilters.missing_ingredients : null,
                missing_bar_ingredients: this.activeFilters.missing_bar_ingredients ? this.activeFilters.missing_bar_ingredients : null,
                ignore_ingredients: this.activeFilters.ignore_ingredients.length > 0 ? this.activeFilters.ignore_ingredients.join(',') : null,
                tag_id: this.activeFilters.tag_id.length > 0 ? this.activeFilters.tag_id.join(',') : null,
                glass_id: this.activeFilters.glass_id.length > 0 ? this.activeFilters.glass_id.join(',') : null,
                cocktail_method_id: this.activeFilters.cocktail_method_id.length > 0 ? this.activeFilters.cocktail_method_id.join(',') : null,
                main_ingredient_id: this.activeFilters.main_ingredient_id.length > 0 ? this.activeFilters.main_ingredient_id.join(',') : null,
                specific_ingredients: this.activeFilters.specific_ingredients.length > 0 ? this.activeFilters.specific_ingredients.join(',') : null,
                ingredient_id: this.activeFilters.ingredient_id.length > 0 ? this.activeFilters.ingredient_id.join(',') : null,
                ingredient_substitute_id: this.activeFilters.ingredient_substitute_id.length > 0 ? this.activeFilters.ingredient_substitute_id.join(',') : null,
                collection_id: this.activeFilters.collection_id.length > 0 ? this.activeFilters.collection_id.join(',') : null,
                user_shelves: this.activeFilters.user_shelves.length > 0 ? this.activeFilters.user_shelves.join(',') : null,
                id: this.activeFilters.id.length > 0 ? this.activeFilters.id.join(',') : null,
                created_user_id: this.activeFilters.created_user_id.length > 0 ? this.activeFilters.created_user_id.join(',') : null,
                abv_min: this.activeFilters.abv ? this.activeFilters.abv.min : null,
                abv_max: this.activeFilters.abv ? this.activeFilters.abv.max : null,
            }

            // Remove null values
            query.filter = Object.entries(filters).reduce((a,[k,v]) => (v === null || v === false ? a : (a[k]=v, a)), {})

            return query
        },
        updateIgnoredIngredients(e) {
            this.activeFilters.ignore_ingredients = e.newFilters
            this.showIgnoreIngredientsModal = false
            this.updateRouterPath()
        },
        updateSpecificIngredients(e) {
            this.activeFilters.specific_ingredients = e.newFilters
            this.showSpecificIngredientsModal = false
            this.updateRouterPath()
        },
        handleCollectionsDialogClosed() {
            this.showCreateNewCollectionDialog = false
            this.fetchRefinements()
            this.refreshCocktails()
        },
        debounceCocktailNameSearch() {
            clearTimeout(this.queryTimer)

            this.queryTimer = setTimeout(() => {
                this.currentPage = 1
                this.updateRouterPath()
            }, 300)
        },
        clearRefinements() {
            this.searchQuery = null
            this.sort = 'name'
            this.sort_dir = '',
            this.currentPage = 1,
            this.per_page = 50,
            this.activeFilters = {
                on_shelf: false,
                bar_shelf: false,
                favorites: false,
                is_public: false,
                tag_id: [],
                glass_id: [],
                cocktail_method_id: [],
                main_ingredient_id: [],
                ingredients: [],
                collection_id: [],
                user_rating_min: null,
                average_rating_min: null,
                abv: null,
                total_ingredients: null,
                user_shelves: [],
                created_user_id: [],
                ignore_ingredients: [],
                specific_ingredients: [],
                ingredient_id: [],
                ingredient_substitute_id: [],
                id: [],
                missing_ingredients: null,
                missing_bar_ingredients: null,
            }

            this.updateRouterPath()
        },
        handleClickAway(e) {
            if (e && e.target && e.target.classList.contains('resource-search__refinements')) {
                this.showRefinements = !this.showRefinements
            }
        },
        goToRandomCocktail() {
            this.isLoading = true
            BarAssistantClient.getCocktails({sort: 'random', per_page: 1}).then(async resp => {
                this.$router.push({
                    name: 'cocktails.show',
                    params: { id: resp.data[0].slug }
                })
                this.isLoading = false
            }).catch(e => {
                this.$toast.error(e.message)
                this.isLoading = false
            })
        }
    }
}
</script>
