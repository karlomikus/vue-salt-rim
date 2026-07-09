<template>
    <div class="bar-cocktail-recipe" itemscope itemtype="http://schema.org/Recipe">
        <div class="bar-cocktail-recipe__header">
            <div class="bar-cocktail-recipe__image" itemprop="image" :content="mainImage.url">
                <img :src="mainImage.url" alt="" />
                <div class="glare"></div>
                <div v-if="mainImage.copyright" class="bar-cocktail-recipe__image__copyright">
                    {{ $t("imageupload.copyright-notice", { copyright: mainImage.copyright }) }}
                </div>
            </div>
            <div class="bar-cocktail-recipe__info">
                <h2 itemprop="name">{{ cocktail.name }}</h2>
                <ul class="bar-cocktail-recipe__tags">
                    <li v-for="t in cocktailTags" :key="t.value" class="bar-cocktail-recipe__tag" :class="t.class">{{ t.value }}</li>
                </ul>
                <div v-show="cocktail.description" itemprop="description" v-html="parsedDescription"></div>
                <div class="bar-cocktail-recipe__info__source">
                    <button class="button button--public" @click="showPrintDialog">{{ $t("print-recipe") }}</button>
                    <a v-if="cocktail.source && isValidURL" :href="cocktail.source"
                        >{{ $t("public-bar.recipe-source") }}
                        <svg class="bar-cocktail-recipe__external-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path
                                d="M10 6V8H5V19H16V14H18V20C18 20.5523 17.5523 21 17 21H4C3.44772 21 3 20.5523 3 20V7C3 6.44772 3.44772 6 4 6H10ZM21 3V11H19L18.9999 6.413L11.2071 14.2071L9.79289 12.7929L17.5849 5H13V3H21Z"
                            ></path></svg
                    ></a>
                    <span v-else-if="cocktail.source">
                        {{ $t("public-bar.recipe-source") }}: {{ cocktail.source }} <template v-if="cocktail.year">({{ cocktail.year }})</template>
                    </span>
                </div>
            </div>
        </div>
        <div class="bar-cocktail-recipe__content block-container block-container--padded">
            <div class="bar-cocktail-recipe__section">
                <h3>{{ $t("ingredient.ingredients") }}</h3>
                <div class="bar-cocktail-recipe__ingredient-actions">
                    <div>
                        <button type="button" class="button button--public" @click="showScaler = !showScaler">Scale recipe</button>
                    </div>
                    <div>
                        <button type="button" class="button button--public" :class="{ 'button--active': currentUnit == 'ml' }" @click="currentUnit = 'ml'">ml</button>
                        <button type="button" class="button button--public" :class="{ 'button--active': currentUnit == 'oz' }" @click="currentUnit = 'oz'">oz</button>
                        <button type="button" class="button button--public" :class="{ 'button--active': currentUnit == 'cl' }" @click="currentUnit = 'cl'">cl</button>
                    </div>
                </div>
                <CocktailRecipeScaler
                    v-if="showScaler"
                    class="bar-cocktail-recipe__scaler"
                    v-model="scaleFactor"
                    v-model:waterDilution="waterDilution"
                    v-model:targetVolume="targetVolumeToScaleTo"
                    :cocktail-volume-ml="cocktail.volume_ml ?? 0"
                    :method-dilution="cocktail.method_dilution_percentage ?? 0"
                    :current-unit="currentUnit"
                />
                <ul class="public-cocktail-recipe__ingredients">
                    <CocktailIngredient v-for="ing in cocktail.ingredients" :key="ing.name" :cocktail-ingredient="ing" :units="currentUnit" :scale-factor="scaleFactor" />
                </ul>
            </div>
            <div class="bar-cocktail-recipe__section">
                <h3>{{ $t("instructions") }}</h3>
                <div itemprop="recipeInstructions" class="public-cocktail-recipe__content" v-html="parsedInstructions"></div>
            </div>
            <div v-show="cocktail.garnish" class="bar-cocktail-recipe__section">
                <h3>{{ $t("garnish") }}</h3>
                <div class="public-cocktail-recipe__content" v-html="parsedGarnish"></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { components } from "@/api/api";
import { useRouter } from "vue-router";
import { micromark } from "micromark";
import CocktailIngredient from "./PublicCocktailIngredient.vue";
import CocktailRecipeScaler from "./../Cocktail/CocktailRecipeScaler.vue";
import AppState from "@/AppState";

type Cocktail = components["schemas"]["PublicCocktailResource"];
type CocktailTag = {
    value: string;
    type: string;
    class: string;
};

