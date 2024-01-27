<template>
    <div>
        <div class="dialog-title">{{ $t('cocktails.title') }}</div>
        <ais-instant-search :search-client="searchClient" index-name="cocktails" class="cocktail-finder">
            <ais-configure :hits-per-page.camel="8" />
            <ais-search-box>
                <template #default="{ refine }">
                    {{ doFocus() }}
                    <input ref="search" class="form-input cocktail-finder__search-input" type="search" :placeholder="$t('placeholder.search-cocktails')" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" maxlength="512" @input="refine($event.currentTarget.value)">
                </template>
            </ais-search-box>
            <ais-hits class="cocktail-finder__hits">
                <template #default="{ items }">
                    <a v-for="item in items" :key="item.id" class="cocktail-finder__option block-container block-container--hover" href="#" @click.prevent="$emit('cocktailSelected', item)">
                        <CocktailThumb :cocktail="item"></CocktailThumb>
                        <div>
                            <h4><ais-highlight attribute="name" :hit="item" /></h4>
                            <small>{{ item.short_ingredients.join(', ') }}</small>
                        </div>
                    </a>
                </template>
            </ais-hits>
        </ais-instant-search>
        <div class="dialog-actions">
            <button type="submit" class="button button--dark" @click="$emit('closed')">{{ $t('close') }}</button>
        </div>
    </div>
</template>

<script>
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch'
import AppState from './../AppState'
import CocktailThumb from './Cocktail/CocktailThumb.vue'

const appState = new AppState()

export default {
    components: {
        CocktailThumb,
    },
    emits: ['cocktailSelected', 'closed'],
    data() {
        return {
            searchClient: instantMeiliSearch(
                appState.bar.search_driver_host,
                appState.bar.search_driver_api_key,
            ).searchClient,
        }
    },
    methods: {
        doFocus() {
            this.$nextTick(() => {
                if (this.$refs.search) {
                    this.$el.scrollIntoView(true)
                    this.$refs.search.focus()
                }
            })
        }
    }
}
</script>

<style scoped>
.cocktail-finder__search-input {
    width: 100%;
    margin-bottom: 1rem;
}
.cocktail-finder__hits {
    padding: var(--gap-size-1);
    background-color: #f4edf2;
    border-radius: var(--radius-2);
    border-bottom: 1px solid #fff;
    box-shadow: inset 0px 0.4px 0.5px hsl(var(--shadow-color) / 0.25), inset 0px 1.1px 1.2px -0.8px hsl(var(--shadow-color) / 0.25), inset 0px 2.6px 2.9px -1.7px hsl(var(--shadow-color) / 0.25), inset 0px 6.3px 7.1px -2.5px hsl(var(--shadow-color) / 0.25);
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-1);
    height: 400px;
    overflow-x: auto;
}

.dark-theme .cocktail-finder__hits {
    background-color: rgba(0, 0, 0, .15);
    border-bottom: 1px solid rgba(255, 255, 255, .1);
    box-shadow:
        inset 0px 0.4px 0.5px hsl(var(--shadow-color-dark) / 0.25),
        inset 0px 1.1px 1.2px -0.8px hsl(var(--shadow-color-dark) / 0.25),
        inset 0px 2.6px 2.9px -1.7px hsl(var(--shadow-color-dark) / 0.25),
        inset 0px 6.3px 7.1px -2.5px hsl(var(--shadow-color-dark) / 0.25);
}

.cocktail-finder__option {
    display: flex;
    flex-direction: row;
    gap: var(--gap-size-2);
    text-decoration: none;
    padding: var(--gap-size-2);
}

.cocktail-finder__option h4 span {
    font-size: 1rem;
    font-family: var(--font-heading);
    font-weight: var(--fw-bold);
}

:deep(.cocktail-finder__option h4 span .ais-Highlight-highlighted) {
    background-color: var(--clr-accent-200);
    font-weight: var(--fw-bold);
}

.cocktail-finder__option small {
    font-size: 0.85rem;
    color: var(--clr-gray-600);
}

.dark-theme .cocktail-finder__option small {
    color: var(--clr-gray-400);
}
</style>
