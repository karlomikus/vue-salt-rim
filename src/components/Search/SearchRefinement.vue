<template>
    <div class="resource-search__refinements__refinement">
        <h4 class="resource-search__refinements__refinement__title">{{ title }} <a v-show="isClearable" href="#" @click.prevent="clear">{{ $t('clear') }} {{ totalSelected }}</a></h4>
        <div class="resource-search__refinements__refinement__body">
            <slot>
                <div v-for="refinement in refinements" :key="refinement.id" class="resource-search__refinements__refinement__item">
                    <input :id="id + '-' + refinement.id" v-model="model" :type="type" :value="refinement.value">
                    <label :for="id + '-' + refinement.id">{{ refinement.name }}</label>
                </div>
            </slot>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        modelValue: {
            type: [Object, Array],
            default() {
                return null
            }
        },
        title: {
            type: String,
            required: true
        },
        refinements: {
            type: Array,
            default() {
                return []
            }
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
    emits: ['update:modelValue', 'change'],
    computed: {
        model: {
            get() {
                return this.modelValue
            },
            set(value) {
                this.$emit('update:modelValue', value)
                this.$emit('change', value)
            }
        },
        isClearable() {
            if (this.type == 'radio') {
                return this.model && this.model != null
            }

            return this.model && this.model.length > 0
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
                this.model = []
            } else {
                this.model = null
            }

            this.$emit('change', this.model)
        }
    }
}
</script>
