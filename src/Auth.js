import ApiRequests from "./ApiRequests";

class Auth {
    static rememberUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    }

    static rememberToken(token) {
        localStorage.setItem('user_token', token);
    }

    static forgetUser() {
        localStorage.removeItem('user');
        localStorage.removeItem('user_token');
    }

    static getUser() {
        return JSON.parse(localStorage.getItem('user'));
    }

    static getUserSearchSettings() {
        const user = this.getUser();

        return {
            host: window.srConfig.MEILISEARCH_HOST,
            key: user.search_api_key,
        };
    }

    static async refreshUser() {
        const user = await ApiRequests.fetchUser();

        localStorage.setItem('user', JSON.stringify(user));
    }

    static async isLoggedIn() {
        try {
            const user = await ApiRequests.fetchUser();

            this.rememberUser(user)
        } catch (e) {
            this.forgetUser()
            return false;
        }

        return true;
    }
}

export default Auth;
