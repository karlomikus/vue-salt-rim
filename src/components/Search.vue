<script setup>
import CocktailGridItem from './Cocktail/CocktailGridItem.vue'
</script>
<template>
  <ais-instant-search :search-client="searchClient" index-name="cocktails">
    <ais-search-box />
    <ais-hits>
        <template v-slot:item="{ item }">
            <CocktailGridItem :cocktail="item" />
        </template>
    </ais-hits>
  </ais-instant-search>
</template>

<script>
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import Autocomplete from './Autocomplete.vue';

export default {
  components: { Autocomplete },
  data: () => ({
    cocktails: null,
    searchClient: instantMeiliSearch(
      this.searchUrl,
      this.searchKey
    ),
  })
}
</script>
