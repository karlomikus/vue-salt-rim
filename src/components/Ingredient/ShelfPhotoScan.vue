<script setup lang="ts">
import { computed, ref } from "vue";
import OverlayLoader from "../OverlayLoader.vue";
import IngredientImage from "./IngredientImage.vue";
import IngredientFinder from "../IngredientFinder.vue";
import IngredientFinderBasic from "../IngredientFinderBasic.vue";
import SaltRimDialog from "../Dialog/SaltRimDialog.vue";
import { useI18n } from "vue-i18n";
import AppState from "@/AppState";
import { useBasicSearch } from "@/composables/useBasicSearch";
import { useShelfPhotoScan } from "@/composables/ingredient/useShelfPhotoScan";
import type { SearchResults } from "@/api/SearchResults";

type SearchResult = SearchResults["ingredient"];

const { t } = useI18n();
const { isLoading, scanShelf, result, matchUnmatched } = useShelfPhotoScan();
const appState = new AppState();
const shouldUseBasicSearch = useBasicSearch();
const files = ref<File[]>([]);
const showIngredientDialog = ref(false);
const unmatchedNameMatch = ref<string | null>(null);

const MAX_PHOTOS = 10;

const hasResults = computed(() => (result.value?.stocked.length ?? 0) > 0 || (result.value?.unmatched.length ?? 0) > 0);
const tooManyPhotos = computed(() => files.value.length > MAX_PHOTOS);

function onFilesChanged($event: Event) {
    const target = $event.target as HTMLInputElement;
    if (target && target.files) {
        files.value = Array.from(target.files);
        result.value = null;
    }
}

function manuallyMatch(name: string) {
    unmatchedNameMatch.value = name;
    showIngredientDialog.value = true;
}

async function handleIngredientSelected(ingredient: SearchResult) {
    if (unmatchedNameMatch.value === null) {
        return;
    }

    const wasMatched = await matchUnmatched(unmatchedNameMatch.value, ingredient);
    if (wasMatched) {
        showIngredientDialog.value = false;
        unmatchedNameMatch.value = null;
    }
}
</script>
<template>
    <form @submit.prevent="scanShelf(files)">
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ t("ingredient.shelf-photo-title") }}</div>
        <template v-if="result === null">
            <div class="alert alert--info" style="margin-bottom: var(--gap-size-3);">
                <h3>{{ t("information") }}</h3>
                <p>{{ t("ingredient.shelf-photo-intro") }}</p>
            </div>
            <div class="form-group">
                <label class="form-label form-label--required" for="shelf-photos">{{ t("ingredient.shelf-photo-select") }}:</label>
                <input
                    id="shelf-photos"
                    type="file"
                    class="form-input"
                    accept="image/*"
                    multiple
                    required
                    @change="onFilesChanged($event)"
                />
                <span class="form-input-hint">Images (max: {{ MAX_PHOTOS }}) will be sent to configured AI provider for processing.</span>
            </div>
            <div style="display: flex; gap: var(--gap-size-2); justify-content: flex-end">
                <button type="submit" class="button button--dark" :disabled="isLoading || files.length < 1 || tooManyPhotos">{{ t("ingredient.shelf-photo-submit") }}</button>
            </div>
        </template>
        <template v-else>
            <div v-if="hasResults">
                <div v-if="result.stocked.length > 0">
                    <h3 class="form-section-title">{{ t("ingredient.shelf-photo-stocked") }}</h3>
                    <ul class="shelf-photo-scan__grid">
                        <li v-for="ingredient in result.stocked" :key="ingredient.id" class="shelf-photo-scan__grid-item">
                            <IngredientImage :image-url="ingredient.image?.url ?? null"></IngredientImage>
                            <span class="shelf-photo-scan__grid-name">{{ ingredient.name }}</span>
                        </li>
                    </ul>
                </div>
                <div v-if="result.unmatched.length > 0">
                    <h3 class="form-section-title">{{ t("ingredient.shelf-photo-unmatched") }}</h3>
                    <div class="block-container block-container--inset">
                        <ul class="shelf-photo-scan__list">
                            <li v-for="name in result.unmatched" :key="name" class="block-container shelf-photo-scan__unmatched-item">
                                <span>{{ name }}</span>
                                <a href="#" @click.prevent="manuallyMatch(name)">{{ t("import.manually-match") }}</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <p v-else>{{ t("ingredient.shelf-photo-empty") }}</p>
            <div style="display: flex; gap: var(--gap-size-2); justify-content: flex-end">
                <button type="button" class="button button--outline" @click.prevent="result = null">
                    {{ t("ingredient.shelf-photo-scan-again") }}
                </button>
            </div>
            <SaltRimDialog v-if="unmatchedNameMatch" v-model="showIngredientDialog">
                <template #trigger><span></span></template>
                <template #dialog>
                    <div class="dialog-title">{{ t("import.manually-match") }}</div>
                    <p style="margin-bottom: 1rem">{{ t("import.manual-match-notice", { name: unmatchedNameMatch }) }}</p>
                    <IngredientFinderBasic
                        v-if="shouldUseBasicSearch"
                        :initial-query="unmatchedNameMatch"
                        @ingredient-selected="handleIngredientSelected"
                    ></IngredientFinderBasic>
                    <IngredientFinder
                        v-else-if="appState.bar.search_token"
                        :search-token="appState.bar.search_token"
                        :initial-query="unmatchedNameMatch"
                        @ingredient-selected="handleIngredientSelected"
                    ></IngredientFinder>
                    <div class="dialog-actions">
                        <button type="button" class="button button--outline" @click="showIngredientDialog = false">{{ t("close") }}</button>
                    </div>
                </template>
            </SaltRimDialog>
        </template>
    </form>
</template>

<style scoped>
.shelf-photo-scan__count {
    display: block;
    margin-top: var(--gap-size-1);
    color: var(--clr-gray-600);
    font-size: 0.9rem;
}
.shelf-photo-scan__hint {
    color: var(--clr-red-700);
    margin-bottom: 0;
}
.shelf-photo-scan__list {
    margin: 0;
    padding: var(--gap-size-1);
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-1);
}
.shelf-photo-scan__unmatched-item {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--gap-size-2);
    padding: var(--gap-size-2);
    span {
        font-weight: var(--fw-bold);
    }
}
@media (max-width: 550px) {
    .shelf-photo-scan__unmatched-item {
        flex-direction: column;
        gap: 0;
    }
}
.shelf-photo-scan__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: var(--gap-size-1);
    margin: 0 0 var(--gap-size-1) 0;
    padding: 0;
    list-style: none;
}
.shelf-photo-scan__grid-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--gap-size-1);
    text-align: center;
    padding: var(--gap-size-1);
}
.shelf-photo-scan__grid-name {
    font-size: 1em;
    font-weight: var(--fw-bold);
    overflow-wrap: anywhere;
    font-family: var(--font-heading);
}
</style>
