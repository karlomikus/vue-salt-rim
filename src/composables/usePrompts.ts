export default function usePrompts() {
    const buildIngredientPrompt = (ingredientName: string) => {
        return `
            # Follow these instructions
            - Use 2-3 detailed paragraphs
            - The following properties SHOULD NOT be included in the description: color.
            - DONT mention cocktail recipes, keep information about the ingredient itself.
            - Description CAN be in markdown format.
            - Color should always be in hex format and should describe the color of the liquid or solid ingredient.
            - Origin should be a 1-2 word sentance describing the origin of the ingredient, prefering its country of origin.
            - Strength should be a number between 0 and 100, representing the ABV of the ingredient.
            <INGREDIENT_NAME>
            ${ingredientName}
            </INGREDIENT_NAME>`
    }

    const buildCocktailTagsPrompt = (content: string, tags: string[]) => {
        return `
            # Follow these instructions
            - Analyze the COCKTAIL_RECIPE below and suggest relevant tags that describe its key flavors
            - Aim for 3-7 tags.
            - DONT include ingredient names in the tags.
            - Analyze ingredients, their amounts and try to understand preparation methods and any other relevant aspects of the recipe.
            - Respond only in JSON
            <COCKTAIL_RECIPE>
            ${content}
            </COCKTAIL_RECIPE>
            <EXAMPLE_TAGS>
            ${tags.join(', ')}
            </EXAMPLE_TAGS>`;
    }

    return {
        buildIngredientPrompt,
        buildCocktailTagsPrompt,
    }
}
