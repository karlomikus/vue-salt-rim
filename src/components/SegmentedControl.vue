<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type CSSProperties } from "vue";

export type SegmentedControlValue = string | number | boolean | null;

export interface SegmentedControlOption {
    label?: string;
    text?: string;
    title?: string;
    value: SegmentedControlValue;
    disabled?: boolean;
}

const props = withDefaults(
    defineProps<{
        options?: Array<SegmentedControlOption | string | number | boolean>;
        items?: Array<SegmentedControlOption | string | number | boolean>;
        segments?: Array<SegmentedControlOption | string | number | boolean>;
        choices?: Array<SegmentedControlOption | string | number | boolean>;
        disabled?: boolean;
        label?: string;
        ariaLabel?: string;
    }>(),
    {
        options: () => [],
        items: () => [],
        segments: () => [],
        choices: () => [],
        disabled: false,
        label: undefined,
        ariaLabel: undefined,
    },
);

const modelValue = defineModel<SegmentedControlValue>({ required: false, default: null });

const emit = defineEmits<{
    change: [value: SegmentedControlValue];
}>();

const root = ref<HTMLElement | null>(null);
const segmentElements = ref<Array<HTMLElement | null>>([]);
const indicatorStyle = ref<CSSProperties>({ left: "0px", width: "0px" });
const previousIndicatorStyle = ref<CSSProperties | null>(null);
const crossfading = ref(false);
const isDragging = ref(false);
const pressedIndex = ref<number | null>(null);
const dragTargetIndex = ref<number | null>(null);
const isTouchInteraction = ref(false);
const isReducedMotion = ref(false);

let activePointerId: number | null = null;
let dragStartX = 0;
let dragIndicatorWidth = 0;
let dragMoved = false;
let suppressNextClick = false;
let crossfadeTimer: ReturnType<typeof setTimeout> | undefined;
let coarsePointerMedia: MediaQueryList | undefined;
let reducedMotionMedia: MediaQueryList | undefined;

const normalizedOptions = computed<SegmentedControlOption[]>(() => {
    const source = props.options.length
        ? props.options
        : props.items.length
          ? props.items
          : props.segments.length
            ? props.segments
            : props.choices;

    return source.map((option) => {
        if (typeof option === "object" && option !== null) {
            return {
                ...option,
                label: option.label ?? option.text ?? option.title ?? String(option.value),
            };
        }
        return {
            label: String(option),
            value: option,
        };
    });
});

const selectedIndex = computed(() => normalizedOptions.value.findIndex((option) => option.value === modelValue.value));
const tabbableIndex = computed(() => {
    if (selectedIndex.value >= 0 && !normalizedOptions.value[selectedIndex.value]?.disabled) {
        return selectedIndex.value;
    }
    const firstEnabled = normalizedOptions.value.findIndex((option) => !option.disabled);
    return firstEnabled >= 0 ? firstEnabled : -1;
});

function optionDisabled(option: SegmentedControlOption): boolean {
    return props.disabled || !!option.disabled;
}

function setSegmentElement(element: unknown, index: number): void {
    if (element instanceof HTMLElement) {
        segmentElements.value[index] = element;
    }
}

function getTrackRect(): DOMRect | null {
    return root.value?.getBoundingClientRect() ?? null;
}

function getIndicatorRect(index: number): { left: number; width: number } | null {
    const segment = segmentElements.value[index];
    const track = getTrackRect();
    if (!segment || !track) {
        return null;
    }

    const segmentRect = segment.getBoundingClientRect();
    return {
        left: segmentRect.left - track.left,
        width: segmentRect.width,
    };
}

async function updateIndicator(animated = true): Promise<void> {
    await nextTick();

    if (isDragging.value) {
        return;
    }

    const index = selectedIndex.value;
    if (index < 0) {
        return;
    }

    const position = getIndicatorRect(index);
    if (!position) {
        return;
    }

    if (!animated) {
        root.value?.classList.add("segmented-control--updating");
    }
    indicatorStyle.value = {
        left: `${position.left}px`,
        width: `${position.width}px`,
    };

    if (!animated) {
        requestAnimationFrame(() => root.value?.classList.remove("segmented-control--updating"));
    }
}

