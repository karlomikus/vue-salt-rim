<template>
    <PageHeader>
        [SERVER] {{ $t('cocktails') }}
    </PageHeader>
    <div class="cocktails-search-wrapper">
        <OverlayLoader v-if="isLoading" />
        <div class="cocktails-search">
            <div class="cocktails-search__refinements" v-show="showRefinements">
                <div class="block-container cocktails-search__refinements__refinement">
                    <h4 class="cocktails-search__refinements__refinement__title">Global filters:</h4>
                    <div class="cocktails-search__refinements__refinement__body">
                        <div v-for="filter in availableRefinements.global">
                            <input type="checkbox" :id="'global-' + filter.id" :value="filter.active" v-model="filters[filter.id]">
                            <label :for="'global-' + filter.id">{{ filter.name }}</label>
                        </div>
                    </div>
                </div>
                <div class="block-container cocktails-search__refinements__refinement">
                    <h4 class="cocktails-search__refinements__refinement__title">Tags:</h4>
                    <div class="cocktails-search__refinements__refinement__body">
                        <div v-for="tag in availableRefinements.tags">
                            <input type="checkbox" :id="'tag-' + tag.id" :value="tag.id" v-model="filters.tags">
                            <label :for="'tag-' + tag.id">{{ tag.name }}</label>
                        </div>
                    </div>
                </div>
                <h4>Method:</h4>
                <div v-for="method in availableRefinements.methods">
                    <input type="checkbox" :id="'method-' + method.id" :value="method.id" v-model="filters.methods">
                    <label :for="'method-' + method.id">{{ method.name }}</label>
                </div>
                <h4>Glass:</h4>
                <div v-for="glass in availableRefinements.glasses">
                    <input type="checkbox" :id="'glass-' + glass.id" :value="glass.id" v-model="filters.glasses">
                    <label :for="'glass-' + glass.id">{{ glass.name }}</label>
                </div>
                <h4>Your rating:</h4>
                <div v-for="rating in 5">
                    <input type="radio" :id="'user-rating-' + rating" :value="rating" v-model="filters.user_rating">
                    <label :for="'user-rating-' + rating">Rating {{ rating }} &amp; up</label>
                </div>
            </div>
            <div class="cocktails-search__content">
                <div class="cocktails-search__content__filter">
                    <button type="button" class="button button--input" @click.prevent="showRefinements = !showRefinements">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M6.17 18a3.001 3.001 0 0 1 5.66 0H22v2H11.83a3.001 3.001 0 0 1-5.66 0H2v-2h4.17zm6-7a3.001 3.001 0 0 1 5.66 0H22v2h-4.17a3.001 3.001 0 0 1-5.66 0H2v-2h10.17zm-6-7a3.001 3.001 0 0 1 5.66 0H22v2H11.83a3.001 3.001 0 0 1-5.66 0H2V4h4.17z" />
                        </svg>
                    </button>
                    <input class="form-input" type="text" :placeholder="$t('placeholder.search-cocktails')" v-model="q" style="flex-basis: 100%;">
                    <select class="form-select" v-model="sort">
                        <option value="name">Name</option>
                        <option value="missing_ingredients">Missing ingredients</option>
                        <option value="created_at">Date created</option>
                        <option value="favorited_at">Date favorited</option>
                        <option value="average_rating">Average rating</option>
                        <option value="user_rating">User rating</option>
                        <option value="abv">ABV</option>
                    </select>
                    <select class="form-select" v-model="sort_dir">
                        <option value="">Ascending</option>
                        <option value="-">Descending</option>
                    </select>
                    <select class="form-select" v-model="per_page">
                        <option value="15">15</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                    <button type="button" class="button button--input" @click.prevent="refreshCocktails">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M12 13H4V11H12V4L20 12L12 20V13Z"></path></svg>
                    </button>
                </div>
                <CocktailGridContainer v-if="cocktails.length > 0" v-slot="observer">
                    <CocktailGridItem v-for="cocktail in cocktails" :cocktail="cocktail" :key="cocktail.id" :observer="observer" />
                </CocktailGridContainer>
                <div class="cocktails-search__content__pagination">
                    Showing {{ meta.to }}/{{ meta.total }} results &middot; <button type="button" @click="changePage('prev')">Prev</button> &middot; Page {{ meta.current_page }}/{{ meta.last_page }} &middot; <button type="button" @click="changePage('next')">Next</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import OverlayLoader from '@/components/OverlayLoader.vue'
