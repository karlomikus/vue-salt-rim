import type { components } from "@/api/api";

type Ingredient = components["schemas"]["IngredientBasic"];

export interface ImportResult {
    name: string;
    description: string | null;
    instructions: string;
    garnish: string | null;
    source: string;
    tags: string[];
    glassName: string | null;
    methodName: string | null;
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
