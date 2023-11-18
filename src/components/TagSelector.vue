<template>
    <div class="form-input form-multiselect" :class="{'form-input--focus': isFocused}" @click="focusInput">
        <div class="form-multiselect__options">
            <div v-for="selectedTag in selectedTags" :key="selectedTag" class="form-multiselect__selected-option">
                {{ selectedTag }} <button type="button" class="selected-option__close" @click="removeSelection(selectedTag)"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 10.5858L9.17157 7.75736L7.75736 9.17157L10.5858 12L7.75736 14.8284L9.17157 16.2426L12 13.4142L14.8284 16.2426L16.2426 14.8284L13.4142 12L16.2426 9.17157L14.8284 7.75736L12 10.5858Z"></path></svg></button>
            </div>
            <div class="form-multiselect__input">
                <input
                    ref="mainInput"
                    v-model="tag"
                    type="text"
                    @focus="isFocused = true"
                    @blur="isFocused = false"
                    @input="checkDelimiter"
                    @keydown.tab.prevent="finishInput"
                >
                <div v-show="showDropdown" ref="options" class="floating-element">
                    <div v-if="filteredTags.length > 0" class="dropdown-menu">
                        <a v-for="tagOption in filteredTags" :key="tagOption.name" class="dropdown-menu__item" href="#" @click.prevent="addTag(tagOption.name)">{{ tagOption.name }}</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { computePosition } from '@floating-ui/dom'

export default {
    props: {
        tags: {
            type: Array,
            default() {
                return []
            }
        },
        modelValue: {
            type: [Number, String],
            default: null,
        }
    },
    data() {
        return {
            selectedTags: [],
            tag: null,
            showDropdown: false,
            isFocused: false,
            selectableOptionIndex: null,
        }
    },
    computed: {
        filteredTags() {
            if (!this.tag) {
                return []
            }

            return this.tags.filter(tag => {
                return tag.name.toLowerCase().includes(this.tag.toLowerCase())
            }).slice(0, 5)
        }
    },
    watch: {
        isFocused() {
            this.showDropdown = this.isFocused
        },
        showDropdown() {
            if (this.showDropdown) {
                computePosition(this.$refs.mainInput, this.$refs.options, {
                    placement: 'bottom-start',
                }).then(({x, y}) => {
                    Object.assign(this.$refs.options.style, {
                        left: `${x}px`,
                        top: `${y}px`,
                    })
                })
            }
        }
    },
    methods: {
        focusInput() {
            this.$refs.mainInput.focus()
        },
        checkDelimiter() {
            if (this.tag && this.tag.endsWith(',')) {
                this.addTag(this.tag.slice(0, -1).trim())
            }
        },
        finishInput() {
            if (this.filteredTags.length == 0) {
                return
            }

            this.addTag(this.filteredTags[0].name)
        },
        addTag(tagName) {
            if (tagName == '' || tagName == ' ' || this.selectedTags.includes(tagName)) {
                return
            }

            this.selectedTags.push(tagName)
            this.tag = null
        },
        removeSelection(tagName) {
            this.selectedTags.splice(
                this.selectedTags.findIndex(i => i == tagName),
                1
            )
        }
    }
}
</script>

<style scoped>
.form-multiselect {
    display: flex;
    flex-wrap: wrap;
    height: auto;
}

.form-multiselect__options {
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-size-2);
}

.form-multiselect__selected-option {
    background-color: var(--clr-gray-600);
    color: var(--clr-gray-100);
    border-radius: var(--radius-1);
    padding: 0 0.5rem;
    gap: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.form-multiselect__input input {
    background: none;
    border: 0;
    position: relative;
}

.selected-option__close {
    padding: 0;
    margin: 0;
    border: 0;
    background: none;
    cursor: pointer;
}

.selected-option__close svg {
    fill: var(--clr-gray-100);
}
</style>
