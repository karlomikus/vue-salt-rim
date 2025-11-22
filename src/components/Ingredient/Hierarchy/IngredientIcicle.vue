<template>
    <div class="block-container block-container--padded block-container--inset block-container--icicle">
        <div class="node-editor-canvas">
            <div class="icicle-chart">
                <IngredientIcicleNode :node="ingredientTree" :level="0"></IngredientIcicleNode>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { components } from '@/api/api'
import IngredientIcicleNode from './IngredientIcicleNode.vue';

type IngredientTree = components['schemas']['IngredientTree'];

const ingredientTree = defineModel<IngredientTree>({
    required: true,
})
</script>

<style scoped>
.block-container--icicle {
    overflow: scroll;
}
</style>
