import { dialogBus } from './eventBus'

export function useConfirm() {
    return {
        show(message: string, dialogOptions: object): void {
            dialogBus.emit('requestConfirm', { body: message, ...dialogOptions })
        }
    }
}