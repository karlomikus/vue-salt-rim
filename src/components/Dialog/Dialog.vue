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
