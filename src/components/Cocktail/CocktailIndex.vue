<template>
    <PageHeader>
        {{ $t("cocktail.cocktails") }}
        <template v-if="appState.isAdmin() || appState.isGeneral()" #actions>
            <RouterLink class="button button--outline" :to="{ name: 'cocktails.scrape' }">{{ $t("cocktail.import") }}</RouterLink>
            <RouterLink class="button button--dark" :to="{ name: 'cocktails.form' }">{{ $t("cocktail.add") }}</RouterLink>
        </template>
    </PageHeader>
    <Drawer v-model="showRefinements" :title="$t('filters')">
        <div class="resource-search__refinements__body">
            <Refinement id="sort" :title="$t('sort')" :collapsable="false">
                <select v-model="draftSort" class="form-select">
                    <option disabled>{{ $t("sort") }}:</option>
                    <option value="name">{{ $t("name") }}</option>
                    <option value="created_at">{{ $t("date-added") }}</option>
                    <option value="favorited_at">{{ $t("date-favorited") }}</option>
                    <option value="missing_ingredients">{{ $t("missing-ingredients") }}</option>
                    <option value="missing_bar_ingredients">{{ $t("missing-ingredients") }} ({{ $t("bars.bar") }})</option>
                    <option value="total_ingredients">{{ $t("total.ingredients") }}</option>
                    <option value="average_rating">{{ $t("average-rating") }}</option>
                    <option value="user_rating">{{ $t("user-rating") }}</option>
                    <option value="abv">{{ $t("ABV") }}</option>
                    <option value="year">{{ $t("year") }}</option>
                    <option value="reviews_count">{{ $t("reviews-count") }}</option>
                    <option value="random">{{ $t("sort-random") }}</option>
                </select>
                <select v-model="draftSortDir" class="form-select">
                    <option disabled>{{ $t("sort-direction") }}:</option>
                    <option value="">{{ $t("sort-asc") }}</option>
                    <option value="-">{{ $t("sort-desc") }}</option>
                </select>
            </Refinement>
            <Refinement id="per-page" :title="$t('search.results-per-page')" :collapsable="false">
                <select v-model="draftPerPage" class="form-select">
                    <option disabled>{{ $t("search.results-per-page") }}:</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>
            </Refinement>
            <Refinement id="global" :title="$t('global')" :collapsable="false">
                <div v-for="filter in availableRefinements.global" :key="filter.id" class="resource-search__refinements__refinement__item">
                    <input :id="'global-' + filter.id" v-model="draftFilters[filter.id]" type="checkbox" :value="filter.active" />
                    <label :for="'global-' + filter.id">{{ filter.name }}</label>
                </div>
            </Refinement>
            <Refinement
                v-if="refineCollections.length > 0"
                id="collection"
                v-model="draftFilters.collection_id"
                :title="$t('collections.title')"
                :refinements="refineCollections"
            ></Refinement>
            <Refinement id="users" v-model="draftFilters.created_user_id" :searchable="true" :title="$t('user-recipes')" :refinements="refineUsers"></Refinement>
            <Refinement id="author" v-model="draftFilters.author" :searchable="true" :title="$t('author.title')" :refinements="refineAuthors"></Refinement>
            <Refinement id="origin-bar" v-model="draftFilters.origin_bar" :searchable="true" :title="$t('origin-bar.title')" :refinements="refineOriginBars"></Refinement>
            <Refinement id="favorited-by-user" v-model="draftFilters.favorited_by_user" :searchable="true" :title="$t('favorited-by-user')" :refinements="refineUsers"></Refinement>
            <Refinement
                id="main-ingredient"
                v-model="draftFilters.main_ingredient_id"
                :searchable="true"
                :title="$t('ingredient.main')"
                :refinements="refineMainIngredients"
            ></Refinement>
            <Refinement
                id="specific-ingredients"
                v-model="draftFilters.specific_ingredients"
                :searchable="true"
                :title="$t('search.ingredients')"
                :refinements="refineFilterIngredients"
            ></Refinement>
            <Refinement
                id="ignore-ingredients"
                v-model="draftFilters.ignore_ingredients"
                :searchable="true"
                :title="$t('search.ignore-ingredients')"
                :refinements="refineFilterIngredients"
            ></Refinement>
            <Refinement id="method" v-model="draftFilters.cocktail_method_id" :title="$t('method.title')" :refinements="refineMethods"></Refinement>
            <Refinement id="abv" v-model="draftFilters.abv as any" :title="$t('strength')" :refinements="refineABV" type="radio"></Refinement>
            <Refinement id="year" :title="$t('year')">
                <div class="cocktail-index__year-range">
                    <div>
                        <label for="year-min">{{ $t("minimum") }}</label>
                        <input id="year-min" v-model.number="draftFilters.year_min" class="form-input" type="number" step="1" />
                    </div>
                    <div>
                        <label for="year-max">{{ $t("maximum") }}</label>
                        <input id="year-max" v-model.number="draftFilters.year_max" class="form-input" type="number" step="1" />
                    </div>
                </div>
            </Refinement>
            <Refinement id="tag" v-model="draftFilters.tag_id" :searchable="true" :title="$t('tag.tags')" :refinements="refineTags"></Refinement>
            <Refinement id="glass" v-model="draftFilters.glass_id" :title="$t('glass-type.title')" :refinements="refineGlasses"></Refinement>
            <Refinement
                id="total-ingredients"
                v-model="draftFilters.total_ingredients as any"
                :title="$t('total.ingredients')"
                :refinements="refineIngredientsCount"
                type="radio"
            ></Refinement>
            <Refinement
                id="missing-bar-ingredients"
                v-model="draftFilters.missing_bar_ingredients as any"
                :title="$t('missing-ingredients') + ' (' + $t('bars.bar') + ')'"
                :refinements="refineMissingBarIngredients"
                type="radio"
            ></Refinement>
            <Refinement
                id="missing-ingredients"
                v-model="draftFilters.missing_ingredients as any"
                :title="$t('missing-ingredients') + ' (' + $t('shelf.title') + ')'"
                :refinements="refineMissingIngredients"
                type="radio"
            ></Refinement>
            <Refinement id="user-rating" v-model="draftFilters.user_rating_min as any" :title="$t('your-rating')" :refinements="refineRatings" type="radio"></Refinement>
            <Refinement id="avg-rating" v-model="draftFilters.average_rating_min as any" :title="$t('avg-rating')" :refinements="refineRatings" type="radio"></Refinement>
        </div>
        <template #footer>
            <button type="button" class="button button--dark" @click="applyFilters">{{ $t("apply-filters") }}</button>
        </template>
    </Drawer>
    <div class="resource-search-wrapper">
        <div class="resource-search">
            <div class="resource-search__content">
                <div class="resource-search__content__filter">
                    <button type="button" class="button button--input" @click.prevent="showRefinements = !showRefinements">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path
                                d="M6.17 18a3.001 3.001 0 0 1 5.66 0H22v2H11.83a3.001 3.001 0 0 1-5.66 0H2v-2h4.17zm6-7a3.001 3.001 0 0 1 5.66 0H22v2h-4.17a3.001 3.001 0 0 1-5.66 0H2v-2h10.17zm-6-7a3.001 3.001 0 0 1 5.66 0H22v2H11.83a3.001 3.001 0 0 1-5.66 0H2V4h4.17z"
                            />
                        </svg>
                        <div v-show="totalActiveRefinements > 0" class="resource-search__content__filter__count">{{ totalActiveRefinements }}</div>
                    </button>
                    <input
                        v-model="searchQuery"
                        class="form-input"
                        type="text"
                        :placeholder="$t('placeholder.search-cocktails')"
                        @input="debounceCocktailNameSearch"
                        @keyup.enter="updateRouterPath"
                    />
                    <button type="button" class="button button--input" :title="$t('cocktail.randomize')" @click.prevent="goToRandomCocktail">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path
                                d="M10.9979 1.58018C11.6178 1.22132 12.3822 1.22132 13.0021 1.58018L20.5021 5.92229C21.1197 6.27987 21.5 6.93946 21.5 7.65314V16.3469C21.5 17.0606 21.1197 17.7202 20.5021 18.0778L13.0021 22.4199C12.3822 22.7788 11.6178 22.7788 10.9979 22.4199L3.49793 18.0778C2.88029 17.7202 2.5 17.0606 2.5 16.3469V7.65314C2.5 6.93947 2.88029 6.27987 3.49793 5.92229L10.9979 1.58018ZM4.5 7.65314V7.65792L11.0021 11.4223C11.6197 11.7799 12 12.4395 12 13.1531V20.689L19.5 16.3469V7.65314L12 3.31104L4.5 7.65314ZM6.13208 12.3C6.13206 11.7477 5.74432 11.0761 5.26604 10.7999C4.78776 10.5238 4.40004 10.7476 4.40006 11.2999C4.40008 11.8522 4.78782 12.5238 5.2661 12.7999C5.74439 13.0761 6.1321 12.8523 6.13208 12.3ZM8.72899 18.7982C9.20728 19.0743 9.59499 18.8505 9.59497 18.2982C9.59495 17.7459 9.20721 17.0743 8.72893 16.7982C8.25065 16.522 7.86293 16.7459 7.86295 17.2982C7.86297 17.8504 8.25071 18.522 8.72899 18.7982ZM5.2661 16.799C5.74439 17.0751 6.1321 16.8513 6.13208 16.299C6.13206 15.7467 5.74432 15.0751 5.26604 14.799C4.78776 14.5228 4.40004 14.7467 4.40006 15.2989C4.40008 15.8512 4.78782 16.5228 5.2661 16.799ZM8.72851 14.7995C9.20679 15.0756 9.5945 14.8518 9.59448 14.2995C9.59446 13.7472 9.20673 13.0756 8.72844 12.7995C8.25016 12.5233 7.86245 12.7471 7.86246 13.2994C7.86248 13.8517 8.25022 14.5233 8.72851 14.7995ZM14.8979 8.00001C15.3762 7.72388 15.3762 7.27619 14.8979 7.00006C14.4196 6.72394 13.6441 6.72394 13.1658 7.00006C12.6875 7.27619 12.6875 7.72388 13.1658 8.00001C13.6441 8.27614 14.4196 8.27614 14.8979 8.00001ZM10.0981 7.00006C10.5764 7.27619 10.5764 7.72388 10.0981 8.00001C9.61982 8.27614 8.84434 8.27614 8.36604 8.00001C7.88774 7.72388 7.88774 7.27619 8.36604 7.00006C8.84434 6.72394 9.61982 6.72394 10.0981 7.00006ZM15.9954 15.3495C16.5932 15.0043 17.0779 14.1649 17.0779 13.4745C17.0779 12.7842 16.5933 12.5044 15.9955 12.8496C15.3977 13.1948 14.9131 14.0342 14.913 14.7246C14.913 15.4149 15.3976 15.6947 15.9954 15.3495Z"
                            ></path>
                        </svg>
                    </button>
                    <SaltRimDialog v-model="showCreateNewCollectionDialog">
                        <template #trigger>
                            <button
                                type="button"
                                class="button button--input"
                                :title="$t('collections.add')"
                                @click.prevent="showCreateNewCollectionDialog = !showCreateNewCollectionDialog"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                    <path fill="none" d="M0 0h24v24H0z" />
                                    <path
                                        d="M12.414 5H21a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7.414l2 2zM4 5v14h16V7h-8.414l-2-2H4zm7 7V9h2v3h3v2h-3v3h-2v-3H8v-2h3z"
                                    />
                                </svg>
                            </button>
                        </template>
                        <template #dialog>
                            <SegmentedControl
                                v-model="currentCollectionStore"
                                class="add-to-collection__mode"
                                :options="collectionStoreOptions"
                                :aria-label="$t('collections.title')"
                            />
                            <CollectionDialog
                                v-if="currentCollectionStore == 'collection'"
                                :title="$t('collections.add-from-query')"
                                :cocktails="currentCocktailIds"
                                @collection-dialog-closed="handleCollectionsDialogClosed"
                            />
                            <MenuAddDialog
                                v-if="currentCollectionStore == 'menu'"
                                :title="$t('menu.add-multiple')"
                                :items="currentCocktailIds"
                                :menu-item-type="'cocktail'"
                                @menu-add-dialog-closed="handleCollectionsDialogClosed"
                            />
                        </template>
                    </SaltRimDialog>
                    <button v-show="totalActiveRefinements > 0" type="button" class="button button--input" :title="$t('clear-filters')" @click.prevent="clearRefinements">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path
                                d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 10.5858L14.8284 7.75736L16.2426 9.17157L13.4142 12L16.2426 14.8284L14.8284 16.2426L12 13.4142L9.17157 16.2426L7.75736 14.8284L10.5858 12L7.75736 9.17157L9.17157 7.75736L12 10.5858Z"
                            ></path>
                        </svg>
                    </button>
                </div>
                <div>
                    <CocktailGridContainer v-if="isLoading" aria-busy="true">
                        <div v-for="n in 24" :key="n" class="cocktail-grid-skeleton" aria-hidden="true">
                            <div class="cocktail-grid-skeleton__graphic">
                                <SaltRimSkeleton :index="n - 1" :width="'100%'" :height="'100%'" :radius="3" />
                            </div>
                            <div class="block-container cocktail-grid-skeleton__content">
                                <SaltRimSkeleton :index="n" :width="'65%'" :height="22" :radius="2" />
                                <SaltRimSkeleton :index="n + 1" :width="'35%'" :height="14" :radius="2" />
                                <SaltRimSkeleton :index="n + 2" :width="'90%'" :height="12" :radius="2" />
                                <div class="cocktail-grid-skeleton__tags">
                                    <SaltRimSkeleton :index="n + 3" :width="55" :height="20" />
                                    <SaltRimSkeleton :index="n + 4" :width="70" :height="20" />
                                    <SaltRimSkeleton :index="n + 5" :width="45" :height="20" />
                                </div>
                            </div>
                        </div>
                    </CocktailGridContainer>
                    <CocktailGridContainer v-else-if="cocktails.length > 0" v-slot="{ observer }">
                        <CocktailGridItem v-for="cocktail in cocktails" :key="cocktail.id" :cocktail="cocktail" :observer="observer" />
                    </CocktailGridContainer>
                    <EmptyState v-else style="margin-top: 1rem">
                        <template #icon>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
                                <path
                                    d="M11 2C15.968 2 20 6.032 20 11C20 15.968 15.968 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2ZM11 18C14.8675 18 18 14.8675 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18ZM19.4853 18.0711L22.3137 20.8995L20.8995 22.3137L18.0711 19.4853L19.4853 18.0711Z"
                                ></path>
                            </svg>
                        </template>
                        <strong>{{ $t("cocktails-not-found") }}</strong><br>
                        Try adjusting your search or filters to find what you need.<br>
                        <a href="#" @click.prevent="clearRefinements">{{ $t("clear-filters") }}</a>
                    </EmptyState>
                </div>
                <Pagination :meta="meta" @page-changed="handlePageChange"></Pagination>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import SaltRimSkeleton from "../SaltRimSkeleton.vue";
