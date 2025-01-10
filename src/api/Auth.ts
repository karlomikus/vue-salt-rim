import AppState from '@/AppState'
import BarAssistantClient from './BarAssistantClient'

type InitAppStateParameters = {
    token?: string
    redirectPath?: string
    appState: AppState
}

export const initAppState = async ({
    token,
    redirectPath,
    appState,
}: InitAppStateParameters): Promise<string> => {
    if (token) {
        appState.setToken(token)
    }

    const [profile, bars] = await Promise.all([
        BarAssistantClient.getProfile(),
        BarAssistantClient.getBars(),
    ])

    if (!profile) {
        throw new Error('Failed to fetch profile')
    }

    if (!bars) {
        throw new Error('Failed to fetch bars')
    }

    appState.setUser(profile.data)

    if (!redirectPath) {
        if (bars.data.length == 1) {
            appState.setBar(bars.data[0])
            redirectPath = '/'
        } else {
            redirectPath = '/bars'
        }
    }

    return redirectPath
}
