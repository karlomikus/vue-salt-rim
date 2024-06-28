<script setup>
import { ref, computed } from 'vue'
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/vue'

defineOptions({
    inheritAttrs: false
})

const props = defineProps({
    options: {
        type: Array,
        default() {
            return []
        },
        required: true
    },
    labelKey: {
        type: String,
        required: true
    },
    maxShownOptions: {
        type: Number,
        default: 7
    }
})

const reference = ref(null)
const content = ref(null)
const currentOption = ref('')
const showDropdown = ref(false)
const currentFocusedDropdownOption = ref(null)
const currentFocusedDeleteOption = ref(null)
const model = defineModel({ required: true, type: Array })
const { floatingStyles } = useFloating(reference, content, {
    placement: 'bottom-start',
    middleware: [offset(5), flip(), shift()],
    whileElementsMounted: autoUpdate,
})
const isFocused = ref(false)
const filteredOptions = computed(() => {
    if (!currentOption.value) {
        return []
    }

    return props.options.filter(option => {
        return !model.value.includes(option.name)
    }).filter(option => {
        return option.name.toLowerCase().includes(currentOption.value.toLowerCase())
    }).slice(0, props.maxShownOptions)
})

function focusInput() {
    showDropdown.value = true
    reference.value.focus()
}

function selectOption(option) {
    if (model.value.includes(option)) {
        return
    }

    model.value.push(option)
    currentOption.value = null
}

function removeSelectedOption(option) {
    model.value.splice(
        model.value.findIndex(i => i == option),
        1
    )
}

function checkLastOptionRemoval() {
    if (!currentFocusedDeleteOption.value && (currentOption.value == '' || !currentOption.value)) {
        currentFocusedDeleteOption.value = model.value[model.value.length - 1]
        return
    }

    if (currentFocusedDeleteOption.value) {
        removeSelectedOption(currentFocusedDeleteOption.value)
        currentFocusedDeleteOption.value = null
    }
}

function checkDelimiter(e) {
    currentFocusedDeleteOption.value = null
    currentFocusedDropdownOption.value = null
    if (e.target.value && e.target.value.endsWith(',')) {
        selectOption(e.target.value.slice(0, -1).trim())
        currentOption.value = null
    }
}

function addSelectedOption() {
    if (filteredOptions.value.length == 0) {
        return
    }

    if (currentFocusedDropdownOption.value) {
        selectOption(currentFocusedDropdownOption.value.name)
    } else {
        selectOption(filteredOptions.value[0].name)
    }
}

function navigateOptions(dir) {
    if (filteredOptions.value.length == 0) {
        return
    }

    if (!currentFocusedDropdownOption.value) {
        currentFocusedDropdownOption.value = filteredOptions.value[0]
        return
    }

    if (dir === 'down') {
        currentFocusedDropdownOption.value = filteredOptions.value[filteredOptions.value.indexOf(currentFocusedDropdownOption.value) + 1]
    } else {
        currentFocusedDropdownOption.value = filteredOptions.value[filteredOptions.value.indexOf(currentFocusedDropdownOption.value) - 1]
    }
}

function handleFocus() {
    isFocused.value = true
}

function handleBlur(e) {
    const relatedTarget = e.relatedTarget
    if (showDropdown.value) {
        if (relatedTarget === null || !content.value.contains(relatedTarget)) {
            showDropdown.value = false
        }
        currentFocusedDeleteOption.value = null
    }

    isFocused.value = false
}
</script>

<template>
    <div class="form-input form-multiselect" :class="{'form-input--focus': isFocused}" @click="focusInput">
        <div class="form-multiselect__options">
            <div v-for="option in model" :key="option" class="form-multiselect__selected-option">
                {{ option }} <button type="button" class="button selected-option__close" :class="{'selected-option__close--focused': currentFocusedDeleteOption == option}" @click="removeSelectedOption(option)"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 10.5858L9.17157 7.75736L7.75736 9.17157L10.5858 12L7.75736 14.8284L9.17157 16.2426L12 13.4142L14.8284 16.2426L16.2426 14.8284L13.4142 12L16.2426 9.17157L14.8284 7.75736L12 10.5858Z"></path></svg></button>
            </div>
            <div class="form-multiselect__input">
                <input
                    :id="$attrs.id"
                    ref="reference"
                    v-model="currentOption"
                    :placeholder="$attrs.placeholder"
                    type="text"
                    class="form-input"
                    @focus="handleFocus"
                    @blur.prevent.stop="handleBlur"
                    @input="checkDelimiter"
                    @keydown.tab.prevent="addSelectedOption"
                    @keydown.enter.prevent="addSelectedOption"
                    @keydown.down.prevent="navigateOptions('down')"
                    @keydown.up.prevent="navigateOptions('up')"
                    @keydown.delete="checkLastOptionRemoval"
                >
                <div v-show="filteredOptions.length > 0 && showDropdown" ref="content" class="floating-element" :style="floatingStyles">
                    <div class="dropdown-menu dropdown-menu--tags">
                        <span class="dropdown-menu__title">{{ $t('suggestions') }}:</span>
                        <a v-for="option in filteredOptions" :key="option.name" class="dropdown-menu__item" :class="{'dropdown-menu__item--focused': currentFocusedDropdownOption == option}" href="#" @click.prevent="selectOption(option[props.labelKey])" @mouseover="currentFocusedDropdownOption = option">
                            {{ option.name }}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.form-multiselect {
    display: flex;
    flex-wrap: wrap;
    height: auto;
}

.form-multiselect__options {
    display: flex;
    flex-basis: 100%;
    flex-grow: 1;
    flex-wrap: wrap;
    gap: var(--gap-size-2);
}

.form-multiselect__selected-option {
    background-color: var(--clr-gray-100);
    color: var(--clr-gray-800);
    border-radius: var(--radius-1);
    padding: 0 0.5rem;
    gap: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.form-multiselect__input {
    width: 0;
    max-width: 100%;
    flex-grow: 1;
}

.form-multiselect__input .form-input {
    background: none;
    border: 0;
    padding: 0;
    margin: 0;
    height: auto;
    position: relative;
    width: 100%;
}

.form-multiselect__input input:focus {
    outline: 0;
}

.selected-option__close {
    padding: 0;
    margin: 0;
    border: 0;
    background: none;
    color: var(--clr-gray-800);
}

.selected-option__close:hover,
.selected-option__close:focus,
.selected-option__close--focused {
    color: var(--clr-red);
}

.selected-option__close svg {
    fill: currentColor;
}

.dropdown-menu--tags {
    min-width: 300px;
}

.dropdown-menu .dropdown-menu__item--focused {
    box-shadow: inset 0 0 0 3px var(--clr-gray-800);
}
</style>
