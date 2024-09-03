import createClient, { type Middleware } from "openapi-fetch";
import type { paths, components } from "@/api/api";
import AppState from '@/AppState'

let accessToken: string | undefined = undefined;

const appState = new AppState()

const checkToken: Middleware = {
  async onResponse({ response }) {
    if (response.status == 401) {
      appState.clear()
      window.location.replace('/')
    }
    return undefined;
  },
};

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    accessToken = appState.token
    request.headers.set("Authorization", `Bearer ${accessToken}`);
    request.headers.set("Accept", "application/json");
    return request;
  },
};

const barIdMiddleware: Middleware = {
  async onRequest({ request }) {
    request.headers.set("Bar-Assistant-Bar-Id", appState.bar.id.toString());
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

const client = createClient<paths>({ baseUrl: window.srConfig.API_URL + '/api' });
client.use(checkToken);
client.use(authMiddleware);
client.use(barIdMiddleware);
client.use(rejectOnError);

export default class BarAssistantClient {
  static async getIngredients(query = {}) {
    return (await client.GET('/ingredients', { params: { query: query } })).data
  }

  static async saveIngredient(data: components["schemas"]["IngredientRequest"]) {
    return (await client.POST('/ingredients', { body: data })).data
  }

  static async getCocktail(id: string) {
    return (await client.GET('/cocktails/{id}', { params: { path: { id: id } } })).data
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

  static async getCollections() {
    return (await client.GET('/collections')).data
  }

  static async getCollection(id: number) {
    return (await client.GET('/collections/{id}', { params: { path: { id: id } } })).data
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
            if (image.image_url && image.image_url) {
              fd.append('images[' + i + '][image_url]', image.image_url ?? '')
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
}