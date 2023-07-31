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
<style>
.resource-search__refinements__refinement {
    padding: 1rem 0 0 0;
    margin-bottom: 0.5rem;
    border-top: 3px double var(--clr-red-300);
}

.dark-theme .resource-search__refinements__refinement {
    border-color: var(--clr-dark-main-800);
}

.resource-search__refinements__refinement__body {
    max-height: 300px;
    overflow-y: auto;
}

.resource-search__refinements__refinement__title {
    color: var(--clr-header-title);
    font-weight: var(--fw-bold);
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 0.715rem;
    margin-bottom: 0.5rem;
}

.resource-search__refinements__refinement__item {
    margin-bottom: 0.25rem;
}

.resource-search__refinements__refinement__item input[type="checkbox"],
.resource-search__refinements__refinement__item input[type="radio"] {
    margin-right: 0.25rem;
    width: 1rem;
    height: 1rem;
}
</style>
