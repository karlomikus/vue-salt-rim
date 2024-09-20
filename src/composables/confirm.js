import { dialogBus } from './eventBus'

export function useConfirm() {
    return {
        show(message, dialogOptions) {
            dialogBus.emit('requestConfirm', { body: message, ...dialogOptions })
        }
    }
}