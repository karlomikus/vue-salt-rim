<script setup lang="ts">
import { computed } from 'vue'
import type { components } from '@/api/api'
import { useIngredientBg } from '@/composables/ingredientBg';

type IngredientBasic = components["schemas"]["IngredientBasic"]
type Image = components["schemas"]["Image"]
interface IngredientViewModel extends IngredientBasic {
    image: string | null;
    description: string | null;
    color: string | null;
}

const props = defineProps<{
    ingredient: IngredientBasic,
    images: Image[]
}>()

const mainImage = computed(() => {
    if (!props.images || props.images.length == 0) {
        return null
    }

    return props.images.find(i => i.sort <= 1)
})

// It should work with basic ingredient by default, but we can send more stuff...
const viewModel = computed(() => {
    return {
        image: mainImage.value?.url ?? null,
        description: null,
        color: null,
        ...props.ingredient
    } as IngredientViewModel
})
</script>
<template>
    <div class="ingredient-tile block-container">
        <div class="ingredient-tile__image" v-if="viewModel.image" :style="{ 'background-color': useIngredientBg(viewModel.color ?? '') }">
            <img :src="viewModel.image" alt="">
        </div>
        <div class="ingredient-tile__content">
            <h4 class="ingredient-tile__title">
                <RouterLink :to="{ name: 'ingredients.show', params: { id: viewModel.slug } }">{{ viewModel.name }}</RouterLink>
            </h4>
            <div class="ingredient-tile__description">
                <slot name="content">
                    <template v-if="viewModel.description">
                        {{ viewModel.description }}
                    </template>
                </slot>
            </div>
        </div>
    </div>
</template>

<style scoped>
.ingredient-tile {
    padding: 0.75rem;
    display: flex;
    align-items: center;
    gap: var(--gap-size-2);
}

.ingredient-tile__content {
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-2);
}

.ingredient-tile__title {
    line-height: 1.2;
}

.ingredient-tile__description {
    font-size: 0.85rem;
}

.ingredient-tile__title a {
    font-size: 1.25em;
    font-family: var(--font-heading);
    font-weight: var(--fw-bold);
}

.ingredient-tile__image {
    width: 70px;
    height: 70px;
    border-radius: var(--radius-2);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
    background-color: #fff;
}

.ingredient-tile__image img {
    height: 100px;
    position: absolute;
    top: 10px;
    transition: top ease-in-out .1s;
}

.ingredient-tile__image:hover img {
    top: 0;
}
</style>