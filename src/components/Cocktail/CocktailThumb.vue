<template>
    <div class="cocktail-thumb">
        <img :src="mainCocktailImageUrl" alt="Smaller image of cocktail" />
    </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import BarAssistantClient from "@/api/BarAssistantClient";

type ThumbCocktail = {
    image_url?: string | null;
    images?: { id: number }[];
};

const props = withDefaults(defineProps<{ cocktail?: Partial<ThumbCocktail> }>(), {
    cocktail: () => ({}),
});

const mainCocktailImageUrl = computed(() => {
    if (!props.cocktail.images && !props.cocktail.image_url) {
        return "/no-cocktail.jpg";
    }

    if (props.cocktail.image_url) {
        return props.cocktail.image_url;
    }

    if (props.cocktail.images && props.cocktail.images.length == 0) {
        return "/no-cocktail.jpg";
    }

    return BarAssistantClient.getImageThumbUrl(props.cocktail.images![0].id);
});
</script>
<style scoped>
.cocktail-thumb {
    width: 60px;
    height: 60px;
    border-radius: var(--radius-1);
    overflow: hidden;
    flex-shrink: 0;
}

.cocktail-thumb img {
    height: 100%;
    width: 100%;
    object-fit: cover;
}
</style>
