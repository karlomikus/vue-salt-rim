import { micromark } from "micromark";
import { useHtmlDecode } from "./useHtmlDecode";

export function useMarkdown(input: string): string {
    return micromark(useHtmlDecode(input));
}
