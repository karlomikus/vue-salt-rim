<script setup>
import CocktailGridItem from './CocktailGridItem.vue'
import CocktailGridContainer from './CocktailGridContainer.vue'
</script>

<template>
  <ais-instant-search :search-client="searchClient" index-name="cocktails:name:asc">
    <ais-configure :hitsPerPage="50" />
    <div class="cocktail-list-tags">
      <ais-refinement-list attribute="tags" :sort-by="['name:asc']">
        <template v-slot:item="{ item, refine, createURL }">
          <!-- <a :href="createURL(item)" @click.prevent="refine(item.value)" v-for="item in items"><ais-highlight attribute="item" :hit="item"/></a> -->
          <a :href="createURL(item.value)" :style="{ fontWeight: item.isRefined ? 'bold' : '' }"
            @click.prevent="refine(item.value)">
            {{item.label}}
            ({{ item.count.toLocaleString() }})
          </a>
        </template>
      </ais-refinement-list>
    </div>
    <ais-sort-by
      :items="[
        { value: 'cocktails:name:asc', label: 'Name asc.' },
        { value: 'cocktails:name:desc', label: 'Name desc.' },
        { value: 'cocktails:date:asc', label: 'Date asc.' },
        { value: 'cocktails:date:desc', label: 'Date desc.' },
      ]"
    />
    <ais-search-box />
    <ais-infinite-hits>
      <template v-slot="{ items, refineNext, isLastPage }">
        <CocktailGridContainer>
          <CocktailGridItem v-for="cocktail in items" :cocktail="cocktail" :key="cocktail.id" />
        </CocktailGridContainer>
        <button class="button" v-if="!isLastPage" @click="refineNext">
          Show more results
        </button>
      </template>
    </ais-infinite-hits>
  </ais-instant-search>
</template>

<script>
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';

export default {
  data() {
    return {
      searchClient: instantMeiliSearch(
        'localhost:7700',
        "YBT-cev!dyj7mju8bur"
      ),
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
}

.cocktail-list-tags .ais-RefinementList-list li {
  margin-right: 10px;
}

.cocktail-list-tags .ais-RefinementList-list li a {
  display: flex;
  text-decoration: none;
  background-color: #abfade;
  padding: 2px 12px;
  border-radius: 3px;
  font-size: 0.9rem;
}
</style>
