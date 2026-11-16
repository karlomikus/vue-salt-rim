// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { mount, RouterLinkStub, type VueWrapper } from "@vue/test-utils";
import MobileBottomNav from "../MobileBottomNav.vue";
import Drawer from "../../Drawer.vue";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));
vi.mock("vue-router", () => ({ useRoute: () => ({ path: "/", name: "home", fullPath: "/" }) }));

let wrapper: VueWrapper | undefined;

beforeEach(() => {
    HTMLDialogElement.prototype.showModal = function () {
        this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function () {
        this.removeAttribute("open");
    };
    localStorage.clear();
    localStorage.setItem("_salt_rim", JSON.stringify({ bar: { id: 1, access: { role_id: 4 } } }));
});

afterEach(() => {
    wrapper?.unmount();
});

function mountNav() {
    wrapper = mount(MobileBottomNav, {
        attachTo: document.body,
        global: { stubs: { RouterLink: RouterLinkStub, Teleport: true } },
    });
    return wrapper;
}

test("renders the five primary tabs", () => {
    const nav = mountNav();

    expect(nav.findAll(".bottom-nav__item")).toHaveLength(5);
    expect(nav.findAll(".bottom-nav__label").map((label) => label.text())).toEqual([
        "shelf.title",
        "cocktail.cocktails",
        "ingredient.ingredients",
        "shopping",
        "more",
    ]);
});

test("does not render without an active bar", () => {
    localStorage.setItem("_salt_rim", JSON.stringify({ bar: {} }));
    const nav = mountNav();

    expect(nav.find(".bottom-nav").exists()).toBe(false);
});

test("opens the more sheet with overflow destinations", async () => {
    const nav = mountNav();
    const moreButton = nav.get("button");

    expect(nav.findComponent(Drawer).props("modelValue")).toBe(false);
    expect(nav.findAll(".more-nav__item").map((item) => item.text())).toEqual(["collections.title", "calculators.title", "settings"]);

    await moreButton.trigger("click");

    expect(moreButton.attributes("aria-expanded")).toBe("true");
    expect(nav.findComponent(Drawer).props("modelValue")).toBe(true);
});

test("shows the menu destination to admins", () => {
    localStorage.setItem("_salt_rim", JSON.stringify({ bar: { id: 1, access: { role_id: 1 } } }));
    const nav = mountNav();

    expect(nav.findAll(".more-nav__item").map((item) => item.text())).toEqual(["collections.title", "menu.title", "calculators.title", "settings"]);
});
