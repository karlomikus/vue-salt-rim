<template>
    <span @keyup.esc="handleEsc()">
        <slot name="trigger" :toggle-dialog="toggleDialog">
            <button type="button" class="button button--outline" @click.prevent="toggleDialog()">Trigger dialog</button>
        </slot>
        <Teleport to="body">
            <Transition name="dialog-animation">
                <div v-if="modelValue" class="dialog" :class="$attrs.class">
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

<script>
import CloseButton from '../CloseButton.vue'

export default {
    components: {
        CloseButton,
    },
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
