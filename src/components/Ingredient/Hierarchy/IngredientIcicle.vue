<template>
    <div class="node-editor-container block-container block-container--padded block-container--inset"
         :class="{'node-editor-container--is-panning': isPanning}"
         ref="nodeEditor"
         @pointerdown="startPan"
         @pointermove="pan"
         @pointerup="isPanning = false"
         @pointerleave="isPanning = false"
         @wheel="zoom"
         @touchstart="startTouchPan"
         @touchmove="touchPan"
         @touchend="touchEndCleanup">
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
const initialPinchDistance = ref(0);

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

const startPan = (e: PointerEvent) => {
    if (e.button !== 0 || (e.target as HTMLDivElement).closest('.ingredient-icicle-row__node a')) {
        // Only start panning on left mouse button and not on node elements
        return;
    }

    e.preventDefault();
    isPanning.value = true;
    panStart.value.x = e.clientX - transformState.value.x;
    panStart.value.y = e.clientY - transformState.value.y;
}

const startTouchPan = (e: TouchEvent) => {
    if ((e.target as HTMLDivElement).closest('.ingredient-icicle-row__node a')) {
        return;
    }

    const touches = e.touches;
    if (touches.length === 1) {
        isPanning.value = true;
        panStart.value.x = touches[0].clientX - transformState.value.x;
        panStart.value.y = touches[0].clientY - transformState.value.y;
    } else if (touches.length === 2) {
        isPanning.value = false;
        initialPinchDistance.value = Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
    }
}

const touchPan = (e: TouchEvent) => {
    e.preventDefault();

    const touches = e.touches;
    if (touches.length === 1 && isPanning) {
        transformState.value.x = touches[0].clientX - panStart.value.x;
        transformState.value.y = touches[0].clientY - panStart.value.y;
        applyTransform();
    } else if (touches.length === 2 && initialPinchDistance) {
        const currentDist = Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
        const scaleAmount = (currentDist / initialPinchDistance.value) - 1.0;

        const midX = (touches[0].clientX + touches[1].clientX) / 2
        const midY = (touches[0].clientY + touches[1].clientY) / 2

        zoomAtPoint(scaleAmount, midX, midY);

        initialPinchDistance.value = currentDist; // Update for next move
    }
}

const touchEndCleanup = (e: TouchEvent) => {
    isPanning.value = false;
    initialPinchDistance.value = 0;
}

const pan = (e: PointerEvent) => {
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
    zoomAtPoint(scaleAmount, e.clientX, e.clientY);
}

const zoomAtPoint = (scaleAmount: number, pointX: number, pointY: number) => {
    if (!nodeEditor.value) return;

    const newScale = Math.max(0.2, Math.min(2, transformState.value.scale + scaleAmount));
    const scaleRatio = newScale / transformState.value.scale;

    const rect = nodeEditor.value.getBoundingClientRect();
    const mouseX = pointX - rect.left;
    const mouseY = pointY - rect.top;

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
    touch-action: none;
}
.dark-theme .node-editor-container {
    background-image: radial-gradient(var(--clr-gray-700) 1px, transparent 1px);
}

.node-editor-container--is-panning {
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
