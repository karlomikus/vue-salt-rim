import { useTitle as useVueTitle } from '@vueuse/core'
import AppState from '@/AppState'

const useTitle = (title: string) => {
    const appState = new AppState()

    useVueTitle(`${title} \u22C5 ${appState.bar.name ?? 'Bar Assistant'}`)
}

export { useTitle }