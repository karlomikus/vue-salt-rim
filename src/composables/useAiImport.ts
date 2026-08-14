import { ref } from "vue";
import BarAssistantClient from "@/api/BarAssistantClient";
import type { ImportResult } from "@/schema/ImportResult";

interface AiGeneratedIngredient {
    name: string;
    amount: number | null;
    amount_max: number | null;
    units: string | null;
    note: string | null;
}

interface AiGeneratedRecipe {
    name: string;
    description: string | null;
    instructions: string;
    garnish: string | null;
    method: string | null;
    ingredients: AiGeneratedIngredient[];
}

export function useAiImport() {
    const isLoading = ref(false);
    const result = ref<ImportResult | null>(null);
    const error = ref<Error | null>(null);

    async function generateFromAi(aiContent: string): Promise<void> {
        isLoading.value = true;
        error.value = null;

        try {
            const resp = await BarAssistantClient.aiGenerateCocktailRecipe(aiContent);
            const schema = resp?.data as AiGeneratedRecipe;

            if (!schema) {
                throw new Error("No recipe generated from AI");
            }

            result.value = {
                name: schema.name,
                description: schema.description ?? null,
                instructions: schema.instructions,
                garnish: schema.garnish ?? null,
                source: "Raw text input",
                tags: [],
                glassName: null,
                methodName: schema.method ?? null,
                images: [],
                ingredients: schema.ingredients.map((ing, idx) => {
                    return {
                        matchedIngredient: null,
                        source: "",
                        name: ing.name,
                        amount: ing.amount ?? null,
                        amount_max: ing.amount_max ?? null,
                        units: ing.units ?? null,
                        note: ing.note ?? null,
                        substitutes: [],
                    };
                }),
            };
        } catch (e) {
            error.value = e instanceof Error ? e : new Error("Failed to generate recipe from AI");
            result.value = null;
            throw error.value;
        } finally {
            isLoading.value = false;
        }
    }

    function clearAiImport(): void {
        isLoading.value = false;
        result.value = null;
        error.value = null;
    }

    return {
        isLoading,
        result,
        error,
        generateFromAi,
        clearAiImport,
    };
}
