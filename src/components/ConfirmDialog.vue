<template>
    <Modal class="confirm-modal" v-show="isShown">
        <template #body>
            {{ text }}
            <br>
            You can't undo this action!
        </template>
        <template #footer>
            <button type="button" class="button button--outline" @click="cancel" style="margin-right: 10px;">Cancel</button>
            <button type="button" class="button button--red" @click="save" :disabled="isLoading">Confirm</button>
        </template>
    </Modal>
</template>

<script>
import Modal from '@/components/Modal.vue'
import OverlayLoader from '@/components/OverlayLoader.vue'

export default {
    props: ['text'],
    data() {
        return {
            isLoading: false,
            isShown: true,
        }
    },
    components: {
        Modal,
        OverlayLoader
    },
    methods: {
        cancel() {
            this.isShown = false
        },
    },
};
</script>

<style>
.confirm-modal .modal-body {
    text-align: center;
}
</style>
