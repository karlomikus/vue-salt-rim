// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import Drawer from "../Drawer.vue";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));

let wrapper: VueWrapper;

beforeEach(() => {
    HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
    HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
});

afterEach(() => {
    wrapper?.unmount();
});

function mountDrawer(open = false) {
    wrapper = mount(Drawer, {
        attachTo: document.body,
        props: {
            title: "Filters",
            side: "right",
            modelValue: open,
            "onUpdate:modelValue": (value: boolean) => wrapper.setProps({ modelValue: value }),
        },
        slots: { default: '<template #default="{ close }"><button class="apply" @click="close">Apply</button></template>' },
        global: { stubs: { Teleport: true } },
    });
    return wrapper;
}

test("supports initially open drawers, right placement and arbitrary content", async () => {
    const drawer = mountDrawer(true);
    expect(drawer.get("dialog").attributes("open")).toBeDefined();
    expect(drawer.get("dialog").attributes("aria-label")).toBe("Filters");
    expect(drawer.get("dialog").classes()).toContain("drawer--right");
    expect(drawer.get(".drawer__title").text()).toBe("Filters");
    await drawer.get(".drawer__content").trigger("click");
    expect(drawer.get("dialog").attributes("open")).toBeDefined();
    await drawer.get(".apply").trigger("click");
    expect(drawer.get("dialog").attributes("open")).toBeUndefined();
});

test("supports bottom placement", () => {
    wrapper = mount(Drawer, {
        attachTo: document.body,
        props: { title: "More", side: "bottom", modelValue: true },
        global: { stubs: { Teleport: true } },
    });

    expect(wrapper.get("dialog").classes()).toContain("drawer--bottom");
    expect(wrapper.get("dialog").attributes("aria-label")).toBe("More");
});

test("synchronizes parent state and close button, cancel, backdrop and native close", async () => {
    const drawer = mountDrawer();
    await drawer.setProps({ modelValue: true });
    expect(drawer.get("dialog").attributes("open")).toBeDefined();
    await drawer.get('button[aria-label="close"]').trigger("click");
    expect(drawer.get("dialog").attributes("open")).toBeUndefined();

    await drawer.setProps({ modelValue: true });
    await drawer.get("dialog").trigger("cancel");
    expect(drawer.get("dialog").attributes("open")).toBeUndefined();

    await drawer.setProps({ modelValue: true });
    await drawer.get("dialog").trigger("click");
    expect(drawer.get("dialog").attributes("open")).toBeUndefined();

    await drawer.setProps({ modelValue: true });
    (drawer.get("dialog").element as HTMLDialogElement).close();
    await drawer.get("dialog").trigger("close");
    await nextTick();
    expect(drawer.props("modelValue")).toBe(false);
});

test("closes an open native dialog when unmounted", () => {
    document.body.style.overflow = "auto";
    const drawer = mountDrawer(true);
    const dialog = drawer.get("dialog").element as HTMLDialogElement;
    expect(document.body.style.overflow).toBe("hidden");
    drawer.unmount();
    expect(dialog.open).toBe(false);
    expect(document.body.style.overflow).toBe("auto");
    document.body.style.overflow = "";
});

test("keeps background scrolling locked until all open drawers close", async () => {
    const first = mountDrawer(true);
    const second = mountDrawer(true);
    await first.setProps({ modelValue: false });
    expect(document.body.style.overflow).toBe("hidden");
    await second.setProps({ modelValue: false });
    expect(document.body.style.overflow).toBe("");
    first.unmount();
});

test("preserves a pre-existing scroll lock", async () => {
    document.body.style.overflow = "hidden";
    const drawer = mountDrawer(true);
    await drawer.setProps({ modelValue: false });
    expect(document.body.style.overflow).toBe("hidden");
    document.body.style.overflow = "";
});

test("keeps the lock when an open drawer is unmounted before another", async () => {
    const first = mountDrawer(true);
    const second = mountDrawer(true);
    first.unmount();
    expect(document.body.style.overflow).toBe("hidden");
    await second.setProps({ modelValue: false });
    expect(document.body.style.overflow).toBe("");
});
