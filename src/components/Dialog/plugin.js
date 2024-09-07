import { dialogBus } from '@/composables/eventBus'

export default {
    install: (app) => {
        app.config.globalProperties.$confirm = (message, dialogOptions) => {
            dialogBus.emit('requestConfirm', { body: message, ...dialogOptions })
        }
    }
}
