<template>
    <div class="node-editor-container block-container block-container--padded block-container--inset" ref="nodeEditor" @mousedown="startPan" @mousemove="pan" @mouseup="isPanning = false" @mouseleave="isPanning = false" @wheel="zoom">
        <div class="node-editor-canvas" ref="nodeCanvas">
            <div class="icicle-chart">
                <IngredientIcicleNode :node="ingredientTree" :level="0"></IngredientIcicleNode>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from 'vue'; // Added watch
import type { components } from '@/api/api'
import IngredientIcicleNode from './IngredientIcicleNode.vue';

type IngredientTree = components['schemas']['IngredientTree'];

const canvas = useTemplateRef<HTMLDivElement>('nodeCanvas');
const nodeEditor = useTemplateRef<HTMLDivElement>('nodeEditor');
const transformState = ref({ x: 0, y: 0, scale: 1 })
const isPanning = ref(false)
const panStart = ref({ x: 0, y: 0 })

const ingredientTree = defineModel<IngredientTree>({
    required: true,
})
const props = defineProps<{
    targetIngredientId: number;
}>()

const applyTransform = () => {
    if (!canvas.value) return;
    canvas.value.style.transform = `translate(${transformState.value.x}px, ${transformState.value.y}px) scale(${transformState.value.scale})`;
}

const startPan = (e: MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    isPanning.value = true;
    panStart.value.x = e.clientX - transformState.value.x;
    panStart.value.y = e.clientY - transformState.value.y;
}

const pan = (e: MouseEvent) => {
    if (!isPanning.value) return;
    e.preventDefault();
    transformState.value.x = e.clientX - panStart.value.x;
    transformState.value.y = e.clientY - panStart.value.y;
    applyTransform();
}

const zoom = (e: WheelEvent) => {
    e.preventDefault();
    if (!nodeEditor.value) return;

    const scaleAmount = -e.deltaY * 0.001;
    const newScale = Math.max(0.2, Math.min(2, transformState.value.scale + scaleAmount));
    const scaleRatio = newScale / transformState.value.scale;

    const rect = nodeEditor.value.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    transformState.value.x = mouseX - (mouseX - transformState.value.x) * scaleRatio;
    transformState.value.y = mouseY - (mouseY - transformState.value.y) * scaleRatio;
    transformState.value.scale = newScale;

    applyTransform();
}

function initialize() {
    // if (nodeEditor.value) {
    //     const editorRect = nodeEditor.value.getBoundingClientRect();
    //     const nodeEl = document.getElementById(`ingredient-icicle-node-${props.targetIngredientId}`);

    //     if (nodeEl) {
    //         const nodeRect = nodeEl.getBoundingClientRect();

    //         // Calculate the position to center the node
    //         transformState.value.x = (editorRect.width / 2) - (nodeRect.width / 2) - nodeRect.left;
    //         transformState.value.y = (editorRect.height / 2) - (nodeRect.height / 2) - nodeRect.top;
    //         console.log(transformState.value)
    //     }
    // }

    applyTransform()
}

onMounted(() => {
    initialize();
})
</script>

<style scoped>
.node-editor-container {
    --nec-highlight-color: rgb(226, 115, 74);
    width: 100%;
    height: 100%;
    position: relative;
    background-image: radial-gradient(var(--clr-accent-200) 1px, transparent 1px);
    background-size: 20px 20px;
    overflow: hidden;
    cursor: grab;
}

.node-editor-container:active {
    cursor: grabbing;
}

.node-editor-canvas {
    width: 100%;
    height: 100%;
    position: relative;
    transform-origin: 0 0; /* Important for zooming */
}

.node-editor__node {
    position: absolute;
    padding: 0.75rem 1.25rem;
    user-select: none;
    min-width: 200px;
    transition: box-shadow 0.2s ease-in-out;
    cursor: pointer;
    border: 0;
}

.node-editor__node.node-editor__node--hidden {
    display: none;
}

.node-editor__node.node-editor__node--highlighted {
    box-shadow: inset 0 0 0 2px var(--nec-highlight-color);
}

/* .node-editor__node--has-children::after {
    content: '+';
    position: absolute;
    right: 10px;
    font-size: 1.25rem;
    color: var(--connector-color);
}

.node-editor__node--is-open.node-editor__node--has-children::after {
    content: '−';
} */

#connector-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: visible; /* Allows paths to be seen outside the initial viewport */
}

.connector-path {
    stroke: var(--clr-gray-200);
    stroke-width: 2;
    fill: none;
}

.connector-path.connector-path--hidden {
    opacity: 0;
}

.connector-path.connector-path--highlighted {
    stroke: var(--nec-highlight-color);
    stroke-width: 3;
}
</style>