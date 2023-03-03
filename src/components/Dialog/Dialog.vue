<template>
    <div @keyup.esc="handleEsc()">
        <slot name="trigger" :toggleDialog="toggleDialog">
            <button type="button" class="button button--outline" @click.prevent="toggleDialog()">Trigger dialog</button>
        </slot>
        <Teleport to="body">
            <Transition name="dialog-animation">
                <div class="dialog" v-if="modelValue">
                    <div class="dialog__overlay"></div>
                    <div class="dialog__content">
                        <slot name="dialog" :toggleDialog="toggleDialog" />
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script>
export default {
    props: {
        modelValue: {
            type: Boolean,
            default: false
        },
        closeOnEsc: {
            type: Boolean,
            default: true
        }
    },
    emits: ['update:modelValue'],
    methods: {
        toggleDialog() {
            this.$emit('update:modelValue', !this.modelValue)
        },
        handleEsc() {
            if (this.closeOnEsc) {
                this.$emit('update:modelValue', false)
            }
        }
    }
}
</script>

<style scoped>
.dialog {
    display: flex;
    inset: 0;
    pointer-events: none;
    position: fixed;
    align-items: center;
    justify-content: center;
    margin: auto;
    z-index: 500;
    transition: opacity 200ms ease, backdrop-filter 200ms ease;
}

.dialog-animation-enter-from,
.dialog-animation-leave-to {
    opacity: 0;
    backdrop-filter: blur(0)
}

.dialog__overlay {
    background-color: rgba(21, 13, 34, 0.6);
    position: fixed;
    inset: 0;
    pointer-events: auto;
    backdrop-filter: blur(2px);
}

.dialog__content {
    outline: none;
    position: absolute;
    pointer-events: auto;
    contain: layout;
    background-color: #fff;
    padding: 2rem;
    transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

.dialog-animation-enter-from .dialog__content,
.dialog-animation-leave-to .dialog__content {
    transform: translate(0, 2rem);
    opacity: 0;
}
</style>
