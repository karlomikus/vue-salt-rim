<script setup>
import CocktailGridItem from './CocktailGridItem.vue'
import CocktailGridContainer from './CocktailGridContainer.vue'
</script>

<template>
  <h2 class="page-subtitle">Cocktails</h2>
  <ais-instant-search :search-client="searchClient" index-name="cocktails:name:asc" :routing="routing">
    <ais-configure :hitsPerPage="50" />
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
      <ais-search-box placeholder="Filter cocktails..." />
      <ais-sort-by :items="[
        { value: 'cocktails:name:asc', label: 'Name asc.' },
        { value: 'cocktails:name:desc', label: 'Name desc.' },
        { value: 'cocktails:date:asc', label: 'Date modified asc.' },
        { value: 'cocktails:date:desc', label: 'Date modified desc.' },
      ]" :class-names="{'ais-SortBy-select': 'form-select'}" />
    </div>
    <ais-infinite-hits>
      <template v-slot="{ items, refineNext, isLastPage }">
        <CocktailGridContainer>
          <CocktailGridItem v-for="cocktail in items" :cocktail="cocktail" :key="cocktail.id" />
        </CocktailGridContainer>
        <div style="text-align: center; margin: 20px 0;">
          <button class="button" v-if="!isLastPage" @click="refineNext">
            Show more results
          </button>
        </div>
      </template>
    </ais-infinite-hits>
  </ais-instant-search>
</template>

<script>
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import { history } from 'instantsearch.js/es/lib/routers';
import { singleIndex } from 'instantsearch.js/es/lib/stateMappings';

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
        router: history(),
        stateMapping: singleIndex('cocktails'),
      },
    };
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

.cocktail-list-search-container .ais-SearchBox-input {
  width: 100%;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background: #fff;
  border: 0;
  border-bottom: 2px solid var(--color-bg-dark);
  border-radius: 5px;
  height: 3rem;
  font-size: 1.2rem;
  line-height: 1.2rem;
  outline: 0;
  padding: 10px 15px;
  vertical-align: middle;
}
</style>
