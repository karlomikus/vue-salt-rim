import BarAssistantClient from '@/api/BarAssistantClient'
import AppState from '@/AppState'

const useAuth = async (token: string): Promise<string> => {
    const appState = new AppState()
    appState.setToken(token)

    try {
        const profile = (await BarAssistantClient.getProfile())?.data
        if (!profile) {
            appState.forgetUser()
            return '/login'
        }

        appState.setUser(profile)

        if (profile.settings?.language) {
            appState.setLanguage(profile.settings.language)
        }

        if (profile.settings?.theme) {
            appState.setTheme(profile.settings.theme)
        }
    } catch (e: any) {
        appState.forgetUser()

        return '/login'
    }

    const [bars, serverInfo] = await Promise.all([
        BarAssistantClient.getBars(),
        BarAssistantClient.getServerVersion()
    ]);

    if (serverInfo?.data) {
        appState.setServerSettings(serverInfo.data.is_password_login_enabled, serverInfo.data.is_ai_enabled)
    }

    if (bars?.data?.length == 1) {
        appState.setBar(bars.data[0])

        return '/'
    } else {
        return '/bars'
    }
}

export { useAuth }