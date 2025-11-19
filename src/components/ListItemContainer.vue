<script setup lang="ts">
const {
    tag = 'div',
} = defineProps<{
    tag?: string;
}>();
</script>

<template>
    <component :is="tag" class="block-container block-container--hover salt-rim-list__item">
        <div class="salt-rim-list__item__image" v-if="$slots.image">
            <slot name="image"></slot>
        </div>
        <div class="salt-rim-list__item__content">
            <slot name="content"></slot>
        </div>
    </component>
</template>

<style scoped>
.salt-rim-list__item {
    padding: var(--gap-size-3);
    display: flex;
    flex-direction: row;
    gap: var(--gap-size-2);
    align-items: center;
    text-decoration: none;
}

.salt-rim-list__item__image {
    flex-shrink: 0;
}

.salt-rim-list__item__content {
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-1);
}

:deep(.salt-rim-list__item__content p) {
    color: var(--clr-gray-600);
    font-size: 0.85em;
    line-height: 1.3;
}
</style>
