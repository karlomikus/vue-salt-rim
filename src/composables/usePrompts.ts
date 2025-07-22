export default function usePrompts() {
    const buildIngredientPrompt = (ingredientName: string) => {
        return `I'm writing information about an ingredient in cocktail management application.
            Give me a 2-3 paragraphs about INGREDIENT_NAME below. You should follow these rules:
            - The following properties SHOULD NOT be included in the description: color.
            - DONT mention cocktail recipes, keep information about the ingredient itself.
            - Description CAN be in markdown format.
            - Colors should always be in hex format and should describe the color of the liquid or solid ingredient.
            - Origin should be a 1-2 word sentance describing the origin of the ingredient, prefering its country of origin.
            - Strength should be a number between 0 and 100, representing the ABV of the ingredient.
            <INGREDIENT_NAME>
            ${ingredientName}
            </INGREDIENT_NAME>`
    }

    const buildCocktailTagsPrompt = (content: string, tags: string[]) => {
        return `
            Your responsibility is to help write tags for a cocktail recipes app.
            Please analyze the COCKTAIL_RECIPE below and suggest relevant tags that describe its key themes, topics, and main ideas. The rules are:
            - Aim for tags that are relevant to the cocktail recipe, such as flavors.
            - Aim for 3-7 tags.
            - Analyze ingredients, their amounts, preparation methods, and any other relevant aspects of the recipe.
            - If there are no good tags, leave the array empty.
            - Prefer tags that are defined in the EXISTING_TAGS array, but if there are no good matches, you can create new ones.
            - DONT include ingredient names in the tags.

            <EXISTING_TAGS>
            ${tags.join(', ')}
            </EXISTING_TAGS>
            <COCKTAIL_RECIPE>
            ${content}
            </COCKTAIL_RECIPE>`;
    }

    return {
        buildIngredientPrompt,
        buildCocktailTagsPrompt,
    }
}
