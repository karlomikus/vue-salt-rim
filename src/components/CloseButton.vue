<script setup lang="ts">
import IconClose from "./Icons/IconClose.vue";

const emit = defineEmits(["closed"]);
withDefaults(defineProps<{ label?: string }>(), { label: "Close" });
</script>

<template>
    <div class="close-button-container">
        <button class="button button--close" type="button" :aria-label="label" @click.prevent="emit('closed')">
            <IconClose></IconClose>
        </button>
    </div>
</template>
