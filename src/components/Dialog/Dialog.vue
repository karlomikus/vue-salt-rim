<template>
    <DialogOverlay>
        <div class="dialog-confirm">
            <h6 class="dialog-confirm__title">Are you sure?</h6>
            <p class="dialog-confirm__message">{{ body }}</p>
            <div class="dialog-confirm__actions">
                <button class="button button--small button--outline" @click.prevent="cancel">Cancel</button>
                <button class="button button--small button--dark" @click.prevent="confirm">Confirm</button>
            </div>
        </div>
    </DialogOverlay>
</template>

<script>
import DialogOverlay from "./DialogOverlay.vue";

export default {
    props: {
        body: {
            type: String,
            default: 'This will permanently delete this resource.'
        }
    },
    components: {
        DialogOverlay
    },
    methods: {
        confirm() {
            this.$emit('confirmed', { close: this.close })
        },
        cancel() {
            this.close()
        },
        close() {
            this.$root.$el.remove(this.$root.$el);
        }
    }
}
</script>

<style scoped>
.dialog-confirm {
    background-color: #fff;
    border-radius: 0.25rem;
    padding: 1.5rem;
    max-width: 500px;
}

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
</style>
