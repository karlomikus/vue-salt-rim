class ApiRequests {
    constructor() {
        this.url = window.srConfig.API_URL;
    }

    getHeaders() {
        return new Headers({
            'Authorization': 'Bearer ' + localStorage.getItem('user_token'),
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
        }).then(response => {
            if (!response.ok) {
                return Promise.reject(response)
            }

            return response;
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

    async fetchUserCocktails(userId) {
        let jsonResp = await this.getRequest(`/api/cocktails?user_id=${userId}`);

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

    async randomCocktail() {
        let jsonResp = await this.getRequest(`/api/cocktails/random`);

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

    async fetchIngredientsOnShoppingList() {
        let jsonResp = await this.getRequest(`/api/ingredients?on_shopping_list=true`);

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

    async updateIngredient(id, data) {
        let jsonResp = await this.postRequest(`/api/ingredients/${id}`, data, 'PUT');

        return this.parseResponse(jsonResp);
    }

    async deleteIngredient(id) {
        let jsonResp = await this.deleteRequest(`/api/ingredients/${id}`);

        return this.parseResponse(jsonResp);
    }

    async uploadImages(formData) {
        const jsonResp = await (await fetch(`${this.url}/api/images`, {
            method: 'POST',
            headers: new Headers({
                'Authorization': 'Bearer ' + localStorage.getItem('user_token'),
            }),
            body: formData
        })).json();

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
        }).then(response => {
            if (!response.ok) {
                return Promise.reject(response)
            }

            return response;
        })).json();

        return jsonResp.token;
    }

    async fetchApiVersion() {
        let jsonResp = await this.getRequest(`/api/version`);

        return this.parseResponse(jsonResp);
    }

    async addIngredientsToShoppingList(data) {
        let jsonResp = await this.postRequest(`/api/shopping-lists/batch`, data);

        return this.parseResponse(jsonResp);
    }

    async removeIngredientsFromShoppingList(data) {
        let jsonResp = await this.postRequest(`/api/shopping-lists/batch`, data, 'DELETE');

        return this.parseResponse(jsonResp);
    }

    async logout() {
        let jsonResp = await this.postRequest(`/api/logout`);

        return this.parseResponse(jsonResp);
    }

    async deleteImage(id) {
        let jsonResp = await this.deleteRequest(`/api/images/${id}`);

        return this.parseResponse(jsonResp);
    }

    parseResponse(resp) {
        if ('data' in resp) {
            return resp.data;
        }

        return resp
    }
}

export default ApiRequests;
