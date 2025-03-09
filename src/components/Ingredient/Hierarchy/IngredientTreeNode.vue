<script setup lang="ts">
import IngredientTreeNodeItem from './IngredientTreeNodeItem.vue';
import type { components } from '@/api/api'

type IngredientTree = components['schemas']['IngredientTree'];

defineProps<{
    hierarchyItem: IngredientTree,
    currentId: string,
}>()
</script>

<template>
    <li>
        <IngredientTreeNodeItem :ingredient="hierarchyItem.ingredient" :current-id="currentId"></IngredientTreeNodeItem>
        <ul v-if="hierarchyItem.children && hierarchyItem.children.length > 0">
            <IngredientTreeNode v-for="child in hierarchyItem.children" :key="child.ingredient.id" :hierarchy-item="child" :current-id="currentId"></IngredientTreeNode>
        </ul>
    </li>
</template>
