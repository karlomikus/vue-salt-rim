import { useEventBus } from '@vueuse/core'

const dialogBus = useEventBus<string>('dialogs')

export { dialogBus }