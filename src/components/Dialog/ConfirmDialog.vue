<template>
    <Teleport to="body">
        <Transition name="dialog-animation">
            <div v-if="shown" class="dialog" style="z-index: 5;">
                <div class="dialog__overlay"></div>
                <div class="dialog__container">
                    <div class="dialog__content">
                        <div class="dialog-confirm">
                            <h6 class="dialog-confirm__title">{{ $t('confirm-dialog.title') }}</h6>
                            <p class="dialog-confirm__message">{{ body }}</p>
                            <div class="dialog-confirm__actions">
                                <button class="button button--small button--outline" @click.prevent="cancel">{{ $t('cancel') }}</button>
                                <button class="button button--small button--dark" @click.prevent="confirm">{{ $t('confirm') }}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script>
export default {
    data() {
        return {
            shown: false,
            resolve: null
        }
    },
    watch: {
        shown(val) {
            if (val) {
                document.body.style.overflow = 'hidden'
            } else {
                document.body.style.overflow = 'auto'
            }
        }
    },
    mounted() {
        this.$eventBus.on('requestConfirm', (payload) => this.show(payload))
    },
    methods: {
        show(payload) {
            this.body = payload.body
            this.resolve = payload.onResolved
            this.shown = true
        },
        confirm() {
            this.resolve(this)
        },
        cancel() {
            this.close()
        },
        close() {
            this.shown = false
        }
    }
}
</script>

<style scoped>
.dialog-confirm__title {
    font-size: 1.15rem;
    margin-bottom: 0.25rem;
    font-weight: var(--fw-bold);
}

.dialog-confirm__message {
    font-size: 1rem;
    color: var(--clr-gray-600);
}

.dialog-confirm__actions {
    display: flex;
    gap: 0.5rem;
    justify-content: end;
    margin-top: 1rem;
}

.dark-theme .dialog-confirm__title {
    color: var(--clr-gray-100);
}

.dark-theme .dialog-confirm__message {
    color: var(--clr-gray-300);
}
</style>