function findIndexAtClientX(clientX: number): number {
    const options = normalizedOptions.value;
    if (options.length === 0) {
        return -1;
    }

    for (let index = 0; index < options.length; index++) {
        const element = segmentElements.value[index];
        if (!element) {
            continue;
        }
        const rect = element.getBoundingClientRect();
        if (clientX >= rect.left && clientX <= rect.right) {
            return index;
        }
    }

    const track = getTrackRect();
    if (track) {
        if (clientX < track.left) {
            return 0;
        }
        if (clientX > track.right) {
            return options.length - 1;
        }
    }

    return Math.max(0, Math.min(options.length - 1, selectedIndex.value));
}

function commitOption(index: number): void {
    const option = normalizedOptions.value[index];
    if (!option || optionDisabled(option)) {
        return;
    }

    if (option.value !== modelValue.value) {
        modelValue.value = option.value;
        emit("change", option.value);
    }
}

function onSegmentClick(index: number): void {
    if (suppressNextClick) {
        suppressNextClick = false;
        return;
    }

    commitOption(index);
}

function onPointerDown(event: PointerEvent, index: number): void {
    const option = normalizedOptions.value[index];
    if (!option || optionDisabled(option)) {
        return;
    }

    const pointerIsTouch = event.pointerType === "touch" || (!!coarsePointerMedia?.matches && event.pointerType !== "pen" && event.pointerType !== "mouse");
    isTouchInteraction.value = pointerIsTouch;

    if (index === selectedIndex.value) {
        const track = getTrackRect();
        const segment = segmentElements.value[index];
        if (!track || !segment) {
            return;
        }

        activePointerId = event.pointerId;
        dragStartX = event.clientX;
        dragMoved = false;
        suppressNextClick = false;
        isDragging.value = true;
        dragTargetIndex.value = index;
        dragIndicatorWidth = segment.getBoundingClientRect().width;

        if (pointerIsTouch) {
            pressedIndex.value = index;
        }

        try {
            segment.setPointerCapture?.(event.pointerId);
        } catch {
            // Pointer capture may be unavailable in some embedded environments.
        }
    } else if (pointerIsTouch) {
        activePointerId = event.pointerId;
        pressedIndex.value = index;

        const segment = segmentElements.value[index];
        try {
            segment?.setPointerCapture?.(event.pointerId);
        } catch {
            // Pointer capture may be unavailable in some embedded environments.
        }
    }
}

function onPointerMove(event: PointerEvent): void {
    if (!isDragging.value || activePointerId !== event.pointerId) {
        return;
    }

    const track = getTrackRect();
    if (!track) {
        return;
    }

    if (Math.abs(event.clientX - dragStartX) > 2) {
        dragMoved = true;
    }

    const targetIndex = findIndexAtClientX(event.clientX);
    dragTargetIndex.value = targetIndex >= 0 ? targetIndex : selectedIndex.value;

    const clampedLeft = Math.max(0, Math.min(track.width - dragIndicatorWidth, event.clientX - track.left - dragIndicatorWidth / 2));
    indicatorStyle.value = {
        left: `${clampedLeft}px`,
        width: `${dragIndicatorWidth}px`,
    };
}

