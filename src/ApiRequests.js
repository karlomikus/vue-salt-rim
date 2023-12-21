import qs from 'qs'
import AppState from './AppState'

class ApiRequests
{
    static getUrl() {
        return window.srConfig.API_URL
    }

    static getBarId() {
        const appState = new AppState()

        if (appState.bar.id) {
            return appState.bar.id
        }

        return null
    }

    static getHeaders() {
        const defaultHeaders = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }

        const appState = new AppState()

        if (appState.token) {
            defaultHeaders['Authorization'] = 'Bearer ' + appState.token
        }

        return new Headers(defaultHeaders)
    }

    static generateBAQueryString(queryParams, includeBar = false) {
        if (includeBar) {
            queryParams['bar_id'] = this.getBarId()
        }

        let q = ''
        if (Object.keys(queryParams).length > 0) {
            q = '?' + qs.stringify(queryParams)
        }

        return q
    }

    static async handleResponseErrors(response) {
        if (!response.ok) {
            if (response.status == 401) {
                const appState = new AppState()
                appState.clear()
                window.location.replace('/')
            } else {
                return Promise.reject(await response.json())
            }
        }

        return response
    }

    static parseResponse(resp) {
        if ('data' in resp) {
            return resp.data
        }

        return resp
    }

    static async getRequest(path) {
        let url = `${this.getUrl()}${path}`

        const response = await fetch(url, {
            headers: this.getHeaders(),
        }).then(this.handleResponseErrors)

        if (response.status == 204) {
            return {}
        }

        return await response.json()
    }

    static async postRequest(path, data = {}, type = 'POST') {
        const url = `${this.getUrl()}${path}`

        const response = await fetch(url, {
            method: type,
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        }).then(this.handleResponseErrors)

        if (response.status == 204) {
            return {}
        }

        return await response.json()
    }

    static async deleteRequest(path) {
        const url = `${this.getUrl()}${path}`

        return await (await fetch(url, {
            method: 'DELETE',
            headers: this.getHeaders()
        }).then(this.handleResponseErrors))
    }

    /**
     * =============================
     * Cocktails
     * =============================
     */

    static async fetchCocktails(query = {}) {
        const q = this.generateBAQueryString(query, true)
        const jsonResp = await this.getRequest(`/api/cocktails${q}`)

        return jsonResp
    }

    static async fetchCocktail(id, queryParams = {}) {
        const q = this.generateBAQueryString(queryParams)
        const jsonResp = await this.getRequest(`/api/cocktails/${id}${q}`)

        return this.parseResponse(jsonResp)
    }

    static async deleteCocktail(id) {
        return await this.deleteRequest(`/api/cocktails/${id}`)
    }

    static async favoriteCocktail(id) {
        const q = this.generateBAQueryString({})
        const jsonResp = await this.postRequest(`/api/cocktails/${id}/toggle-favorite${q}`)

        return this.parseResponse(jsonResp)
    }

    static async saveCocktail(data) {
        const q = this.generateBAQueryString({}, true)
        const jsonResp = await this.postRequest(`/api/cocktails${q}`, data)

        return this.parseResponse(jsonResp)
    }

    static async updateCocktail(id, data) {
        const jsonResp = await this.postRequest(`/api/cocktails/${id}`, data, 'PUT')

        return this.parseResponse(jsonResp)
    }

    static async importCocktail(data, query = {}) {
        const q = this.generateBAQueryString(query, true)
        const jsonResp = await this.postRequest(`/api/import/cocktail${q}`, data)

        return this.parseResponse(jsonResp)
    }

    static async createPublicLink(id) {
        const jsonResp = await this.postRequest(`/api/cocktails/${id}/public-link`)

        return this.parseResponse(jsonResp)
    }

    static async deletePublicLink(id) {
        return await this.deleteRequest(`/api/cocktails/${id}/public-link`)
    }

    static async fetchCocktailByPublicId(ulid) {
        const jsonResp = await this.getRequest(`/api/explore/cocktails/${ulid}`)

        return this.parseResponse(jsonResp)
    }

    static async shareCocktail(id, queryParams = {}) {
        let url = `${this.getUrl()}/api/cocktails/${id}/share`
        const queryString = new URLSearchParams(queryParams).toString()
        if (queryString != '') {
            url += `?${queryString}`
        }

        const f = fetch(url, {
            headers: this.getHeaders(),
        }).then(this.handleResponseErrors)

        return await (await f).text()
    }

    static async fetchSimilarCocktails(id) {
        let jsonResp = await this.getRequest(`/api/cocktails/${id}/similar`)

        return this.parseResponse(jsonResp)
    }

    /**
     * =============================
     * Ingredient Categories
     * =============================
     */

    static async fetchIngredientCategories() {
        const q = this.generateBAQueryString({}, true)
        const jsonResp = await this.getRequest(`/api/ingredient-categories${q}`)

        return this.parseResponse(jsonResp)
    }

    static async fetchIngredientCategory(id) {
        let jsonResp = await this.getRequest(`/api/ingredient-categories/${id}`)

        return this.parseResponse(jsonResp)
    }

    static async saveIngredientCategory(data) {
        const q = this.generateBAQueryString({}, true)
        const jsonResp = await this.postRequest(`/api/ingredient-categories${q}`, data)

        return this.parseResponse(jsonResp)
    }

    static async updateIngredientCategory(id, data) {
        let jsonResp = await this.postRequest(`/api/ingredient-categories/${id}`, data, 'PUT')

        return this.parseResponse(jsonResp)
    }

    static async deleteIngredientCategory(id) {
        return await this.deleteRequest(`/api/ingredient-categories/${id}`)
    }

    /**
     * =============================
     * Ingredients
     * =============================
     */

    static async fetchIngredients(query = {}) {
        const q = this.generateBAQueryString(query, true)
        const jsonResp = await this.getRequest(`/api/ingredients${q}`)

        return jsonResp
    }

    static async fetchIngredient(id) {
        let jsonResp = await this.getRequest(`/api/ingredients/${id}`)

        return this.parseResponse(jsonResp)
    }

    static async saveIngredient(data) {
        const q = this.generateBAQueryString({}, true)
        const jsonResp = await this.postRequest(`/api/ingredients${q}`, data)

        return this.parseResponse(jsonResp)
    }

    static async updateIngredient(id, data) {
        let jsonResp = await this.postRequest(`/api/ingredients/${id}`, data, 'PUT')

        return this.parseResponse(jsonResp)
    }

    static async deleteIngredient(id) {
        return await this.deleteRequest(`/api/ingredients/${id}`)
    }

    static async fetchExtraCocktailsWithIngredient(id) {
        const q = this.generateBAQueryString({}, true)
        const jsonResp = await this.getRequest(`/api/ingredients/${id}/extra${q}`)

        return this.parseResponse(jsonResp)
    }

    /**
     * =============================
     * Shelf
     * =============================
     */

    static async fetchMyShelf() {
        const q = this.generateBAQueryString({}, true)
        let jsonResp = await this.getRequest(`/api/shelf/ingredients${q}`)

        return this.parseResponse(jsonResp)
    }

    static async addIngredientsToShelf(data) {
        const q = this.generateBAQueryString({}, true)
        const jsonResp = await this.postRequest(`/api/shelf/ingredients/batch-store${q}`, data)

        return this.parseResponse(jsonResp)
    }

    static async removeIngredientsFromShelf(data) {
        const q = this.generateBAQueryString({}, true)
        const jsonResp = await this.postRequest(`/api/shelf/ingredients/batch-delete${q}`, data)

        return this.parseResponse(jsonResp)
    }

    static async fetchCocktailFavorites() {
        const q = this.generateBAQueryString({}, true)
        const jsonResp = await this.getRequest(`/api/shelf/cocktail-favorites${q}`)

        return this.parseResponse(jsonResp)
    }

    /**
     * =============================
     * Users
     * =============================
     */

    static async fetchUser() {
        let jsonResp = await this.getRequest('/api/profile')

        return this.parseResponse(jsonResp)
    }

    static async updateUser(data) {
        let jsonResp = await this.postRequest('/api/profile', data)

        return this.parseResponse(jsonResp)
    }

    static async registerNewUser(data) {
        let jsonResp = await this.postRequest('/api/register', data)

        return this.parseResponse(jsonResp)
    }

    static async passwordForgot(data) {
        let jsonResp = await this.postRequest('/api/forgot-password', data)

        return this.parseResponse(jsonResp)
    }

    static async passwordReset(data) {
        let jsonResp = await this.postRequest('/api/reset-password', data)

        return this.parseResponse(jsonResp)
    }

    static async confirmAccount(id, hash) {
        let jsonResp = await this.getRequest(`/api/verify/${id}/${hash}`)
    }

    /**
     * =============================
     * Server
     * =============================
     */

    static async fetchApiVersion() {
        let jsonResp = await this.getRequest('/api/server/version')

        return this.parseResponse(jsonResp)
    }

    /**
     * =============================
     * Shopping lists
     * =============================
     */

    static async fetchShoppingList() {
        const q = this.generateBAQueryString({}, true)
        const jsonResp = await this.getRequest(`/api/shopping-list${q}`)

        return this.parseResponse(jsonResp)
    }

    static async addIngredientsToShoppingList(data) {
        const q = this.generateBAQueryString({}, true)
        const jsonResp = await this.postRequest(`/api/shopping-list/batch-store${q}`, data)

        return this.parseResponse(jsonResp)
    }

    static async removeIngredientsFromShoppingList(data) {
        const q = this.generateBAQueryString({}, true)
        let jsonResp = await this.postRequest(`/api/shopping-list/batch-delete${q}`, data)

        return this.parseResponse(jsonResp)
    }

    static async shareShoppingList(query = {}) {
        const queryString = this.generateBAQueryString(query, true)

        const f = fetch(`${this.getUrl()}/api/shopping-list/share${queryString}`, {
            headers: this.getHeaders(),
        }).then(this.handleResponseErrors)

        return await (await f).text()
    }

    /**
     * =============================
     * Auth
     * =============================
     */

    static async fetchLoginToken(email, password) {
        const jsonResp = await this.postRequest('/api/login', {
            email: email,
            password: password
        })

        return jsonResp.data.token
    }

    static async logout() {
        let jsonResp = await this.postRequest('/api/logout')

        return this.parseResponse(jsonResp)
    }

    /**
     * =============================
     * Images
     * =============================
     */

    static async deleteImage(id) {
        return await this.deleteRequest(`/api/images/${id}`)
    }

    static async uploadImages(formData) {
        const appState = new AppState()

        const jsonResp = await (await fetch(`${this.getUrl()}/api/images`, {
            method: 'POST',
            headers: new Headers({
                'Authorization': 'Bearer ' + appState.token,
            }),
            body: formData
        }).then(this.handleResponseErrors)).json()

        return this.parseResponse(jsonResp)
    }

    static async updateSingleImage(id, formData) {
        const appState = new AppState()

        const jsonResp = await (await fetch(`${this.getUrl()}/api/images/${id}`, {
            method: 'POST',
            headers: new Headers({
                'Authorization': 'Bearer ' + appState.token,
                'Accept': 'application/json',
            }),
            body: formData
        }).then(this.handleResponseErrors)).json()

        return this.parseResponse(jsonResp)
    }

    static imageThumbUrl(id) {
        return `${this.getUrl()}/api/images/${id}/thumb`
    }

    /**
     * =============================
     * Glasses
     * =============================
     */

    static async fetchGlasses() {
        const q = this.generateBAQueryString({}, true)
        let jsonResp = await this.getRequest(`/api/glasses${q}`)

        return this.parseResponse(jsonResp)
    }

    static async fetchGlass(id) {
        let jsonResp = await this.getRequest(`/api/glasses/${id}`)

        return this.parseResponse(jsonResp)
    }

    static async saveGlass(data) {
        const q = this.generateBAQueryString({}, true)
        const jsonResp = await this.postRequest(`/api/glasses${q}`, data)

        return this.parseResponse(jsonResp)
    }

    static async updateGlass(id, data) {
        let jsonResp = await this.postRequest(`/api/glasses/${id}`, data, 'PUT')

        return this.parseResponse(jsonResp)
    }

    static async deleteGlass(id) {
        return await this.deleteRequest(`/api/glasses/${id}`)
    }

    /**
     * =============================
     * Ratings
     * =============================
     */

    static async rateCocktail(id, data) {
        let jsonResp = await this.postRequest(`/api/ratings/cocktails/${id}`, data)

        return this.parseResponse(jsonResp)
    }

    static async deleteCocktailUserRating(id) {
        return await this.deleteRequest(`/api/ratings/cocktails/${id}`)
    }

    /**
     * =============================
     * Users
     * =============================
     */

    static async fetchUsers() {
        const q = this.generateBAQueryString({}, true)
        const jsonResp = await this.getRequest(`/api/users${q}`)

        return this.parseResponse(jsonResp)
    }

    static async fetchUserById(id) {
        const q = this.generateBAQueryString({}, true)
        let jsonResp = await this.getRequest(`/api/users/${id}${q}`)

        return this.parseResponse(jsonResp)
    }

    static async saveUser(data) {
        const q = this.generateBAQueryString({}, true)
        let jsonResp = await this.postRequest(`/api/users${q}`, data)

        return this.parseResponse(jsonResp)
    }

    static async updateUserById(id, data) {
        const q = this.generateBAQueryString({}, true)
        let jsonResp = await this.postRequest(`/api/users/${id}${q}`, data, 'PUT')

        return this.parseResponse(jsonResp)
    }

    static async deleteUser(id) {
        const q = this.generateBAQueryString({}, true)

        return await this.deleteRequest(`/api/users/${id}${q}`)
    }

    /**
     * =============================
     * Stats
     * =============================
     */

    static async fetchStats() {
        const q = this.generateBAQueryString({}, true)
        const jsonResp = await this.getRequest(`/api/stats${q}`)

        return this.parseResponse(jsonResp)
    }

    /**
     * =============================
     * Tags
     * =============================
     */

    static async fetchTags() {
        const q = this.generateBAQueryString({}, true)
        let jsonResp = await this.getRequest(`/api/tags${q}`)

        return this.parseResponse(jsonResp)
    }

    static async fetchTag(id) {
        let jsonResp = await this.getRequest(`/api/tags/${id}`)

        return this.parseResponse(jsonResp)
    }

    static async saveTag(data) {
        const q = this.generateBAQueryString({}, true)
        let jsonResp = await this.postRequest(`/api/tags${q}`, data)

        return this.parseResponse(jsonResp)
    }

    static async updateTag(id, data) {
        let jsonResp = await this.postRequest(`/api/tags/${id}`, data, 'PUT')

        return this.parseResponse(jsonResp)
    }

    static async deleteTag(id) {
        return await this.deleteRequest(`/api/tags/${id}`)
    }

    /**
     * =============================
     * Cocktail methods
     * =============================
     */

    static async fetchCocktailMethods() {
        const q = this.generateBAQueryString({}, true)
        let jsonResp = await this.getRequest(`/api/cocktail-methods${q}`)

        return this.parseResponse(jsonResp)
    }

    static async fetchCocktailMethod(id) {
        let jsonResp = await this.getRequest(`/api/cocktail-methods/${id}`)

        return this.parseResponse(jsonResp)
    }

    static async saveCocktailMethod(data) {
        let jsonResp = await this.postRequest('/api/cocktail-methods', data)

        return this.parseResponse(jsonResp)
    }

    static async updateCocktailMethod(id, data) {
        let jsonResp = await this.postRequest(`/api/cocktail-methods/${id}`, data, 'PUT')

        return this.parseResponse(jsonResp)
    }

    static async deleteCocktailMethod(id) {
        return await this.deleteRequest(`/api/cocktail-methods/${id}`)
    }

    static async checkVersions() {
        // https://api.github.com/repos/karlomikus/bar-assistant/releases/latest
        // https://api.github.com/repos/karlomikus/vue-salt-rim/releases/latest
    }

    static async checkMeilisearchStatus(meiliHost) {
        const f = fetch(`${meiliHost}/health`, {
        }).then(this.handleResponseErrors)

        return await (await f).json()
    }

    /**
     * =============================
     * Notes
     * =============================
     */

    static async fetchNotes(query = {}) {
        const queryString = this.generateBAQueryString(query, true)
        const jsonResp = await this.getRequest(`/api/notes${queryString}`)

        return this.parseResponse(jsonResp)
    }

    static async saveNote(data) {
        let jsonResp = await this.postRequest('/api/notes', data)

        return this.parseResponse(jsonResp)
    }

    static async deleteNote(id) {
        return await this.deleteRequest(`/api/notes/${id}`)
    }

    /**
     * =============================
     * Collections
     * =============================
     */

    static async fetchCollections(query = {}) {
        const queryString = this.generateBAQueryString(query, true)
        const jsonResp = await this.getRequest(`/api/collections${queryString}`)

        return this.parseResponse(jsonResp)
    }

    static async saveCollection(data) {
        const q = this.generateBAQueryString({}, true)
        const jsonResp = await this.postRequest(`/api/collections${q}`, data)

        return this.parseResponse(jsonResp)
    }

    static async updateCollection(id, data) {
        let jsonResp = await this.postRequest(`/api/collections/${id}`, data, 'PUT')

        return this.parseResponse(jsonResp)
    }

    static async addCocktailsToCollection(collectionId, cocktailIds) {
        let jsonResp = await this.postRequest(`/api/collections/${collectionId}/cocktails`, {
            cocktails: cocktailIds
        })

        return this.parseResponse(jsonResp)
    }

    static async putCocktailInCollection(collectionId, cocktailId) {
        let jsonResp = await this.postRequest(`/api/collections/${collectionId}/cocktails/${cocktailId}`, {}, 'PUT')

        return this.parseResponse(jsonResp)
    }

    static async removeCocktailFromCollection(collectionId, cocktailId) {
        return await this.deleteRequest(`/api/collections/${collectionId}/cocktails/${cocktailId}`)
    }

    static async deleteCollection(collectionId) {
        return await this.deleteRequest(`/api/collections/${collectionId}`)
    }

    static async shareCollection(id) {
        let jsonResp = await this.getRequest(`/api/collections/${id}/share`)

        return this.parseResponse(jsonResp)
    }

    static async fetchSharedCollections(query = {}) {
        const queryString = this.generateBAQueryString(query, true)
        const jsonResp = await this.getRequest(`/api/collections/shared${queryString}`)

        return this.parseResponse(jsonResp)
    }

    /**
     * =============================
     * Utensils
     * =============================
     */

    static async fetchUtensils() {
        const q = this.generateBAQueryString({}, true)
        let jsonResp = await this.getRequest(`/api/utensils${q}`)

        return this.parseResponse(jsonResp)
    }

    static async fetchUtensil(id) {
        let jsonResp = await this.getRequest(`/api/utensils/${id}`)

        return this.parseResponse(jsonResp)
    }

    static async saveUtensil(data) {
        const q = this.generateBAQueryString({}, true)
        let jsonResp = await this.postRequest(`/api/utensils${q}`, data)

        return this.parseResponse(jsonResp)
    }

    static async updateUtensil(id, data) {
        let jsonResp = await this.postRequest(`/api/utensils/${id}`, data, 'PUT')

        return this.parseResponse(jsonResp)
    }

    static async deleteUtensil(id) {
        return await this.deleteRequest(`/api/utensils/${id}`)
    }

    /**
     * =============================
     * Bars
     * =============================
     */
    static async fetchBars() {
        let jsonResp = await this.getRequest('/api/bars')

        return this.parseResponse(jsonResp)
    }

    static async fetchBar(id) {
        let jsonResp = await this.getRequest(`/api/bars/${id}`)

        return this.parseResponse(jsonResp)
    }

    static async saveBar(data) {
        let jsonResp = await this.postRequest('/api/bars', data)

        return this.parseResponse(jsonResp)
    }

    static async updateBar(id, data) {
        const jsonResp = await this.postRequest(`/api/bars/${id}`, data, 'PUT')

        return this.parseResponse(jsonResp)
    }

    static async deleteBar(id) {
        return await this.deleteRequest(`/api/bars/${id}`)
    }

    static async joinBar(data) {
        let jsonResp = await this.postRequest('/api/bars/join', data)

        return this.parseResponse(jsonResp)
    }

    static async leaveBar(barId) {
        return await this.deleteRequest(`/api/bars/${barId}/memberships`)
    }

    static async removeUserFromBar(barId, userId) {
        return await this.deleteRequest(`/api/bars/${barId}/memberships/${userId}`)
    }

    static async fetchBarMembers(id) {
        let jsonResp = await this.getRequest(`/api/bars/${id}/memberships`)

        return this.parseResponse(jsonResp)
    }

    static async updateBarStatus(id, status) {
        const jsonResp = await this.postRequest(`/api/bars/${id}/status`, {status: status})

        return this.parseResponse(jsonResp)
    }

    /**
     * =============================
     * Billing
     * =============================
     */

    static async fetchSubscription() {
        let jsonResp = await this.getRequest('/api/billing/subscription')

        return this.parseResponse(jsonResp)
    }

    static async updateSubscription(data) {
        const jsonResp = await this.postRequest('/api/billing/subscription', data)

        return this.parseResponse(jsonResp)
    }
}

export default ApiRequests
