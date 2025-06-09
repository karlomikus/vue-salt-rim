<template>
    <!-- <pre>
        debug: {{ transformState }}
    </pre> -->
    <div class="node-editor-container block-container block-container--padded block-container--inset" ref="nodeEditor" @mousedown="startPan" @mousemove="pan" @mouseup="isPanning = false" @mouseleave="isPanning = false" @wheel="zoom">
        <div class="node-editor-canvas" ref="nodeCanvas">
            <svg id="connector-svg" ref="connectorSvg"></svg>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from 'vue'; // Added watch
import type { components } from '@/api/api'

type IngredientTree = components['schemas']['IngredientTree'];

interface Node {
    tree: IngredientTree;
    x: number;
    y: number;
    isOpen: boolean;
    isVisible: boolean;
    childrenIds: number[];
    el: HTMLDivElement | null; // Reference to the DOM element for this node
}

interface NodeConnection {
    from: number;
    to: number;
}

const canvas = useTemplateRef<HTMLDivElement>('nodeCanvas');
const nodeEditor = useTemplateRef<HTMLDivElement>('nodeEditor');
const connectorSvg = useTemplateRef<HTMLDivElement>('connectorSvg');
const transformState = ref({ x: 0, y: 0, scale: 1 })
const isPanning = ref(false)
const panStart = ref({ x: 0, y: 0 })
const nodes = ref<Node[]>([])
const connections = ref<NodeConnection[]>([])

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

function flattenAndPositionTree(tree: IngredientTree) {
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

        // Add the current node to the array
        localNodes.push({
            tree: treeNode,
            x: depth * X_SPACING,
            y: yPos,
            isOpen: false,
            isVisible: depth === 0,
            childrenIds: childrenIds,
            el: null // Will be set when creating the DOM element
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

    return { nodes: localNodes, connections: localConnections };
}

function drawConnections(nodes: Node[], connections: NodeConnection[]) {
    if (!canvas.value || !connectorSvg.value) return;

    connectorSvg.value.innerHTML = ''; // Clear all paths
    connections.forEach(conn => {
        const fromNode = nodes.find(n => n.tree.ingredient.id === conn.from);
        const toNode = nodes.find(n => n.tree.ingredient.id === conn.to);

        if (fromNode && toNode && fromNode.el && toNode.el) {
            const p1 = getConnectorPosition(fromNode, 'right');
            const p2 = getConnectorPosition(toNode, 'left');
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const curveX = Math.abs(p2.x - p1.x) * 0.5;
            const d = `M ${p1.x} ${p1.y} C ${p1.x + curveX} ${p1.y}, ${p2.x - curveX} ${p2.y}, ${p2.x} ${p2.y}`;
            
            path.setAttribute('d', d);
            path.setAttribute('class', 'connector-path');
            
            // Hide path if target node is not visible
            if (!toNode.isVisible) {
                path.classList.add('hidden');
            }

            connectorSvg.value!.appendChild(path);
        }
    });
}

function getConnectorPosition(node: Node, side: string) {
    const nodeEl = node.el;
    if (!nodeEl) return { x: 0, y: 0 };
    
    const x = node.x + (side === 'right' ? nodeEl.offsetWidth : 0);
    const y = node.y + nodeEl.offsetHeight / 2;
    return { x, y };
}

function createNode(nodeData: Node) {
    if (!canvas.value) {
        throw new Error('Canvas element is not available');
    }

    const nodeEl = document.createElement('div');
    nodeEl.id = `node-${nodeData.tree.ingredient.id}`;
    nodeEl.className = 'node-editor__node block-container';
    if (!nodeData.isVisible) nodeEl.classList.add('node-editor__node--hidden');
    if (nodeData.childrenIds.length > 0) nodeEl.classList.add('node-editor__node--has-children');
    if (nodeData.isOpen) nodeEl.classList.add('node-editor__node--is-open');
    nodeEl.style.left = `${nodeData.x}px`;
    nodeEl.style.top = `${nodeData.y}px`;

    const labelHTML = `<div class="label">${nodeData.tree.ingredient.name}</div>`;

    nodeEl.addEventListener('click', () => toggleNode(nodeData));
    nodeEl.innerHTML = labelHTML;

    canvas.value.appendChild(nodeEl);
    nodeData.el = nodeEl;

    return { ...nodeData, el: nodeEl };
}

function toggleNode(node: Node) {
    node.isOpen = !node.isOpen;
    node.el!.classList.toggle('node-editor__node--is-open');

    node.childrenIds.forEach(childId => {
        const childNode = nodes.value.find(n => n.tree.ingredient.id === childId);
        if (childNode) {
            // If we're opening this node, make its direct children visible
            if (node.isOpen) {
                childNode.isVisible = true;
                childNode.el!.classList.remove('node-editor__node--hidden');
            } else {
                // If we're closing this node, recursively hide all descendants
                hideDescendants(childNode.tree.ingredient.id);
            }
        }
    });

    drawConnections(nodes.value, connections.value);
}

function hideDescendants(nodeId: number) {
    const node = nodes.value.find(n => n.tree.ingredient.id === nodeId);
    if (!node) return;

    // First hide this node
    node.isVisible = false;
    node.el!.classList.add('node-editor__node--hidden');
    
    // If the node was open, mark it as closed
    if (node.isOpen) {
        node.isOpen = false;
        node.el!.classList.remove('node-editor__node--is-open');
    }

    node.childrenIds.forEach(childId => hideDescendants(childId));
}

function render() {
    const stru = flattenAndPositionTree(rootNode.value);
    nodes.value = stru.nodes.map(createNode)
    connections.value = stru.connections;
    drawConnections(nodes.value, connections.value);
    applyTransform()
}

onMounted(() => {
    render();
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
    transition: opacity 0.3s ease;
}

.connector-path.hidden {
    opacity: 0;
}
</style>