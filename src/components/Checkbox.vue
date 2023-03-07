<template>
    <label class="checkbox-button-wrapper" :id="$props.id">
        <button type="button" @click="toggle" class="checkbox-button" :class="{'checkbox-button--selected': modelValue}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"/></svg>
        </button>
        <slot />
    </label>
</template>

<script>
export default {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    methods: {
        toggle() {
            this.$emit('update:modelValue', !this.modelValue)
        }
    }
}
</script>

<style scoped>
label {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.checkbox-button {
    border: 2px solid var(--clr-gray-200);
    border-radius: 3px;
    padding: 0;
    background: var(--clr-gray-50);
    width: 20px;
    height: 20px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.checkbox-button:hover {
    background: var(--clr-gray-100);
    border-color: var(--clr-gray-300);
}

.checkbox-button svg {
    display: none;
    fill: #fff;
}

.checkbox-button--selected svg {
    display: block;
}

.checkbox-button--selected {
    background: var(--clr-red-600);
    border-color: var(--clr-red-800);
}

.checkbox-button--selected:hover {
    background: var(--clr-red-700);
    border-color: var(--clr-red-900);
}
</style>