const appState = new AppState();
const router = useRouter();
const currentUnit = ref<"ml" | "oz" | "cl">(appState.defaultUnit);
const scaleFactor = ref<number>(1);
const waterDilution = ref<string | null>(null);
const targetVolumeToScaleTo = ref<null | number>(null);
const showScaler = ref<boolean>(false);
const barId = "test";
const props = defineProps<{
    cocktail: Cocktail;
}>();

const parsedDescription = computed(() => {
    return props.cocktail.description ? micromark(props.cocktail.description) : "";
});

const parsedInstructions = computed(() => {
    return props.cocktail.instructions ? micromark(props.cocktail.instructions) : "";
});

const parsedGarnish = computed(() => {
    return props.cocktail.garnish ? micromark(props.cocktail.garnish) : "";
});

const mainImage = computed(() => {
    if (props.cocktail && props.cocktail.images && props.cocktail.images.length > 0) {
        return props.cocktail.images[0];
    }

    return {
        url: "/no-cocktail.jpg",
        copyright: null,
    };
});

const cocktailTags = computed(() => {
    const result: CocktailTag[] = [];

    result.push(...(props.cocktail.tags.map((tag) => ({ value: tag, type: "tag", class: "bar-cocktail-recipe__tag--tag" })) || []));

    if (props.cocktail.glass) {
        result.push({ value: props.cocktail.glass, type: "glass", class: "bar-cocktail-recipe__tag--glass" });
    }

    if (props.cocktail.method) {
        result.push({ value: props.cocktail.method, type: "method", class: "bar-cocktail-recipe__tag--method" });
    }

    if (props.cocktail.abv) {
        result.push({ value: props.cocktail.abv.toString() + "% ABV", type: "abv", class: "bar-cocktail-recipe__tag--abv" });
    }

    result.push(...(props.cocktail.utensils.map((utensil) => ({ value: utensil, type: "utensil", class: "bar-cocktail-recipe__tag--utensil" })) || []));

    return result;
});

const isValidURL = computed(() => {
    if (!props.cocktail.source) {
        return false;
    }

    const source = props.cocktail.source || "";

    try {
        new URL(source.startsWith("http") ? source : `https://${source}`);
        return true;
    } catch (err) {
        return false;
    }
});

const showPrintDialog = () => {
    window.print();
};

watch(
    () => currentUnit.value,
    () => {
        appState.setDefaultUnits(currentUnit.value);
    },
);
</script>

<style scoped>
.bar-cocktail-recipe {
    --bcr-default-gap: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    /*max-width: 800px;*/
    margin: 0 auto;
}

.bar-cocktail-recipe__info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.bar-cocktail-recipe__info h2 {
    font-family: var(--font-heading);
    font-size: 2.2em;
    font-weight: bold;
    margin-top: 0;
    line-height: 1.1;
}

:deep(.bar-cocktail-recipe__info p) {
    line-height: 1.5;
}

.bar-cocktail-recipe__info__source {
    font-size: 0.75em;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.bar-cocktail-recipe__image {
    flex-shrink: 0;
    width: 300px;
    position: relative;
    box-shadow: var(--shadow-elevation-medium);
}
@media (max-width: 545px) {
    .bar-cocktail-recipe__image {
        width: auto;
    }
}

.bar-cocktail-recipe__image img {
    display: block;
    object-position: center;
    object-fit: cover;
    width: 100%;
    height: 100%;
    border-radius: 0.25rem;
}

.bar-cocktail-recipe__image__copyright {
    background-color: rgba(0, 0, 0, 0.3);
    color: #fff;
    text-shadow: 0 0 3px rgba(0, 0, 0, 0.7);
    font-size: 0.65em;
    position: absolute;
    bottom: 0;
    padding: 1px 5px;
    border-radius: 3px;
    margin: 4px;
}

.bar-cocktail-recipe__content {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--bcr-default-gap);
}

.bar-cocktail-recipe__content h3 {
    font-family: var(--font-heading);
    font-size: 1em;
    font-weight: bold;
    color: #8f4277;
    margin-bottom: 0.25rem;
}

.bar-cocktail-recipe__header {
    display: flex;
    gap: var(--bcr-default-gap);
}
@media (max-width: 545px) {
    .bar-cocktail-recipe__header {
        flex-direction: column;
    }
}

.public-cocktail-recipe__ingredients {
    list-style: none;
    padding: 0;
    margin: 0;
}

.bar-cocktail-recipe__tags {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
}

.bar-cocktail-recipe__tag {
    padding: 0.15rem 0.5rem;
    font-size: 0.75rem;
    font-weight: var(--fw-bold);
    color: white;
    border-radius: 2px;
    text-transform: capitalize;
}

