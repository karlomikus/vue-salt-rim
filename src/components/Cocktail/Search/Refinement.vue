<template>
    <div class="cocktails-search__refinements__refinement">
        <h4 class="cocktails-search__refinements__refinement__title">{{ title }} <a href="#" v-show="model && model.length > 0" @click.prevent="clear">{{ $t('clear') }}</a></h4>
        <div class="cocktails-search__refinements__refinement__body">
            <slot>
                <div class="cocktails-search__refinements__refinement__item" v-for="refinement in refinements">
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
            return this.model && this.model.length > 0;
        }
    },
    methods: {
        clear() {
            this.model = [];
        }
    }
}
</script>
<style>
.cocktails-search__refinements__refinement {
    padding: 1rem 0 0 0;
    margin-bottom: 0.5rem;
    border-top: 3px double var(--clr-red-300);
}

.cocktails-search__refinements__refinement__body {
    max-height: 300px;
    overflow-y: auto;
}

.cocktails-search__refinements__refinement__title {
    color: var(--clr-header-title);
    font-weight: var(--fw-bold);
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 0.715rem;
    margin-bottom: 0.5rem;
}

.cocktails-search__refinements__refinement__item {
    margin-bottom: 0.25rem;
}

.cocktails-search__refinements__refinement__item input[type="checkbox"],
.cocktails-search__refinements__refinement__item input[type="radio"] {
    margin-right: 0.25rem;
    width: 1rem;
    height: 1rem;
}
</style>
