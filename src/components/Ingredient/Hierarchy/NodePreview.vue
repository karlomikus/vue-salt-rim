<template>
    <div class="node-editor-container block-container block-container--padded block-container--inset" ref="nodeEditor" @mousedown="startPan" @mousemove="pan" @mouseup="isPanning = false" @mouseleave="isPanning = false" @wheel="zoom">
        <div class="node-editor-canvas" ref="nodeCanvas">
            <svg id="connector-svg">
                <path v-for="path in paths" :d="path.definition" class="connector-path" :class="{'connector-path--hidden': path.isHidden}"></path>
            </svg>
            <template v-if="nodes.length > 0">
                <div v-for="node in nodes" :key="node.tree.ingredient.id" :id="`node-${node.tree.ingredient.id}`"
                     class="node-editor__node block-container"
                     :class="{
                         'highlighted': node.isHighlighted,
                         'node-editor__node--hidden': !node.isVisible,
                         'node-editor__node--has-children': node.childrenIds.length > 0,
                         'node-editor__node--is-open': node.isOpen
                     }"
                     :style="{ left: `${node.x}px`, top: `${node.y}px` }"
                     @click="toggleNode(node)">
                    <div class="label">{{ node.tree.ingredient.name }}</div>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, useTemplateRef } from 'vue'; // Added watch
import type { components } from '@/api/api'

type IngredientTree = components['schemas']['IngredientTree'];

interface Node {
    tree: IngredientTree;
    x: number;
    y: number;
    isOpen: boolean;
    isVisible: boolean;
    isHighlighted: boolean;
    childrenIds: number[];
}

interface NodeConnection {
    from: number;
    to: number;
}

interface Path {
    definition: string;
    isHidden: boolean;
}

const canvas = useTemplateRef<HTMLDivElement>('nodeCanvas');
const nodeEditor = useTemplateRef<HTMLDivElement>('nodeEditor');
const transformState = ref({ x: 0, y: 0, scale: 1 })
const isPanning = ref(false)
const panStart = ref({ x: 0, y: 0 })
const nodes = ref<Node[]>([])
const connections = ref<NodeConnection[]>([])
const paths = ref<Path[]>([]);

const rootNode = defineModel<IngredientTree>({
    required: true,
});

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

function positionIngredientNodes(tree: IngredientTree, openPath: number[]) {
    const localNodes: Node[] = [];
    const localConnections: NodeConnection[] = [];
    let yCursor = 0; // Tracks the y-position for leaf nodes

    const X_SPACING = 450;
    const Y_SPACING = 100;

    function traverse(treeNode: IngredientTree, parentId: number|null = null, depth: number = 0) {
        const nodeId = treeNode.ingredient.id;
        let yPos: number;
        const childrenYPositions: number[] = [];
        const childrenIds: number[] = [];

        // Recurse on children first to determine their positions
        if (treeNode.children && treeNode.children.length > 0) {
            treeNode.children.forEach(child => {
                const childData = traverse(child, nodeId, depth + 1);
                childrenYPositions.push(childData.y);
                childrenIds.push(childData.id);
            });
            yPos = (childrenYPositions[0] + childrenYPositions[childrenYPositions.length - 1]) / 2;
        } else {
            yPos = yCursor;
            yCursor += Y_SPACING;
        }

        // Determine visibility and open state based on the path
        const isInPath = openPath.includes(nodeId);
        const parentInPath = parentId ? openPath.includes(parentId) : false;

        // Add the current node to the array
        localNodes.push({
            tree: treeNode,
            x: depth * X_SPACING,
            y: yPos,
            isOpen: isInPath && childrenIds.length > 0,
            isVisible: depth === 0 || parentInPath,
            isHighlighted: isInPath,
            childrenIds: childrenIds,
        });

        // Add connection from parent if it exists
        if (parentId !== null) {
            localConnections.push({ from: parentId, to: nodeId });
        }

        return { y: yPos, id: nodeId };
    }

    traverse(tree);

    // Root node is open by default
    const firstNode = localNodes.find(n => n.tree.ingredient.id === rootNode.value.ingredient.id);
    if(firstNode) {
        firstNode.isOpen = true;
        firstNode.childrenIds.forEach(childId => {
            const childNode = localNodes.find(n => n.tree.ingredient.id === childId);
            if(childNode) childNode.isVisible = true;
        })
    }

    nodes.value = localNodes
    connections.value = localConnections
}

function buildConnectionPaths() {
    paths.value = []

    connections.value.forEach(conn => {
        const fromNode = nodes.value.find(n => n.tree.ingredient.id === conn.from);
        const toNode = nodes.value.find(n => n.tree.ingredient.id === conn.to);

        if (fromNode && toNode) {
            const p1 = getConnectorPosition(fromNode, 'right');
            const p2 = getConnectorPosition(toNode, 'left');

            const curveX = Math.abs(p2.x - p1.x) * 0.5;
            const d = `M ${p1.x} ${p1.y} C ${p1.x + curveX} ${p1.y}, ${p2.x - curveX} ${p2.y}, ${p2.x} ${p2.y}`;

            paths.value.push({
                definition: d,
                isHidden: !toNode.isVisible
            })
        }
    });
}

function getConnectorPosition(node: Node, side: string) {
    const nodeElement = document.getElementById(`node-${node.tree.ingredient.id}`);
    if (!nodeElement) return { x: 0, y: 0 };

    const x = node.x + (side === 'right' ? nodeElement.offsetWidth : 0);
    const y = node.y + nodeElement.offsetHeight / 2;

    return { x, y };
}

function toggleNode(node: Node) {
    node.isOpen = !node.isOpen;

    node.childrenIds.forEach(childId => {
        const childNode = nodes.value.find(n => n.tree.ingredient.id === childId);
        if (childNode) {
            // If we're opening this node, make its direct children visible
            if (node.isOpen) {
                childNode.isVisible = true;
            } else {
                // If we're closing this node, recursively hide all descendants
                hideDescendants(childNode);
            }
        }
    });

    nextTick(() => {
        buildConnectionPaths()
    })
}

function hideDescendants(node: Node) {
    // First hide this node
    node.isVisible = false;

    if (node.isOpen) {
        node.isOpen = false;
    }

    node.childrenIds.forEach(childId => hideDescendants(nodes.value.find(n => n.tree.ingredient.id === childId)!));
}

function initialize() {
    positionIngredientNodes(rootNode.value, [])
    nextTick(() => {
        buildConnectionPaths()
    })

    applyTransform()
}

onMounted(() => {
    initialize();
})
</script>

<style>
.node-editor-container {
    width: 100%;
    height: 100%;
    position: relative;
    background-image: radial-gradient(var(--clr-accent-200) 1px, transparent 1px);
    background-size: 20px 20px;
    overflow: hidden;
    border: 1px solid blue;
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
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    user-select: none;
    min-width: 100px;
    transition: box-shadow 0.2s ease-in-out;
    cursor: pointer;
}

.node-editor__node.node-editor__node--hidden {
    display: none;
}

.node-editor__node--has-children::after {
    content: '+';
    position: absolute;
    right: 10px;
    font-size: 1.25rem;
    color: var(--connector-color);
}

.node-editor__node--is-open.node-editor__node--has-children::after {
    content: '−';
}

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
</style>