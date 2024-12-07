import createClient, { type Middleware } from "openapi-fetch";
import type { paths, components } from "@/api/api";
import AppState from '@/AppState'

let accessToken: string | undefined = undefined;

const checkService: Middleware = {
  async onResponse({ response }) {
    if (response.status == 503) {
      window.location.replace('/service-down')
    }
    return undefined;
  },
};

const checkToken: Middleware = {
  async onResponse({ response }) {
    if (response.status == 401) {
      const appState = new AppState()
      appState.clear()
      window.location.replace('/')
    }
    return undefined;
  },
};

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const scopedState = new AppState()
    accessToken = scopedState.token
    request.headers.set("Authorization", `Bearer ${accessToken}`);
    return request;
  },
};

const barIdMiddleware: Middleware = {
  async onRequest({ request }) {
    const appState = new AppState()
    if (appState.bar && appState.bar.id) {
      request.headers.set("Bar-Assistant-Bar-Id", appState.bar.id.toString());
    }
    return request;
  },
};

const rejectOnError: Middleware = {
  async onResponse({ response }) {
    if (response.status >= 400) {
      const body = await response.clone().json();

      return Promise.reject(body)
    }
    return undefined;
  },
};

const apiBaseUrl = window.srConfig.API_URL + '/api'
const client = createClient<paths>({ baseUrl: apiBaseUrl, headers: { "Accept": "application/json" } });
client.use(authMiddleware);
client.use(barIdMiddleware);
client.use(rejectOnError);
client.use(checkToken);
client.use(checkService);

export default class BarAssistantClient {
  static async getLoginToken(email: string, password: string) {
    return (await client.POST('/auth/login', { body: { email: email, password: password } })).data
  }

  static async logout() {
    return (await client.POST('/auth/logout')).data
  }

  static async getProfile() {
    return (await client.GET('/profile')).data
  }

  static async updateProfile(body: components["schemas"]["ProfileRequest"]) {
    return (await client.POST('/profile', { body: body })).data
  }

  static async requestPasswordResetEmail(email: string) {
    return (await client.POST('/auth/forgot-password', { body: { email: email } })).data
  }

  static async register(body: components["schemas"]["RegisterRequest"]) {
    return (await client.POST('/auth/register', { body: body })).data
  }

  static async resetPassword(requestBody: object) {
    return (await client.POST('/auth/reset-password', { body: requestBody })).data
  }

  static async confirmAccount(id: number, hash: string) {
    return (await client.GET('/auth/verify/{id}/{hash}', { params: { path: { id: id, hash: hash } } })).data
  }

  static async getIngredients(query = {}) {
    return (await client.GET('/ingredients', { params: { query: query } })).data
  }

  static async saveIngredient(data: components["schemas"]["IngredientRequest"]) {
    return (await client.POST('/ingredients', { body: data })).data
  }

  static async updateIngredient(id: number, body: components["schemas"]["IngredientRequest"]) {
    return (await client.PUT('/ingredients/{id}', { params: { path: { id: id } }, body: body })).data
  }

  static async deleteIngredient(id: number) {
    return (await client.DELETE('/ingredients/{id}', { params: { path: { id: id } } })).data
  }

  static async getCocktails(query = {}) {
    return (await client.GET('/cocktails', { params: { query: query } })).data
  }

  static async getCocktail(id: string) {
    return (await client.GET('/cocktails/{id}', { params: { path: { id: id } } })).data
  }

  static async getSimilarCocktail(id: number) {
    return (await client.GET('/cocktails/{id}/similar', { params: { path: { id: id } } })).data
  }

  static async getPublicCocktail(id: string) {
    return (await client.GET('/explore/cocktails/{public_id}', { params: { path: { public_id: id } } })).data
  }

  static async savePublicCocktailLink(id: number) {
    return (await client.POST('/cocktails/{id}/public-link', { params: { path: { id: id } } })).data
  }

  static async deletePublicCocktailLink(id: number) {
    return (await client.DELETE('/cocktails/{id}/public-link', { params: { path: { id: id } } })).data
  }

  static async saveCocktail(body: components["schemas"]["CocktailRequest"]) {
    return (await client.POST('/cocktails', { body: body })).data
  }

  static async updateCocktail(id: number, body: components["schemas"]["CocktailRequest"]) {
    return (await client.PUT('/cocktails/{id}', { params: { path: { id: id } }, body: body })).data
  }

  static async shareCocktail(id: string, query = {}) {
    return (await client.GET('/cocktails/{id}/share', { params: { path: { id: id }, query: query } })).data
  }

  static async favoriteCocktail(id: number) {
    return (await client.POST('/cocktails/{id}/toggle-favorite', { params: { path: { id: id } } })).data
  }