function endPointerDrag(event: PointerEvent): void {
    if (activePointerId !== event.pointerId) {
        return;
    }

    const wasDragging = isDragging.value;
    const pressedSegmentIndex = pressedIndex.value;
    const targetIndex = findIndexAtClientX(event.clientX);

    if (wasDragging && dragMoved) {
        suppressNextClick = true;
        const finalIndex = targetIndex >= 0 ? targetIndex : selectedIndex.value;
        commitOption(finalIndex);
    }

    if (wasDragging) {
        isDragging.value = false;
        dragTargetIndex.value = null;
    }
    pressedIndex.value = null;

    try {
        const capturedIndex = wasDragging ? selectedIndex.value : pressedSegmentIndex;
        const segment = capturedIndex !== null ? segmentElements.value[capturedIndex] : null;
        if (segment?.hasPointerCapture?.(event.pointerId)) {
            segment.releasePointerCapture?.(event.pointerId);
        }
    } catch {
        // Pointer capture may be unavailable in some embedded environments.
    }

    activePointerId = null;

    if (!wasDragging || !dragMoved) {
        void updateIndicator();
    } else {
        void updateIndicator();
    }
}

function onPointerCancel(event: PointerEvent): void {
    if (activePointerId !== event.pointerId) {
        return;
    }

    isDragging.value = false;
    dragTargetIndex.value = null;
    pressedIndex.value = null;
    activePointerId = null;
    suppressNextClick = false;
    void updateIndicator();
}

function onPointerUp(event: PointerEvent): void {
    endPointerDrag(event);
}

function onPointerLeave(index: number, event: PointerEvent): void {
    if (!isTouchInteraction.value && pressedIndex.value === index && activePointerId !== event.pointerId) {
        pressedIndex.value = null;
    }
}

function cancelDrag(): void {
    if (!isDragging.value && pressedIndex.value === null) {
        return;
    }

    isDragging.value = false;
    dragTargetIndex.value = null;
    pressedIndex.value = null;
    suppressNextClick = false;
    activePointerId = null;
    void updateIndicator(false);
}

function onKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
        cancelDrag();
        event.preventDefault();
        return;
    }

    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key) && !props.disabled) {
        event.preventDefault();

        const enabledIndexes = normalizedOptions.value
            .map((option, index) => (!optionDisabled(option) ? index : -1))
            .filter((index) => index >= 0);
        if (enabledIndexes.length === 0) {
            return;
        }

        const current = enabledIndexes.includes(selectedIndex.value)
            ? selectedIndex.value
            : enabledIndexes[0];
        let enabledPosition = enabledIndexes.indexOf(current);

        if (event.key === "Home") {
            enabledPosition = 0;
        } else if (event.key === "End") {
            enabledPosition = enabledIndexes.length - 1;
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
            enabledPosition = (enabledPosition - 1 + enabledIndexes.length) % enabledIndexes.length;
        } else {
            enabledPosition = (enabledPosition + 1) % enabledIndexes.length;
        }

        const nextIndex = enabledIndexes[enabledPosition];
        commitOption(nextIndex);
        nextTick(() => segmentElements.value[nextIndex]?.focus({ preventScroll: true }));
    }
}

function handleWindowKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
        cancelDrag();
    }
}

watch(
    () => modelValue.value,
    async () => {
        await nextTick();

        if (isReducedMotion.value) {
            const oldStyle = { ...indicatorStyle.value };
            await updateIndicator(false);
            const newStyle = { ...indicatorStyle.value };

            if (oldStyle.left !== newStyle.left || oldStyle.width !== newStyle.width) {
                if (crossfadeTimer) {
                    clearTimeout(crossfadeTimer);
                }
                previousIndicatorStyle.value = oldStyle;
                crossfading.value = false;
                await nextTick();
                crossfading.value = true;
                crossfadeTimer = setTimeout(() => {
                    previousIndicatorStyle.value = null;
                    crossfading.value = false;
                }, 180);
            }
        } else {
            await updateIndicator(true);
        }
    },
);

watch(
    () => [props.options, props.items, props.segments, props.choices],
    () => void updateIndicator(),
);

function updatePointerMedia(): void {
    isReducedMotion.value = !!reducedMotionMedia?.matches;
}

function handleResize(): void {
    void updateIndicator(!isDragging.value);
}

