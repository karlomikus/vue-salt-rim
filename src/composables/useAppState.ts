import AppState from '@/AppState'

/**
 * Singleton instance of AppState
 * This ensures we only have one instance throughout the application
 */
let appStateInstance: AppState | null = null

/**
 * Composable for accessing the global AppState singleton
 * Prevents multiple instances of AppState being created
 * 
 * @returns The singleton AppState instance
 */
export function useAppState(): AppState {
    if (!appStateInstance) {
        appStateInstance = new AppState()
    }
    
    return appStateInstance
}
