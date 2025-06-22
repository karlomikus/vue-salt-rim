<template>
    <div class="ingredient-icicle-row">
        <div class="ingredient-icicle-row__node" :class="'ingredient-icicle-row__node--level-' + level" :id="'ingredient-icicle-node-' + node.ingredient.id">
            <span class="node-content">
                {{ node.ingredient.name }} <template v-if="node.children.length > 0">({{ node.children.length }})</template>
                &middot;
                <RouterLink :to="{ name: 'ingredients.show', params: { id: node.ingredient.slug } }">
                    {{ t('view') }}
                </RouterLink>
            </span>
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
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
type IngredientTree = components['schemas']['IngredientTree'];

const props = defineProps<{
    node: IngredientTree;
    level: number;
}>()

const { t } = useI18n()

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
    background-color: hsl(28, 65%, 60%);
    color: #312419;
}

.ingredient-icicle-row__node--level-1 {
    background-color: hsl(28, 65%, 62%);
    color: #312419;
}

.ingredient-icicle-row__node--level-2 {
    background-color: hsl(28, 65%, 64%);
    color: #312419;
}

.ingredient-icicle-row__node--level-3 {
    background-color: hsl(28, 65%, 66%);
    color: #312419;
}

.ingredient-icicle-row__node--level-4 {
    background-color: hsl(28, 65%, 68%);
    color: #312419;
}

.ingredient-icicle-row__node--level-5 {
    background-color: hsl(28, 65%, 70%);
    color: #312419;
}

.ingredient-icicle-row__node--level-6 {
    background-color: hsl(28, 65%, 72%);
    color: #312419;
}

.ingredient-icicle-row__node--level-7 {
    background-color: hsl(28, 65%, 74%);
    color: #312419;
}

.ingredient-icicle-row__node--level-8 {
    background-color: hsl(28, 65%, 76%);
    color: #312419;
}

.ingredient-icicle-row__node--level-9 {
    background-color: hsl(28, 65%, 78%);
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