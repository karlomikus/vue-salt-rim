<template>
    <div
        class="salt-rim-skeleton sr-skeleton"
        :class="`salt-rim-skeleton--radius-${radiusClass}`"
        :style="skeletonStyle"
        aria-hidden="true"
    ></div>
</template>

<script setup lang="ts">
import { computed } from "vue";

type SkeletonRadius = "none" | 0 | 1 | 2 | 3 | 4 | "rounded";

interface SaltRimSkeletonProps {
    height?: number | string;
    index?: number;
    radius?: SkeletonRadius;
    width?: number | string;
}

const props = withDefaults(defineProps<SaltRimSkeletonProps>(), {
    height: "100%",
    index: 0,
    radius: 3,
    width: "100%",
});

const DELAY_TIME = 300;
const STAGGER_TIME = 100;

function toCssSize(value: number | string): string {
    return typeof value === "number" ? `${value}px` : value;
}

const radiusClass = computed(() => (props.radius === "rounded" ? "rounded" : props.radius === "none" ? "none" : String(props.radius)));

const borderRadius = computed(() => {
    if (props.radius === "none" || props.radius === 0) {
        return "0";
    }

    if (props.radius === "rounded") {
        return "var(--radius-round)";
    }

    return `var(--radius-${props.radius})`;
});

const animationDelay = computed(() => `${DELAY_TIME + STAGGER_TIME * props.index}ms`);

const skeletonStyle = computed(() => ({
    width: toCssSize(props.width),
    height: toCssSize(props.height),
    borderRadius: borderRadius.value,
    animationDelay: animationDelay.value,
    "--salt-rim-skeleton-delay": animationDelay.value,
}));
</script>

<style scoped>
@keyframes salt-rim-skeleton-shimmer {
    from {
        transform: translateX(-100%);
    }

    to {
        transform: translateX(100%);
    }
}

.salt-rim-skeleton {
    --salt-rim-skeleton-bg: var(--clr-gray-200);
    --salt-rim-skeleton-highlight: var(--clr-gray-100);
    position: relative;
    display: block;
    overflow: hidden;
    background: var(--salt-rim-skeleton-bg);
}

.salt-rim-skeleton::after {
    content: "";
    position: absolute;
    inset: 0;
    transform: translateX(-100%);
    animation: salt-rim-skeleton-shimmer 0.7s ease-in-out infinite;
    animation-delay: var(--salt-rim-skeleton-delay, 300ms);
    background: linear-gradient(90deg, transparent, var(--salt-rim-skeleton-highlight), transparent);
}

.dark-theme .salt-rim-skeleton {
    --salt-rim-skeleton-bg: var(--clr-gray-650);
    --salt-rim-skeleton-highlight: var(--clr-gray-600);
}

@media (prefers-reduced-motion: reduce) {
    .salt-rim-skeleton::after {
        animation: none;
        opacity: 0.35;
        transform: none;
    }
}
</style>
