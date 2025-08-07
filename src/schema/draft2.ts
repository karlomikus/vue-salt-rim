/**
 * Schema for a cocktail recipe including detailed ingredient data. Draft 02 splits ingredients and recipe data.
 */
export interface CocktailRecipeDraft02 {
    recipe: {
        /**
         * The unique identifier for a cocktail
         */
        _id: string;
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
         * Recipe description
         */
        description?: string | null;
        /**
         * Source of the recipe, either URL or Book referece
         */
        source?: string | null;
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
         * Glass type
         */
        glass?: string | null;
        /**
         * Cocktail method
         */
        method?: string | null;
        /**
         * Required utensils
         */
        utensils?: string[];
        /**
         * List of cocktail images
         */
        images?: Image[];
        /**
         * List of cocktail ingredients and substitutes
         */
        ingredients?: CocktailIngredient[];
    };
    /**
     * List of ingredients
     */
    ingredients: Ingredient[];
}
export interface Image {
    uri: string;
    /**
     * Control the representation of the image
     */
    sort?: number;
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
     * The unique reference for an ingredient from `ingredients` property
     */
    _id: string;
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
    /**
     * Sort order for the ingredient
     */
    sort?: number;
}
export interface CocktailIngredientSubstitute {
    /**
     * The unique reference for an ingredient from `ingredients` property
     */
    _id: string;
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
export interface Ingredient {
    /**
     * The unique identifier for an ingredient, used as a refrence in cocktail ingredient list
     */
    _id: string;
    name: string;
    /**
     * Ingredient ABV
     */
    strength?: number | null;
    /**
     * Additional ingredient information
     */
    description?: string | null;
    /**
     * Ingredient origin
     */
    origin?: string | null;
    /**
     * Category ingredient belongs to
     */
    category?: string | null;
}
