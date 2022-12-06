class ApiRequests
{
    static getUrl() {
        return window.srConfig.API_URL;
    }

    static getHeaders() {
        const defaultHeaders = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };

        if (localStorage.getItem('user_token')) {
            defaultHeaders['Authorization'] = 'Bearer ' + localStorage.getItem('user_token');
        }

        return new Headers(defaultHeaders);
    }

    static async handleResponseErrors(response) {
        if (!response.ok) {
            return Promise.reject(await response.json())
        }

        return response;
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
        }).then(this.handleResponseErrors)

        return await (await f).json();
    }

    static async postRequest(path, data = {}, type = 'POST') {
        const url = `${this.getUrl()}${path}`

        return await (await fetch(url, {
            method: type,
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        }).then(this.handleResponseErrors)).json();
    }

    static async deleteRequest(path) {
        const url = `${this.getUrl()}${path}`

        return await (await fetch(url, {
            method: 'DELETE',
            headers: this.getHeaders()
        }).then(this.handleResponseErrors));
    }

    /**
     * =============================
     * Cocktails
     * =============================
     */

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
        return await this.deleteRequest(`/api/cocktails/${id}`);
    }

    static async fetchUserCocktail() {
        let jsonResp = await this.getRequest(`/api/cocktails/user-shelf`);

        return this.parseResponse(jsonResp);
    }

    static async favoriteCocktail(id) {
        let jsonResp = await this.postRequest(`/api/cocktails/${id}/toggle-favorite`);

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

    /**
     * =============================
     * Ingredients
     * =============================
     */

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

    static async saveIngredient(data) {
        let jsonResp = await this.postRequest(`/api/ingredients`, data);

        return this.parseResponse(jsonResp);
    }

    static async updateIngredient(id, data) {
        let jsonResp = await this.postRequest(`/api/ingredients/${id}`, data, 'PUT');

        return this.parseResponse(jsonResp);
    }

    static async deleteIngredient(id) {
        return await this.deleteRequest(`/api/ingredients/${id}`);
    }

    /**
     * =============================
     * Shelf
     * =============================
     */

    static async fetchMyShelf() {
        let jsonResp = await this.getRequest(`/api/shelf`);

        return this.parseResponse(jsonResp);
    }

    static async addIngredientToShelf(id) {
        let jsonResp = await this.postRequest(`/api/shelf/${id}`);

        return this.parseResponse(jsonResp);
    }

    static async removeIngredientFromShelf(id) {
        return await this.deleteRequest(`/api/shelf/${id}`);
    }

    /**
     * =============================
     * Users
     * =============================
     */

    static async fetchUser() {
        let jsonResp = await this.getRequest(`/api/user`);

        return this.parseResponse(jsonResp);
    }

    static async updateUser(data) {
        let jsonResp = await this.postRequest(`/api/user`, data);

        return this.parseResponse(jsonResp);
    }

    static async registerNewUser(data) {
        let jsonResp = await this.postRequest(`/api/register`, data);

        return this.parseResponse(jsonResp);
    }

    /**
     * =============================
     * Server
     * =============================
     */

    static async fetchApiVersion() {
        let jsonResp = await this.getRequest(`/api/server/version`);

        return this.parseResponse(jsonResp);
    }

    /**
     * =============================
     * Shopping lists
     * =============================
     */

    static async addIngredientsToShoppingList(data) {
        let jsonResp = await this.postRequest(`/api/shopping-list/batch-store`, data);

        return this.parseResponse(jsonResp);
    }

    static async removeIngredientsFromShoppingList(data) {
        let jsonResp = await this.postRequest(`/api/shopping-list/batch-delete`, data);

        return this.parseResponse(jsonResp);
    }

    /**
     * =============================
     * Auth
     * =============================
     */

     static async fetchLoginToken(email, password) {
        const jsonResp = await this.postRequest(`/api/login`, {
            email: email,
            password: password
        });

        return jsonResp.token;
    }

    static async logout() {
        let jsonResp = await this.postRequest(`/api/logout`);

        return this.parseResponse(jsonResp);
    }

    /**
     * =============================
     * Images
     * =============================
     */

    static async deleteImage(id) {
        return await this.deleteRequest(`/api/images/${id}`);
    }

    static async uploadImages(formData) {
        const jsonResp = await (await fetch(`${this.getUrl()}/api/images`, {
            method: 'POST',
            headers: new Headers({
                'Authorization': 'Bearer ' + localStorage.getItem('user_token'),
            }),
            body: formData
        }).then(this.handleResponseErrors)).json();

        return this.parseResponse(jsonResp);
    }

    static async patchImage(id, formData) {
        const jsonResp = await (await fetch(`${this.getUrl()}/api/images/${id}`, {
            method: 'POST',
            headers: new Headers({
                'Authorization': 'Bearer ' + localStorage.getItem('user_token'),
            }),
            body: formData
        }).then(this.handleResponseErrors)).json();

        return this.parseResponse(jsonResp);
    }

    static imageThumbUrl(id) {
        return `${this.getUrl()}/api/images/${id}/thumb`;
    }

    /**
     * =============================
     * Glasses
     * =============================
     */

    static async fetchGlasses() {
        let jsonResp = await this.getRequest(`/api/glasses`);

        return this.parseResponse(jsonResp);
    }
}

export default ApiRequests;
