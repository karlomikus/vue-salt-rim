import ApiRequests from "./ApiRequests";

class Auth {
    async login(email, password) {
        const api = new ApiRequests();
        const token = await api.fetchLoginToken(email, password);

        localStorage.setItem('user_token', token);
    }

    isLoggedIn() {
        return localStorage.getItem('user_token') !== null;
    }
}

export default Auth;