import BarAssistantClient from "@/api/BarAssistantClient";
import CocktailGridItem from "./CocktailGridItem.vue";
import CocktailGridContainer from "./CocktailGridContainer.vue";
import PageHeader from "./../PageHeader.vue";
import Drawer from "./../Drawer.vue";
import Refinement from "./../Search/SearchRefinement.vue";
import MenuAddDialog from "../Menu/MenuAddDialog.vue";
import Pagination from "./../Search/SearchPagination.vue";
import CollectionDialog from "./../Collections/CollectionDialog.vue";
import SaltRimDialog from "./../Dialog/SaltRimDialog.vue";
import SegmentedControl from "./../SegmentedControl.vue";
import AppState from "../../AppState";
import EmptyState from "./../EmptyState.vue";
import { useTitle } from "@/composables/title";
import type { operations } from "@/api/api";
import qs from "qs";

type ServerQueryFilters = NonNullable<operations["listCocktails"]["parameters"]["query"]>;

interface RefinementItem {
    id: string | number;
    name: string;
    active?: boolean;
    min?: number | null;
    max?: number | null;
    value?: any;
}

interface ActiveFilters {
    bar_shelf: boolean | null;
    locked_bar_cocktails: boolean | null;
    favorites: boolean | null;
    is_public: boolean | null;
    tag_id: string[];
    glass_id: string[];
    cocktail_method_id: string[];
    main_ingredient_id: string[];
    collection_id: string[];
    user_rating_min: number | null;
    average_rating_min: number | null;
    abv: { min: number | null; max: number | null } | null;
    year_min: number | null;
    year_max: number | null;
    total_ingredients: string | null;
    missing_ingredients: string | null;
    missing_bar_ingredients: string | null;
    user_shelves: string[];
    created_user_id: string[];
    author: string[];
    origin_bar: string[];
    favorited_by_user: string[];
    ignore_ingredients: string[];
    specific_ingredients: string[];
    ingredient_id: string[];
    ingredient_substitute_id: string[];
    id: string[];
    [key: string]: any;
}

