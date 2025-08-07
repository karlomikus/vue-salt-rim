import schema from '@/schema/draft2.json'

export default function usePrompts() {
    const buildIngredientPrompt = (ingredientName: string) => {
        return `
            # Identity
            You are assistant that helps to write ingredient information for a cocktail management application.
            # Instructions
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
            # Identity
            You are assistant that helps to tag cocktail recipes for a cocktail management application.
            #Instructions
            - Analyze the COCKTAIL_RECIPE below and suggest relevant tags that describe its key flavors
            - Aim for 3-7 tags.
            - DONT include ingredient names in the tags.
            - Analyze ingredients, their amounts and try to understand preparation methods and any other relevant aspects of the recipe.
            <COCKTAIL_RECIPE>
            ${content}
            </COCKTAIL_RECIPE>
            <EXAMPLE_TAGS>
            ${tags.join(', ')}
            </EXAMPLE_TAGS>`;
    }

    const buildRecipeImprovementPrompt = (content: string) => {
        return `
            # Identity
            You are an assistant that helps to improve recipe details for a cocktail management application.
            # Instructions
            - Analyzes recipe instructions for clarity, grammar, and completeness.
            - Each instruction step should be numbered and concise, avoiding unnecessary complexity.
            - Number the steps in the instructions. (Example 1. Do this\n\n2. Do that)
            - Check descriptions for grammar and spelling errors.
            <RECIPE>
            ${content}
            </RECIPE>`;
    }

    const buildGenerateSchemaPrompt = (content: string) => {
        return `
        These are the steps you should follow:
        1. Read and understand the JSON schema.
        2. Read the provided recipe text and reformat it into this schema and return the JSON.

        Schema:
        ${JSON.stringify(schema)}

        Recipe text:
        ${content}`;
    }

    return {
        buildIngredientPrompt,
        buildCocktailTagsPrompt,
        buildRecipeImprovementPrompt,
        buildGenerateSchemaPrompt,
    }
}
