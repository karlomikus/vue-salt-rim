<template>
  <div class="site-autocomplete">
    <ais-instant-search :search-client="searchClient" index-name="cocktails" :routing="routing">
        <ais-autocomplete>
            <template v-slot="{ currentRefinement, indices, refine }">
              <svg class="site-autocomplete__input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z"/></svg>
              <input
                  class="site-autocomplete__input"
                  type="search"
                  :value="currentRefinement"
                  placeholder="Search for cocktails or ingredients..."
                  @input="refine($event.currentTarget.value)"
              >
              <ul class="site-autocomplete__results" v-if="currentRefinement" v-for="index in indices" :key="index.indexId">
                  <li>
                    <h3>{{ index.indexName === 'cocktails' ? 'Cocktails' : '' }}</h3>
                    <RouterLink :to="{ name: 'cocktails.show', params: { id: hit.id } }" v-for="hit in index.hits" :key="hit.id" class="site-autocomplete__result">
                        <div class="site-autocomplete__result__image" :style="{'background-image': 'url(' + hit.image_url + ')'}"></div>
                        <h3 class="autocomplete__result__text">{{ hit.name }}<span>{{ hit.description }}</span></h3>
                    </RouterLink>
                  </li>
              </ul>
            </template>
        </ais-autocomplete>
    </ais-instant-search>
</div>
</template>

<script>
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import { history } from 'instantsearch.js/es/lib/routers';
import { singleIndex } from 'instantsearch.js/es/lib/stateMappings';

export default {
  data: () => {
    return {
      searchClient: instantMeiliSearch(
        'localhost:7700',
        "YBT-cev!dyj7mju8bur"
      ),
      routing: {
        router: history(),
        stateMapping: singleIndex('cocktails'),
      },
    }
  }
}
</script>

<style scoped>
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

  .site-autocomplete__input-icon {
    position: absolute;
    z-index: 3;
    top: 12px;
    left: 15px;
    fill: var(--color-text);
  }

  .site-autocomplete__input:focus {
    background-color: #fff;
    color: var(--color-text);
    border: 0;
    outline: none;
  }

  .site-autocomplete .ais-InstantSearch {
    width: 100%;
  }

  .site-autocomplete .ais-Autocomplete {
    position: relative;
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
    padding: 30px;
    box-shadow: 0px 0.5px 0.6px hsl(0deg 0% 63% / 0.36),
      0px 1.6px 1.8px -0.8px hsl(0deg 0% 63% / 0.36),
      0.1px 4px 4.5px -1.7px hsl(0deg 0% 63% / 0.36),
      0.1px 9.7px 10.9px -2.5px hsl(0deg 0% 63% / 0.36);
  }

  .site-autocomplete__results li > h3 {
    color: var(--color-site-header);
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.9rem;
    margin-bottom: 10px;
  }

  .site-autocomplete__result {
    display: flex;
    text-decoration: none;
    margin: 0 0 10px 0;
    padding: 8px;
  }

  .site-autocomplete__result:hover,
  .site-autocomplete__result:active,
  .site-autocomplete__result:focus {
    background: #f3f8f8;
    border-radius: 15px;
  }

  .site-autocomplete__result .site-autocomplete__result__image {
    background-size: cover;
    background-position: center center;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin-right: 10px;
    flex-shrink: 0;
  }

  .site-autocomplete__result .autocomplete__result__text {
    font-weight: 700;
  }

  .site-autocomplete__result .autocomplete__result__text span {
    display: block;
    font-size: 1rem;
    font-weight: normal;
  }
</style>
