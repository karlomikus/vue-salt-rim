<template>
    <div class="glass-hits block-container block-container--inset">
        <a v-for="option in options" :key="option.id" class="glass-hits__option block-container block-container--hover" href="#" @click.prevent="selectGlass(option)">
            <div class="glass-hits__option__image">
                <img v-if="option.images && option.images?.length > 0" :src="option.images[0].url ?? ''" alt="">
            </div>
            <div>
                <h4 class="sr-list-item-title">{{ option.name }}</h4>
                <p>{{ option.description }}</p>
            </div>
        </a>
    </div>
</template>

<script setup lang="ts">
import type { components } from '@/api/api'

type Glass = components['schemas']['Glass']

defineProps<{
    options: Glass[],
}>()
const emit = defineEmits<{
    (e: 'glassSelected', glass: Glass): void
}>()
const model = defineModel<Glass>({
    required: true,
})

function selectGlass(glass: Glass): void {
    model.value = glass
    emit('glassSelected', glass)
}
</script>

<style scoped>
.glass-hits {
    padding: .25rem;
    display: flex;
    flex-direction: column;
    gap: .25rem;
    height: 500px;
    overflow-y: auto;
}

.glass-hits__option {
    display: flex;
    text-decoration: none;
    gap: .25rem;
    padding: .25rem .5rem;
}

.glass-hits__option__image {
    flex: 0;
}

.glass-hits__option img {
    display: block;
    max-width: 32px;
    max-height: 32px;
    height: auto;
}

.glass-hits__option p {
    font-size: .85em;
    color: var(--clr-gray-500);
}
</style>