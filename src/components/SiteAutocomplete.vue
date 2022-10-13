<template>
  <div class="site-autocomplete">
    <ais-instant-search :search-client="searchClient" index-name="site_search_index">
      <ais-configure :hitsPerPage="10" />
      <ais-autocomplete>
        <template v-slot="{ currentRefinement, indices, refine }">
          <input
            type="search"
            :value="currentRefinement"
            placeholder="Search for a product"
            class="site-autocomplete__input"
            @input="refine($event.currentTarget.value)"
          >
          <ul class="site-autocomplete__results" v-if="currentRefinement" v-for="index in indices" :key="index.indexId">
              <li v-for="hit in index.hits" :key="hit.key">
                <a href="#">
                  <div class="site-autocomplete__results__image" :style="{'background-image': 'url(' + hit.image_url + ')'}"></div>
                  <h4>
                    <ais-highlight attribute="name" :hit="hit"/>
                    <small>{{ hit.type }}</small>
                  </h4>
                </a>
              </li>
              <li v-show="index.hits.length <= 0">No results found for term: "{{ currentRefinement }}"</li>
          </ul>
        </template>
      </ais-autocomplete>
    </ais-instant-search>
  </div>
</template>

<script>
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';

export default {
  data() {
    return {
      searchClient: instantMeiliSearch(
        this.searchUrl,
        this.searchKey,
      )
    }
  }
}
</script>

<style>
.site-autocomplete {
  padding: 20px 0;
  max-width: var(--site-width);
  margin: 0 auto;
}

.site-autocomplete__input {
  width: 100%;
  border: 0;
  background: rgb(92, 101, 155);
  font-size: 1.3rem;
  color: #fff;
  padding: 12px 30px 12px 50px;
  border-radius: 30px;
  appearance: none;
}

.site-autocomplete__input:focus {
  background-color: #fff;
  color: var(--color-text);
  border: 0;
  outline: none;
}

.site-autocomplete__results {
  list-style: none;
  padding: 0;
  margin: 0;
  background: #fff;
  position: absolute;
  margin-top: 5px;
  width: 100%;
  z-index: 5;
  border-radius: 15px;
  padding: 10px;
}

.site-autocomplete__results li a {
  display: flex;
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  text-decoration: none;
}

.site-autocomplete__results li a:hover {
  background-color: #eff7f6;
}

.site-autocomplete__results li a .site-autocomplete__results__image {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #eae4e9;
  background-position: center center;
  background-size: contain;
  background-repeat: no-repeat;
  margin-right: 10px;
}

.site-autocomplete__results li a h4 {
  font-weight: 700;
}

.site-autocomplete__results li a h4 small {
  display: block;
}

.site-autocomplete .ais-Highlight-highlighted {
  background-color: #fbf8cc;
}
</style>
