<template>
    <div class="resource-search__refinements__refinement">
        <h4 class="resource-search__refinements__refinement__title">{{ title }} <a v-show="isClearable" href="#" @click.prevent="clear">{{ $t('clear') }} {{ totalSelected }}</a></h4>
        <input v-show="searchable" v-model="searchTerm" class="form-input form-input--refinement" type="text" placeholder="Filter refinement...">
        <div class="resource-search__refinements__refinement__body">
            <slot>
                <div v-for="refinement in refinementsSearched" :key="refinement.id" class="resource-search__refinements__refinement__item">
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
        },
        searchable: {
            type: Boolean,
            default: false
        }
    },
    emits: ['update:modelValue', 'change'],
    data() {
        return {
            searchTerm: null
        }
    },
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
        },
        refinementsSearched() {
            if (this.searchTerm == null || this.searchTerm == '') {
                return this.refinements
            }

            return this.refinements.filter(r => {
                return r.name.toLowerCase().includes(this.searchTerm.toLowerCase())
            })
        }
    },
    methods: {
        clear() {
            this.searchTerm = null
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
<style scoped>
.form-input--refinement {
    border-top: 0;
    border-left: 0;
    border-right: 0;
    font-size: 0.75rem;
    border-radius: 0;
    width: 100%;
    height: 100%;
    padding: 5px;
    line-height: 1;
    margin-bottom: 0.5rem;
}
</style>