  static async deleteCocktail(id: number) {
    return (await client.DELETE('/cocktails/{id}', { params: { path: { id: id } } })).data
  }

  static async copyCocktail(id: string) {
    return (await client.POST('/cocktails/{id}/copy', { params: { path: { id: id } } })).data
  }

  static async rateCocktail(id: number, data: {}) {
    return (await client.POST('/cocktails/{id}/ratings', { params: { path: { id: id } }, body: data })).data
  }

  static async deleteCocktailRating(id: number) {
    return (await client.DELETE('/cocktails/{id}/ratings', { params: { path: { id: id } } })).data
  }

  static async getUserCocktailFavorites(id: number) {
    return (await client.GET('/users/{id}/cocktails/favorites', { params: { path: { id: id }, query: { per_page: 500 } } })).data
  }

  static async getUserCocktailShelf(id: number) {
    return (await client.GET('/users/{id}/cocktails', { params: { path: { id: id }, query: { per_page: 500 } } })).data
  }

  static async getNotes(query = {}) {
    return (await client.GET('/notes', { params: { query: query } })).data
  }

  static async saveNote(data: components["schemas"]["NoteRequest"]) {
    return (await client.POST('/notes', { body: data })).data
  }

  static async deleteNote(id: number) {
    return (await client.DELETE('/notes/{id}', { params: { path: { id: id } } })).data
  }

  static async getTags() {
    return (await client.GET('/tags')).data
  }

  static async deleteTag(id: number) {
    return (await client.DELETE('/tags/{id}', { params: { path: { id: id } } })).data
  }

  static async getTag(id: number) {
    return (await client.GET('/tags/{id}', { params: { path: { id: id } } })).data
  }

  static async saveTag(data: components["schemas"]["TagRequest"]) {
    return (await client.POST('/tags', { body: data })).data
  }

  static async updateTag(id: number, data: components["schemas"]["TagRequest"]) {
    return (await client.PUT('/tags/{id}', { params: { path: { id: id } }, body: data })).data
  }

  static async getCocktailMethods(query = {}) {
    return (await client.GET('/cocktail-methods', { params: { query: query } })).data
  }

  static async getCocktailMethod(id: number) {
    return (await client.GET('/cocktail-methods/{id}', { params: { path: { id: id } } })).data
  }

  static async saveCocktailMethod(data: components["schemas"]["CocktailMethodRequest"]) {
    return (await client.POST('/cocktail-methods', { body: data })).data
  }

  static async updateCocktailMethod(id: number, data: components["schemas"]["CocktailMethodRequest"]) {
    return (await client.PUT('/cocktail-methods/{id}', { params: { path: { id: id } }, body: data })).data
  }

  static async deleteCocktailMethod(id: number) {
    return (await client.DELETE('/cocktail-methods/{id}', { params: { path: { id: id } } })).data
  }

  static async getShoppingList(id: number) {
    return (await client.GET('/users/{id}/shopping-list', { params: { path: { id: id } } })).data
  }

  static async addToShoppingList(id: number, data: components["schemas"]["ShoppingListRequest"]) {
    return (await client.POST('/users/{id}/shopping-list/batch-store', { params: { path: { id: id } }, body: data })).data
  }

  static async removeFromShoppingList(id: number, data: components["schemas"]["ShoppingListRequest"]) {
    return (await client.POST('/users/{id}/shopping-list/batch-delete', { params: { path: { id: id } }, body: data })).data
  }

  static async shareShoppingList(id: number) {
    return (await client.GET('/users/{id}/shopping-list/share', { params: { path: { id: id } } })).data
  }

  static async generateExportDownloadURL(id: number) {
    return (await client.POST('/exports/{id}/download', { params: { path: { id: id } } })).data
  }

  static async getRecommendedIngredients(id: number) {
    return (await client.GET('/users/{id}/ingredients/recommend', { params: { path: { id: id } } })).data
  }

  static async getBarRecommendedIngredients(id: number) {
    return (await client.GET('/bars/{id}/ingredients/recommend', { params: { path: { id: id } } })).data
  }

  static async getBars() {
    return (await client.GET('/bars')).data
  }

  static async getBar(id: number) {
    return (await client.GET('/bars/{id}', { params: { path: { id: id } } })).data
  }

  static async updateBar(id: number, data: components["schemas"]["BarRequest"]) {
    return (await client.PUT('/bars/{id}', { params: { path: { id: id } }, body: data })).data
  }

  static async saveBar(data: components["schemas"]["BarRequest"]) {
    return (await client.POST('/bars', { body: data })).data
  }

  static async deleteBar(id: number) {
    return (await client.DELETE('/bars/{id}', { params: { path: { id: id } } })).data
  }

