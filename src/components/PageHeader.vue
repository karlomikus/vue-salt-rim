<template>
    <header class="site-page-header" :class="{ 'site-page-header--has-primary-actions': $slots['primary-actions'] }" @keydown.esc="showActions = false">
        <div class="site-page-header__title">
            <h2><slot /></h2>
        </div>
        <div v-if="$slots['primary-actions']" class="site-page-header__primary-actions">
            <slot name="primary-actions" />
        </div>
        <div v-if="$slots.actions" class="site-page-header__actions" :class="{ 'site-page-header__actions--open': showActions }" @click="onActionClick">
            <slot name="actions" />
        </div>
        <template v-if="$slots.actions">
            <OverlayScrim v-if="showActions" class="site-page-header__scrim" @dismiss="showActions = false" />
            <button
                type="button"
                class="site-page-header__fab"
                :class="{ 'site-page-header__fab--open': showActions }"
                :aria-label="$t('actions')"
                aria-haspopup="true"
                :aria-expanded="showActions"
                @click="showActions = !showActions"
            >
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path class="site-page-header__fab-line site-page-header__fab-line--top" d="M4 6h16v2H4z" />
                    <path class="site-page-header__fab-line site-page-header__fab-line--middle" d="M4 11h16v2H4z" />
                    <path class="site-page-header__fab-line site-page-header__fab-line--bottom" d="M4 16h16v2H4z" />
                </svg>
            </button>
        </template>
    </header>
</template>

<script setup lang="ts">
import { ref } from "vue";
import OverlayScrim from "@/components/OverlayScrim.vue";

const showActions = ref(false);

function onActionClick(event: MouseEvent) {
    const target = event.target as HTMLElement | null;
    const dropdownTrigger = target?.closest(".dropdown-wrapper")?.firstElementChild;

    // Keep the FAB menu open while a desktop dropdown is being opened. Mobile
    // dropdown contents are promoted into the FAB menu and close it normally.
    if (target && dropdownTrigger?.contains(target)) {
        return;
    }

    showActions.value = false;
}
</script>

<style scoped>
.site-page-header {
    --sph-clr-border: var(--clr-accent-200);
    display: flex;
    flex-wrap: wrap;
    /* border-bottom: 3px double var(--sph-clr-border); */
    padding-bottom: 1rem;
}

.dark-theme .site-page-header {
    --sph-clr-border: var(--clr-gray-800);
}

.site-page-header__title h2 {
    font-family: var(--font-heading);
    font-weight: var(--fw-bold);
    font-size: 1.8em;
    line-height: 1.2;
}

:deep(.site-page-header__title small) {
    font-family: var(--font-primary);
    font-size: 0.4em;
    color: var(--clr-gray-700);
    display: block;

    .dark-theme & {
        color: var(--clr-gray-400);
    }
}

.site-page-header__primary-actions,
.site-page-header__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-size-3);
}

.site-page-header__primary-actions {
    margin-left: auto;
    flex-shrink: 0;
}

.site-page-header__actions {
    margin-left: auto;
}

.site-page-header__primary-actions + .site-page-header__actions {
    margin-left: var(--gap-size-3);
}

.site-page-header__fab,
.site-page-header__scrim {
    display: none;
}

@media (max-width: 450px) {
    .site-page-header {
        flex-direction: column;
        gap: var(--gap-size-2);
    }

    .site-page-header__actions {
        margin-left: 0;
        gap: var(--gap-size-2);
    }

    .site-page-header--has-primary-actions {
        flex-direction: row;
        align-items: flex-start;
    }

    .site-page-header--has-primary-actions .site-page-header__title {
        min-width: 0;
        flex: 1;
    }

    .site-page-header__primary-actions {
        gap: var(--gap-size-1);
        margin-left: var(--gap-size-2);
    }
}

@media (max-width: 750px) {
    .site-page-header__actions {
        position: fixed;
        right: 1rem;
        bottom: calc(4.75rem + 56px + 1rem + env(safe-area-inset-bottom));
        z-index: 4;
        flex-direction: column;
        align-items: flex-end;
        flex-wrap: nowrap;
        max-height: calc(100dvh - 10rem - env(safe-area-inset-bottom));
        overflow-y: auto;
        overscroll-behavior: contain;
        gap: var(--gap-size-2);
        margin: 0;
        visibility: hidden;
        opacity: 0;
        transform: translateY(0.5rem);
        pointer-events: none;
        transition:
            opacity 150ms ease,
            transform 150ms ease,
            visibility 150ms;
    }

    .site-page-header__actions--open {
        visibility: visible;
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
    }

    .site-page-header__actions :deep(.button) {
        box-shadow: var(--shadow-elevation-medium);
    }

    .site-page-header__actions :deep(.dropdown-wrapper > div:first-child) {
        display: none;
    }

    .site-page-header__actions :deep(.dropdown-wrapper > .floating-element) {
        position: static !important;
        display: block !important;
        width: min(270px, calc(100vw - 2rem));
        transform: none !important;
    }

    .site-page-header__actions :deep(.dropdown-menu) {
        max-height: none;
        overflow: visible;
    }

    .site-page-header__fab {
        position: fixed;
        right: 1rem;
        bottom: calc(4.75rem + env(safe-area-inset-bottom) + 0.5rem);
        z-index: 4;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 56px;
        height: 56px;
        padding: 0;
        border: 0;
        border-radius: var(--radius-3);
        background-color: var(--clr-purple-700);
        color: var(--clr-purple-100);
        cursor: pointer;
        transition:
            background-color 150ms ease,
            transform 150ms ease;
    }

    .site-page-header__fab svg {
        width: 40px;
        height: 40px;
        fill: currentColor;
    }

    .site-page-header__fab-line {
        transform-box: fill-box;
        transform-origin: center;
        transition:
            transform 200ms ease,
            opacity 200ms ease;
    }

    .site-page-header__fab:is(:hover, :focus-visible) {
        background-color: var(--clr-purple-900);
    }

    .site-page-header__fab--open {
        background-color: var(--clr-purple-900);
    }

    .site-page-header__fab--open .site-page-header__fab-line--top {
        transform: translateY(5px) rotate(45deg);
    }

    .site-page-header__fab--open .site-page-header__fab-line--middle {
        opacity: 0;
    }

    .site-page-header__fab--open .site-page-header__fab-line--bottom {
        transform: translateY(-5px) rotate(-45deg);
    }

    .dark-theme .site-page-header__fab {
        background-color: var(--clr-accent-500);
        color: var(--clr-gray-800);
    }

    .dark-theme .site-page-header__fab:is(:hover, :focus-visible),
    .dark-theme .site-page-header__fab--open {
        background-color: var(--clr-accent-400);
    }

    .site-page-header__scrim {
        --scrim-z-index: 3;
        display: block;
    }
}

.site-page-header :deep(p) {
    font-size: 1rem;
    color: var(--clr-gray-500);
}
</style>
