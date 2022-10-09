import ApiRequests from "./ApiRequests";

const api = new ApiRequests();

class Auth {
    async login(email, password) {
        const token = await api.fetchLoginToken(email, password);

        localStorage.setItem('user_token', token);
    }

    isLoggedIn() {
        return localStorage.getItem('user_token') !== null;
    }
}

export default Auth;
