class ApiRequests {
    static getUrl() {
        return window.srConfig.API_URL;
    }

    static getHeaders() {
        return new Headers({
            'Authorization': 'Bearer ' + localStorage.getItem('user_token'),
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        });
    }

    static parseResponse(resp) {
        if ('data' in resp) {
            return resp.data;
        }

        return resp
    }

    static async getRequest(path) {
        const url = `${this.getUrl()}${path}`

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

    static async postRequest(path, data = {}, type = 'POST') {
        const url = `${this.getUrl()}${path}`

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

    static async deleteRequest(path) {
        const url = `${this.getUrl()}${path}`

        return await (await fetch(url, {
            method: 'DELETE',
            headers: this.getHeaders()
        })).json();
    }

    static async uploadImages(formData) {
        const jsonResp = await (await fetch(`${this.getUrl()}/api/images`, {
            method: 'POST',
            headers: new Headers({
                'Authorization': 'Bearer ' + localStorage.getItem('user_token'),
            }),
            body: formData
        })).json();

        return this.parseResponse(jsonResp);
    }

    static async fetchLoginToken(email, password) {
        const url = `${this.getUrl()}/api/login`

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

    static async fetchCocktails() {
        let jsonResp = await this.getRequest(`/api/cocktails`);

        return this.parseResponse(jsonResp);
    }

    static async fetchUserCocktails(userId) {
        let jsonResp = await this.getRequest(`/api/cocktails?user_id=${userId}`);

        return this.parseResponse(jsonResp);
    }

    static async fetchUserFavoriteCocktails() {
        let jsonResp = await this.getRequest(`/api/cocktails/user-favorites`);

        return this.parseResponse(jsonResp);
    }

    static async fetchCocktail(id) {
        let jsonResp = await this.getRequest(`/api/cocktails/${id}`);

        return this.parseResponse(jsonResp);
    }

    static async randomCocktail() {
        let jsonResp = await this.getRequest(`/api/cocktails/random`);

        return this.parseResponse(jsonResp);
    }

    static async deleteCocktail(id) {
        let jsonResp = await this.deleteRequest(`/api/cocktails/${id}`);

        return this.parseResponse(jsonResp);
    }

    static async fetchUserCocktail() {
        let jsonResp = await this.getRequest(`/api/cocktails/user-shelf`);

        return this.parseResponse(jsonResp);
    }

    static async fetchIngredients() {
        let jsonResp = await this.getRequest(`/api/ingredients`);

        return this.parseResponse(jsonResp);
    }

    static async fetchIngredientsOnShoppingList() {
        let jsonResp = await this.getRequest(`/api/ingredients?on_shopping_list=true`);

        return this.parseResponse(jsonResp);
    }

    static async fetchIngredientCategories() {
        let jsonResp = await this.getRequest(`/api/ingredient-categories`);

        return this.parseResponse(jsonResp);
    }

    static async fetchIngredient(id) {
        let jsonResp = await this.getRequest(`/api/ingredients/${id}`);

        return this.parseResponse(jsonResp);
    }

    static async fetchMyShelf() {
        let jsonResp = await this.getRequest(`/api/shelf`);

        return this.parseResponse(jsonResp);
    }

    static async addIngredientToShelf(id) {
        let jsonResp = await this.postRequest(`/api/shelf/${id}`);

        return this.parseResponse(jsonResp);
    }

    static async removeIngredientFromShelf(id) {
        let jsonResp = await this.deleteRequest(`/api/shelf/${id}`);

        return this.parseResponse(jsonResp);
    }

    static async fetchUser() {
        let jsonResp = await this.getRequest(`/api/user`);

        return this.parseResponse(jsonResp);
    }

    static async favoriteCocktail(id) {
        let jsonResp = await this.postRequest(`/api/cocktails/${id}/favorite`);

        return this.parseResponse(jsonResp);
    }

    static async saveCocktail(data) {
        let jsonResp = await this.postRequest(`/api/cocktails`, data);

        return this.parseResponse(jsonResp);
    }

    static async updateCocktail(id, data) {
        let jsonResp = await this.postRequest(`/api/cocktails/${id}`, data, 'PUT');

        return this.parseResponse(jsonResp);
    }

    static async saveIngredient(data) {
        let jsonResp = await this.postRequest(`/api/ingredients`, data);

        return this.parseResponse(jsonResp);
    }

    static async updateIngredient(id, data) {
        let jsonResp = await this.postRequest(`/api/ingredients/${id}`, data, 'PUT');

        return this.parseResponse(jsonResp);
    }

    static async deleteIngredient(id) {
        let jsonResp = await this.deleteRequest(`/api/ingredients/${id}`);

        return this.parseResponse(jsonResp);
    }

    static async fetchApiVersion() {
        let jsonResp = await this.getRequest(`/api/version`);

        return this.parseResponse(jsonResp);
    }

    static async addIngredientsToShoppingList(data) {
        let jsonResp = await this.postRequest(`/api/shopping-lists/batch`, data);

        return this.parseResponse(jsonResp);
    }

    static async removeIngredientsFromShoppingList(data) {
        let jsonResp = await this.postRequest(`/api/shopping-lists/batch`, data, 'DELETE');

        return this.parseResponse(jsonResp);
    }

    static async logout() {
        let jsonResp = await this.postRequest(`/api/logout`);

        return this.parseResponse(jsonResp);
    }

    static async deleteImage(id) {
        let jsonResp = await this.deleteRequest(`/api/images/${id}`);

        return this.parseResponse(jsonResp);
    }
}

export default ApiRequests;
