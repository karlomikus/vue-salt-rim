<script setup lang="ts">
import type { components } from '@/api/api'

type IngredientBasic = components['schemas']['IngredientBasic'];

interface Props {
    ingredient: IngredientBasic;
    currentId: string;
}

const {
    ingredient,
} = defineProps<Props>();

</script>

<template>
    <div class="tf-nc">
        <div class="ingredient-tree-node-item block-container block-container--hover" :class="{'ingredient-tree-node-item--current': currentId == ingredient.id.toString()}">
            <RouterLink :to="{name: 'ingredients.show', params: {id: ingredient.slug}}">{{ ingredient.name }}</RouterLink>
        </div>
    </div>
</template>
