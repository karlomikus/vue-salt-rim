<template>
    <div class="ingredient-shelf-status" :class="statusClass">
        <svg v-if="inShelf" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm56-88a56,56,0,1,1-56-56A56.06,56.06,0,0,1,184,128Z"></path></svg>
        <svg v-else-if="inShelfAsSubstitute" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M228,48V152a20,20,0,0,1-20,20H112.92a12,12,0,0,1-17.41,16.49l-20-20a12,12,0,0,1,0-17l20-20A12,12,0,0,1,112.92,148H204V52H100a12,12,0,0,1-24,0V48A20,20,0,0,1,96,28H208A20,20,0,0,1,228,48ZM168,192a12,12,0,0,0-12,12H52V108h91.08a12,12,0,0,0,17.41,16.49l20-20a12,12,0,0,0,0-17l-20-20A12,12,0,0,0,143.08,84H48a20,20,0,0,0-20,20V208a20,20,0,0,0,20,20H160a20,20,0,0,0,20-20v-4A12,12,0,0,0,168,192Z"></path></svg>
        <svg v-else-if="inShelfAsComplex" xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M16.5717 8.02749C16.8469 7.4078 16.9998 6.72176 16.9998 6C16.9998 3.23858 14.7612 1 11.9998 1C9.23839 1 6.99981 3.23858 6.99981 6C6.99981 8.58261 8.95785 10.7079 11.4704 10.9723C12.6858 9.24029 14.576 8.20785 16.5717 8.02749ZM13.1542 17.9462C13.996 16.1276 14.047 13.9741 13.1547 12.0554C14.6399 10.0118 17.4591 9.37883 19.6956 10.6701L19.6957 10.67C22.0871 12.0508 22.9064 15.1086 21.5257 17.5C20.145 19.8915 17.087 20.7109 14.6956 19.3302C14.0707 18.9694 13.5532 18.4942 13.1542 17.9462ZM6.27311 10.0269C7.42726 11.6652 9.26672 12.786 11.3746 12.9726C12.4016 15.2807 11.5401 18.0388 9.30357 19.3301C6.91211 20.7108 3.85415 19.8914 2.47344 17.5C1.09273 15.1085 1.91211 12.0505 4.30357 10.6698C4.92851 10.309 5.59897 10.0984 6.27311 10.0269Z'></path></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"/><path d="M104,35a95.51,95.51,0,0,1,48,0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/><path d="M35.49,102.3a95.54,95.54,0,0,1,24-41.56" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/><path d="M59.49,195.27a95.54,95.54,0,0,1-24-41.58" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/><path d="M152,221a95.51,95.51,0,0,1-48,0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/><path d="M220.51,153.7a95.54,95.54,0,0,1-24,41.56" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/><path d="M196.51,60.73a95.54,95.54,0,0,1,24,41.58" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/></svg>
    </div>
</template>

<script setup lang="ts">
import type { components } from '@/api/api'
import { computed } from 'vue';

type CocktailIngredient = components['schemas']['CocktailIngredient'];

const props = defineProps<{
    ingredient: CocktailIngredient,
    currentShelf: string,
}>();

const inShelf = computed(() => {
    if (props.currentShelf === 'bar') {
        return props.ingredient.in_bar_shelf;
    }
    return props.ingredient.in_shelf;
});

const inShelfAsSubstitute = computed(() => {
    if (props.currentShelf === 'bar') {
        return !props.ingredient.in_bar_shelf && (props.ingredient.in_bar_shelf_as_substitute || props.ingredient.in_bar_shelf_as_variant);
    }
    return !props.ingredient.in_shelf && (props.ingredient.in_shelf_as_substitute || props.ingredient.in_shelf_as_variant);
});

const inShelfAsComplex = computed(() => {
    if (props.currentShelf === 'bar') {
        return !props.ingredient.in_bar_shelf && props.ingredient.in_bar_shelf_as_complex_ingredient;
    }
    return !props.ingredient.in_shelf && props.ingredient.in_shelf_as_complex_ingredient;
});

const statusClass = computed(() => {
    if (inShelf.value) {
        return '';
    } else if (inShelfAsSubstitute.value) {
        return 'ingredient-shelf-status--substitute';
    } else if (inShelfAsComplex.value) {
        return 'ingredient-shelf-status--complex';
    } else {
        return 'ingredient-shelf-status--missing';
    }
});
</script>

<style scoped>
.ingredient-shelf-status {
    display: inline-block;
    margin-right: 5px;
    color: var(--clr-gray-800);
    .dark-theme & {
        color: var(--clr-gray-400);
    }
}

.ingredient-shelf-status svg {
    display: block;
    width: 16px;
    height: 16px;
    margin-top: 5px;
    fill: currentColor;
}

.ingredient-shelf-status.ingredient-shelf-status--missing {
    color: var(--clr-gray-500);
}

.ingredient-shelf-status.ingredient-shelf-status--substitute {
    color: #ff7d27;
}

.ingredient-shelf-status.ingredient-shelf-status--complex {
    color: #1784e9;
}
</style>
