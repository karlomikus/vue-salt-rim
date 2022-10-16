class ApiRequests {
    constructor() {
        this.url = import.meta.env.VITE_BA_API_URL;
        this.token = localStorage.getItem('user_token');
    }

    getHeaders() {
        return new Headers({
            'Authorization': 'Bearer ' + this.token,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        });
    }

    async getRequest(path) {
        const url = `${this.url}${path}`

        const f = fetch(url, {
            headers: this.getHeaders()
        }).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            return response;
        })

        return await (await f).json();
    }

    async postRequest(path, data = {}, type = 'POST') {
        const url = `${this.url}${path}`

        return await (await fetch(url, {
            method: type,
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        })).json();
    }

    async deleteRequest(path) {
        const url = `${this.url}${path}`

        return await (await fetch(url, {
            method: 'DELETE',
            headers: this.getHeaders()
        })).json();
    }

    async fetchCocktails() {
        let jsonResp = await this.getRequest(`/api/cocktails`);

        return this.parseResponse(jsonResp);
    }

    async fetchUserFavoriteCocktails() {
        let jsonResp = await this.getRequest(`/api/cocktails/user-favorites`);

        return this.parseResponse(jsonResp);
    }

    async fetchCocktail(id) {
        let jsonResp = await this.getRequest(`/api/cocktails/${id}`);

        return this.parseResponse(jsonResp);
    }

    async deleteCocktail(id) {
        let jsonResp = await this.deleteRequest(`/api/cocktails/${id}`);

        return this.parseResponse(jsonResp);
    }

    async fetchUserCocktail() {
        let jsonResp = await this.getRequest(`/api/cocktails/user-shelf`);

        return this.parseResponse(jsonResp);
    }

    async fetchIngredients() {
        let jsonResp = await this.getRequest(`/api/ingredients`);

        return this.parseResponse(jsonResp);
    }

    async fetchIngredientCategories() {
        let jsonResp = await this.getRequest(`/api/ingredients/categories`);

        return this.parseResponse(jsonResp);
    }

    async fetchIngredient(id) {
        let jsonResp = await this.getRequest(`/api/ingredients/${id}`);

        return this.parseResponse(jsonResp);
    }

    async fetchMyShelf() {
        let jsonResp = await this.getRequest(`/api/shelf`);

        return this.parseResponse(jsonResp);
    }

    async addIngredientToShelf(id) {
        let jsonResp = await this.postRequest(`/api/shelf/${id}`);

        return this.parseResponse(jsonResp);
    }

    async removeIngredientFromShelf(id) {
        let jsonResp = await this.deleteRequest(`/api/shelf/${id}`);

        return this.parseResponse(jsonResp);
    }

    async fetchUser() {
        let jsonResp = await this.getRequest(`/api/user`);

        return this.parseResponse(jsonResp);
    }

    async favoriteCocktail(id) {
        let jsonResp = await this.postRequest(`/api/cocktails/${id}/favorite`);

        return this.parseResponse(jsonResp);
    }

    async saveCocktail(data) {
        let jsonResp = await this.postRequest(`/api/cocktails`, data);

        return this.parseResponse(jsonResp);
    }

    async updateCocktail(id, data) {
        let jsonResp = await this.postRequest(`/api/cocktails/${id}`, data, 'PUT');

        return this.parseResponse(jsonResp);
    }

    async saveIngredient(data) {
        let jsonResp = await this.postRequest(`/api/ingredients`, data);

        return this.parseResponse(jsonResp);
    }

    async fetchLoginToken(email, password) {
        const url = `${this.url}/api/login`

        let jsonResp = await (await fetch(url, {
            method: 'POST',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                email: email,
                password: password,
            })
        })).json();

        return jsonResp.token;
    }

    parseResponse(resp) {
        return resp.data;
    }
}

export default ApiRequests;
