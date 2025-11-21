<template>
    <div class="ingredient-icicle-row">
        <div class="ingredient-icicle-row__node" :id="'ingredient-icicle-node-' + node.ingredient.id">
            <span class="node-content">
                <RouterLink :to="{ name: 'ingredients.show', params: { id: node.ingredient.slug } }">
                    {{ node.ingredient.name }}
                </RouterLink>
                <template v-if="node.children.length > 0"> &middot; ({{ node.children.length }})</template>
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
    font-size: 0.85em;
    background-color: var(--clr-gray-200);
    border-radius: 3px;
    .dark-theme & {
        background-color: var(--clr-gray-700);
    }
}

.ingredient-icicle-row__sub-chart {
    display: flex;
    flex-direction: column;
    gap: 2px;
}
</style>