onMounted(() => {
    void updateIndicator(false);

    coarsePointerMedia = typeof window.matchMedia === "function" ? window.matchMedia("(pointer: coarse)") : undefined;
    reducedMotionMedia = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : undefined;

    updatePointerMedia();
    coarsePointerMedia?.addEventListener?.("change", updatePointerMedia);
    reducedMotionMedia?.addEventListener?.("change", updatePointerMedia);

    window.addEventListener("keydown", handleWindowKeydown);
    window.addEventListener("resize", handleResize);

    if (typeof ResizeObserver !== "undefined" && root.value) {
        resizeObserver = new ResizeObserver(() => void updateIndicator(isDragging.value ? false : true));
        resizeObserver.observe(root.value);
        segmentElements.value.forEach((element) => element && resizeObserver?.observe(element));
    }
});

let resizeObserver: ResizeObserver | undefined;

onBeforeUnmount(() => {
    coarsePointerMedia?.removeEventListener?.("change", updatePointerMedia);
    reducedMotionMedia?.removeEventListener?.("change", updatePointerMedia);
    window.removeEventListener("keydown", handleWindowKeydown);
    window.removeEventListener("resize", handleResize);
    resizeObserver?.disconnect();
    if (crossfadeTimer) {
        clearTimeout(crossfadeTimer);
    }
});
</script>

<template>
    <div
        v-bind="$attrs"
        ref="root"
        class="segmented-control"
        :class="{
            'segmented-control--disabled': disabled,
            'segmented-control--dragging': isDragging,
            'segmented-control--reduced-motion': isReducedMotion,
        }"
        role="radiogroup"
        :aria-label="ariaLabel || label || undefined"
        :aria-disabled="disabled ? 'true' : undefined"
        @keydown="onKeydown"
    >
        <span
            v-if="previousIndicatorStyle"
            class="segmented-control__indicator segmented-control__indicator--previous"
            :class="{ 'is-crossfading': crossfading }"
            :style="previousIndicatorStyle"
            aria-hidden="true"
        ></span>
        <span
            class="segmented-control__indicator"
            :class="{ 'is-crossfading': crossfading }"
            :style="indicatorStyle"
            aria-hidden="true"
        ></span>

        <button
            v-for="(option, index) in normalizedOptions"
            :key="String(option.value)"
            :ref="(element) => setSegmentElement(element, index)"
            type="button"
            role="radio"
            class="segmented-control__segment"
            :class="{
                'segmented-control__segment--selected': isDragging ? dragTargetIndex === index : selectedIndex === index,
                'segmented-control__segment--drag-target': isDragging && dragTargetIndex === index,
                'segmented-control__segment--pressed': isTouchInteraction && pressedIndex === index,
                'segmented-control__segment--pressed-selected': isTouchInteraction && pressedIndex === index && selectedIndex === index,
                'segmented-control__segment--pressed-unselected': isTouchInteraction && pressedIndex === index && selectedIndex !== index,
            }"
            :aria-checked="selectedIndex === index ? 'true' : 'false'"
            :aria-disabled="optionDisabled(option) ? 'true' : undefined"
            :disabled="optionDisabled(option)"
            :tabindex="tabbableIndex === index ? 0 : -1"
            :data-value="String(option.value)"
            :data-index="index"
            @pointerdown="onPointerDown($event, index)"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointercancel="onPointerCancel"
            @pointerleave="onPointerLeave(index, $event)"
            @click="onSegmentClick(index)"
        >
            <span class="segmented-control__label"><slot :option="option" :selected="isDragging ? dragTargetIndex === index : selectedIndex === index">{{ option.label }}</slot></span>
        </button>
    </div>
</template>

