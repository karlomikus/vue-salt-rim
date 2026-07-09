<template>
    <PublicCocktailDetails v-if="cocktail" :cocktail="cocktail"></PublicCocktailDetails>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { components } from "@/api/api";
import { useRoute } from "vue-router";
import PublicCocktailDetails from "./PublicCocktailDetails.vue";
import BarAssistantClient from "@/api/BarAssistantClient";

type Cocktail = components["schemas"]["PublicCocktailResource"];

const route = useRoute();
const cocktail = ref<Cocktail | null>(null);
const barId = route.params.barId;
const publicId = route.params.ulid;

const fetchCocktail = async () => {
    if (barId) {
        try {
            const response = await BarAssistantClient.getPublicBarCocktail(barId.toString(), route.params.slug.toString());
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
