import type { components } from "@/api/api";

/** Flattened ingredient shape used for print rendering. */
export interface CocktailPrintIngredient {
    name: string;
    amount: number;
    amount_max: number | null;
    units: string;
    optional: boolean;
    note: string | null;
    substitutes: CocktailPrintSubstitute[];
}

export interface CocktailPrintSubstitute {
    name: string;
    amount: number | null;
    amount_max: number | null;
    units: string | null;
}

export interface CocktailPrintImage {
    url: string;
    copyright: string | null;
}

/** Normalized cocktail model consumed by PrintCocktail.vue. */
export interface CocktailPrintModel {
    name: string;
    description: string | null;
    instructions: string;
    garnish: string | null;
    images: CocktailPrintImage[];
    ingredients: CocktailPrintIngredient[];
}

/** Map an authenticated Cocktail API response to the print model. */
export function mapCocktailToPrintModel(cocktail: components["schemas"]["Cocktail"]): CocktailPrintModel {
    return {
        name: cocktail.name,
        description: cocktail.description ?? null,
        instructions: cocktail.instructions,
        garnish: cocktail.garnish ?? null,
        images: (cocktail.images ?? []).map((img) => ({
            url: img.url ?? "",
            copyright: img.copyright ?? null,
        })),
        ingredients: (cocktail.ingredients ?? []).map((ing) => ({
            name: ing.ingredient.name,
            amount: ing.amount,
            amount_max: ing.amount_max ?? null,
            units: ing.units,
            optional: ing.optional ?? false,
            note: ing.note,
            substitutes: (ing.substitutes ?? []).map((sub) => ({
                name: sub.ingredient.name,
                amount: sub.amount,
                amount_max: sub.amount_max ?? null,
                units: sub.units,
            })),
        })),
    };
}

/** Map a PublicCocktailResource API response to the print model. */
export function mapPublicCocktailToPrintModel(cocktail: components["schemas"]["PublicCocktailResource"]): CocktailPrintModel {
    return {
        name: cocktail.name,
        description: cocktail.description ?? null,
        instructions: cocktail.instructions,
        garnish: cocktail.garnish ?? null,
        images: (cocktail.images ?? []).map((img) => ({
            url: img.url,
            copyright: img.copyright ?? null,
        })),
        ingredients: (cocktail.ingredients ?? []).map((ing) => ({
            name: ing.name,
            amount: ing.amount,
            amount_max: ing.amount_max ?? null,
            units: ing.units,
            optional: ing.optional ?? false,
            note: ing.note ?? null,
            substitutes: (ing.substitutes ?? []).map((sub) => ({
                name: sub.name,
                amount: sub.amount,
                amount_max: sub.amount_max ?? null,
                units: sub.units,
            })),
        })),
    };
}
