import { inject } from 'vue'

export function useConfirm() {
    const bus = inject('srEventBus')

    return {
        show(message, dialogOptions) {
            bus.emit('requestConfirm', { body: message, ...dialogOptions })
        }
    }
}