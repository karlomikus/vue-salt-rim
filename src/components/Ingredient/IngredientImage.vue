<template>
    <div class="ingredient__image" :style="{ 'background-color': backgroundColor }">
        <img :src="mainIngredientImageUrl" alt="Image of an ingredient">
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useIngredientBg } from '@/composables/ingredientBg';

const {
    imageUrl = null,
    color = null,
} = defineProps<{
    imageUrl: string|null;
    color?: string|null;
}>()

const backgroundColor = computed(() => {
    if (!color) {
        return useIngredientBg('#fff')
    }

    return useIngredientBg(color)
})

const mainIngredientImageUrl = computed(() => {
    if (imageUrl) {
        return imageUrl
    }

    return '/no-ingredient.png'
})
</script>
<style scoped>
.ingredient__image {
    width: 60px;
    height: 60px;
    border-radius: var(--radius-1);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
    background-color: #fff;
}

@media (max-width: 450px) {
    .ingredient__image {
        width: 60px;
        height: 60px;
    }
}

.ingredient__image.ingredient__image--small {
    width: 50px;
    height: 50px;
}

.ingredient__image img {
    height: 100px;
    position: absolute;
    top: 10px;
    transition: top ease-in-out .2s;
}

.ingredient__image.ingredient__image--small {
    width: 45px;
    height: 45px;
}

.ingredient__image.ingredient__image--small img {
    height: 70px;
}

.ingredient__image:hover img {
    top: -15px;
}
</style>
