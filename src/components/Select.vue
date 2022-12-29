<template>
    <select ref="select" autocomplete="off">
        <option v-for="item in items" :value="item[valueKey]">{{ item[labelKey] }}</option>
    </select>
</template>
<script>
import TomSelect from 'tom-select';

export default {
    props: {
        modelValue: null,
        items: {
            type: Array,
            default: []
        },
        valueKey: {
            type: String
        },
        labelKey: {
            type: String
        }
    },
    emits: ['update:modelValue'],
    data() {
        return {
            tomSelect: null
        }
    },
    watch: {
        items(newVal) {
            this.$nextTick(() => {
                this.refresh();
            })
        },
        modelValue(newVal) {
            this.$nextTick(() => {
                this.tomSelect.setValue(newVal)
                this.refresh()
            })
        }
    },
    mounted() {
        this.tomSelect = new TomSelect(this.$refs.select, {
            onChange: (value) => {
                this.updateVal(value)
            }
        });
    },
    methods: {
        updateVal(val) {
            this.$emit('update:modelValue', val)
        },
        refresh() {
            this.tomSelect.sync()
        }
    }
}
</script>