interface AvailableRefinements {
    global: RefinementItem[];
    abv: RefinementItem[];
    total_ingredients: RefinementItem[];
    missing_ingredients: RefinementItem[];
    missing_bar_ingredients: RefinementItem[];
    tags: any[];
    glasses: any[];
    methods: any[];
    main_ingredients: any[];
    ingredients: any[];
    collections: any[];
    shared_collections: any[];
    members: any[];
    authors: { name: string }[];
    origin_bars: { name: string }[];
}

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const appState = new AppState();

const showCreateNewCollectionDialog = ref(false);
const isLoading = ref(false);
const showRefinements = ref(false);
const cocktails = ref<any[]>([]);
const searchQuery = ref<string | null>(null);
const sort = ref("created_at");
const currentCollectionStore = ref<"collection" | "menu">("collection");

const collectionStoreOptions = computed(() => [
    { label: t("collections.title"), value: "collection" as const },
    { label: t("menu.title"), value: "menu" as const },
]);
const sort_dir = ref("-");
const meta = ref<any>({});
const queryTimer = ref<number | null>(null);
const currentPage = ref(1);
const per_page = ref(50);
const draftSort = ref(sort.value);
const draftSortDir = ref(sort_dir.value);
const draftPerPage = ref(per_page.value);

const availableRefinements = ref<AvailableRefinements>({
    global: [],
    abv: [],
    total_ingredients: [],
    missing_ingredients: [],
    missing_bar_ingredients: [],
    tags: [],
    glasses: [],
    methods: [],
    main_ingredients: [],
    ingredients: [],
    collections: [],
    shared_collections: [],
    members: [],
    authors: [],
    origin_bars: [],
});

