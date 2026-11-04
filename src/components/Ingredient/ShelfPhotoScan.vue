<script setup lang="ts">
import { computed, ref } from "vue";
import OverlayLoader from "../OverlayLoader.vue";
import IngredientImage from "./IngredientImage.vue";
import { useI18n } from "vue-i18n";
import { useShelfPhotoScan } from "@/composables/ingredient/useShelfPhotoScan";

const { t } = useI18n();
const { isLoading, scanShelf, result } = useShelfPhotoScan();
const files = ref<File[]>([]);

const MAX_PHOTOS = 10;

const hasResults = computed(() => (result.value?.stocked.length ?? 0)); //+ (result.value?.unmatched.length ?? 0) > 0);
const tooManyPhotos = computed(() => files.value.length > MAX_PHOTOS);

function onFilesChanged($event: Event) {
    const target = $event.target as HTMLInputElement;
    if (target && target.files) {
        files.value = Array.from(target.files);
        result.value = null;
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
                        <li v-for="ingredient in result.stocked" :key="ingredient.id" class="block-container shelf-photo-scan__grid-item">
                            <IngredientImage :image-url="ingredient.image?.url ?? null"></IngredientImage>
                            <span class="shelf-photo-scan__grid-name">{{ ingredient.name }}</span>
                        </li>
                    </ul>
                </div>
                <!-- <div v-if="result.unmatched.length > 0">
                    <h3 class="form-section-title">{{ t("ingredient.shelf-photo-unmatched") }}</h3>
                    <ul class="shelf-photo-scan__list">
                        <li v-for="name in result.unmatched" :key="name">{{ name }}</li>
                    </ul>
                </div> -->
            </div>
            <p v-else>{{ t("ingredient.shelf-photo-empty") }}</p>
            <div style="display: flex; gap: var(--gap-size-2); justify-content: flex-end">
                <button type="button" class="button button--outline" @click.prevent="result = null">
                    {{ t("ingredient.shelf-photo-scan-again") }}
                </button>
            </div>
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
    padding-left: 1.2rem;
}
.shelf-photo-scan__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: var(--gap-size-2);
    margin: 0 0 1rem 0;
    padding: 0;
    list-style: none;
}
.shelf-photo-scan__grid-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--gap-size-1);
    text-align: center;
    padding: var(--gap-size-2);
}
.shelf-photo-scan__grid-name {
    font-size: 1em;
    font-weight: var(--fw-bold);
    overflow-wrap: anywhere;
    font-family: var(--font-heading);
}
</style>
