<script setup>
import CocktailGridItem from './CocktailGridItem.vue'
import CocktailGridContainer from './CocktailGridContainer.vue'
</script>

<template>
  <div style="text-align: right;">
    <RouterLink class="button button--outline" :to="{ name: 'cocktails.form' }">Add cocktail</RouterLink>
  </div>
  <h2 class="page-subtitle" style="margin-top: 10px;">Cocktails</h2>
  <ais-instant-search :search-client="searchClient" index-name="cocktails:name:asc" :routing="routing">
    <ais-configure :hitsPerPage="100" />
    <div class="cocktail-list-tags" style="margin-bottom: 10px;">
      <ais-refinement-list attribute="tags" :sort-by="['name:asc']" operator="and">
        <template v-slot:item="{ item, refine, createURL }">
          <a :href="createURL(item.value)" class="tag tag--link" :class="{ 'tag--is-selected': item.isRefined }" @click.prevent="refine(item.value)">
            {{ item.label }}
          </a>
        </template>
      </ais-refinement-list>
    </div>
    <ais-toggle-refinement attribute="user_id" :on="userId">
      <template v-slot="{ value, refine, createURL }">
        <a :href="createURL(value)" class="tag tag--link" :class="{ 'tag--is-selected': value.isRefined }" @click.prevent="refine(value)">
          My cocktails
          ({{ value.count || 0 }})
        </a>
      </template>
    </ais-toggle-refinement>
    <div class="cocktail-list-search-container">
      <ais-search-box placeholder="Filter cocktails..." :class-names="{ 'ais-SearchBox-input': 'form-input', 'ais-SearchBox-reset': 'cocktail-list-search-container__reset' }" />
      <ais-sort-by :items="[
        { value: 'cocktails:name:asc', label: 'Name asc.' },
        { value: 'cocktails:name:desc', label: 'Name desc.' },
        { value: 'cocktails:date:asc', label: 'Date modified asc.' },
        { value: 'cocktails:date:desc', label: 'Date modified desc.' },
      ]" :class-names="{ 'ais-SortBy-select': 'form-select' }" />
    </div>
    <ais-infinite-hits>
      <template v-slot="{ items, refineNext, isLastPage }">
        <CocktailGridContainer v-slot="observer">
          <CocktailGridItem v-for="(cocktail, i) in items" :cocktail="cocktail" :key="cocktail.id" :observer="observer" />
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
import Auth from '@/Auth.js';
import ApiRequests from '@/ApiRequests.js'

export default {
  data() {
    return {
      searchClient: instantMeiliSearch(
        Auth.getUserSearchSettings().host,
        Auth.getUserSearchSettings().key,
        {
          keepZeroFacets: true
        }
      ),
      routing: {
        router: historyRouter(),
        stateMapping: singleIndexMapping('cocktails:name:asc'),
      },
      userCocktails: [],
      userId: Auth.getUser().id
    };
  },
  created() {
    document.title = `Cocktails \u22C5 Salt Rim`
    const userId = Auth.getUser().id
    ApiRequests.fetchUserCocktails(userId).then(data => {
      this.userCocktails = data
    })
  },
  computed: {
    userCocktailIds() {
      return this.userCocktails.map(c => c.id)
    }
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
  gap: 10px;
}

.cocktail-list-search-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  row-gap: 10px;
  column-gap: 10px;
  margin-top: 20px;
}

@media (max-width: 450px) {
  .cocktail-list-search-container {
    grid-template-columns: 1fr;
  }
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
</style>