const activeFilters = ref<ActiveFilters>({
    bar_shelf: false,
    locked_bar_cocktails: false,
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
    year_min: null,
    year_max: null,
    total_ingredients: null,
    missing_ingredients: null,
    missing_bar_ingredients: null,
    user_shelves: [],
    created_user_id: [],
    author: [],
    origin_bar: [],
    favorited_by_user: [],
    ignore_ingredients: [],
    specific_ingredients: [],
    ingredient_id: [],
    ingredient_substitute_id: [],
    id: [],
});
const draftFilters = ref<ActiveFilters>(cloneFilters(activeFilters.value));

function cloneFilters(filters: ActiveFilters): ActiveFilters {
    return JSON.parse(JSON.stringify(filters));
}

const sortWithDir = computed({
    set(val: string | null) {
        if (!val) {
            return;
        }
        if (val.startsWith("-")) {
            sort_dir.value = "-";
            sort.value = val.substring(1);
        } else {
            sort_dir.value = "";
            sort.value = val;
        }
    },
    get() {
        return sort.value != null && sort.value != "" ? sort_dir.value + sort.value : null;
    },
});

const refineMethods = computed(() => {
    return availableRefinements.value.methods.map((m: any) => ({
        id: m.id,
        value: m.id,
        name: m.name,
    }));
});

