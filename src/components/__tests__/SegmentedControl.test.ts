// @vitest-environment jsdom
import { defineComponent, ref } from "vue";
import { afterEach, expect, test } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import SegmentedControl from "../SegmentedControl.vue";

let wrapper: VueWrapper | undefined;

const options = [
    { label: "List", value: "list" },
    { label: "Grid", value: "grid" },
    { label: "Map", value: "map", disabled: true },
];

afterEach(() => {
    wrapper?.unmount();
});

test("renders mutually exclusive options and selects with a click", async () => {
    wrapper = mount(SegmentedControl, {
        props: {
            modelValue: "list",
            options,
        },
    });

    expect(wrapper.attributes("role")).toBe("radiogroup");
    expect(wrapper.findAll('[role="radio"]')).toHaveLength(3);
    expect(wrapper.findAll('[role="radio"]')[0].attributes("aria-checked")).toBe("true");
    expect(wrapper.findAll('[role="radio"]')[2].attributes("disabled")).toBeDefined();

    await wrapper.findAll('[role="radio"]')[1].trigger("click");

    expect(wrapper.emitted("update:modelValue")).toEqual([["grid"]]);
    expect(wrapper.emitted("change")).toEqual([["grid"]]);
});

test("keeps selection in a Host and moves through enabled options with arrow keys", async () => {
    const Host = defineComponent({
        components: { SegmentedControl },
        setup() {
            return { selected: ref("list"), options };
        },
        template: '<SegmentedControl v-model="selected" :options="options" />',
    });

    wrapper = mount(Host);

    await wrapper.get('[role="radio"][data-value="list"]').trigger("keydown", { key: "ArrowRight" });

    expect(wrapper.find('[role="radio"][data-value="grid"]').attributes("aria-checked")).toBe("true");

    await wrapper.get('[role="radio"][data-value="grid"]').trigger("keydown", { key: "Escape" });

    expect(wrapper.find('[role="radio"][data-value="grid"]').attributes("aria-checked")).toBe("true");
});
