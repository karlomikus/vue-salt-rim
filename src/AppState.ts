import type { components } from "./api/api"

type Bar = components["schemas"]["Bar"]
type Profile = components["schemas"]["Profile"]

class AppState {
    theme: string
    defaultUnit: 'ml' | 'oz' | 'cl'
    defaultShelf: string
    language: string
    token: string|null
    bar: Bar
    user: Profile
    rememberMe: boolean
    isFeedsEnabled: boolean
    isPasswordLoginEnabled: boolean
    _key: string

    constructor() {
        this.theme = 'light'
        this.defaultUnit = 'ml'
        this.defaultShelf = 'bar'
        this.language = null
        this.token = null
        this.rememberMe = false
        this.isFeedsEnabled = false
        this.isPasswordLoginEnabled = true
        this.bar = {} as Bar
        this.user = {} as Profile

        this._key = '_salt_rim'
        this._readStateFromStorage()
    }

    setToken(token: string|null) {
        this.token = token
        this._updateState()
    }

    setUser(user: Profile) {
        this.user = user
        this._updateState()
    }

    setBar(bar: Bar) {
        let searchHost = window.srConfig.MEILISEARCH_URL
        if (!searchHost) {
            searchHost = bar.search_host ?? ''
        }

        if (!(searchHost.startsWith('http://') || searchHost.startsWith('https://'))) {
            if (!searchHost.startsWith('/')) {
                searchHost = '/' + searchHost
            }

            searchHost = window.location.origin + searchHost
        }

        bar.search_host = searchHost

        this.bar = bar
        if (bar.settings && bar.settings.default_units) {
            this.setDefaultUnits(bar.settings.default_units)
        }
        this._updateState()
    }

    forgetUser() {
        this.user = {} as Profile
        this.token = null
        this._updateState()
    }

    forgetBar() {
        this.bar = {} as Bar
        this._updateState()
    }

    setDefaultUnits(unit: string) {
        if (unit == 'ml' || unit == 'oz' || unit == 'cl') {
            this.defaultUnit = unit
            this._updateState()
        }
    }

    setDefaultShelf(shelf: string) {
        this.defaultShelf = shelf
        this._updateState()
    }

    setTheme(theme: string) {
        this.theme = theme
        this._updateState()
    }

    setLanguage(language: string) {
        this.language = language
        this._updateState()
    }

    setServerSettings(isFeedsEnabled: boolean, isPasswordLoginEnabled: boolean) {
        this.isFeedsEnabled = isFeedsEnabled
        this.isPasswordLoginEnabled = isPasswordLoginEnabled
        this._updateState()
    }

    hasUserInfo() {
        if (!this.user) {
            return false
        }

        return this.user.id != null || this.user.id != undefined
    }

    clear() {
        this._getStorage().removeItem(this._key)
    }

    isAdmin() {
        return this.bar && this.bar.id && this.bar.access.role_id == 1
    }

    isModerator() {
        return this.bar && this.bar.id && this.bar.access.role_id == 2
    }

    isGeneral() {
        return this.bar && this.bar.id && this.bar.access.role_id == 3
    }

    isGuest() {
        return this.bar && this.bar.id && this.bar.access.role_id == 4
    }

    isSubscribed() {
        if (!this.user) {
            return false
        }

        if (window.srConfig.BILLING_ENABLED === true) {
            return this.user.is_subscribed
        }

        return true
    }

    isBillingEnabled() {
        return window.srConfig.BILLING_ENABLED === true
    }

    _getStorage(): Storage {
        const val = localStorage.getItem('sr_remember_login')
        const rememberMe = val === null || val === 'true' ? true : false

        if (rememberMe === false) {
            return sessionStorage
        }

        return localStorage
    }

    _updateState() {
        this._getStorage().setItem(this._key, JSON.stringify(this))
    }

    _readStateFromStorage() {
        if (this._getStorage().getItem(this._key)) {
            const newState = JSON.parse(this._getStorage().getItem(this._key) ?? '')

            this.theme = newState.theme
            this.defaultUnit = newState.defaultUnit
            this.defaultShelf = newState.defaultShelf
            this.language = newState.language
            this.token = newState.token
            this.rememberMe = newState.rememberMe
            this.bar = newState.bar
            this.user = newState.user
            this.isFeedsEnabled = newState.isFeedsEnabled
            this.isPasswordLoginEnabled = newState.isPasswordLoginEnabled
        }
    }
}

export default AppState
