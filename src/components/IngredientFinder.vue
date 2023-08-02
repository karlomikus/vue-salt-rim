<template>
    <ais-instant-search :search-client="searchClient" :index-name="index" class="ingredient-finder">
        <ais-configure :hitsPerPage="maxHits" />
        <ais-search-box class="ingredient-finder__search-input" :placeholder="$t('placeholder.search-ingredients')" :class-names="{ 'ais-SearchBox-input': 'form-input' }" v-model="currentQuery" />
        <ais-hits class="ingredient-finder__hits">
            <template v-slot="{ items }">
                <div class="ingredient-finder__options">
                    <OverlayLoader v-if="isLoading"></OverlayLoader>
                    <a href="#" v-for="item in items" @click.prevent="selectIngredient(item)">{{ item.name }}</a>
                    <a href="#" class="ingredient-finder__options__create" @click.prevent="newIngredient" v-show="currentQuery">
                        {{ $t('ingredient-dialog.search-not-found') }} {{ $t('ingredient-dialog.create-ingredient', { name: currentQuery }) }}
                    </a>
                </div>
            </template>
        </ais-hits>
    </ais-instant-search>
</template>

<script>
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import Auth from './../Auth.js';
import OverlayLoader from './OverlayLoader.vue';
import ApiRequests from '../ApiRequests';

export default {
    props: {
        modelValue: null,
        maxHits: {
            type: Number,
            default: 15
        },
        disabledIngredients: {
            type: Array,
            default: []
        }
    },
    emits: ['update:modelValue', 'ingredientSelected'],
    components: {
        OverlayLoader
    },
    data() {
        return {
            isLoading: false,
            currentQuery: null,
            index: 'ingredients:name:asc',
            searchClient: instantMeiliSearch(
                Auth.getUserSearchSettings().host,
                Auth.getUserSearchSettings().key,
            ),
        }
    },
    methods: {
        selectIngredient(ing) {
            if (ing && this.disabledIngredients.includes(ing.id)) {
                return false;
            }

            this.$emit('update:modelValue', ing)
            this.$emit('ingredientSelected', ing)
        },
        newIngredient() {
            this.isLoading = true;
            ApiRequests.saveIngredient({
                name: this.currentQuery,
                description: null,
                strength: 0,
                origin: null,
                color: null,
                images: [],
                ingredient_category_id: 1,
            }).then(data => {
                this.$toast.default(this.$t('ingredient-dialog.new-ingredient-success', { name: data.name }));
                this.selectIngredient({
                    name: data.name,
                    slug: data.slug,
                    id: data.id
                });
                this.isLoading = false;
            }).catch(() => {
                this.$toast.error(this.$t('ingredient-dialog.new-ingredient-fail'));
                this.isLoading = false;
            })
        },
    }
}
</script>

<style scoped>
:deep(.ingredient-finder__search-input .form-input) {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
}

.ingredient-finder__options {
    display: flex;
    flex-direction: column;
    height: 15rem;
    overflow-y: auto;
    padding: 0.5rem;
    border-radius: 5px;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border: 2px solid var(--clr-gray-100);
    border-top: 0;
    background: #fff;
}

.ingredient-finder__options a {
    display: block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
}

.ingredient-finder__options a:hover {
    background-color: var(--clr-gray-50);
}

.dark-theme .ingredient-finder__options a:hover {
    background-color: var(--clr-gray-900);
}

.dark-theme .ingredient-finder__options {
    background: #1c1b20;
    border-color: #2c2734;
}

.ingredient-finder__new_ingredient {
    padding: 0.25rem 0.5rem;
    margin-top: 0.5rem;
}

a.ingredient-finder__options__create {
    background-color: var(--clr-accent-blue);
}
</style>
