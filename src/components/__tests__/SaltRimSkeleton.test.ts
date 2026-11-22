// @vitest-environment jsdom
import { afterEach, expect, test } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import SaltRimSkeleton from "../SaltRimSkeleton.vue";

let wrapper: VueWrapper | undefined;

afterEach(() => {
    wrapper?.unmount();
});

test("renders default dimensions and radius", () => {
    wrapper = mount(SaltRimSkeleton);

    const skeleton = wrapper.get(".salt-rim-skeleton");
    expect(skeleton.attributes("aria-hidden")).toBe("true");
    expect(skeleton.attributes("style")).toContain("width: 100%");
    expect(skeleton.attributes("style")).toContain("height: 100%");
    expect(skeleton.attributes("style")).toContain("border-radius: var(--radius-3)");
});

test("converts numeric dimensions to pixels", () => {
    wrapper = mount(SaltRimSkeleton, {
        props: { width: 240, height: 48, radius: "none", index: 2 },
    });

    const skeleton = wrapper.get(".salt-rim-skeleton");
    expect(skeleton.attributes("style")).toContain("width: 240px");
    expect(skeleton.attributes("style")).toContain("height: 48px");
    expect(skeleton.attributes("style")).toContain("border-radius: 0px");
    expect(skeleton.classes()).toContain("salt-rim-skeleton--radius-none");
});

test("uses staggered animation delay", () => {
    wrapper = mount(SaltRimSkeleton, {
        props: { index: 3 },
    });

    const skeleton = wrapper.get(".salt-rim-skeleton");
    expect(skeleton.attributes("style")).toContain("animation-delay: 600ms");
});

test("supports string dimensions and rounded radius", () => {
    wrapper = mount(SaltRimSkeleton, {
        props: { width: "50vw", height: "2rem", radius: "rounded" },
    });

    const skeleton = wrapper.get(".salt-rim-skeleton");
    expect(skeleton.attributes("style")).toContain("width: 50vw");
    expect(skeleton.attributes("style")).toContain("height: 2rem");
    expect(skeleton.attributes("style")).toContain("border-radius: var(--radius-round)");
});
