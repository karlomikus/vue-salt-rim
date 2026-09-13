<template>
    <div class="block-container block-container--padded block-container--inset block-container--icicle" @mouseleave="hoveredId = null">
        <div class="node-editor-canvas">
            <div class="icicle-chart">
                <IngredientIcicleNode :node="ingredientTree" :level="0"></IngredientIcicleNode>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { components } from "@/api/api";
import { computed, provide, ref, toRef } from "vue";
import IngredientIcicleNode from "./IngredientIcicleNode.vue";

type IngredientTree = components["schemas"]["IngredientTree"];

const ingredientTree = defineModel<IngredientTree>({
    required: true,
});

const props = defineProps<{
    targetIngredientId: number;
}>();

const hoveredId = ref<number | null>(null);

function findPathToIngredient(node: IngredientTree, targetId: number, path: number[] = []): number[] | null {
    const currentPath = [...path, node.ingredient.id];

    if (node.ingredient.id === targetId) {
        return currentPath;
    }

    for (const child of node.children) {
        const childPath = findPathToIngredient(child, targetId, currentPath);
        if (childPath) {
            return childPath;
        }
    }

    return null;
}

const highlightedIds = computed(() => {
    const id = hoveredId.value ?? props.targetIngredientId;

    return new Set(findPathToIngredient(ingredientTree.value, id) ?? []);
});

provide("icicleHighlightedIds", highlightedIds);
provide("icicleTargetIngredientId", toRef(props, "targetIngredientId"));
provide("icicleSetHoveredId", (id: number | null) => {
    hoveredId.value = id;
});
</script>

<style scoped>
.block-container--icicle {
    overflow: scroll;
}
</style>