  static async joinBar(inviteCode: string) {
    return (await client.POST('/bars/join', { body: { invite_code: inviteCode } })).data
  }

  static async leaveBar(id: number) {
    return (await client.DELETE('/bars/{id}/memberships', { params: { path: { id: id } } })).data
  }

  static async getBarMembers(id: number) {
    return (await client.GET('/bars/{id}/memberships', { params: { path: { id: id } } })).data
  }

  static async getSharedCollections(id: number) {
    return (await client.GET('/bars/{id}/collections', { params: { path: { id: id } } })).data
  }

  static async updateBarStatus(id:number, status: components["schemas"]["BarStatusEnum"]) {
    return (await client.POST('/bars/{id}/status', { params: { path: { id: id } }, body: { status: status} })).data
  }

  static async getBarStats(id: number) {
    return (await client.GET('/bars/{id}/stats', { params: { path: { id: id } } })).data
  }

  static async getUserIngredientShelf(id: number) {
    return (await client.GET('/users/{id}/ingredients', { params: { path: { id: id } } })).data
  }

  static async addToUserShelf(id: number, data: {}) {
    return (await client.POST('/users/{id}/ingredients/batch-store', { params: { path: { id: id } }, body: data })).data
  }

  static async removeFromUserShelf(id: number, data: {}) {
    return (await client.POST('/users/{id}/ingredients/batch-delete', { params: { path: { id: id } }, body: data })).data
  }

  static async getIngredient(id: string) {
    return (await client.GET('/ingredients/{id}', { params: { path: { id: id } } })).data
  }

  static async getExtraCocktailsWithIngredient(id: number) {
    return (await client.GET('/ingredients/{id}/extra', { params: { path: { id: id } } })).data
  }

  static async getUtensils() {
    return (await client.GET('/utensils')).data
  }

  static async getUtensil(id: number) {
    return (await client.GET('/utensils/{id}', { params: { path: { id: id } } })).data
  }

  static async saveUtensil(data: components["schemas"]["UtensilRequest"]) {
    return (await client.POST('/utensils', { body: data })).data
  }

  static async updateUtensil(id: number, data: components["schemas"]["UtensilRequest"]) {
    return (await client.PUT('/utensils/{id}', { params: { path: { id: id } }, body: data })).data
  }

  static async deleteUtensil(id: number) {
    return (await client.DELETE('/utensils/{id}', { params: { path: { id: id } } })).data
  }

  static async getIngredientCategories() {
    return (await client.GET('/ingredient-categories')).data
  }

  static async getPriceCategories() {
    return (await client.GET('/price-categories')).data
  }

  static async savePriceCategory(data: components["schemas"]["PriceCategoryRequest"]) {
    return (await client.POST('/price-categories', { body: data })).data
  }

  static async updatePriceCategory(id: number, data: components["schemas"]["PriceCategoryRequest"]) {
    return (await client.PUT('/price-categories/{id}', { params: { path: { id: id } }, body: data })).data
  }

  static async deletePriceCategory(id: number) {
    return (await client.DELETE('/price-categories/{id}', { params: { path: { id: id } } })).data
  }

  static async getIngredientCategory(id: number) {
    return (await client.GET('/ingredient-categories/{id}', { params: { path: { id: id } } })).data
  }

  static async updateIngredientCategory(id: number, data: components["schemas"]["IngredientCategoryRequest"]) {
    return (await client.PUT('/ingredient-categories/{id}', { params: { path: { id: id } }, body: data })).data
  }

  static async deleteIngredientCategory(id: number) {
    return (await client.DELETE('/ingredient-categories/{id}', { params: { path: { id: id } } })).data
  }

  static async saveIngredientCategory(data: components["schemas"]["IngredientCategoryRequest"]) {
    return (await client.POST('/ingredient-categories', { body: data })).data
  }

  static async getUsers() {
    return (await client.GET('/users')).data
  }

  static async getUser(id: number) {
    return (await client.GET('/users/{id}', { params: { path: { id: id } } })).data
  }

  static async saveUser(data: components["schemas"]["UserRequest"]) {
    return (await client.POST('/users', { body: data })).data
  }

  static async updateUser(id: number, data: components["schemas"]["UserRequest"]) {
    return (await client.PUT('/users/{id}', { params: { path: { id: id } }, body: data })).data
  }

  static async deleteUser(id: number) {
    return (await client.DELETE('/users/{id}', { params: { path: { id: id } } })).data
  }

  static async removeUserFromBar(barId: number, userId: number) {
    return (await client.DELETE('/bars/{id}/memberships/{userId}', { params: { path: { id: barId, userId: userId } } })).data
  }

  static async getCollections(query = {}) {
    return (await client.GET('/collections', { params: { query: query } })).data
  }

