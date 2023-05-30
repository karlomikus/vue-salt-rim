<template>
    <div v-if="modelValue" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <button type="button" class="button button--outline">{{ modelValue.name }}</button>
        <button type="button" class="button button--dark" @click="removeIngredient">{{ $t('remove') }}</button>
    </div>
    <ais-instant-search :search-client="searchClient" :index-name="index" v-show="!modelValue">
        <ais-configure :hitsPerPage="15" />
        <ais-search-box :placeholder="$t('placeholder.search-ingredients')" :class-names="{'ais-SearchBox-input': 'form-input'}" />
        <ais-hits>
            <template v-slot="{ items }">
                <div class="block-container ingredients-options">
                    <a href="#" v-for="item in items" @click.prevent="selectIngredient(item)">{{ item.name }}</a>
                </div>
            </template>
        </ais-hits>
    </ais-instant-search>
</template>

<script>
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import Auth from '@/Auth.js';

export default {
    props: {
        modelValue: null,
        block: []
    },
    emits: ['update:modelValue'],
    data() {
        return {
            index: 'ingredients:name:asc',
            searchClient: instantMeiliSearch(
                Auth.getUserSearchSettings().host,
                Auth.getUserSearchSettings().key,
            ),
        }
    },
    methods: {
        selectIngredient(ing) {
            if (ing && this.block && this.block.includes(ing.id)) {
                return false;
            }

            this.$emit('update:modelValue', ing)
        },
        removeIngredient() {
            this.selectIngredient(null)
        },

    }
}
</script>

<style scoped>
.ingredients-options {
    display: flex;
    flex-direction: column;
    height: 200px;
    overflow-y: auto;
    padding: 1rem;
    border-radius: 5px;
    margin-top: 0.5rem;
}

.ingredients-options a {
    display: block;
    padding: 0.125rem 0.25rem;
    border-radius: 4px;
}

.ingredients-options a:hover {
    background-color: var(--clr-gray-50);
}

.dark-theme .ingredients-options a:hover {
    background-color: var(--clr-gray-900);
}
</style>
