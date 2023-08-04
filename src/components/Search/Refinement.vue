<template>
    <div class="resource-search__refinements__refinement">
        <h4 class="resource-search__refinements__refinement__title">{{ title }} <a href="#" v-show="isClearable" @click.prevent="clear">{{ $t('clear') }} {{ totalSelected }}</a></h4>
        <div class="resource-search__refinements__refinement__body">
            <slot>
                <div class="resource-search__refinements__refinement__item" v-for="refinement in refinements">
                    <input :type="type" :id="id + '-' + refinement.id" :value="refinement.value" v-model="model">
                    <label :for="id + '-' + refinement.id">{{ refinement.name }}</label>
                </div>
            </slot>
        </div>
    </div>
</template>
<script>
export default {
    props: ['title', 'refinements', 'id', 'modelValue'],
    props: {
        modelValue: null,
        title: {
            type: String,
            required: true
        },
        refinements: {
            type: Array,
            default: []
        },
        id: {
            type: String,
            required: true
        },
        type: {
            type: String,
            default: 'checkbox'
        }
    },
    emits: ['update:modelValue'],
    computed: {
        model: {
            get() {
                return this.modelValue;
            },
            set(value) {
                this.$emit("update:modelValue", value);
            }
        },
        isClearable() {
            if (this.type == 'radio') {
                return this.model && this.model != null;
            }

            return this.model && this.model.length > 0;
        },
        totalSelected() {
            if (!this.model || this.type == 'radio' || this.model.length == 0) {
                return ''
            }

            return `(${this.model.length})`
        }
    },
    methods: {
        clear() {
            if (this.type == 'checkbox') {
                this.model = [];
            } else {
                this.model = null;
            }

            this.$emit("change", this.model);
        }
    }
}
</script>
