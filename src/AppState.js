class AppState {
    #key;

    constructor() {
        this.theme = 'light';
        this.defaultUnit = 'ml';
        this.language = 'en-US';
        this.token = null;
        this.bar = {};
        this.user = {};

        this.#key = '_salt_rim';
        this.#readStateFromStorage();
    }

    setToken(token) {
        this.token = token
        this.#updateState()
    }

    setUser(user) {
        this.user = user
        this.#updateState()
    }

    setBar(bar) {
        this.bar = bar
        this.#updateState()
    }

    forgetUser() {
        this.user = {};
        this.token = null;
        this.#updateState()
    }

    setDefaultUnit(unit) {
        this.defaultUnit = unit;
        this.#updateState()
    }

    hasUserInfo() {
        return this.user.id != null || this.user.id != undefined;
    }

    clear() {
        localStorage.removeItem(this.#key);
    }

    #updateState() {
        localStorage.setItem(this.#key, JSON.stringify(this));
    }

    #readStateFromStorage() {
        if (localStorage.getItem(this.#key)) {
            const newState = JSON.parse(localStorage.getItem(this.#key));

            this.theme = newState.theme;
            this.defaultUnit = newState.defaultUnit;
            this.language = newState.language;
            this.token = newState.token;
            this.bar = newState.bar;
            this.user = newState.user;
        }
    }
}

export default AppState;
