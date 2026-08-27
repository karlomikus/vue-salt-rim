<template>
    <PublicCocktailDetails v-if="cocktail" :cocktail="cocktail"></PublicCocktailDetails>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { components } from "@/api/api";
import { useRoute } from "vue-router";
import PublicCocktailDetails from "./PublicCocktailDetails.vue";
import BarAssistantClient from "@/api/BarAssistantClient";
import { usePageMeta } from "@/composables/usePageMeta";
import { usePublicBarName } from "@/composables/public/usePublicBarName";

type Cocktail = components["schemas"]["PublicCocktailResource"];

const route = useRoute();
const cocktail = ref<Cocktail | null>(null);
const barIdParam = route.params.barId;
const barId = Array.isArray(barIdParam) ? barIdParam[0] : barIdParam;
const publicId = route.params.ulid;

const barName = usePublicBarName(barId);

usePageMeta({
    title: computed(() => cocktail.value?.name ?? null),
    description: computed(() => cocktail.value?.description ?? null),
    image: computed(() => cocktail.value?.images?.[0]?.url ?? null),
    siteName: barName,
});

const fetchCocktail = async () => {
    if (barId) {
        try {
            const response = await BarAssistantClient.getPublicBarCocktail(barId, route.params.slug.toString());
            cocktail.value = response?.data || null;
        } catch (error) {
            cocktail.value = null;
        }
    }
    if (publicId) {
        try {
            const response = await BarAssistantClient.getPublicLinkCocktail(publicId.toString());
            cocktail.value = response?.data || null;
        } catch (error) {
            cocktail.value = null;
        }
    }
};

fetchCocktail();
</script>
