import { readonly, ref } from "vue";
import BarAssistantClient from "@/api/BarAssistantClient";
import type { components } from "@/api/api";

export type Cocktail = components["schemas"]["Cocktail"];

export function useIngredientCocktails() {
    let latestIngredientId = 0;
    const cocktails = ref<Cocktail[]>([]);
    const cocktailsTotal = ref(0);
    const makeableTotal = ref(0);
    const isLoading = ref(false);

    async function fetchCocktails(ingredientId: number, maxCocktails: number) {
        latestIngredientId = ingredientId;
        isLoading.value = true;
        try {
            const resp = await BarAssistantClient.getCocktails({
                "filter[ingredient_id]": ingredientId.toString(),
                sort: "-random",
                per_page: maxCocktails,
                include: "images,ingredients.ingredient",
            });

            if (latestIngredientId === ingredientId) {
                cocktails.value = (resp?.data ?? []).slice(0, maxCocktails);
                cocktailsTotal.value = resp?.meta?.total ?? cocktails.value.length;
            }
        } catch (e) {
            if (latestIngredientId === ingredientId) {
                cocktails.value = [];
                cocktailsTotal.value = 0;
            }
        } finally {
            if (latestIngredientId === ingredientId) {
                isLoading.value = false;
            }
        }
    }

    async function fetchMakeableTotal(ingredientId: number) {
        try {
            const resp = await BarAssistantClient.getCocktails({
                "filter[bar_shelf]": true,
                "filter[ingredient_id]": ingredientId.toString(),
                per_page: 1,
            });

            if (latestIngredientId === ingredientId) {
                makeableTotal.value = resp?.meta?.total ?? 0;
            }
        } catch (e) {
            if (latestIngredientId === ingredientId) {
                makeableTotal.value = 0;
            }
        }
    }

    async function refresh(ingredientId: number, maxCocktails: number) {
        await Promise.all([fetchCocktails(ingredientId, maxCocktails), fetchMakeableTotal(ingredientId)]);
    }

    return {
        cocktails: readonly(cocktails),
        cocktailsTotal: readonly(cocktailsTotal),
        makeableTotal: readonly(makeableTotal),
        isLoading: readonly(isLoading),
        refresh,
    };
}
