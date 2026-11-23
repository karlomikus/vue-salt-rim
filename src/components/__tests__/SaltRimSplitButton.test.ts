// @vitest-environment jsdom
import { defineComponent, ref } from "vue";
import { afterEach, expect, test } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import SaltRimSplitButton from "../SaltRimSplitButton.vue";

const DropdownStub = defineComponent({
    setup() {
        const isShown = ref(false);
        const toggleDropdown = () => (isShown.value = !isShown.value);
        const closeDropdown = () => (isShown.value = false);

        return { isShown, toggleDropdown, closeDropdown };
    },
    template: `
        <div class="dropdown-wrapper">
            <slot :toggle-dropdown="toggleDropdown" :close-dropdown="closeDropdown" :is-shown="isShown" />
            <div v-show="isShown">
                <slot name="content" :toggle-dropdown="toggleDropdown" :close-dropdown="closeDropdown" :is-shown="isShown" />
            </div>
        </div>
    `,
});

let wrapper: VueWrapper | undefined;

const options = [
    { label: "Editorial", value: "editorial" },
    { label: "Vintage", value: "vintage" },
    { label: "Moody", value: "moody" },
];

afterEach(() => {
    wrapper?.unmount();
});

test("runs the action with the selected option", async () => {
    wrapper = mount(SaltRimSplitButton, {
        props: { modelValue: "editorial", options },
        global: { stubs: { SaltRimDropdown: DropdownStub } },
    });

    expect(wrapper.get(".split-button__primary").text()).toBe("Editorial");
    await wrapper.get(".split-button__primary").trigger("click");

    expect(wrapper.emitted("click")).toEqual([["editorial"]]);
});

test("selects an option and changes the primary button text", async () => {
    const Host = defineComponent({
        components: { SaltRimSplitButton },
        setup() {
            return { selected: ref("editorial"), options };
        },
        template: '<SaltRimSplitButton v-model="selected" :options="options" />',
    });

    wrapper = mount(Host, {
        global: { stubs: { SaltRimDropdown: DropdownStub } },
    });

    await wrapper.get(".split-button__toggle").trigger("click");
    await wrapper.findAll(".split-button__option")[1].trigger("click");

    expect(wrapper.get(".split-button__primary").text()).toBe("Vintage");
    expect(wrapper.get(".split-button__toggle").attributes("aria-expanded")).toBe("false");
});

test("disables both halves while loading", () => {
    wrapper = mount(SaltRimSplitButton, {
        props: { modelValue: "editorial", options, loading: true },
        global: { stubs: { SaltRimDropdown: DropdownStub } },
    });

    expect(wrapper.findAll(".split-button button").every((button) => button.attributes("disabled") !== undefined)).toBe(true);
});
