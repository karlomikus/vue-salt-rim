<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { components } from '@/api/api'
import { useI18n } from 'vue-i18n'
import BarAssistantClient from '@/api/BarAssistantClient'
import IngredientTreeNode from './Hierarchy/IngredientTreeNode.vue'
import OverlayLoader from '../OverlayLoader.vue'
import IngredientIcicle from './Hierarchy/IngredientIcicle.vue'

type IngredientTree = components['schemas']['IngredientTree'];

const { t } = useI18n()
const isLoading = ref(false)
const hierarchy = ref<IngredientTree | null>(null)
const currentTab = ref<'dendogram' | 'icicle'>('dendogram')
const {
    parentId,
    rootId,
} = defineProps<{
    parentId: number | string;
    rootId: number | string;
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

const onlyVariants = computed((): IngredientTree|null => {
    if (!hierarchy.value) {
        return null
    }

    if (hierarchy.value.ingredient.id.toString() === parentId.toString()) {
        return hierarchy.value
    }

    function findChildById(node: IngredientTree, targetId: string): IngredientTree | null {
        if (node.ingredient.id.toString() === targetId) {
            return node
        }

        for (const child of node.children) {
            const found = findChildById(child, targetId)
            if (found) {
                return found
            }
        }

        return null
    }

    return findChildById(hierarchy.value, parentId.toString())
})

watch(() => parentId, () => {
    fetchTree(rootId.toString())
}, { immediate: true })
</script>

<template>
    <div v-if="hierarchy">
        <h2 class="block-container__title">{{ t('ingredient.hierarchy') }}</h2>
        <p>{{ t('ingredient.hierarchy-description') }}</p>
        <a href="#" @click.prevent="currentTab = 'dendogram'">{{ t('ingredient.show-variants') }}</a> &middot; <a href="#" @click.prevent="currentTab = 'icicle'">{{ t('ingredient.icicle-graph') }}</a>
        <div class="ingredient-hierarchy block-container block-container--padded block-container--inset tf-tree tf-gap-sm" v-if="currentTab === 'dendogram'">
            <OverlayLoader v-if="isLoading" />
            <ul v-if="onlyVariants">
                <IngredientTreeNode :hierarchy-item="onlyVariants" :current-id="parentId.toString()"></IngredientTreeNode>
            </ul>
        </div>
        <div v-if="currentTab === 'icicle'">
            <IngredientIcicle v-model="hierarchy" :targetIngredientId="parseInt(parentId.toString())"></IngredientIcicle>
        </div>
    </div>
</template>

<style>
.ingredient-hierarchy {
    --border-color: var(--clr-gray-600);
    --border-width: 2px;
    background-image: radial-gradient(var(--clr-accent-200) 1px, transparent 1px);
    background-size: 20px 20px;

    .dark-theme & {
        background-image: radial-gradient(var(--clr-gray-700) 1px, transparent 1px);
    }
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
