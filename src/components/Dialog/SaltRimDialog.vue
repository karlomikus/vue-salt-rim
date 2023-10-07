<template>
    <div @keyup.esc="handleEsc()">
        <slot name="trigger" :toggle-dialog="toggleDialog">
            <button type="button" class="button button--outline" @click.prevent="toggleDialog()">Trigger dialog</button>
        </slot>
        <Teleport to="body">
            <Transition name="dialog-animation">
                <div v-if="modelValue" class="dialog" :class="$attrs.class">
                    <div class="dialog__overlay"></div>
                    <div class="dialog__container">
                        <div class="dialog__content">
                            <button class="dialog__close" type="button" @click.prevent="toggleDialog">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z" /><path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" /></svg>
                            </button>
                            <slot name="dialog" :toggle-dialog="toggleDialog" />
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script>
export default {
    inheritAttrs: false,
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
    emits: ['update:modelValue', 'dialogOpened', 'dialogClosed'],
    watch: {
        modelValue(val) {
            if (val) {
                this.$emit('dialogOpened')
                document.body.style.overflow = 'hidden'
            } else {
                this.$emit('dialogClosed')
                document.body.style.overflow = 'auto'
            }
        }
    },
    unmounted() {
        this.$emit('dialogClosed')
        document.body.style.overflow = 'auto'
    },
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