const refineGlasses = computed(() => {
    return availableRefinements.value.glasses.map((m: any) => ({
        id: m.id,
        value: m.id,
        name: m.name,
    }));
});

const refineTags = computed(() => {
    return availableRefinements.value.tags.map((m: any) => ({
        id: m.id,
        value: m.id,
        name: m.name,
    }));
});

const refineABV = computed(() => {
    return availableRefinements.value.abv.map((m: any) => ({
        id: m.id,
        value: { min: m.min, max: m.max },
        name: m.name,
    }));
});

const refineRatings = computed(() => {
    return [1, 2, 3, 4, 5].map((r) => ({
        id: r,
        value: r,
        name: ">= " + "★".repeat(r),
    }));
});

const refineMainIngredients = computed(() => {
    return availableRefinements.value.main_ingredients.map((i: any) => ({
        id: i.id,
        value: i.id,
        name: i.name,
    }));
});

const refineFilterIngredients = computed(() => {
    return availableRefinements.value.ingredients.map((i: any) => ({
        id: i.id,
        value: i.id,
        name: i.name,
    }));
});

const refineCollections = computed(() => {
    const combinedCollections = [...new Set([...availableRefinements.value.collections, ...availableRefinements.value.shared_collections])];
    const uniqueCollections = combinedCollections.filter((v: any, i: number, a: any[]) => a.findIndex((v2) => parseInt(v.id) == parseInt(v2.id)) == i);

    return uniqueCollections.map((m: any) => {
        const author = m.created_user ? ` [${m.created_user.name}]` : "";
        return {
            id: m.id,
            value: m.id,
            name: `${m.name}${author} (${m.cocktails.length})`,
        };
    });
});

const refineIngredientsCount = computed(() => {
    return availableRefinements.value.total_ingredients.map((m: any) => ({
        id: m.id,
        value: m.id,
        name: m.name,
    }));
});

const refineMissingIngredients = computed(() => {
    return availableRefinements.value.missing_ingredients.map((m: any) => ({
        id: m.id,
        value: m.id,
        name: m.name,
    }));
});

const refineMissingBarIngredients = computed(() => {
    return availableRefinements.value.missing_bar_ingredients.map((m: any) => ({
        id: m.id,
        value: m.id,
        name: m.name,
    }));
});

const refineUsers = computed(() => {
    return availableRefinements.value.members.map((m: any) => ({
        id: m.id,
        value: m.id,
        name: m.name,
    }));
});

const refineAuthors = computed(() => {
    return availableRefinements.value.authors.map((a: any) => ({
        id: a.name,
        value: a.name,
        name: a.name,
    }));
});

const refineOriginBars = computed(() => {
    return availableRefinements.value.origin_bars.map((o: any) => ({
        id: o.name,
        value: o.name,
        name: o.name,
    }));
});

const currentCocktailIds = computed(() => {
    return cocktails.value.map((c) => c.id);
});

const totalActiveRefinements = computed(() => {
    let total = 0;

    Object.values(activeFilters.value).forEach((element) => {
        if (Array.isArray(element) && element.length > 0) {
            return total++;
        }

        if (typeof element == "boolean" && element == true) {
            return total++;
        }

        if (element !== null && !Array.isArray(element) && element !== false) {
            return total++;
        }
    });

    return total;
});

