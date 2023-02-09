<template>
    <select ref="select" autocomplete="off" @change="$emit('update:modelValue', $event.target.value)" :value="modelValue">
        <slot></slot>
    </select>
</template>

<script>
import TomSelect from 'tom-select';

export default {
    props: {
        modelValue: null,
    },
    emits: ['update:modelValue'],
    data() {
        return {
            tomSelect: null
        }
    },
    mounted() {
        this.tomSelect = new TomSelect(this.$refs.select, {
            allowEmptyOption: true
        });
    },
    updated() {
        this.tomSelect.sync()
    }
}
</script>
