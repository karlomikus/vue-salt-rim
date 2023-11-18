<template>
    <div class="resource-search__refinements__refinement">
        <div class="resource-search__refinements__refinement__title">
            <h4>{{ title }} {{ totalSelected }}</h4>
            <div class="resource-search__refinements__refinement__title__actions">
                <button v-show="isClearable" type="button" class="button" @click="clear">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="none" d="M0 0h24v24H0z" /><path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" /></svg>
                </button>
                <button v-if="collapsable" type="button" class="button" @click="collapsed = !collapsed">
                    <svg v-show="collapsed == false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path d="M11.9997 13.1714L16.9495 8.22168L18.3637 9.63589L11.9997 15.9999L5.63574 9.63589L7.04996 8.22168L11.9997 13.1714Z"></path></svg>
                    <svg v-show="collapsed == true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z"></path></svg>
                </button>
            </div>
        </div>
        <template v-if="!collapsed">
            <input v-show="searchable" v-model="searchTerm" class="form-input form-input--refinement" type="text" placeholder="Filter refinement...">
            <div class="resource-search__refinements__refinement__body">
                <slot>
                    <div v-for="refinement in refinementsSearched" :key="refinement.id" class="resource-search__refinements__refinement__item">
                        <input :id="id + '-' + refinement.id" v-model="model" :type="type" :value="refinement.value">
                        <label :for="id + '-' + refinement.id">{{ refinement.name }}</label>
                    </div>
                </slot>
            </div>
        </template>
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
        },
        collapsable: {
            type: Boolean,
            default: true
        }
    },
    emits: ['update:modelValue', 'change'],
    data() {
        return {
            searchTerm: null,
            collapsed: this.collapsable,
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

.resource-search__refinements__refinement__title__actions button {
    padding: 0;
    margin: 0;
    width: auto;
    height: auto;
}

.resource-search__refinements__refinement__title__actions svg {
    fill: var(--clr-gray-700);
}

.dark-theme .resource-search__refinements__refinement__title__actions svg {
    fill: var(--clr-gray-400);
}
</style>
