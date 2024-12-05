import { useEventBus } from '@vueuse/core'

const dialogBus = useEventBus<string>('dialogs')
const barBus = useEventBus<string>('bars')

export { dialogBus, barBus }