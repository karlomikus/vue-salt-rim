import { ref } from "vue";
import BarAssistantClient from "@/api/BarAssistantClient";

const newIssueUrl = "https://github.com/bar-assistant/data/issues/new";

interface ExportedRecipe {
    name?: string;
    source?: string | null;
}

function catalogIdFromSlug(slug: string): string {
    return slug.replace(/-(\d+)$/, "");
}

function buildIssueBody(name: string, slug: string, source: string | null, json: string): string {
    return [
        "## What should be improved?",
        "",
        "Describe any typos, wrong amounts, or request that this recipe be added to the catalog.",
        "",
        "## Recipe",
        "",
        `- Name: ${name}`,
        `- Catalog ID: ${catalogIdFromSlug(slug)}`,
        `- Source: ${source || "—"}`,
        `- Bar Assistant version: ${window.srConfig.VERSION ?? ""}`,
    ].join("\n");
}

export function useRecipeIssue() {
    const isLoading = ref(false);

    async function suggestImprovement(slug: string, units: string): Promise<Error | null> {
        const openedWindow = window.open("", "_blank");

        if (!openedWindow) {
            return new Error("Unable to open a new tab");
        }

        isLoading.value = true;

        try {
            const response = await BarAssistantClient.shareCocktail(slug, { type: "json", units });
            const content = response?.data?.content ?? "";
            const parsed = JSON.parse(content) as ExportedRecipe;
            // const minified = JSON.stringify(parsed);

            const title = `Recipe: ${parsed.name ?? ""}`;
            const body = buildIssueBody(parsed.name ?? "", slug, parsed.source ?? null, "");

            openedWindow.location.href = `${newIssueUrl}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
            openedWindow.opener = null;

            return null;
        } catch (e) {
            openedWindow.close();
            return e instanceof Error ? e : new Error("Unable to prepare the improvement report");
        } finally {
            isLoading.value = false;
        }
    }

    return {
        isLoading,
        suggestImprovement,
    };
}
