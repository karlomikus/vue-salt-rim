<template>
    <div class="resource-search__refinements__refinement block-container block-container--inset">
        <div class="resource-search__refinements__refinement__title">
            <h4>{{ title }} {{ totalSelected }}</h4>
            <div class="resource-search__refinements__refinement__title__actions">
                <button v-show="isClearable" type="button" class="button" @click="clear">
                    <IconClose></IconClose>
                </button>
                <button v-if="collapsable" type="button" class="button" @click="collapsed = !collapsed">
                    <svg v-show="collapsed == false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path d="M11.9997 13.1714L16.9495 8.22168L18.3637 9.63589L11.9997 15.9999L5.63574 9.63589L7.04996 8.22168L11.9997 13.1714Z"></path></svg>
                    <svg v-show="collapsed == true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z"></path></svg>
                </button>
            </div>
        </div>
        <template v-if="!collapsed">
            <input v-show="searchable" v-model="searchTerm" class="form-input form-input--refinement" type="text" :placeholder="$t('placeholder.filter-refinement')">
            <div class="resource-search__refinements__refinement__body">
                <slot>
                    <div v-for="refinement in refinementsSearched" :key="refinement.id" class="resource-search__refinements__refinement__item">
                        <input :id="id + '-' + refinement.id" v-model="model" :type="type" :value="refinement.value">
                        <label :for="id + '-' + refinement.id">{{ refinement.name }}</label>
                    </div>
                </slot>
            </div>
        </template>
    </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import IconClose from '../Icons/IconClose.vue';

export interface RefinementRange {
    min: number;
    max: number;
}

export interface Refinement {
    id: number | string;
    name: string;
    value: string | number | RefinementRange | null;
}

const {
    title,
    id,
    type = 'checkbox',
    refinements = [],
    searchable = false,
    collapsable = true,
} = defineProps<{
    title: string,
    id: string,
    type?: 'checkbox' | 'radio',
    refinements?: Refinement[],
    searchable?: boolean,
    collapsable?: boolean,
}>()
const model = defineModel<null | object | string[] | number[]>()
const searchTerm = ref<string>('')
const collapsed = ref<boolean>(collapsable)

const refinementsSearched = computed(() => {
    if (!searchTerm.value || searchTerm.value === '') {
        return refinements
    }
    return refinements.filter(r => r.name.toLowerCase().includes(searchTerm.value.toLowerCase()))
});

const isClearable = computed(() => {
    if (type == 'radio') {
        return model.value && model.value !== null
    }

    return model.value && Array.isArray(model.value) && model.value.length > 0
});

const totalSelected = computed(() => {
    if (!model.value || type === 'radio' || (Array.isArray(model.value) && model.value.length === 0)) {
        return ''
    }

    if (Array.isArray(model.value)) {
        return `(${model.value.length})`
    }

    return ''
});

function clear() {
    searchTerm.value = ''
    if (type === 'checkbox') {
        model.value = []
    } else {
        model.value = null
    }
}

if (isClearable.value) {
    collapsed.value = false
}
</script>
<style scoped>
.form-input--refinement {
    border-top: 0;
    border-left: 0;
    border-right: 0;
    font-size: 0.75rem;
    border-radius: 0;
    width: 100%;
    height: 100%;
    padding: 5px;
    line-height: 1;
    margin-bottom: 0.5rem;
}

.resource-search__refinements__refinement__title__actions button {
    padding: 0;
    margin: 0;
    width: auto;
    height: auto;
}

.resource-search__refinements__refinement__title__actions button svg {
    width: 16px;
    height: 16px;
}

.resource-search__refinements__refinement__title__actions svg {
    fill: var(--clr-gray-700);
}

.dark-theme .resource-search__refinements__refinement__title__actions svg {
    fill: var(--clr-gray-400);
}
</style>
