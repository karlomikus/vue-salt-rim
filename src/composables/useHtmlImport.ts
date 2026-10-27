import { ref } from "vue";
import BarAssistantClient from "@/api/BarAssistantClient";
import type { ImportResult, ScrapedCocktailSchema } from "@/schema/ImportResult";

export function useHtmlImport() {
    const isLoading = ref(false);
    const result = ref<ImportResult | null>(null);
    const error = ref<Error | null>(null);

    async function scrapeFromHtml(htmlContent: string): Promise<void> {
        isLoading.value = true;
        error.value = null;

        try {
            const resp = await BarAssistantClient.scrapeCocktail("http://barassistant.app", htmlContent);
            const data = resp?.data;

            if (!data?.schema) {
                throw new Error("No schema returned from HTML scraper");
            }

            const schema = data.schema as ScrapedCocktailSchema;

            result.value = {
                name: schema.name,
                description: schema.description ?? null,
                instructions: schema.instructions,
                garnish: schema.garnish ?? null,
                source: "HTML Import",
                tags: schema.tags ?? [],
                glassName: schema.glass ?? null,
                methodName: schema.method ?? null,
                author: schema.author ?? null,
                originBar: schema.origin_bar ?? null,
                year: schema.year ?? null,
                images:
                    schema.images?.map((img) => {
                        return {
                            uri: img.uri as string,
                            copyright: img.copyright,
                        };
                    }) ?? [],
                ingredients:
                    schema.ingredients?.map((i) => {
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
        } catch (e) {
            error.value = e instanceof Error ? e : new Error("Failed to scrape cocktail from HTML");
            result.value = null;
            throw error.value;
        } finally {
            isLoading.value = false;
        }
    }

    function clearHtmlImport(): void {
        isLoading.value = false;
        result.value = null;
        error.value = null;
    }

    return {
        isLoading,
        result,
        error,
        scrapeFromHtml,
        clearHtmlImport,
    };
}
