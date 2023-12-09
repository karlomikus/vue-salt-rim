<template>
    <ais-instant-search :search-client="searchClient" :index-name="index" class="ingredient-finder" :initial-ui-state="initialUiState">
        <ais-configure :hits-per-page="maxHits" />
        <ais-search-box autofocus>
            <template #default="{ refine }">
                <input v-model="currentQuery" class="form-input ingredient-finder__search-input" type="search" :placeholder="$t('placeholder.search-ingredients')" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" maxlength="512" @input="refine($event.currentTarget.value)">
            </template>
        </ais-search-box>
        <ais-hits class="ingredient-finder__hits">
            <template #default="{ items }">
                <div class="ingredient-finder__options">
                    <OverlayLoader v-if="isLoading"></OverlayLoader>
                    <a v-for="item in items" :key="item.id" href="#" @click.prevent="selectIngredient(item)">
                        <IngredientImage class="ingredient__image--small" :ingredient="item"></IngredientImage>
                        <div class="ingredient-finder__options__content">
                            <span>{{ item.name }}</span>
                            <small>{{ item.category }}</small>
                        </div>
                    </a>
                    <a v-show="currentQuery" href="#" class="ingredient-finder__options__create" @click.prevent="newIngredient">
                        {{ $t('ingredient.dialog.search-not-found') }} {{ $t('ingredient.dialog.create-ingredient', { name: currentQuery }) }}
                    </a>
                </div>
            </template>
        </ais-hits>
    </ais-instant-search>
</template>

<script>
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch'
import OverlayLoader from './OverlayLoader.vue'
import ApiRequests from '../ApiRequests'
import AppState from './../AppState'
import IngredientImage from './Ingredient/IngredientImage.vue'

const appState = new AppState()

export default {
    components: {
        OverlayLoader,
        IngredientImage
    },
    props: {
        modelValue: {
            type: Object,
            default() {
                return {}
            }
        },
        initialQuery: {
            type: String,
            default: null,
        },
        maxHits: {
            type: Number,
            default: 15
        },
        disabledIngredients: {
            type: Array,
            default() {
                return []
            }
        }
    },
    emits: ['update:modelValue', 'ingredientSelected'],
    data() {
        return {
            isLoading: false,
            currentQuery: this.initialQuery,
            index: 'ingredients:name:asc',
            initialUiState: {
                'ingredients:name:asc': {
                    query: this.initialQuery,
                },
            },
            searchClient: instantMeiliSearch(
                appState.bar.search_driver_host,
                appState.bar.search_driver_api_key,
            ),
        }
    },
    methods: {
        selectIngredient(ing) {
            if (ing && this.disabledIngredients.includes(ing.id)) {
                return false
            }

            this.$emit('update:modelValue', ing)
            this.$emit('ingredientSelected', ing)
        },
        newIngredient() {
            this.isLoading = true
            ApiRequests.saveIngredient({
                name: this.currentQuery,
                description: null,
                strength: 0,
                origin: null,
                color: null,
                images: [],
                ingredient_category_id: null,
            }).then(data => {
                this.$toast.default(this.$t('ingredient.dialog.new-ingredient-success', { name: data.name }))
                this.selectIngredient({
                    name: data.name,
                    slug: data.slug,
                    id: data.id
                })
                this.isLoading = false
            }).catch(() => {
                this.$toast.error(this.$t('ingredient.dialog.new-ingredient-fail'))
                this.isLoading = false
            })
        },
    }
}
</script>

<style scoped>
.ingredient-finder__search-input {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    width: 100%;
}

.ingredient-finder__options {
    display: flex;
    flex-direction: column;
    height: 15rem;
    overflow-y: auto;
    padding: 0.5rem;
    border-radius: var(--radius-2);
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border: 2px solid var(--clr-gray-100);
    border-top: 0;
    background: #fff;
}

.dark-theme .ingredient-finder__options {
    border-color: var(--clr-dark-main-600);
    background-color: var(--clr-dark-main-900);
}

.ingredient-finder__options a {
    display: flex;
    gap: var(--gap-size-2);
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-1);
    text-decoration: none;
}

.ingredient-finder__options a:hover {
    background-color: var(--clr-gray-50);
}

.dark-theme .ingredient-finder__options a:hover {
    background-color: var(--clr-dark-main-700);
}

.ingredient-finder__options__content {
    display: flex;
    flex-direction: column;
}

.ingredient-finder__options__content small {
    font-size: 0.75rem;
    color: var(--clr-gray-500);
}

a.ingredient-finder__options__create {
    text-decoration: underline;
}
</style>
