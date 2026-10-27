import type { components } from "@/api/api";

type Ingredient = components["schemas"]["IngredientBasic"];

export type ScrapedCocktailSchema = components["schemas"]["cocktail-04.schema"] & {
    author?: string | null;
    origin_bar?: string | null;
    year?: number | null;
};

export interface ImportResult {
    name: string;
    description: string | null;
    instructions: string;
    garnish: string | null;
    source: string;
    tags: string[];
    glassName: string | null;
    methodName: string | null;
    author: string | null;
    originBar: string | null;
    year: number | null;
    images: {
        uri: string;
        copyright: string;
    }[];
    ingredients: {
        matchedIngredient: Ingredient | null;
        source: string;
        name: string;
        amount: number | null;
        amount_max: number | null;
        units: string | null;
        note: string | null;
        substitutes: {
            matchedIngredient: Ingredient | null;
            name: string;
            amount: number | null;
            amount_max: number | null;
            units: string | null;
        }[];
    }[];
}
