import { describe, it, expect } from "vitest";
import { useMarkdown } from "../useMarkdown";

describe("useMarkdown", () => {
    it("renders an HTML-escaped blockquote as a blockquote", () => {
        const result = useMarkdown("&gt; Everybody knows the significance");

        expect(result).toContain("<blockquote>");
        expect(result).toContain("Everybody knows the significance");
    });

    it("renders an already clean blockquote as a blockquote", () => {
        const result = useMarkdown("> Everybody knows the significance");

        expect(result).toContain("<blockquote>");
    });

    it("decodes numeric apostrophe entities", () => {
        const result = useMarkdown("Bartender&#039;s Bar");

        expect(result).not.toContain("&#039;");
        expect(result).toMatch(/Bartender(?:'|&#x27;|&#39;|&apos;)s Bar/);
    });

    it("renders an HTML-escaped autolink as a link", () => {
        const result = useMarkdown("&lt;https://barassistant.app&gt;");

        expect(result).toContain('<a href="https://barassistant.app">');
    });

    it("returns an empty string for empty input", () => {
        expect(useMarkdown("")).toBe("");
    });

    it("still escapes raw HTML after decoding", () => {
        const result = useMarkdown("&lt;script&gt;alert(1)&lt;/script&gt;");

        expect(result).not.toContain("<script>");
        expect(result).toContain("&lt;script&gt;");
    });
});
