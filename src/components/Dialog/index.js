import { h, render } from 'vue'
import ConfirmDialog from './ConfirmDialog.vue'

export default {
    customConfirm(message, options) {
        const d = h(ConfirmDialog, {body: message, ...options});
        const container = document.createElement('div');

        document.body.appendChild(container);

        render(d, container)

        return d;
    }
}
