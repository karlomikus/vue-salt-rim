<template>
    <div class="ingredient-icicle-row">
        <div
            class="ingredient-icicle-row__node"
            :class="{
                'ingredient-icicle-row__node--highlighted': isHighlighted,
                'ingredient-icicle-row__node--target': isTarget,
            }"
            :id="'ingredient-icicle-node-' + node.ingredient.id"
            @mouseenter="setHoveredId?.(node.ingredient.id)"
        >
            <span class="node-content">
                <RouterLink :to="{ name: 'ingredients.show', params: { id: node.ingredient.slug } }">
                    {{ node.ingredient.name }} <template v-if="node.children.length > 0"> ({{ node.children.length }})</template>
                </RouterLink>
            </span>
        </div>
        <div v-if="childrenSortedByName && childrenSortedByName.length" class="ingredient-icicle-row__sub-chart">
            <IngredientIcicleNode v-for="child in childrenSortedByName" :key="child.ingredient.id" :node="child" :level="level + 1"></IngredientIcicleNode>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { components } from "@/api/api";
import { computed, inject, type ComputedRef, type Ref } from "vue";
type IngredientTree = components["schemas"]["IngredientTree"];

const props = defineProps<{
    node: IngredientTree;
    level: number;
}>();

const highlightedIds = inject<ComputedRef<Set<number>>>("icicleHighlightedIds");
const targetIngredientId = inject<Ref<number> | undefined>("icicleTargetIngredientId");
const setHoveredId = inject<(id: number | null) => void>("icicleSetHoveredId");

const isHighlighted = computed(() => highlightedIds?.value.has(props.node.ingredient.id) ?? false);
const isTarget = computed(() => targetIngredientId?.value === props.node.ingredient.id);

const childrenSortedByName = computed(() => {
    return [...props.node.children].sort((a, b) => a.ingredient.name.localeCompare(b.ingredient.name)) || [];
});
</script>

<style scoped>
.ingredient-icicle-row {
    display: flex;
    gap: 2px;
}

.ingredient-icicle-row__node {
    width: 160px;
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

.ingredient-icicle-row__node--highlighted {
    background-color: var(--clr-accent-100);
    box-shadow: inset 0 0 0 2px var(--clr-accent-400);

    .dark-theme & {
        background-color: var(--clr-accent-900);
    }
}

.ingredient-icicle-row__node--target {
    background-color: var(--clr-purple-100);
    box-shadow: inset 0 0 0 2px var(--clr-purple-400);

    .dark-theme & {
        background-color: var(--clr-purple-900);
    }
}

.ingredient-icicle-row__sub-chart {
    display: flex;
    flex-direction: column;
    gap: 2px;
}
</style>
