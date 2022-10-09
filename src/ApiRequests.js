class ApiRequests {
    constructor(url = 'http://localhost:8000') {
        this.url = url;
        this.token = localStorage.getItem('user_token')
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

        return await (await fetch(url, {
            headers: this.getHeaders()
        })).json();
    }

    async postRequest(path) {
        const url = `${this.url}${path}`

        return await (await fetch(url, {
            method: 'POST',
            headers: this.getHeaders()
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

    async fetchCocktail(id) {
        let jsonResp = await this.getRequest(`/api/cocktails/${id}`);

        return this.parseResponse(jsonResp);
    }

    async fetchIngredients() {
        let jsonResp = await this.getRequest(`/api/ingredients`);

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

        return jsonResp;
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