import ApiRequests from '@/ApiRequests.js'
import Checkbox from '@/components/Checkbox.vue'
import CocktailGridItem from './CocktailGridItem.vue'
import CocktailGridContainer from './CocktailGridContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import Auth from '@/Auth.js';

export default {
    data() {
        return {
            isLoading: false,
            showRefinements: false,
            cocktails: [],
            q: null,
            sort: 'name',
            sort_dir: '',
            meta: {},
            currentPage: 1,
            availableRefinements: {
                global: [
                    { name: this.$t('shelf.cocktails'), active: false, id: 'shelf' },
                    { name: this.$t('my.favorites'), active: false, id: 'favorites' },
                    { name: this.$t('cocktails.shared'), active: false, id: 'public' },
                    { name: this.$t('my.cocktails'), active: false, id: 'user' },
                ],
                tags: [],
                glasses: [],
                methods: [],
            },
            per_page: 50,
            filters: {
                shelf: false,
                favorites: false,
                public: false,
                user: false,
                tags: [],
                glasses: [],
                methods: [],
                user_rating: null
            }
        }
    },
    components: {
        CocktailGridItem,
        CocktailGridContainer,
        PageHeader,
        Checkbox,
        OverlayLoader
    },
    created() {
        document.title = `${this.$t('cocktails')} \u22C5 ${this.site_title}`
        this.fetchRefinements();
        this.refreshCocktails();
    },
    methods: {
        fetchRefinements() {
            ApiRequests.fetchTags().then(data => {
                this.availableRefinements.tags = data
            })

            ApiRequests.fetchGlasses().then(data => {
                this.availableRefinements.glasses = data
            })

            ApiRequests.fetchCocktailMethods().then(data => {
                this.availableRefinements.methods = data
            })
        },
        refreshCocktails() {
            const query = {per_page: this.per_page, page: this.currentPage};

            if (this.q != null && this.q != '') {
                query['filter[name]'] = this.q
            }

            if (this.sort != null && this.sort != '') {
                query['sort'] = this.sort_dir + this.sort
            }

            query['filter[on_shelf]'] = this.filters.shelf
            query['filter[favorites]'] = this.filters.favorites
            query['filter[is_public]'] = this.filters.public

            if (this.filters.user) {
                query['filter[user_id]'] = Auth.getUser().id
            }

            if (this.filters.tags.length > 0) {
                query['filter[tag_id]'] = this.filters.tags.join(',');
            }

            if (this.filters.glasses.length > 0) {
                query['filter[glass_id]'] = this.filters.glasses.join(',');
            }

            if (this.filters.methods.length > 0) {
                query['filter[cocktail_method_id]'] = this.filters.methods.join(',');
            }

            if (this.filters.user_rating) {
                query['filter[user_rating]'] = this.filters.user_rating;
            }

            this.isLoading = true;
            ApiRequests.fetchCocktails(query).then(resp => {
                this.cocktails = resp.data
                this.meta = resp.meta
                this.isLoading = false;
            }).catch(e => {
                this.$toast.error(e.message);
                this.isLoading = false;
            })
        },
        changePage(dir) {
            if (dir == 'prev') {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.refreshCocktails();
                }
            }

            if (dir == 'next') {
                if (this.currentPage < this.meta.last_page) {
                    this.currentPage++;
                    this.refreshCocktails();
                }
            }
        }
    }
}
</script>
<style scoped>
.cocktails-search {
    display: flex;
    gap: 1rem;
}

.cocktails-search__refinements__refinement {
    /* background: #eeeff9;
    border-radius: 5px; */
    padding: 1rem;
    margin-bottom: 0.5rem;
}

.cocktails-search__refinements__refinement__title {
    color: var(--clr-header-title);
    font-weight: var(--fw-bold);
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 0.715rem;
    margin-bottom: 0.5rem;
}

.cocktails-search__content {
    width: 100%;
}

.cocktails-search__content__filter {
    display: flex;
    gap: 0.5rem;
}
</style>
