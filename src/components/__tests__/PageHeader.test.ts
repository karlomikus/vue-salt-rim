// @vitest-environment jsdom
import { afterEach, expect, test } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import PageHeader from "../PageHeader.vue";

let wrapper: VueWrapper | undefined;

afterEach(() => {
    wrapper?.unmount();
});

function mountHeader(actions?: string) {
    wrapper = mount(PageHeader, {
        attachTo: document.body,
        slots: {
            default: "Cocktails",
            ...(actions ? { actions } : {}),
        },
        global: { mocks: { $t: (key: string) => key } },
    });
    return wrapper;
}

test("renders inline actions without a floating button by default", () => {
    const header = mountHeader('<button class="add">Add cocktail</button>');

    expect(header.get(".site-page-header__actions").classes()).not.toContain("site-page-header__actions--open");
    expect(header.get(".site-page-header__fab").attributes("aria-label")).toBe("actions");
    expect(header.find(".site-page-header__scrim").exists()).toBe(false);
});

test("shows and hides actions from the floating action button", async () => {
    const header = mountHeader('<button class="add">Add cocktail</button>');
    const fab = header.get(".site-page-header__fab");

    await fab.trigger("click");

    expect(header.get(".site-page-header__actions").classes()).toContain("site-page-header__actions--open");
    expect(fab.classes()).toContain("site-page-header__fab--open");
    expect(fab.attributes("aria-expanded")).toBe("true");
    expect(header.find(".site-page-header__scrim").exists()).toBe(true);

    await header.get(".site-page-header__scrim").trigger("click");

    expect(header.get(".site-page-header__actions").classes()).not.toContain("site-page-header__actions--open");
    expect(header.find(".site-page-header__scrim").exists()).toBe(false);
});

test("closes after an action is clicked", async () => {
    const header = mountHeader('<button class="add">Add cocktail</button>');

    await header.get(".site-page-header__fab").trigger("click");
    await header.get(".add").trigger("click");

    expect(header.get(".site-page-header__actions").classes()).not.toContain("site-page-header__actions--open");
});

test("stays open when an action opens its own dropdown", async () => {
    const header = mountHeader('<div class="dropdown-wrapper"><div><button class="share">Share</button></div></div>');

    await header.get(".site-page-header__fab").trigger("click");
    await header.get(".share").trigger("click");

    expect(header.get(".site-page-header__actions").classes()).toContain("site-page-header__actions--open");
});

test("closes after choosing an item from a promoted dropdown", async () => {
    const header = mountHeader(
        '<div class="dropdown-wrapper"><div><button class="share">Share</button></div><div class="floating-element"><button class="copy">Copy</button></div></div>',
    );

    await header.get(".site-page-header__fab").trigger("click");
    await header.get(".copy").trigger("click");

    expect(header.get(".site-page-header__actions").classes()).not.toContain("site-page-header__actions--open");
});

test("renders primary actions independently from FAB actions", () => {
    wrapper = mount(PageHeader, {
        slots: {
            default: "Cocktail",
            "primary-actions": '<button class="favorite">Favorite</button>',
            actions: '<button class="more">More</button>',
        },
        global: { mocks: { $t: (key: string) => key } },
    });

    expect(wrapper.get(".site-page-header__primary-actions .favorite").exists()).toBe(true);
    expect(wrapper.get(".site-page-header__actions .more").exists()).toBe(true);
    expect(wrapper.get(".site-page-header").classes()).toContain("site-page-header--has-primary-actions");
});

test("does not render a floating action button without actions", () => {
    const header = mountHeader();

    expect(header.find(".site-page-header__fab").exists()).toBe(false);
    expect(header.find(".site-page-header__actions").exists()).toBe(false);
});
