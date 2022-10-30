<script setup>
import CocktailGridItem from './CocktailGridItem.vue'
import CocktailGridContainer from './CocktailGridContainer.vue'
</script>

<template>
  <div style="text-align: right;">
    <RouterLink class="button button--outline" :to="{name: 'cocktails.form'}">Add cocktail</RouterLink>
  </div>
  <h2 class="page-subtitle" style="margin-top: 10px;">Cocktails</h2>
  <ais-instant-search :search-client="searchClient" index-name="cocktails:name:asc" :routing="routing">
    <ais-configure :hitsPerPage="100" />
    <div class="cocktail-list-tags">
      <ais-refinement-list attribute="tags" :sort-by="['name:asc']" operator="and">
        <template v-slot:item="{ item, refine, createURL }">
          <a :href="createURL(item.value)" :class="{ 'is-selected': item.isRefined }"
            @click.prevent="refine(item.value)">
            {{item.label}}
          </a>
        </template>
      </ais-refinement-list>
    </div>
    <div class="cocktail-list-search-container">
      <ais-search-box placeholder="Filter cocktails..." :class-names="{'ais-SearchBox-input': 'form-input', 'ais-SearchBox-reset': 'cocktail-list-search-container__reset'}" />
      <ais-sort-by :items="[
        { value: 'cocktails:name:asc', label: 'Name asc.' },
        { value: 'cocktails:name:desc', label: 'Name desc.' },
        { value: 'cocktails:date:asc', label: 'Date modified asc.' },
        { value: 'cocktails:date:desc', label: 'Date modified desc.' },
      ]" :class-names="{'ais-SortBy-select': 'form-select'}" />
    </div>
    <ais-infinite-hits>
      <template v-slot="{ items, refineNext, isLastPage }">
        <CocktailGridContainer v-slot="observer">
          <CocktailGridItem v-for="cocktail in items" :cocktail="cocktail" :key="cocktail.id" :observer="observer" />
        </CocktailGridContainer>
        <div style="text-align: center; margin: 20px 0;">
          <button class="button button--dark" v-if="!isLastPage" @click="refineNext">
            Show more results
          </button>
        </div>
      </template>
    </ais-infinite-hits>
  </ais-instant-search>
</template>

<script>
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import { history as historyRouter } from 'instantsearch.js/es/lib/routers';
import { singleIndex as singleIndexMapping } from 'instantsearch.js/es/lib/stateMappings';

export default {
  data() {
    return {
      searchClient: instantMeiliSearch(
        this.searchUrl,
        this.searchKey,
        {
          keepZeroFacets: true
        }
      ),
      routing: {
        router: historyRouter(),
        stateMapping: singleIndexMapping('cocktails:name:asc'),
      },
    };
  },
  created() {
    document.title = `Cocktails \u22C5 Salt Rim`
  }
}
</script>

<style scope>
.cocktail-list-tags .ais-RefinementList-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
}

.cocktail-list-tags .ais-RefinementList-list li {
  margin-right: 10px;
  margin-bottom: 5px;
}

.cocktail-list-tags .ais-RefinementList-list li a {
  display: flex;
  text-decoration: none;
  background-color: none;
  border: 1px solid var(--color-bg-dark);
  padding: 2px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
  white-space: nowrap;
}

.cocktail-list-tags .ais-RefinementList-list li a:hover,
.cocktail-list-tags .ais-RefinementList-list li a:focus,
.cocktail-list-tags .ais-RefinementList-list li a:active {
  background-color: #fff;
}

.cocktail-list-tags .ais-RefinementList-list li a.is-selected {
  background-color: var(--color-text);
  border: 1px solid var(--color-text);
  color: #fff;
}

.cocktail-list-search-container {
  display: flex;
  margin-top: 20px;
}

.cocktail-list-search-container .ais-SearchBox-submit {
  display: none;
}

.cocktail-list-search-container .ais-SearchBox {
  width: 100%;
  margin-right: 15px;
}

.cocktail-list-search-container__reset {
  background: none;
  border: 0;
  padding: 0;
  margin: 0;
  position: absolute;
  top: 9px;
  right: 5px;
  cursor: pointer;
  width: 30px;
  height: 30px;
}

@media (max-width: 500px) {
  .cocktail-list-search-container {
    flex-wrap: wrap;
  }
}
</style>
