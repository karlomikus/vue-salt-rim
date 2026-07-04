import { ref } from "vue";
import type { ImportResult } from "@/schema/ImportResult";
import type { CocktailRecipeDraft04 } from "@/schema/draft4";

export function useJsonImport() {
    const isLoading = ref(false);
    const result = ref<ImportResult | null>(null);
    const error = ref<Error | null>(null);

    function importFromJson(jsonString: string): void {
        isLoading.value = true;
        error.value = null;

        try {
            const parsed = JSON.parse(jsonString) as CocktailRecipeDraft04;

            result.value = {
                name: parsed.name,
                description: parsed.description ?? null,
                instructions: parsed.instructions,
                garnish: parsed.garnish ?? null,
                source: parsed.source ?? "",
                tags: parsed.tags ?? [],
                glassName: parsed.glass ?? null,
                methodName: parsed.method ?? null,
                images:
                    parsed.images?.map((img) => {
                        return {
                            uri: img.uri,
                            copyright: img.copyright,
                        };
                    }) ?? [],
                ingredients:
                    parsed.ingredients?.map((i) => {
                        return {
                            matchedIngredient: null,
                            name: i.name,
                            units: i.units,
                            source: "",
                            amount: i.amount ?? null,
                            amount_max: i.amount_max ?? null,
                            note: i.note ?? null,
                            substitutes:
                                i.substitutes?.map((s) => {
                                    return {
                                        matchedIngredient: null,
                                        name: s.name,
                                        units: s.units ?? null,
                                        amount: s.amount ?? null,
                                        amount_max: s.amount_max ?? null,
                                    };
                                }) ?? [],
                        };
                    }) ?? [],
            };
        } catch (e) {
            error.value = e instanceof Error ? e : new Error("Unable to parse JSON");
            result.value = null;
            throw error.value;
        } finally {
            isLoading.value = false;
        }
    }

    function clearJsonImport(): void {
        isLoading.value = false;
        result.value = null;
        error.value = null;
    }

    return {
        isLoading,
        result,
        error,
        importFromJson,
        clearJsonImport,
    };
}
