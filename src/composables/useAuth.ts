import BarAssistantClient from '@/api/BarAssistantClient'
import AppState from '@/AppState'

const useAuth = async (token: string): Promise<string> => {
    const appState = new AppState()
    appState.setToken(token)

    try {
        const profile = (await BarAssistantClient.getProfile())?.data
        appState.setUser(profile)
    } catch (e: any) {
        appState.forgetUser()

        return '/login'
    }

    const bars = (await BarAssistantClient.getBars())?.data

    if (bars?.length == 1) {
        appState.setBar(bars[0])

        return '/'
    } else {
        return '/bars'
    }
}

export { useAuth }