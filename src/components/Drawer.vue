<script lang="ts">
import { createGlobalState, useScrollLock } from "@vueuse/core";

const useSharedScrollLock = createGlobalState(() => useScrollLock(document.body));
let openDrawers = 0;
let previousOverflow = "";
</script>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import IconClose from "@/components/Icons/IconClose.vue";

defineOptions({ name: "SaltRimDrawer" });

withDefaults(defineProps<{ title: string; side?: "left" | "right" | "bottom" }>(), {
    side: "left",
});

const model = defineModel<boolean>({ default: false });
const { t } = useI18n();
const isScrollLocked = useSharedScrollLock();
const dialog = ref<HTMLDialogElement | null>(null);
let ownsScrollLock = false;

function lockScroll() {
    if (ownsScrollLock) return;
    if (openDrawers === 0) {
        previousOverflow = document.body.style.overflow;
        isScrollLocked.value = true;
    }
    openDrawers++;
    ownsScrollLock = true;
}

function unlockScroll() {
    if (!ownsScrollLock) return;
    ownsScrollLock = false;
    openDrawers--;
    if (openDrawers === 0) {
        isScrollLocked.value = false;
        document.body.style.overflow = previousOverflow;
    }
}

function close() {
    model.value = false;
}

function syncDialog() {
    if (!dialog.value) return;
    if (model.value) {
        if (!dialog.value.open) dialog.value.showModal();
        lockScroll();
    } else {
        if (dialog.value.open) dialog.value.close();
        unlockScroll();
    }
}

function onNativeClose() {
    if (!dialog.value?.open) {
        unlockScroll();
        close();
    }
}

watch(model, syncDialog, { flush: "post" });
onMounted(syncDialog);
onBeforeUnmount(() => {
    if (dialog.value?.open) dialog.value.close();
    unlockScroll();
});
</script>

<template>
    <Teleport to="body">
        <dialog ref="dialog" class="drawer" :class="`drawer--${side}`" :aria-label="title" @cancel.prevent="close" @close="onNativeClose" @click.self="close">
            <div class="drawer__panel" @touchmove.stop>
                <header class="drawer__header">
                    <h2 class="drawer__title">{{ title }}</h2>
                    <button type="button" class="drawer__close" :aria-label="t('close')" autofocus @click="close">
                        <IconClose aria-hidden="true" />
                    </button>
                </header>
                <div class="drawer__content">
                    <slot :close="close" />
                </div>
                <footer v-if="$slots.footer" class="drawer__footer">
                    <slot name="footer" :close="close" />
                </footer>
            </div>
        </dialog>
    </Teleport>
</template>

<style scoped>
.drawer {
    position: fixed;
    inset: 0 auto 0 0;
    width: min(22rem, 90vw);
    max-width: none;
    height: 100%;
    max-height: none;
    margin: 0;
    padding: 0;
    border: 0;
    background: var(--clr-gray-50);
    color: var(--clr-body-font);
    box-shadow: var(--shadow-elevation-high-dark);
}

.drawer--right {
    inset: 0 0 0 auto;
}

.drawer--bottom {
    inset: auto 0 0 0;
    width: 100%;
    height: auto;
    max-height: 90vh;
    border-radius: var(--radius-4) var(--radius-4) 0 0;
    padding-bottom: env(safe-area-inset-bottom);
    overflow: hidden;
}

.drawer--bottom .drawer__panel {
    height: auto;
    max-height: 90vh;
}

.drawer::backdrop {
    background: rgba(11, 5, 21, 0.65);
}

.dark-theme .drawer {
    background: var(--clr-gray-800);
}

.drawer__panel {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.drawer__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;
    border-bottom: 1px solid var(--clr-gray-200);
}

.drawer__title {
    font-size: 1.25rem;
    margin: 0;
}

.drawer__close {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    padding: 0;
    border: 0;
    border-radius: var(--radius-round);
    background: transparent;
    color: inherit;
    cursor: pointer;
}

.drawer__close:hover,
.drawer__close:focus-visible {
    background: var(--clr-gray-200);
}

.drawer__close svg {
    width: 24px;
    height: 24px;
}

.drawer__content {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 1rem;
}

.drawer__footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--gap-size-2);
    padding: 1rem;
    border-top: 1px solid var(--clr-gray-200);
}
</style>
