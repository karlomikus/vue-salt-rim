<script setup>
import IconClose from './Icons/IconClose.vue';

const emit = defineEmits(['closed'])
</script>

<template>
    <div class="close-button-container">
        <button class="button button--close" type="button" @click.prevent="emit('closed')">
            <IconClose></IconClose>
        </button>
    </div>
</template>