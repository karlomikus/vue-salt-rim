<template>
    <span @keyup.esc="handleEsc()">
        <slot name="trigger" :toggle-dialog="toggleDialog">
            <button type="button" class="button button--outline" @click.prevent="toggleDialog()">Trigger dialog</button>
        </slot>
        <Teleport to="body">
            <Transition name="dialog-animation">
                <div v-if="model" class="dialog" :class="attrs.class">
                    <div class="dialog__overlay"></div>
                    <div class="dialog__container">
                        <div class="dialog__content">
                            <CloseButton @closed="toggleDialog"></CloseButton>
                            <slot name="dialog" :toggle-dialog="toggleDialog" />
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </span>
</template>

<script setup lang="ts">
import { watch, onUnmounted, useAttrs } from "vue";
import CloseButton from "../CloseButton.vue";

defineOptions({ inheritAttrs: false });

const model = defineModel<boolean>({ default: false });
const props = withDefaults(defineProps<{ closeOnEsc?: boolean }>(), {
    closeOnEsc: true,
});
const emit = defineEmits<{ dialogOpened: []; dialogClosed: [] }>();
const attrs = useAttrs();

function toggleDialog() {
    model.value = !model.value;
}

function handleEsc() {
    if (props.closeOnEsc) {
        model.value = false;
    }
}

watch(model, (val) => {
    if (val) {
        emit("dialogOpened");
        document.body.style.overflow = "hidden";
    } else {
        emit("dialogClosed");
        document.body.style.overflow = "auto";
    }
});

onUnmounted(() => {
    emit("dialogClosed");
    document.body.style.overflow = "auto";
});
</script>