<style scoped>
.segmented-control {
    --segmented-control-duration: var(--motion-duration, 180ms);
    --segmented-control-easing: var(--motion-easing, cubic-bezier(0.2, 0, 0, 1));
    --segmented-control-clr-bg: var(--clr-gray-100);
    --segmented-control-clr-indicator: #fff;
    --segmented-control-clr-label: var(--clr-gray-700);
    --segmented-control-clr-selected: var(--clr-gray-950);
    --segmented-control-clr-pressed: rgba(143, 66, 119, 0.12);

    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(0, 1fr);
    isolation: isolate;
    width: fit-content;
    min-width: 0;
    padding: 3px;
    border-radius: var(--radius-3);
    background: var(--segmented-control-clr-bg);
    box-shadow: inset 0 0 0 1px rgba(29, 27, 27, 0.06);
    user-select: none;
    -webkit-tap-highlight-color: transparent;
}

.dark-theme .segmented-control {
    --segmented-control-clr-bg: rgba(0, 0, 0, 0.2);
    --segmented-control-clr-indicator: var(--clr-gray-650);
    --segmented-control-clr-label: var(--clr-gray-300);
    --segmented-control-clr-selected: var(--clr-gray-50);
    --segmented-control-clr-pressed: rgba(255, 175, 55, 0.14);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
}

.segmented-control__indicator {
    position: absolute;
    z-index: 0;
    top: 3px;
    bottom: 3px;
    border-radius: calc(var(--radius-3) - 2px);
    background: var(--segmented-control-clr-indicator);
    box-shadow:
        0 1px 2px rgba(29, 27, 27, 0.12),
        0 1px 1px rgba(29, 27, 27, 0.06);
    transition:
        left var(--segmented-control-duration) var(--segmented-control-easing),
        width var(--segmented-control-duration) var(--segmented-control-easing);
    pointer-events: none;
}

.segmented-control--dragging .segmented-control__indicator,
.segmented-control--updating .segmented-control__indicator {
    transition: none;
}

.segmented-control__indicator--previous {
    z-index: 0;
}

.segmented-control__segment {
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 3rem;
    min-height: 2.25rem;
    padding: 0.45rem 0.75rem;
    border: 0;
    border-radius: calc(var(--radius-3) - 2px);
    background: transparent;
    color: var(--segmented-control-clr-label);
    cursor: pointer;
    font-weight: var(--fw-bold);
    line-height: 1.2;
    outline: none;
    touch-action: none;
    transition:
        color var(--segmented-control-duration) var(--segmented-control-easing),
        transform var(--segmented-control-duration) var(--segmented-control-easing),
        background-color var(--segmented-control-duration) var(--segmented-control-easing);
}

.segmented-control__label {
    pointer-events: none;
}

.segmented-control__segment:focus-visible {
    outline: 0.15rem solid rgba(122, 77, 194, 0.3);
    outline-offset: 1px;
}

.segmented-control__segment--selected,
.segmented-control__segment--drag-target {
    color: var(--segmented-control-clr-selected);
}

.segmented-control__segment--pressed-selected {
    z-index: 2;
    transform: translateY(-2px);
}

.segmented-control__segment--pressed-unselected::before {
    content: "";
    position: absolute;
    z-index: -1;
    inset: 0;
    border-radius: inherit;
    background: var(--segmented-control-clr-pressed);
}

.segmented-control__segment[disabled] {
    cursor: default;
    opacity: 0.5;
}

.segmented-control--disabled {
    cursor: default;
}

.segmented-control--disabled .segmented-control__segment {
    cursor: default;
}

.segmented-control--reduced-motion .segmented-control__indicator {
    transition:
        opacity var(--segmented-control-duration) linear,
        left 0s,
        width 0s;
}

.segmented-control--reduced-motion .segmented-control__segment {
    transition:
        color 0s,
        transform 0s,
        background-color 0s;
}

.segmented-control__indicator.is-crossfading:not(.segmented-control__indicator--previous) {
    animation: segmented-control-fade-in var(--segmented-control-duration) linear;
}

.segmented-control__indicator--previous.is-crossfading {
    animation: segmented-control-fade-out var(--segmented-control-duration) linear;
}

@keyframes segmented-control-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes segmented-control-fade-out {
    from { opacity: 1; }
    to { opacity: 0; }
}

</style>
