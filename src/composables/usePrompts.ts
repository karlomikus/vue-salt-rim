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

    return {
        buildIngredientPrompt
    }
}