function initializeGlobalRefinements() {
    availableRefinements.value.global = [
        { name: t("bar_shelf.cocktails"), active: false, id: "bar_shelf" },
        { name: t("bar_shelf.locked_cocktails"), active: false, id: "locked_bar_cocktails" },
        { name: t("my-favorites"), active: false, id: "favorites" },
        { name: t("cocktail.shared"), active: false, id: "is_public" },
    ];

    availableRefinements.value.abv = [
        { name: t("non-alcoholic"), min: null, max: 2, id: "abv_non_alcoholic" },
        { name: t("weak"), min: 2, max: 18, id: "abv_weak" },
        { name: t("medium"), min: 18, max: 28, id: "abv_medium" },
        { name: t("strong"), min: 28, max: null, id: "abv_strong" },
    ];

    availableRefinements.value.total_ingredients = [
        { name: ">= " + t("n-ingredients", 3), active: false, id: "3" },
        { name: ">= " + t("n-ingredients", 5), active: false, id: "5" },
        { name: ">= " + t("n-ingredients", 7), active: false, id: "7" },
    ];

    availableRefinements.value.missing_ingredients = [
        { name: t("n-ingredients", 1), active: false, id: "1" },
        { name: t("n-ingredients", 2), active: false, id: "2" },
        { name: ">= " + t("n-ingredients", 3), active: false, id: "3" },
    ];

    availableRefinements.value.missing_bar_ingredients = [
        { name: t("n-ingredients", 1), active: false, id: "1" },
        { name: t("n-ingredients", 2), active: false, id: "2" },
        { name: ">= " + t("n-ingredients", 3), active: false, id: "3" },
    ];
}

function fetchRefinements() {
    BarAssistantClient.getTags().then((resp) => {
        availableRefinements.value.tags = resp?.data ?? [];
    });

    BarAssistantClient.getGlasses().then((resp) => {
        availableRefinements.value.glasses = resp?.data ?? [];
    });

    BarAssistantClient.getCocktailMethods().then((resp) => {
        availableRefinements.value.methods = resp?.data ?? [];
    });

    BarAssistantClient.getIngredients({ "filter[main_ingredients]": true, per_page: 100 }).then((resp) => {
        availableRefinements.value.main_ingredients = resp?.data ?? [];
    });

    fetchFilterIngredients();

    BarAssistantClient.getCollections({ per_page: 100, include: "cocktails" }).then((resp) => {
        availableRefinements.value.collections = resp?.data ?? [];
    });

    BarAssistantClient.getBarMembersMinimal(appState.bar.id).then((resp) => {
        availableRefinements.value.members = resp?.data ?? [];
    });

    BarAssistantClient.getSharedCollections(appState.bar.id).then((resp) => {
        availableRefinements.value.shared_collections = resp?.data ?? [];
    });
}

async function fetchFilterIngredients() {
    const perPage = 500;
    const ingredients: any[] = [];
    let currentPage = 1;
    let lastPage = 1;

    try {
        do {
            const resp = await BarAssistantClient.getIngredients({ per_page: perPage, page: currentPage, sort: "name" });
            ingredients.push(...(resp?.data ?? []));
            lastPage = resp?.meta?.last_page ?? 1;
            currentPage++;
        } while (currentPage <= lastPage);
    } catch {
        // Ignore, the filter list is optional
    }

    availableRefinements.value.ingredients = ingredients;
}

function updateRouterPath() {
    const query = stateToQuery();

    router.push({
        query: query,
    });
}

async function refreshCocktails() {
    const query = stateToQuery();
    query.include = "ratings,ingredients.ingredient,tags,images";

    cocktails.value = [];
    isLoading.value = true;
    try {
        const resp = await BarAssistantClient.getCocktails(query);
        cocktails.value = resp?.data ?? [];
        meta.value = resp?.meta;
        availableRefinements.value.authors = resp?.meta?.filters?.authors ?? [];
        availableRefinements.value.origin_bars = resp?.meta?.filters?.origin_bars ?? [];
    } catch (e) {
        // @ts-ignore
        window.$toast?.error(e instanceof Error ? e.message : String(e));
    } finally {
        isLoading.value = false;
    }
}

function handlePageChange(toPage: number) {
    currentPage.value = toPage;
    updateRouterPath();
}

