import ApiRequests from "./ApiRequests";

const api = new ApiRequests();

class Auth {
    async login(email, password) {
        const token = await api.fetchLoginToken(email, password);

        localStorage.setItem('user_token', token);
    }

    async isLoggedIn() {
        try {
            await api.fetchUser();
        } catch (e) {
            localStorage.removeItem('user_token');
            return false;
        }

        return true;
    }
}

export default Auth;
