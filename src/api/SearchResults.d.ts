export interface SearchResults {
    ingredient: {
        id: number;
        slug: string;
        name: string;
        image_url: string|null;
        description: string|null;
        category: string|null;
        bar_id: number;
        units?: string|null;
    },
    cocktail: {
        id: number;
        name: string;
        slug: string;
        description: string|null;
        image_url: string|null;
        short_ingredients: string[];
        tags: string[];
        bar_id: number;
    }
}