  static async getCollection(id: number) {
    return (await client.GET('/collections/{id}', { params: { path: { id: id } } })).data
  }

  static async updateCollection(id: number, data: components["schemas"]["CollectionRequest"]) {
    return (await client.PUT('/collections/{id}', { params: { path: { id: id } }, body: data })).data
  }

  static async deleteCollection(id: number) {
    return (await client.DELETE('/cocktails/{id}', { params: { path: { id: id } } })).data
  }

  static async syncCollectionCocktails(id: number, cocktails: number[]) {
    return (await client.PUT('/collections/{id}/cocktails', { params: { path: { id: id } }, body: { cocktails: cocktails } })).data
  }

  static async saveCollection(data: components["schemas"]["CollectionRequest"]) {
    return (await client.POST('/collections', { body: data })).data
  }

  static async scrapeCocktail(url: string) {
    return (await client.POST('/import/scrape', { body: { source: url } })).data
  }

  static async getGlasses(query = {}) {
    return (await client.GET('/glasses', { params: { query: query } })).data
  }

  static async getGlass(id: number) {
    return (await client.GET('/glasses/{id}', { params: { path: { id: id } } })).data
  }

  static async saveGlass(data: components["schemas"]["GlassRequest"]) {
    return (await client.POST('/glasses', { body: data })).data
  }

  static async updateGlass(id: number, data: components["schemas"]["GlassRequest"]) {
    return (await client.PUT('/glasses/{id}', { params: { path: { id: id } }, body: data })).data
  }

  static async deleteGlass(id: number) {
    return (await client.DELETE('/glasses/{id}', { params: { path: { id: id } } })).data
  }

  static getImageThumbUrl(imageId: number) {
    return `${apiBaseUrl}/images/${imageId}/thumb`
  }

  static async getServerVersion() {
    return (await client.GET('/server/version')).data
  }

  static async uploadImages(images: components["schemas"]["ImageRequest"][]) {
    return (await client.POST('/images',
      {
        body: { images: images }, bodySerializer(body) {
          const fd = new FormData();
          let i = 1
          for (const image of body.images) {
            if (image.id && image.id) {
              fd.append('images[' + i + '][id]', image.id?.toString() ?? '')
            }
            if (image.image && image.image) {
              fd.append('images[' + i + '][image]', image.image ?? '')
            }
            fd.append('images[' + i + '][copyright]', image.copyright ?? '')
            fd.append('images[' + i + '][sort]', image.sort?.toString() ?? '1')
            i++
          }
          return fd;
        }
      }
    )).data
  }

  static async deleteImage(id: number) {
    return (await client.DELETE('/images/{id}', { params: { path: { id: id } } })).data
  }

  static async getMenu() {
    return (await client.GET('/menu')).data
  }

  static async getPublicMenu(slug: string) {
    return (await client.GET('/explore/menus/{slug}', { params: { path: { slug: slug } } })).data
  }

  static async updateMenu(data: components["schemas"]["MenuRequest"]) {
    return (await client.POST('/menu', { body: data })).data
  }

  static async getTokens() {
    return (await client.GET('/tokens')).data
  }

  static async saveToken(data: components["schemas"]["PersonalAccessTokenRequest"]) {
    return (await client.POST('/tokens', { body: data })).data
  }

  static async deleteToken(id: number) {
    return (await client.DELETE('/tokens/{id}', { params: { path: { id: id } } })).data
  }

  static async getExports() {
    return (await client.GET('/exports')).data
  }

  static async saveExport(data: components["schemas"]["ExportRequest"]) {
    return (await client.POST('/exports', { body: data })).data
  }

  static async deleteExport(id: number) {
    return (await client.DELETE('/exports/{id}', { params: { path: { id: id } } })).data
  }

  static async getSubscriptionStatus() {
    return (await client.GET('/billing/subscription')).data
  }

  static async updateSubscriptionStatus(status: string) {
    return (await client.POST('/billing/subscription', { body: { type: status } })).data
  }

  static async addToBarShelf(id: number, data: {}) {
    return (await client.POST('/bars/{id}/ingredients/batch-store', { params: { path: { id: id } }, body: data })).data
  }

  static async removeFromBarShelf(id: number, data: {}) {
    return (await client.POST('/bars/{id}/ingredients/batch-delete', { params: { path: { id: id } }, body: data })).data
  }

  static async getCocktailPrices(id: string) {
    return (await client.GET('/cocktails/{id}/prices', { params: { path: { id: id } } })).data
  }

  static async getBarShelfCocktails(id: number) {
    return (await client.GET('/bars/{id}/cocktails', { params: { path: { id: id }, query: { per_page: 500 } } })).data
  }

  static async getMenuExport() {
    return (await client.GET('/menu/export', {parseAs: 'text'})).data
  }
}