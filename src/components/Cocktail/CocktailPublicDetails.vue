<template>
    <div class="public-page">
        <div class="public-page__header">
            <SiteLogo :bar-name="barName" :bar-subtitle="barSubtitle"></SiteLogo>
        </div>
        <PublicRecipe :cocktail="cocktail"></PublicRecipe>
        <div class="public-footer">
            Powered by <a href="https://barassistant.app">Bar Assistant</a>
            <template v-if="cocktail.source"> &middot; <SourcePresenter :source="cocktail.source"></SourcePresenter> </template>
            <!-- &middot; <a href="#">Add to your bar</a> &middot; <a href="#">Print</a> -->
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import BarAssistantClient from "@/api/BarAssistantClient";
import SiteLogo from "@/components/Layout/SiteLogo.vue";
import PublicRecipe from "@/components/Cocktail/PublicRecipe.vue";
import SourcePresenter from "@/components/SourcePresenter.vue";
import { useTitle } from "@/composables/title";
import { useSaltRimToast } from "@/composables/toast";

type PublicCocktail = {
    name?: string;
    source?: string | null;
    bar?: { name?: string | null; subtitle?: string | null } | null;
};

const route = useRoute();
const { t } = useI18n();
const toast = useSaltRimToast();

const isLoading = ref(false);
const cocktail = ref<PublicCocktail>({});

const barName = computed(() => cocktail.value.bar?.name ?? null);
const barSubtitle = computed(() => cocktail.value.bar?.subtitle ?? null);

watch(
    () => cocktail.value,
    (val) => {
        useTitle(val.name ?? "Cocktail");
    },
);

useTitle("Cocktail");

watch(
    () => route.params,
    () => {
        if (route.name == "e.cocktail") {
            getCocktail(route.params.ulid as string);
        }
    },
    { immediate: true },
);

onMounted(() => {
    document.body.classList.add("public-body");
});

onUnmounted(() => {
    document.body.classList.remove("public-body");
});

function getCocktail(ulid: string) {
    isLoading.value = true;
    (BarAssistantClient as unknown as { getPublicCocktail: (ulid: string) => Promise<{ data: PublicCocktail }> })
        .getPublicCocktail(ulid)
        .then((resp) => {
            cocktail.value = resp.data;
            isLoading.value = false;
        })
        .catch((e) => {
            toast.error(e.message);
            isLoading.value = false;
        });
}
</script>

<style scoped>
.public-page__header {
    padding: var(--gap-size-3);
    margin: var(--gap-size-3) 0;
    background-color: #332d46;
    border-bottom: 1px solid #6b6188;
    box-shadow:
        inset 0px 0.4px 0.5px hsl(var(--shadow-color-dark) / 0.25),
        inset 0px 1.1px 1.2px -0.8px hsl(var(--shadow-color-dark) / 0.25),
        inset 0px 2.6px 2.9px -1.7px hsl(var(--shadow-color-dark) / 0.25),
        inset 0px 6.3px 7.1px -2.5px hsl(var(--shadow-color-dark) / 0.25);
    border-radius: var(--radius-3);
}

.public-page {
    align-items: center;
    justify-content: center;
    flex-direction: column;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 0 0.5rem;
}

.public-footer {
    padding: 1rem 0;
    font-size: 0.85rem;
    color: var(--clr-gray-300);
}

.public-footer a {
    color: var(--clr-gray-200);
}
</style>
