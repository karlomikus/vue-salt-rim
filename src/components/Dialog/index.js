import { h, render } from 'vue'
import Dialog from './Dialog.vue'

export default {
    customConfirm(message, options) {
        const d = h(Dialog, {body: message, ...options});
        const container = document.createElement('div');

        document.body.appendChild(container);

        render(d, container)

        return d;
    }
}