function queryToState() {
    const state = qs.parse(window.location.search.replace(/^\?/, "")) as ServerQueryFilters;

    activeFilters.value.tag_id = state.filter && state.filter.tag_id ? String(state.filter.tag_id).split(",") : [];
    activeFilters.value.cocktail_method_id = state.filter && state.filter.cocktail_method_id ? String(state.filter.cocktail_method_id).split(",") : [];
    activeFilters.value.glass_id = state.filter && state.filter.glass_id ? String(state.filter.glass_id).split(",") : [];
    activeFilters.value.main_ingredient_id = state.filter && state.filter.main_ingredient_id ? String(state.filter.main_ingredient_id).split(",") : [];
    activeFilters.value.collection_id = state.filter && state.filter.collection_id ? String(state.filter.collection_id).split(",") : [];
    activeFilters.value.user_shelves = state.filter && state.filter.user_shelves ? String(state.filter.user_shelves).split(",") : [];
    activeFilters.value.created_user_id = state.filter && state.filter.created_user_id ? String(state.filter.created_user_id).split(",") : [];
    activeFilters.value.author = state.filter && state.filter.author ? String(state.filter.author).split("|") : [];
    activeFilters.value.origin_bar = state.filter && state.filter.origin_bar ? String(state.filter.origin_bar).split("|") : [];
    activeFilters.value.favorited_by_user = state.filter && state.filter.favorited_by_user ? String(state.filter.favorited_by_user).split(",") : [];
    activeFilters.value.bar_shelf = state.filter && state.filter.bar_shelf ? state.filter.bar_shelf : null;
    activeFilters.value.locked_bar_cocktails = state.filter && state.filter.locked_bar_cocktails ? state.filter.locked_bar_cocktails : null;
    activeFilters.value.favorites = state.filter && state.filter.favorites ? state.filter.favorites : null;
    activeFilters.value.is_public = state.filter && state.filter.is_public ? state.filter.is_public : null;
    activeFilters.value.total_ingredients = state.filter && state.filter.total_ingredients ? String(state.filter.total_ingredients) : null;
    activeFilters.value.missing_ingredients = state.filter && state.filter.missing_ingredients ? String(state.filter.missing_ingredients) : null;
    activeFilters.value.missing_bar_ingredients = state.filter && state.filter.missing_bar_ingredients ? String(state.filter.missing_bar_ingredients) : null;
    activeFilters.value.ignore_ingredients = state.filter && state.filter.ignore_ingredients ? String(state.filter.ignore_ingredients).split(",") : [];
    activeFilters.value.specific_ingredients = state.filter && state.filter.specific_ingredients ? String(state.filter.specific_ingredients).split(",") : [];
    activeFilters.value.id = state.filter && state.filter.id ? String(state.filter.id).split(",") : [];
    activeFilters.value.ingredient_id = state.filter && state.filter.ingredient_id ? String(state.filter.ingredient_id).split(",") : [];
    activeFilters.value.ingredient_substitute_id = state.filter && state.filter.ingredient_substitute_id ? String(state.filter.ingredient_substitute_id).split(",") : [];
    activeFilters.value.user_rating_min = state.filter && state.filter.user_rating_min ? state.filter.user_rating_min : null;
    activeFilters.value.average_rating_min = state.filter && state.filter.average_rating_min ? state.filter.average_rating_min : null;
    searchQuery.value = state.filter && state.filter.name ? state.filter.name : null;
    if (state.filter && (state.filter.abv_min || state.filter.abv_max)) {
        activeFilters.value.abv = { min: state.filter.abv_min ? state.filter.abv_min : null, max: state.filter.abv_max ? state.filter.abv_max : null };
    }
    activeFilters.value.year_min = state.filter?.year_min ?? null;
    activeFilters.value.year_max = state.filter?.year_max ?? null;

    if (state.per_page) {
        per_page.value = Number(state.per_page);
    }

    if (state.page) {
        currentPage.value = Number(state.page);
    }

    if (state.sort) {
        sortWithDir.value = state.sort as string;
    }
}

function stateToQuery() {
    const query: any = {
        per_page: per_page.value,
        page: currentPage.value,
        sort: sortWithDir.value,
    };

    const filters: any = {
        name: searchQuery.value != null && searchQuery.value != "" ? searchQuery.value : null,
        bar_shelf: activeFilters.value.bar_shelf,
        locked_bar_cocktails: activeFilters.value.locked_bar_cocktails,
        favorites: activeFilters.value.favorites,
        is_public: activeFilters.value.is_public,
        user_rating_min: activeFilters.value.user_rating_min ? activeFilters.value.user_rating_min : null,
        average_rating_min: activeFilters.value.average_rating_min ? activeFilters.value.average_rating_min : null,
        total_ingredients: activeFilters.value.total_ingredients ? activeFilters.value.total_ingredients : null,
        missing_ingredients: activeFilters.value.missing_ingredients ? activeFilters.value.missing_ingredients : null,
        missing_bar_ingredients: activeFilters.value.missing_bar_ingredients ? activeFilters.value.missing_bar_ingredients : null,
        ignore_ingredients: activeFilters.value.ignore_ingredients.length > 0 ? activeFilters.value.ignore_ingredients.join(",") : null,
        tag_id: activeFilters.value.tag_id.length > 0 ? activeFilters.value.tag_id.join(",") : null,
        glass_id: activeFilters.value.glass_id.length > 0 ? activeFilters.value.glass_id.join(",") : null,
        cocktail_method_id: activeFilters.value.cocktail_method_id.length > 0 ? activeFilters.value.cocktail_method_id.join(",") : null,
        main_ingredient_id: activeFilters.value.main_ingredient_id.length > 0 ? activeFilters.value.main_ingredient_id.join(",") : null,
        specific_ingredients: activeFilters.value.specific_ingredients.length > 0 ? activeFilters.value.specific_ingredients.join(",") : null,
        ingredient_id: activeFilters.value.ingredient_id.length > 0 ? activeFilters.value.ingredient_id.join(",") : null,
        ingredient_substitute_id: activeFilters.value.ingredient_substitute_id.length > 0 ? activeFilters.value.ingredient_substitute_id.join(",") : null,
        collection_id: activeFilters.value.collection_id.length > 0 ? activeFilters.value.collection_id.join(",") : null,
        user_shelves: activeFilters.value.user_shelves.length > 0 ? activeFilters.value.user_shelves.join(",") : null,
        id: activeFilters.value.id.length > 0 ? activeFilters.value.id.join(",") : null,
        created_user_id: activeFilters.value.created_user_id.length > 0 ? activeFilters.value.created_user_id.join(",") : null,
        author: activeFilters.value.author.length > 0 ? activeFilters.value.author.join("|") : null,
        origin_bar: activeFilters.value.origin_bar.length > 0 ? activeFilters.value.origin_bar.join("|") : null,
        favorited_by_user: activeFilters.value.favorited_by_user.length > 0 ? activeFilters.value.favorited_by_user.join(",") : null,
        abv_min: activeFilters.value.abv ? activeFilters.value.abv.min : null,
        abv_max: activeFilters.value.abv ? activeFilters.value.abv.max : null,
        year_min: activeFilters.value.year_min,
        year_max: activeFilters.value.year_max,
    };

    query.filter = Object.entries(filters).reduce((a: any, [k, v]) => (v === null || v === false ? a : ((a[k] = v), a)), {});

    return query;
}

