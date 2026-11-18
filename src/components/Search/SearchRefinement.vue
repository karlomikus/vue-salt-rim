<template>
    <div class="resource-search__refinements__refinement">
        <div
            class="resource-search__refinements__refinement__title"
            :class="{ 'resource-search__refinements__refinement__title--collapsable': collapsable }"
            @click="toggleCollapsed"
        >
            <IconCaret
                v-if="collapsable"
                class="resource-search__refinements__refinement__title__caret"
                :class="{ 'resource-search__refinements__refinement__title__caret--collapsed': collapsed }"
            />
            <h4>{{ title }}</h4>
            <div class="resource-search__refinements__refinement__title__actions">
                <button v-show="isClearable" type="button" class="button" @click.stop="clear">
                    <span v-if="totalSelected">{{ totalSelected }}</span>
                    <IconClose></IconClose>
                </button>
            </div>
        </div>
        <template v-if="!collapsed">
            <input v-show="searchable" v-model="searchTerm" class="form-input form-input--small" type="text" :placeholder="$t('placeholder.filter-refinement')" style="margin-bottom: 0.5rem;" />
            <div class="resource-search__refinements__refinement__body block-container block-container--inset">
                <slot>
                    <div v-for="refinement in refinementsSearched" :key="refinement.id" class="resource-search__refinements__refinement__item">
                        <input :id="id + '-' + refinement.id" v-model="model" :type="type" :value="refinement.value" @change="emit('change', model)" />
                        <label :for="id + '-' + refinement.id">{{ refinement.name }}</label>
                    </div>
                </slot>
            </div>
        </template>
    </div>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import IconCaret from "../Icons/IconCaret.vue";
import IconClose from "../Icons/IconClose.vue";

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
    type = "checkbox",
    refinements = [],
    searchable = false,
    collapsable = true,
} = defineProps<{
    title: string;
    id: string;
    type?: "checkbox" | "radio";
    refinements?: Refinement[];
    searchable?: boolean;
    collapsable?: boolean;
}>();
const emit = defineEmits<{
    change: [value: null | object | string[] | number[] | undefined];
}>();
const model = defineModel<null | object | string[] | number[]>();
const searchTerm = ref<string>("");
const collapsed = ref<boolean>(collapsable);

const refinementsSearched = computed(() => {
    if (!searchTerm.value || searchTerm.value === "") {
        return refinements;
    }
    return refinements.filter((r) => r.name.toLowerCase().includes(searchTerm.value.toLowerCase()));
});

const isClearable = computed(() => {
    if (type == "radio") {
        return model.value && model.value !== null;
    }

    return model.value && Array.isArray(model.value) && model.value.length > 0;
});

const totalSelected = computed(() => {
    if (!model.value || type === "radio" || (Array.isArray(model.value) && model.value.length === 0)) {
        return "";
    }

    if (Array.isArray(model.value)) {
        return `${model.value.length}`;
    }

    return "";
});

function toggleCollapsed() {
    if (!collapsable) {
        return;
    }

    collapsed.value = !collapsed.value;
}

function clear() {
    searchTerm.value = "";
    if (type === "checkbox") {
        model.value = [];
    } else {
        model.value = null;
    }
    emit("change", model.value);
}

if (isClearable.value) {
    collapsed.value = false;
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
    height: 2.15rem;
    padding: 5px;
    line-height: 1;
    margin-bottom: 0.5rem;
}

.resource-search__refinements__refinement__title {
    display: flex;
    min-height: 3rem;
}

.resource-search__refinements__refinement__title--collapsable {
    cursor: pointer;
}

.resource-search__refinements__refinement__title__caret {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    margin-right: 0.25rem;
    fill: currentColor;
    transition: transform 0.20s ease;
}

.resource-search__refinements__refinement__title__caret--collapsed {
    transform: rotate(-90deg);
}

.resource-search__refinements__refinement__title__actions button {
    padding: 0;
    margin: 0;
    width: auto;
    height: auto;
    display: flex;
    border-radius: 2px;
    color: var(--clr-accent-800);
    background-color: var(--clr-accent-200);

    & span {
        padding: 0 0.25rem;
    }
}

.resource-search__refinements__refinement__title__actions button svg {
    width: 20px;
    height: 20px;
}

.resource-search__refinements__refinement__title__actions svg {
    fill: var(--clr-accent-800);
}

.dark-theme .resource-search__refinements__refinement__title__actions svg {
    fill: var(--clr-gray-400);
}
</style>
