<template>
    <div class="block-container ingredient-spotlight-wrapper">
        <OverlayLoader v-if="isLoading"></OverlayLoader>
        <div class="ingredient-spotlight__image">
            <img :src="mainIngredientImageUrl" :alt="ingredient.name" />
        </div>
        <div class="ingredient-spotlight__content">
            <small v-if="ingredient.hierarchy && ingredient.hierarchy.path_to_self">{{ ingredient.hierarchy.path_to_self }}</small>
            <h4 class="sr-list-item-title">{{ ingredient.name }}</h4>
            <p>{{ truncatedDescription }}</p>
            <RouterLink :to="{ name: 'ingredients.show', params: { id: ingredient.slug } }">{{ $t("show-more") }}</RouterLink>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, computed, watch } from "vue";
import BarAssistantClient from "@/api/BarAssistantClient";
import OverlayLoader from "@/components/OverlayLoader.vue";
import removeMd from "remove-markdown";
import type { components } from "@/api/api";

type Ingredient = components["schemas"]["Ingredient"];

const props = withDefaults(defineProps<{ id?: number }>(), {
    id: 0,
});

const isLoading = ref(false);
const ingredient = ref<Partial<Ingredient>>({});

const truncatedDescription = computed(() => {
    if (!ingredient.value.description) {
        return ingredient.value.description;
    }

    const doc = new DOMParser().parseFromString(ingredient.value.description, "text/html");
    const description = removeMd(doc.documentElement?.textContent ?? "");

    return description.length > 200 ? `${description.substring(0, 200)}...` : description;
});

const mainIngredientImageUrl = computed(() => {
    if (!ingredient.value.images || ingredient.value.images.length == 0) {
        return "/no-ingredient.png";
    }

    return ingredient.value.images.find((i) => i.sort <= 1)?.url ?? "/no-ingredient.png";
});

watch(
    () => props.id,
    (newVal, oldVal) => {
        if (newVal != oldVal) {
            fetchIngredient();
        }
    },
);

fetchIngredient();

function fetchIngredient() {
    isLoading.value = true;
    BarAssistantClient.getIngredient(String(props.id))
        .then((resp) => {
            ingredient.value = resp.data as Ingredient;
            isLoading.value = false;
        })
        .catch(() => {
            ingredient.value = {};
            isLoading.value = false;
        });
}
</script>
<style scoped>
.ingredient-spotlight-wrapper {
    display: flex;
}

.ingredient-spotlight-wrapper h4 {
    margin-top: -2px;
    margin-bottom: var(--gap-size-1);
}

.ingredient-spotlight-wrapper p {
    line-height: 1.4;
    color: var(--clr-gray-700);

    .dark-theme & {
        color: var(--clr-gray-300);
    }
}

.ingredient-spotlight__image {
    flex-shrink: 0;
    padding: 1rem 0 1rem 1rem;
}

.ingredient-spotlight__image img {
    max-width: 60px;
}

.ingredient-spotlight__content {
    padding: 1rem;
}

.ingredient-spotlight__content small {
    font-size: 0.75rem;
    line-height: 1.4;
    display: inline-block;
    color: var(--clr-gray-700);

    .dark-theme & {
        color: var(--clr-gray-400);
    }
}
</style>