function applyFilters() {
    activeFilters.value = cloneFilters(draftFilters.value);
    sort.value = draftSort.value;
    sort_dir.value = draftSortDir.value;
    per_page.value = draftPerPage.value;
    currentPage.value = 1;
    showRefinements.value = false;
    updateRouterPath();
}

watch(showRefinements, (isOpen) => {
    if (isOpen) {
        draftFilters.value = cloneFilters(activeFilters.value);
        draftSort.value = sort.value;
        draftSortDir.value = sort_dir.value;
        draftPerPage.value = per_page.value;
    }
});

function handleCollectionsDialogClosed() {
    showCreateNewCollectionDialog.value = false;
    fetchRefinements();
    refreshCocktails();
}

function debounceCocktailNameSearch() {
    if (queryTimer.value) {
        clearTimeout(queryTimer.value);
    }

    queryTimer.value = setTimeout(() => {
        currentPage.value = 1;
        updateRouterPath();
    }, 300) as any;
}

function clearRefinements() {
    searchQuery.value = null;
    sort.value = "name";
    sort_dir.value = "";
    currentPage.value = 1;
    per_page.value = 50;
    activeFilters.value = {
        bar_shelf: false,
        locked_bar_cocktails: false,
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
        year_min: null,
        year_max: null,
        total_ingredients: null,
        user_shelves: [],
        created_user_id: [],
        author: [],
        origin_bar: [],
        favorited_by_user: [],
        ignore_ingredients: [],
        specific_ingredients: [],
        ingredient_id: [],
        ingredient_substitute_id: [],
        id: [],
        missing_ingredients: null,
        missing_bar_ingredients: null,
    };

    updateRouterPath();
}

function goToRandomCocktail() {
    const query = stateToQuery();
    query.per_page = 1;
    query.sort = "random";

    isLoading.value = true;
    BarAssistantClient.getCocktails(query)
        .then(async (resp) => {
            if (!resp?.data) {
                return;
            }
            if (resp.data.length == 0) {
                isLoading.value = false;
                return;
            }
            router.push({
                name: "cocktails.show",
                params: { id: resp.data[0].slug },
            });
            isLoading.value = false;
        })
        .catch((e) => {
            // @ts-ignore
            window.$toast?.error(e.message);
            isLoading.value = false;
        });
}

onMounted(() => {
    useTitle(t("cocktail.cocktails"));
    initializeGlobalRefinements();
    fetchRefinements();
});

watch(
    () => route.query,
    () => {
        if (route.name == "cocktails") {
            queryToState();
            refreshCocktails();
        }
    },
    { immediate: true },
);
</script>
<style scoped>
.cocktail-grid-skeleton {
    display: flex;
    flex-direction: column;
    text-align: center;
}

.cocktail-grid-skeleton__graphic {
    height: 260px;
}

.cocktail-grid-skeleton__content {
    min-height: 180px;
    margin-top: -2.25rem;
    padding: 1.5rem;
    border-radius: var(--radius-3);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--gap-size-2);
}

.cocktail-grid-skeleton__tags {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: var(--gap-size-1);
}

@media (max-width: 545px) {
    .cocktail-grid-skeleton__graphic {
        height: 250px;
    }

    .cocktail-grid-skeleton__content {
        min-height: 150px;
        padding: var(--gap-size-3);
        border-radius: var(--radius-2);
        gap: var(--gap-size-1);
    }
}

.cocktail-index__year-range {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
}

.cocktail-index__year-range label {
    display: block;
    margin-bottom: 0.25rem;
    font-size: 0.75rem;
}

.add-to-collection__mode {
    width: 100%;
    margin-bottom: 1rem;
    margin-top: 1rem;
}
</style>
