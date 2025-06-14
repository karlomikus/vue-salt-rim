<template>
    <div class="ingredient-icicle-row">
        <div class="ingredient-icicle-row__node" :class="'ingredient-icicle-row__node--level-' + level" :id="'ingredient-icicle-node-' + node.ingredient.id">
            <span class="node-content">{{ node.ingredient.name }}</span>
        </div>
        <div v-if="childrenSortedByName && childrenSortedByName.length" class="ingredient-icicle-row__sub-chart">
            <IngredientIcicleNode
                v-for="child in childrenSortedByName"
                :key="child.ingredient.id"
                :node="child"
                :level="level + 1"
            ></IngredientIcicleNode>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { components } from '@/api/api'
import { computed, ref } from 'vue';
type IngredientTree = components['schemas']['IngredientTree'];

const props = defineProps<{
    node: IngredientTree;
    level: number;
}>()

const childrenSortedByName = computed(() => {
    return props.node.children?.sort((a, b) => a.ingredient.name.localeCompare(b.ingredient.name)) || [];
})
</script>

<style scoped>
.ingredient-icicle-row {
    display: flex;
    gap: 2px;
}

.ingredient-icicle-row__node {
    width: 250px;
    flex-grow: 0;
    flex-shrink: 0;
    padding: var(--gap-size-1);
}

.ingredient-icicle-row__node--level-0 {
    background-color: #c79d78;
    color: #312419;
}

.ingredient-icicle-row__node--level-1 {
    background-color: #d3a57d;
    color: #312419;
}

.ingredient-icicle-row__node--level-2 {
    background-color: #ddac82;
    color: #312419;
}

.ingredient-icicle-row__node--level-3 {
    background-color: #e6b184;
    color: #312419;
}

.ingredient-icicle-row__node--level-4 {
    background-color: #ecb788;
    color: #312419;
}

.ingredient-icicle-row__node--level-5 {
    background-color: #f1b988;
    color: #312419;
}

.ingredient-icicle-row__node--level-6 {
    background-color: #f3b986;
    color: #312419;
}

.ingredient-icicle-row__node--level-7 {
    background-color: #f8bb85;
    color: #312419;
}

.ingredient-icicle-row__node--level-8 {
    background-color: #ffbd84;
    color: #312419;
}

.ingredient-icicle-row__node--level-9 {
    background-color: #ffb879;
    color: #312419;
}

.ingredient-icicle-row__sub-chart {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.ingredient-icicle-row--highlighted .ingredient-icicle-row__node {
    background-color: #f7b174 !important;
}
</style>