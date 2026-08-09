// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import PrintCocktail from "../PrintCocktail.vue";
import type { CocktailPrintModel } from "../types";

function makeCocktail(overrides: Partial<CocktailPrintModel> = {}): CocktailPrintModel {
    return {
        name: "Old Fashioned",
        description: null,
        instructions: "Stir with ice.",
        garnish: null,
        images: [],
        ingredients: [],
        ...overrides,
    };
}

function mountPrint(overrides: Partial<CocktailPrintModel> = {}) {
    return mount(PrintCocktail, {
        props: { cocktail: makeCocktail(overrides) },
        global: {
            mocks: {
                $t: (key: string) => key,
            },
        },
    });
}

describe("PrintCocktail markdown rendering", () => {
    it("renders an API-escaped blockquote as a <blockquote>, not a <p>", () => {
        const wrapper = mountPrint({
            description: "Created by X at Bartender's Bar.\n\n&gt; Everybody knows the significance",
        });

        const blockquote = wrapper.find("blockquote");
        expect(blockquote.exists()).toBe(true);
        expect(blockquote.text()).toContain("Everybody knows the significance");
        expect(wrapper.text()).not.toContain("&gt;");
    });

    it("renders &#039; as an apostrophe", () => {
        const wrapper = mountPrint({
            description: "Bartender&#039;s Bar",
        });

        expect(wrapper.text()).toContain("Bartender's Bar");
    });

    it("still renders a blockquote for already clean input", () => {
        const wrapper = mountPrint({
            description: "> Everybody knows the significance",
        });

        expect(wrapper.find("blockquote").exists()).toBe(true);
    });

    it("decodes escaped instructions and garnish too", () => {
        const wrapper = mountPrint({
            instructions: "&gt; Stir, don&#039;t shake",
            garnish: "&gt; Orange twist",
        });

        expect(wrapper.findAll("blockquote")).toHaveLength(2);
        expect(wrapper.text()).toContain("Stir, don't shake");
        expect(wrapper.text()).toContain("Orange twist");
    });

    it("renders nothing for a null description", () => {
        const wrapper = mountPrint({ description: null });

        expect(wrapper.find(".cocktail-main-info div").exists()).toBe(false);
        expect(wrapper.find(".cocktail-main-info h1").text()).toBe("Old Fashioned");
    });

    it("renders nothing for an empty description", () => {
        const wrapper = mountPrint({ description: "" });

        expect(wrapper.find(".cocktail-main-info div").exists()).toBe(false);
    });
});
