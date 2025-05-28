<template>
    <div class="glass-selector">
        <input class="form-input" ref="searchInput" v-model="searchTerm" type="search" :placeholder="t('placeholder.search')" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />
        <div class="glass-hits block-container block-container--inset">
            <a v-for="option in filteredOptions" :key="option.id" class="glass-hits__option block-container block-container--hover" href="#" @click.prevent="selectGlass(option)">
                <div class="glass-hits__option__image">
                    <img v-if="option.images && option.images?.length > 0" :src="option.images[0].url ?? ''" alt="">
                </div>
                <div>
                    <h4 class="sr-list-item-title">{{ option.name }}</h4>
                    <p>{{ option.description }}</p>
                </div>
            </a>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { components } from '@/api/api'
import { computed, onMounted, ref, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';

type Glass = components['schemas']['Glass']

const { t } = useI18n()
const props = defineProps<{
    options: Glass[],
}>()
const searchInput = useTemplateRef<HTMLInputElement>('searchInput')
const emit = defineEmits<{
    (e: 'glassSelected', glass: Glass): void
}>()
const searchTerm = ref<string>('')
const model = defineModel<Glass | null>({
    required: true,
})

function selectGlass(glass: Glass): void {
    model.value = glass
    emit('glassSelected', glass)
}

const filteredOptions = computed(() => {
    if (!searchTerm.value) {
        return props.options
    }
    const term = searchTerm.value.toLowerCase()

    return props.options.filter(option => option.name.toLowerCase().includes(term))
})

onMounted(() => {
    searchInput.value?.focus()
})
</script>

<style scoped>
.glass-selector {
    display: flex;
    flex-direction: column;
    gap: .5rem;
}

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
    max-width: 50px;
    max-height: 50px;
    height: auto;
}

.glass-hits__option p {
    font-size: .85em;
    color: var(--clr-gray-500);
}
</style>