import { ref } from "vue";
import BarAssistantClient from "@/api/BarAssistantClient";
import type { ImportResult } from "@/schema/ImportResult";

export function useUrlImport() {
    const isLoading = ref(false);
    const result = ref<ImportResult | null>(null);

    async function scrapeCocktail(url: string): Promise<void> {
        isLoading.value = true;

        try {
            const resp = await BarAssistantClient.scrapeCocktail(url);
            const data = resp?.data;

            if (!data) {
                throw new Error("No schema returned from scraper");
            }

            result.value = {
                name: data.schema.name,
                description: data.schema.description ?? null,
                instructions: data.schema.instructions,
                garnish: data.schema.garnish ?? null,
                source: data.schema.source ?? url,
                tags: data.schema.tags ?? [],
                glassName: data.schema.glass ?? null,
                methodName: data.schema.method ?? null,
                images:
                    data.schema.images?.map((img) => {
                        return {
                            uri: img.uri as string,
                            copyright: img.copyright,
                        };
                    }) ?? [],
                ingredients:
                    data.schema.ingredients?.map((i) => {
                        return {
                            matchedIngredient: null,
                            name: i.name,
                            units: i.units,
                            source: data.scraper_meta.find((meta) => meta.ingredient_name === i.name)?.source ?? "",
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
        } catch (error) {
            result.value = null;
            throw error;
        } finally {
            isLoading.value = false;
        }
    }

    function clearUrlImport(): void {
        isLoading.value = false;
        result.value = null;
    }

    return {
        isLoading,
        result,
        scrapeCocktail,
        clearUrlImport,
    };
}
