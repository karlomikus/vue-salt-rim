import ApiRequests from "./ApiRequests";
import AppState from './AppState.js'

class Auth {
    static appState = new AppState();

    static getUser() {
        return this.appState.user;
    }

    static isAdmin() {
        return this.getUser().is_admin;
    }

    static getUserSearchSettings() {
        const user = this.getUser();

        let searchHost = window.srConfig.MEILISEARCH_URL;
        if (!searchHost) {
            searchHost = user.search_host;
        }

        if (!(searchHost.startsWith('http://') || searchHost.startsWith('https://'))) {
            if (!searchHost.startsWith('/')) {
                searchHost = '/' + searchHost;
            }

            searchHost = window.location.origin + searchHost;
        }

        return {
            host: searchHost,
            key: user.search_api_key,
        };
    }

    static async refreshUser() {
        const user = await ApiRequests.fetchUser();

        this.appState.setUser(user);
    }

    static isLoggedIn() {
        return this.getUser().id;
    }
}

export default Auth;
