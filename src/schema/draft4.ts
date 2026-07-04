/**
 * Schema for a cocktail recipe.
 */
export interface CocktailRecipeDraft04 {
    /**
     * Name of the recipe
     */
    name: string;
    /**
     * Recipe instructions
     */
    instructions: string;
    /**
     * Date of recipe
     */
    created_at?: string | null;
    /**
     * Source of the recipe, either URL, author or book reference
     */
    source?: string | null;
    /**
     * Recipe description
     */
    description?: string | null;
    /**
     * Cocktail garnish
     */
    garnish?: string | null;
    /**
     * Total ABV of made cocktail
     */
    abv?: number | null;
    /**
     * Short keywords to describe cocktail
     */
    tags?: string[];
    /**
     * Glassware type, like 'Coupe', 'Highball', etc.
     */
    glass?: string | null;
    /**
     * Cocktail method
     */
    method?: string | null;
    /**
     * List of cocktail images
     */
    images?: Image[];
    /**
     * List of cocktail ingredients and substitutes (can be empty)
     */
    ingredients?: CocktailIngredient[];
}
export interface Image {
    uri: (
        | {
              [k: string]: unknown;
          }
        | {
              [k: string]: unknown;
          }
    ) &
        string;
    /**
     * Computed placeholder hash, like thumbhash, blurhash and similar
     */
    placeholder_hash?: string | null;
    /**
     * Image copyright information
     */
    copyright: string;
}
export interface CocktailIngredient {
    /**
     * Name of the ingredient
     */
    name: string;
    /**
     * Amount of the ingredient
     */
    amount: number;
    /**
     * Units for the amount
     */
    units: string;
    /**
     * Indicates if the ingredient is optional
     */
    optional?: boolean;
    /**
     * Maximum amount of the ingredient
     */
    amount_max?: number | null;
    /**
     * Additional note related to the cocktail ingredient
     */
    note?: string | null;
    substitutes?: CocktailIngredientSubstitute[];
}
export interface CocktailIngredientSubstitute {
    /**
     * Name of the substitute ingredient
     */
    name: string;
    /**
     * Amount of the substitute ingredient
     */
    amount?: number | null;
    /**
     * Units for the amount
     */
    units?: string | null;
    /**
     * Maximum amount of the substitute ingredient
     */
    amount_max?: number | null;
}
