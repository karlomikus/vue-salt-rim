<template>
    <button type="button" class="sr-radio" :class="{'sr-radio--selected': isSelected}" @click.prevent="select">
        <div class="sr-radio__image">
            <svg v-if="isSelected" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"></path></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z"></path></svg>
        </div>
        <div class="sr-radio__content">
            <h3>{{ title }}</h3>
            <p>{{ description }}</p>
        </div>
    </button>
</template>
<script>
export default {
    props: {
        modelValue: null,
        value: null,
        title: {
            type: String
        },
        description: {
            type: String
        }
    },
    emits: ['update:modelValue'],
    computed: {
        isSelected() {
            return this.value == this.modelValue
        }
    },
    methods: {
        select() {
            this.$emit('update:modelValue', this.value)
        }
    }
}
</script>
<style scoped>
.sr-radio {
    --clr-bg: #fff;
    --clr-border: var(--clr-gray-200);
    --clr-border-hover: var(--clr-gray-800);
    --clr-border-selected: var(--clr-gray-50);
    --clr-svg: var(--clr-border);
    --clr-svg-selected: var(--clr-gray-800);
    --radio-size: 1.85rem;
    background: var(--clr-bg);
    border: 2px solid var(--clr-border);
    border-radius: 5px;
    margin: 0;
    padding: 0.5rem 1.5rem 0.5rem 0.5rem;
    cursor: pointer;
    display: flex;
    gap: 0.5rem;
}

.sr-radio:hover {
    border-color: var(--clr-border-hover);
}

.sr-radio svg {
    fill: var(--clr-svg);
}

.sr-radio.sr-radio--selected {
    box-shadow: 0 0 0 3px var(--clr-border-selected);
}

.sr-radio.sr-radio--selected svg {
    fill: var(--clr-svg-selected);
}

.sr-radio__image {
    flex-shrink: 0;
    width: var(--radio-size);
    height: var(--radio-size);
}

.sr-radio__content {
    text-align: left;
}

.sr-radio__content p {
    color: var(--clr-gray-500);
    font-size: 0.85rem;
}

.dark-theme .sr-radio {
    --clr-bg: #0c0b0e;
    --clr-border: var(--clr-gray-700);
    --clr-border-hover: var(--clr-gray-200);
    --clr-border-selected: var(--clr-gray-900);
    --clr-svg: var(--clr-gray-500);
    --clr-svg-selected: var(--clr-gray-400);
}
</style>
