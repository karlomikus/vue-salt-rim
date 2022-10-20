import ApiRequests from "./ApiRequests";

const api = new ApiRequests();

class Auth {
    saveUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    }

    static getUser() {
        return JSON.parse(localStorage.getItem('user'));
    }

    async isLoggedIn() {
        try {
            const user = await api.fetchUser();

            this.saveUser(user)
        } catch (e) {
            localStorage.removeItem('user');
            localStorage.removeItem('user_token');
            return false;
        }

        return true;
    }
}

export default Auth;
