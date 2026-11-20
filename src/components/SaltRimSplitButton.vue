<script setup lang="ts">
import { computed } from "vue";
import SaltRimDropdown from "@/components/SaltRimDropdown.vue";
import IconCaret from "@/components/Icons/IconCaret.vue";
import IconCheck from "@/components/Icons/IconCheck.vue";

export interface SplitButtonOption {
    label: string;
    value: string | number;
    disabled?: boolean;
}

const props = withDefaults(
    defineProps<{
        options: SplitButtonOption[];
        disabled?: boolean;
        loading?: boolean;
        variant?: "dark" | "outline" | "ai";
        menuLabel?: string;
        menuTitle?: string;
    }>(),
    {
        disabled: false,
        loading: false,
        variant: "dark",
        menuLabel: "Choose an option",
        menuTitle: "",
    },
);

const modelValue = defineModel<string | number>({ required: true });

const emit = defineEmits<{
    click: [value: string | number];
    select: [option: SplitButtonOption];
}>();

const selectedOption = computed(() => props.options.find((option) => option.value === modelValue.value));
const isDisabled = computed(() => props.disabled || props.loading || !selectedOption.value);

function activate() {
    if (isDisabled.value || !selectedOption.value) {
        return;
    }

    emit("click", selectedOption.value.value);
}

function selectOption(option: SplitButtonOption, closeDropdown: () => void) {
    if (option.disabled || props.loading || props.disabled) {
        return;
    }

    modelValue.value = option.value;
    emit("select", option);
    closeDropdown();
}
</script>

<template>
    <SaltRimDropdown class="split-button-wrapper">
        <template #default="{ toggleDropdown, closeDropdown, isShown }">
            <div class="split-button">
                <button type="button" class="button split-button__primary" :class="`button--${variant}`" :disabled="isDisabled" @click="activate">
                    <slot name="prefix" :option="selectedOption" />
                    <slot :option="selectedOption">{{ selectedOption?.label }}</slot>
                </button>
                <button
                    type="button"
                    class="button split-button__toggle"
                    :class="`button--${variant}`"
                    :disabled="isDisabled"
                    :aria-label="menuLabel"
                    :aria-expanded="isShown"
                    aria-haspopup="menu"
                    @click="toggleDropdown"
                    @keydown.esc.prevent="closeDropdown"
                >
                    <IconCaret />
                </button>
            </div>
        </template>
        <template #content="{ closeDropdown }">
            <div v-if="menuTitle" class="dropdown-menu__title">{{ menuTitle }}</div>
            <div role="menu">
                <button
                    v-for="option in options"
                    :key="option.value"
                    type="button"
                    class="dropdown-menu__item split-button__option"
                    role="menuitemradio"
                    :aria-checked="option.value === modelValue"
                    :disabled="option.disabled || disabled || loading"
                    @click="selectOption(option, closeDropdown)"
                >
                    <span>{{ option.label }}</span>
                    <IconCheck v-if="option.value === modelValue" />
                </button>
            </div>
        </template>
    </SaltRimDropdown>
</template>

<style scoped>
.split-button-wrapper {
    display: inline-block;
}

.split-button {
    display: inline-flex;
}

.split-button .button {
    border-radius: 0;
}

.split-button__primary {
    gap: 0.35rem;
    border-top-left-radius: var(--radius-1) !important;
    border-bottom-left-radius: var(--radius-1) !important;
}

.split-button__toggle {
    padding-inline: 0.5rem;
    border-left: 1px solid currentColor !important;
    border-top-right-radius: var(--radius-1) !important;
    border-bottom-right-radius: var(--radius-1) !important;
}

.split-button__toggle svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
}

.split-button__option {
    width: 100%;
    justify-content: space-between;
    gap: 1rem;
    border: 0;
    background: transparent;
    font-family: inherit;
    cursor: pointer;
}

.split-button__option:focus-visible {
    outline: 0.15rem solid rgba(122, 77, 194, 0.3);
    outline-offset: -2px;
}

.split-button__option[disabled] {
    cursor: default;
    opacity: 0.5;
}

.split-button__option svg {
    width: 16px;
    height: 16px;
    margin-right: 0;
    margin-left: auto;
    fill: currentColor;
}
</style>
