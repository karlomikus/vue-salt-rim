<template>
    <div class="modal-backdrop">
        <div class="modal">
            <section class="modal-body">
                <slot name="body">
                    Modal body
                </slot>
            </section>
            <footer class="modal-footer">
                <slot name="footer">
                    Modal footer
                </slot>
            </footer>
        </div>
    </div>
</template>

<script>
export default {
    methods: {
        cancel() {
            window.body.style.overflow = 'auto';
            this.$emit('close');
        },
    },
};
</script>
