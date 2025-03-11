<script setup lang="ts">
import { ref, watch } from 'vue'
import type { components } from '@/api/api'
import { useI18n } from 'vue-i18n'
import BarAssistantClient from '@/api/BarAssistantClient'
import IngredientTreeNode from './Hierarchy/IngredientTreeNode.vue';
import OverlayLoader from '../OverlayLoader.vue';

type IngredientTree = components['schemas']['IngredientTree'];

const { t } = useI18n()
const isLoading = ref(false)
const hierarchy = ref<IngredientTree | null>(null)
const {
    parentId,
    rootId,
} = defineProps<{
    parentId: number | string;
    rootId?: number | string;
}>();

async function fetchTree(id: string) {
    isLoading.value = true
    try {
        hierarchy.value = (await BarAssistantClient.getIngredientTree(id))?.data ?? null
    } catch (e) {
        return
    }

    isLoading.value = false
}

async function showRoot() {
    if (!rootId) {
        return;
    }

    fetchTree(rootId.toString())
}

async function showVariants() {
    fetchTree(parentId.toString())
}

watch(() => parentId, () => {
    fetchTree(parentId.toString())
}, { immediate: true })
</script>

<template>
    <div v-if="hierarchy">
        <h2 class="details-block-container__title">{{ t('ingredient.hierarchy') }}</h2>
        <p>{{ t('ingredient.hierarchy-description') }}</p>
        <a href="#" @click.prevent="showVariants">{{ t('ingredient.show-variants') }}</a> &middot; <a href="#" @click.prevent="showRoot">{{ t('ingredient.show-ancestors') }}</a>
        <div class="ingredient-hierarchy block-container block-container--padded block-container--inset tf-tree tf-gap-sm">
            <OverlayLoader v-if="isLoading" />
            <ul>
                <IngredientTreeNode :hierarchy-item="hierarchy" :current-id="parentId.toString()"></IngredientTreeNode>
            </ul>
        </div>
    </div>
</template>

<style>
.ingredient-hierarchy {
    --border-color: var(--clr-gray-300);
    --border-width: 2px;
}

.ingredient-hierarchy {
    text-align: center;
    margin-top: var(--gap-size-3);
}

.ingredient-hierarchy .tf-nc {
    border: 0;
    padding: 0;
}

.ingredient-hierarchy .tf-nc:before,
.ingredient-hierarchy .tf-nc:after {
    border-left-color: var(--border-color);
    border-left-width: var(--border-width);
}

.ingredient-hierarchy li li:before {
    border-top-color: var(--border-color);
    border-top-width: var(--border-width);
}

.ingredient-tree-node-item {
    text-align: center;
    padding: 0.25rem 0.5rem;
}

.ingredient-tree-node-item.ingredient-tree-node-item--current {
    border: 2px solid var(--clr-accent-400);
}
</style>