.bar-cocktail-recipe__tag--tag {
    background-color: oklch(0.882 0.072 52.8);
    color: oklch(0.474 0.121 52.8);
}

.bar-cocktail-recipe__tag--glass {
    background-color: oklch(0.95 0.029 231.6);
    color: oklch(0.55 0.112 231.6);
}

.bar-cocktail-recipe__tag--method {
    background-color: oklch(0.95 0.029 304.7);
    color: oklch(0.451 0.235 304.7);
}

.bar-cocktail-recipe__tag--abv {
    background-color: oklch(0.931 0.034 28.4);
    color: oklch(0.431 0.17 28.4);
}

.bar-cocktail-recipe__tag--utensil {
    background-color: oklch(0.95 0.009 73.7);
    color: oklch(0.513 0.025 73.7);
}

.bar-cocktail-recipe__external-icon {
    width: 0.75em;
    height: 0.75em;
    vertical-align: middle;
}

.bar-cocktail-recipe__ingredient-actions {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
}

.glare {
    position: absolute;
    top: 5px;
    left: 5px;
    right: 5px;
    bottom: 5px;
    pointer-events: none;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 40%);
    opacity: 0.6;
    border-radius: 0.25rem;
    box-shadow: inset 1px 1px 1px rgba(255, 255, 255, 0.4);
}

@media print {
    :global(body) {
        background: #fff;
        color: #000;
    }

    :global(.public-layout-footer) {
        display: none;
    }

    .bar-cocktail-recipe {
        --bcr-default-gap: 0.75rem;
        color: #000;
        gap: 0.75rem;
        max-width: none;
        margin: 0;
        font-size: 10pt;
        line-height: 1.35;
        break-inside: avoid;
    }

    .bar-cocktail-recipe__header {
        display: grid;
        grid-template-columns: 1.5in 1fr;
        align-items: start;
        gap: 0.75rem;
        padding-bottom: 0.75rem;
        border-bottom: 3px double #333;
        break-inside: avoid;
    }

    .bar-cocktail-recipe__image {
        width: 1.5in;
        box-shadow: none;
    }

    .bar-cocktail-recipe__image img {
        max-height: 1.5in;
        border: 1px solid #999;
        border-radius: 0;
    }

    .bar-cocktail-recipe__image__copyright {
        position: static;
        margin: 0.15rem 0 0;
        padding: 0;
        background: transparent;
        color: #555;
        text-shadow: none;
        font-size: 7pt;
        line-height: 1.2;
    }

    .glare,
    .bar-cocktail-recipe__print-link,
    .bar-cocktail-recipe__ingredient-actions,
    .bar-cocktail-recipe__scaler {
        display: none;
    }

    .bar-cocktail-recipe__info {
        gap: 0.35rem;
    }

    .bar-cocktail-recipe__info h2 {
        color: #000;
        font-size: 22pt;
        line-height: 1;
        margin: 0;
    }

    :deep(.bar-cocktail-recipe__info p),
    :deep(.public-cocktail-recipe__content p) {
        line-height: 1.35;
    }

    .bar-cocktail-recipe__info__source {
        display: none;
    }

    .bar-cocktail-recipe__external-icon {
        display: none;
    }

    .bar-cocktail-recipe__content {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 0.75rem;
        width: 100%;
        padding: 0;
        background: transparent;
        border: 0;
        box-shadow: none;
    }

    .bar-cocktail-recipe__section {
        break-inside: avoid;
    }

    .bar-cocktail-recipe__section:first-child {
        padding: 0.5rem;
        border: 1px solid #333;
    }

    .bar-cocktail-recipe__content h3 {
        color: #000;
        font-size: 11pt;
        margin-bottom: 0.35rem;
        border-bottom: 1px solid #333;
    }

    .public-cocktail-recipe__ingredients {
        font-size: 9pt;
    }

    :deep(.public-cocktail-recipe__ingredients__ingredient) {
        padding: 0.12rem 0;
        border-bottom-color: #999;
        break-inside: avoid;
    }

    :deep(.public-cocktail-recipe__ingredients__secondary) {
        color: #555;
        font-size: 7.5pt;
    }

    .bar-cocktail-recipe__tags {
        gap: 0.2rem;
    }

    .bar-cocktail-recipe__tag {
        padding: 0.05rem 0.25rem;
        border: 1px solid #777;
        background: transparent;
        color: #000;
        font-size: 7.5pt;
    }

    :deep(.public-cocktail-recipe__content ol),
    :deep(.public-cocktail-recipe__content ul) {
        padding-left: 1rem;
    }
}
</style>
