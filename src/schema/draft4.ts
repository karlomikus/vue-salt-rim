export interface CocktailRecipeDraft04 {
    name: string;
    instructions: string;
    created_at?: string | null;
    source?: string | null;
    description?: string | null;
    garnish?: string | null;
    abv?: number | null;
    tags?: string[];
    glass?: string | null;
    method?: string | null;
    images?: CocktailRecipeImageDraft04[];
    ingredients?: CocktailRecipeIngredientDraft04[];
}

export interface CocktailRecipeImageDraft04 {
    uri: string;
    sort?: number;
    placeholder_hash?: string | null;
    copyright: string;
}

export interface CocktailRecipeIngredientDraft04 {
    name: string;
    amount: number;
    units: string;
    optional?: boolean;
    amount_max?: number | null;
    note?: string | null;
    substitutes?: CocktailRecipeIngredientSubstituteDraft04[];
}

export interface CocktailRecipeIngredientSubstituteDraft04 {
    name: string;
    amount?: number | null;
    units?: string | null;
    amount_max?: number | null;
}
