<script setup lang="ts">
import { ref, computed } from "vue";
import BarAssistantClient from "@/api/BarAssistantClient";
import OverlayLoader from "./../OverlayLoader.vue";
import PageHeader from "./../PageHeader.vue";
import SaltRimRadio from "../SaltRimRadio.vue";
import IngredientFinder from "./../IngredientFinder.vue";
import SaltRimDialog from "../Dialog/SaltRimDialog.vue";
import SubscriptionCheck from "../SubscriptionCheck.vue";
import { useSaltRimToast } from "@/composables/toast";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import type { SearchResults } from "@/api/SearchResults";
import type { components } from "@/api/api";
import { useTitle } from "@/composables/title";
import AppState from "@/AppState";
import { useBookmarklet } from "@/composables/useBookmarklet";
import IngredientFinderBasic from "../IngredientFinderBasic.vue";
import { useBasicSearch } from "@/composables/useBasicSearch";
import type { ImportResult } from "@/schema/ImportResult";
import { useUrlImport } from "@/composables/useUrlImport";
import { useJsonImport } from "@/composables/useJsonImport";
import { useAiImport } from "@/composables/useAiImport";
import { useHtmlImport } from "@/composables/useHtmlImport";

type SearchResult = SearchResults["ingredient"];
type Cocktail = components["schemas"]["Cocktail"];
type Bar = components["schemas"]["Bar"];
type Glass = components["schemas"]["Glass"];
type FullIngredient = components["schemas"]["Ingredient"];
type CocktailMethod = components["schemas"]["CocktailMethod"];

const urlImporter = useUrlImport();
const jsonImporter = useJsonImport();
const aiImporter = useAiImport();
const htmlImporter = useHtmlImport();
const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const toast = useSaltRimToast();
const shouldUseBasicSearch = useBasicSearch();
const isLoading = ref(false);
const isImporting = ref(false);
const showIngredientDialog = ref(false);
const ingredientNameMatch = ref<ImportResult["ingredients"][0] | ImportResult["ingredients"][0]["substitutes"][0] | null>(null);
const importType = ref<"url" | "json" | "bookmarklet" | "ai" | "html">("url");
const similarCocktails = ref([] as Cocktail[]);
const isLoadingSimilar = ref(false);
const bookmarkletUrl = ref<string | null>(null);
const bar = ref({} as Bar);
const appState = new AppState();
const source = ref<{
    url: null | string;
    json: null | string;
    ai_content: null | string;
    html: null | string;
}>({
    url: null,
    json: null,
    ai_content: null,
    html: null,
});
const result = ref<ImportResult | null>(null);
const cocktailTags = computed({
    get() {
        return result.value?.tags?.join(",");
    },
    set(newVal) {
        if (!result.value) {
            return;
        }

        if (Array.isArray(newVal)) {
            newVal = newVal.join(",");
        }

        if (newVal == "" || newVal == null || newVal == undefined) {
            result.value.tags = [];
        } else {
            result.value.tags = Array.from(new Set(newVal.split(",").filter((t) => t != "")));
        }
    },
});

const isAiEnabled = computed(() => {
    return appState.isAiEnabled;
});

function clearImport() {
    similarCocktails.value = [];
    source.value = {
        url: null,
        json: null,
        ai_content: null,
        html: null,
    };
    ingredientNameMatch.value = null;
    result.value = null;
}

async function importCocktail() {
    similarCocktails.value = [];
    ingredientNameMatch.value = null;
    result.value = null;
    similarCocktails.value = [];

    if (importType.value == "url") {
        fromUrl();
    }

    if (importType.value == "json") {
        fromJson();
    }

    if (importType.value == "ai") {
        fromAi();
    }

    if (importType.value == "html") {
        fromHtml();
    }
}

function fromUrl() {
    if (!source.value.url) {
        return;
    }

    isLoading.value = true;
    urlImporter
        .scrapeCocktail(source.value.url)
        .then(() => {
            result.value = urlImporter.result.value;
            if (result.value) {
                findSimilarCocktails(result.value.name);
            }
        })
        .catch((e) => {
            toast.error(e.message);
        })
        .finally(() => {
            isLoading.value = false;
        });
}

function fromAi() {
    if (!source.value.ai_content) {
        return;
    }

    isLoading.value = true;
    aiImporter
        .generateFromAi(source.value.ai_content)
        .then(() => {
            result.value = aiImporter.result.value;
            if (result.value) {
                findSimilarCocktails(result.value.name);
            }
        })
        .catch((e) => {
            toast.error(e.message);
        })
        .finally(() => {
            isLoading.value = false;
        });
}

function fromJson() {
    if (!source.value.json) {
        return;
    }

    jsonImporter.importFromJson(source.value.json);
    result.value = jsonImporter.result.value;
    if (result.value) {
        findSimilarCocktails(result.value.name);
    }
}

async function fromHtml() {
    if (!source.value.html) {
        return;
    }

    isLoading.value = true;
    htmlImporter
        .scrapeFromHtml(source.value.html)
        .then(() => {
            result.value = htmlImporter.result.value;
            if (result.value) {
                findSimilarCocktails(result.value.name);
            }
        })
        .catch((e) => {
            toast.error(e.message);
        })
        .finally(() => {
            isLoading.value = false;
        });
}

function manuallyMatch(ing: ImportResult["ingredients"][0] | ImportResult["ingredients"][0]["substitutes"][0]) {
    showIngredientDialog.value = true;
    ingredientNameMatch.value = ing;
}

function removeIngredient(ingredient: ImportResult["ingredients"][0]) {
    if (!result.value) {
        return;
    }

    result.value.ingredients?.splice(
        result.value.ingredients?.findIndex((i) => i.name == ingredient.name),
        1,
    );
}

function removeSubIngredient(parentIngredient: ImportResult["ingredients"][0], ingredient: ImportResult["ingredients"][0]["substitutes"][0]) {
    parentIngredient.substitutes?.splice(
        parentIngredient?.substitutes?.findIndex((i) => i.name == ingredient.name),
        1,
    );
}

function handleIngredientEdit(selectedIngredient: SearchResult) {
    if (ingredientNameMatch.value == null) {
        return;
    }

    ingredientNameMatch.value.matchedIngredient = {
        id: selectedIngredient.id,
        slug: selectedIngredient.slug,
        name: selectedIngredient.name,
    };

    showIngredientDialog.value = false;
}

async function getGlass(glassName: string): Promise<Glass | null> {
    try {
        const response = await BarAssistantClient.getGlasses({ "filter[name]": glassName.toLowerCase() });
        const dbGlass = response?.data?.[0] ?? null;

        if (dbGlass) {
            return dbGlass;
        }

        return null;
    } catch (error) {
        return null;
    }
}

async function getMethod(methodName: string): Promise<CocktailMethod | null> {
    try {
        const response = await BarAssistantClient.getCocktailMethods({ "filter[name]": methodName.toLowerCase() });
        const dbGlass = response?.data?.[0] ?? null;

        if (dbGlass) {
            return dbGlass;
        }

        return null;
    } catch (error) {
        return null;
    }
}

async function getOrCreateIngredient(ingredientName: string): Promise<FullIngredient | null> {
    try {
        const response = await BarAssistantClient.getIngredients({ "filter[name_exact]": ingredientName.toLowerCase(), per_page: 1 });
        const dbIngredient = response?.data?.[0] ?? null;

        if (dbIngredient) {
            return dbIngredient;
        }

        const newIngredientId = await BarAssistantClient.saveIngredient({ name: ingredientName });
        const newIngredient = await BarAssistantClient.getIngredient(newIngredientId);

        return newIngredient?.data ?? null;
    } catch (error) {
        return null;
    }
}

async function finishImporting() {
    isImporting.value = true;
    if (!result.value) {
        return;
    }

    let matchedGlass = null;
    if (result.value.glassName) {
        matchedGlass = (await getGlass(result.value.glassName)) ?? null;
    }

    let matchedMethod = null;
    if (result.value.methodName) {
        matchedMethod = (await getMethod(result.value.methodName)) ?? null;
    }

    for (const ingredient of result.value.ingredients) {
        if (ingredient.matchedIngredient) {
            continue;
        }

        const foundIngredient = await getOrCreateIngredient(ingredient.name);
        if (foundIngredient) {
            ingredient.matchedIngredient = {
                id: foundIngredient.id,
                slug: foundIngredient.slug,
                name: foundIngredient.name,
            };
        }

        if (ingredient.substitutes) {
            for (const substitute of ingredient.substitutes) {
                if (substitute.matchedIngredient) {
                    continue;
                }

                const foundIngredient = await getOrCreateIngredient(substitute.name);
                if (foundIngredient) {
                    substitute.matchedIngredient = {
                        id: foundIngredient.id,
                        slug: foundIngredient.slug,
                        name: foundIngredient.name,
                    };
                }
            }
        }
    }

    const cocktail = {
        name: result.value.name,
        description: result.value.description,
        instructions: result.value.instructions,
        garnish: result.value.garnish,
        source: result.value.source,
        method: { id: matchedMethod?.id },
        glass: matchedGlass,
        images:
            result.value.images?.map((img, idx) => ({
                url: img.uri,
                file: img.uri,
                file_path: "Image from: " + result.value?.source,
                copyright: img.copyright,
                sort: idx + 1,
            })) ?? [],
        tags: result.value.tags?.map((tag) => ({ name: tag })),
        ingredients: result.value.ingredients.map((ing, idx) => {
            return {
                units: ing.units,
                amount: ing.amount,
                amount_max: ing.amount_max,
                optional: false,
                sort: idx + 1,
                note: ing.note,
                substitutes: ing.substitutes?.map((sub) => {
                    return {
                        units: sub.units,
                        amount: sub.amount,
                        amount_max: sub.amount_max,
                        ingredient: sub.matchedIngredient,
                    };
                }),
                ingredient: ing.matchedIngredient,
            };
        }),
        utensils: [],
    };

    sessionStorage.setItem("scrapeResult", JSON.stringify(cocktail));
    router.push({ name: "cocktails.form" });
}

async function findSimilarCocktails(name: string): Promise<void> {
    isLoadingSimilar.value = true;
    const response = await BarAssistantClient.getCocktails({ "filter[name]": name.toLowerCase(), per_page: 10 });
    isLoadingSimilar.value = false;
    similarCocktails.value = response?.data ?? [];
}

async function getBar(barId: number): Promise<void> {
    isLoading.value = true;
    const resp = await BarAssistantClient.getBar(barId);
    if (resp) {
        bar.value = resp.data;
    }
    isLoading.value = false;
}

async function init() {
    useTitle(t("cocktail.import"));

    await getBar(appState.bar.id);

    const prefilledUrl = route.query.url?.toString();
    if (prefilledUrl) {
        isLoading.value = true;
        source.value.url = prefilledUrl;
        importCocktail();
    }
}

async function setupBookmarklet() {
    isLoading.value = true;
    const token =
        (
            await BarAssistantClient.saveToken({
                name: "bookmarklet",
                abilities: ["cocktails.import"],
            })
        )?.data.token ?? "";
    isLoading.value = false;

    const { generateBookmarkletCode } = useBookmarklet();
    bookmarkletUrl.value = generateBookmarkletCode({
        serverUrl: `${window.srConfig.API_URL}/api/import/scrape`,
        authToken: token,
        barId: appState.bar.id.toString(),
    });
}

init();
</script>
<template>
    <form @submit.prevent="finishImporting">
        <PageHeader>
            {{ t("cocktail.import") }}
        </PageHeader>
        <h3 class="form-section-title">{{ t("import.type") }}</h3>
        <div class="block-container block-container--padded">
            <SubscriptionCheck>Subscribe to "Mixologist" plan to remove limit of two import actions per minute!</SubscriptionCheck>
            <div class="form-group">
                <label class="form-label form-label--required">{{ t("type") }}:</label>
                <div class="import-types">
                    <SaltRimRadio v-model="importType" :title="t('import.type-url-title')" :description="t('import.type-url-description')" value="url"></SaltRimRadio>
                    <SaltRimRadio v-model="importType" :title="t('import.type-json-title')" :description="t('import.type-json-description')" value="json"></SaltRimRadio>
                    <SaltRimRadio v-model="importType" :title="t('import.type-html-title')" :description="t('import.type-html-description')" value="html"></SaltRimRadio>
                    <SaltRimRadio
                        v-model="importType"
                        :title="t('import.type-bookmarklet-title')"
                        :description="t('import.type-bookmarklet-description')"
                        value="bookmarklet"
                    ></SaltRimRadio>
                    <SaltRimRadio
                        v-if="isAiEnabled"
                        v-model="importType"
                        :title="t('import.type-ai-title')"
                        :description="t('import.type-ai-description')"
                        value="ai"
                    ></SaltRimRadio>
                </div>
            </div>
            <div class="alert alert--info" style="margin: 1rem 0">
                <h3>{{ t("information") }}</h3>
                <p>{{ t("import.notice") }}</p>
            </div>
            <div v-if="importType === 'url'" class="form-group">
                <label class="form-label form-label--required" for="import-source">{{ t("source") }}:</label>
                <input id="import-source" v-model="source.url" type="url" class="form-input" placeholder="https://" required />
            </div>
            <div v-else-if="importType === 'ai'" class="form-group">
                <label class="form-label form-label--required" for="import-source">{{ t("source") }}:</label>
                <textarea id="import-source" v-model="source.ai_content" class="form-input" rows="14" required></textarea>
            </div>
            <div v-else-if="importType === 'bookmarklet'" class="form-group">
                <h3>Guide</h3>
                <OverlayLoader v-if="isLoading" />
                <p>
                    Bookmarklet is a small piece of JavaScript code that you can save as a bookmark in your browser. It allows you to create a JSON object that you can import
                    directly into Bar Assistant. It particulary useful when you want to import recipe from a private page.
                    <strong>Generating a bookmarklet will create a new personal access token.</strong>
                </p>
                <button class="button button--dark" type="button" @click="setupBookmarklet" :disabled="bookmarkletUrl != null">Generate a new bookmarklet</button>
                <ol v-if="bookmarkletUrl">
                    <li>Drag the following link to your bookmarks bar: <a :href="bookmarkletUrl">Copy cocktail JSON</a></li>
                    <li>Visit the page with cocktail recipe you want to import</li>
                    <li>Click the bookmarklet in your bookmarks bar</li>
                    <li>You will get alert that JSON format was copied to clipboard</li>
                    <li>Select JSON as import type and paste the text</li>
                </ol>
            </div>
            <div v-else-if="importType === 'html'" class="form-group">
                <label class="form-label form-label--required" for="import-source">{{ t("source") }}:</label>
                <textarea id="import-source" v-model="source.html" class="form-input" rows="14" required></textarea>
            </div>
            <div v-else class="form-group">
                <label class="form-label form-label--required" for="import-source">{{ t("source") }}:</label>
                <textarea id="import-source" v-model="source.json" class="form-input" rows="14" required></textarea>
                <p class="form-input-hint">
                    JSON structure needs to be compatible with <a href="https://barassistant.app/cocktail-02.schema.json">Draft 2</a> or
                    <a href="https://barassistant.app/cocktail-01.schema.json">Draft 1</a> JSON schema.
                </p>
            </div>
            <!-- <div v-if="importType === 'json'" class="form-group">
                <label class="form-label form-label--required">{{ t('duplicate.actions') }}:</label>
                <label class="form-checkbox">
                    <input v-model="duplicateAction" name="import-duplicate" type="radio" value="none">
                    <span>{{ t('duplicate.none') }}</span>
                </label>
                <label class="form-checkbox">
                    <input v-model="duplicateAction" name="import-duplicate" type="radio" value="skip">
                    <span>{{ t('duplicate.skip') }}</span>
                </label>
                <label class="form-checkbox">
                    <input v-model="duplicateAction" name="import-duplicate" type="radio" value="overwrite">
                    <span>{{ t('duplicate.overwrite') }}</span>
                </label>
            </div> -->
            <div style="display: flex; gap: var(--gap-size-2)" v-if="importType != 'bookmarklet'">
                <button type="button" class="button button--outline" @click.prevent="clearImport">{{ t("clear") }}</button>
                <button type="button" class="button button--dark" @click.prevent="importCocktail" :disabled="isLoading">
                    <OverlayLoader v-if="isLoading" />{{ t("import.start") }}
                </button>
            </div>
        </div>
        <div class="sda" v-if="similarCocktails.length > 0">
            <h3 class="form-section-title">{{ t("cocktails-similar") }}</h3>
            <div class="similar-cocktails-list block-container block-container--padded">
                <OverlayLoader v-if="isLoadingSimilar" />
                <RouterLink :to="{ name: 'cocktails.show', params: { id: cocktail.slug } }" v-for="cocktail in similarCocktails" :key="cocktail.id">{{ cocktail.name }}</RouterLink>
            </div>
        </div>
        <div v-if="result" class="scraper-form">
            <h3 class="form-section-title">{{ t("recipe-information") }}</h3>
            <div class="block-container block-container--padded">
                <div class="form-group">
                    <label class="form-label form-label--required" for="name">{{ t("name") }}</label>
                    <input id="name" v-model="result.name" type="text" class="form-input" required />
                </div>
                <div class="form-group">
                    <label class="form-label" for="description">{{ t("description") }}</label>
                    <textarea id="description" v-model="result.description" class="form-input" rows="4"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="source">{{ t("source") }}</label>
                    <input id="source" v-model="result.source" type="text" class="form-input" />
                </div>
                <div class="form-group">
                    <label class="form-label" for="glass">{{ t("glass-type.title") }}</label>
                    <input id="glass" v-model="result.glassName" type="text" class="form-input" />
                </div>
                <div class="form-group">
                    <label class="form-label form-label--required" for="instructions">{{ t("instructions") }}</label>
                    <textarea id="instructions" v-model="result.instructions" class="form-input" rows="4" required></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="garnish">{{ t("garnish") }}</label>
                    <textarea id="garnish" v-model="result.garnish" class="form-input" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="method">{{ t("method.title") }}</label>
                    <input id="method" v-model="result.methodName" type="text" class="form-input" />
                </div>
                <template v-for="image in result.images" :key="image.uri">
                    <div class="form-group">
                        <label class="form-label" for="image_url">{{ t("generate-image-dialog.preview") }}</label>
                        <img class="import-image-preview" :src="image.uri" alt="Preview image of cocktail from the scraped URL" />
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="image_copyrigh">{{ t("imageupload.copyright") }}</label>
                        <input id="image_copyrigh" v-model="image.copyright" type="text" class="form-input" />
                    </div>
                </template>
                <div class="form-group">
                    <label class="form-label" for="tags">{{ t("tag.tags") }}</label>
                    <input id="tags" v-model="cocktailTags" type="text" class="form-input" />
                </div>
            </div>
            <h3 class="form-section-title">{{ t("ingredient.ingredients") }}</h3>
            <template v-for="(ingredient, idx) in result.ingredients" :key="idx">
                <div class="block-container block-container--padded scraper-ingredients__ingredient">
                    <p v-if="ingredient.source">
                        <strong>{{ t("source") }}:</strong> {{ ingredient.source }}
                    </p>
                    <div class="scraper-ingredients__ingredient__inputs">
                        <div class="form-group">
                            <label class="form-label form-label--required" :for="'ingredient_name_' + idx">{{ t("name") }}</label>
                            <input
                                :id="'ingredient_name_' + idx"
                                v-model="ingredient.name"
                                type="text"
                                class="form-input"
                                :disabled="ingredient.matchedIngredient != null"
                                required
                            />
                        </div>
                        <div class="form-group">
                            <label class="form-label form-label--required" :for="'ingredient_amount_' + idx">{{ t("amount") }}</label>
                            <input :id="'ingredient_amount_' + idx" v-model="ingredient.amount" type="text" class="form-input" required />
                        </div>
                        <div v-if="ingredient.amount_max" class="form-group">
                            <label class="form-label" :for="'ingredient_amount_max_' + idx">{{ t("amount-max") }}</label>
                            <input :id="'ingredient_amount_max_' + idx" v-model="ingredient.amount_max" type="text" class="form-input" />
                        </div>
                        <div class="form-group">
                            <label class="form-label form-label--required" :for="'ingredient_units_' + idx">{{ t("units") }}</label>
                            <input :id="'ingredient_units_' + idx" v-model="ingredient.units" type="text" class="form-input" required />
                        </div>
                        <div class="form-group">
                            <label class="form-label" :for="'ingredient_note_' + idx">{{ t("note.title") }}</label>
                            <input :id="'ingredient_note_' + idx" v-model="ingredient.note" type="text" class="form-input" />
                        </div>
                    </div>
                    <div v-if="ingredient.matchedIngredient != null" class="scraper-ingredients__ingredient__existing">
                        <span style="letter-spacing: -4px">&boxur;&rtrif;</span> {{ t("save-as") }} "{{ ingredient.matchedIngredient.name }}" &middot;
                        <a href="#" @click.prevent="ingredient.matchedIngredient = null">{{ t("cancel") }}</a>
                    </div>
                    <div class="scraper-ingredients__ingredient__actions">
                        <a href="#" @click.prevent="manuallyMatch(ingredient)">{{ t("import.manually-match") }}</a>
                        &middot;
                        <a href="#" @click.prevent="removeIngredient(ingredient)">{{ t("remove") }}</a>
                    </div>
                </div>
                <div
                    v-for="(sub, sidx) in ingredient.substitutes"
                    :key="sidx"
                    class="block-container block-container--padded scraper-ingredients__ingredient"
                    style="margin-left: 3rem"
                >
                    <p>
                        <strong>{{ t("substitutes") }}:</strong>
                    </p>
                    <div class="scraper-ingredients__ingredient__inputs">
                        <div class="form-group">
                            <label class="form-label" :for="'sub_ingredient_name_' + idx">{{ t("name") }}</label>
                            <input :id="'sub_ingredient_name_' + idx" v-model="sub.name" type="text" class="form-input" :disabled="sub.matchedIngredient != null" />
                        </div>
                        <div class="form-group">
                            <label class="form-label" :for="'sub_ingredient_amount_' + sidx">{{ t("amount") }}</label>
                            <input :id="'sub_ingredient_amount_' + sidx" v-model="sub.amount" type="text" class="form-input" />
                        </div>
                        <div v-if="sub.amount_max" class="form-group">
                            <label class="form-label" :for="'sub_ingredient_amount_max_' + sidx">{{ t("amount-max") }}</label>
                            <input :id="'sub_ingredient_amount_max_' + sidx" v-model="sub.amount_max" type="text" class="form-input" />
                        </div>
                        <div class="form-group">
                            <label class="form-label" :for="'sub_ingredient_units_' + sidx">{{ t("units") }}</label>
                            <input :id="'sub_ingredient_units_' + sidx" v-model="sub.units" type="text" class="form-input" />
                        </div>
                    </div>
                    <div v-if="sub.matchedIngredient != null" class="scraper-ingredients__ingredient__existing">
                        <span style="letter-spacing: -4px">&boxur;&rtrif;</span> {{ t("save-as") }} "{{ sub.matchedIngredient.name }}" &middot;
                        <a href="#" @click.prevent="sub.matchedIngredient = null">{{ t("cancel") }}</a>
                    </div>
                    <div class="scraper-ingredients__ingredient__actions">
                        <a href="#" @click.prevent="manuallyMatch(sub)">{{ t("import.manually-match") }}</a>
                        &middot;
                        <a href="#" @click.prevent="removeSubIngredient(ingredient, sub)">{{ t("remove") }}</a>
                    </div>
                </div>
            </template>
            <SaltRimDialog v-if="ingredientNameMatch" v-model="showIngredientDialog">
                <template #trigger><span></span></template>
                <template #dialog>
                    <div class="dialog-title">{{ t("import.manually-match") }}</div>
                    <p style="margin-bottom: 1rem">{{ t("import.manual-match-notice", { name: ingredientNameMatch.name }) }}</p>
                    <IngredientFinderBasic
                        v-if="shouldUseBasicSearch"
                        :initial-query="ingredientNameMatch.name"
                        @ingredient-selected="handleIngredientEdit"
                    ></IngredientFinderBasic>
                    <IngredientFinder
                        v-else-if="!shouldUseBasicSearch && appState.bar.search_token"
                        :search-token="appState.bar.search_token"
                        :initial-query="ingredientNameMatch.name"
                        @ingredient-selected="handleIngredientEdit"
                    ></IngredientFinder>
                    <div class="dialog-actions">
                        <button type="button" class="button button--outline" @click="showIngredientDialog = false">{{ t("close") }}</button>
                    </div>
                </template>
            </SaltRimDialog>
            <div class="form-actions">
                <RouterLink class="button button--outline" :to="{ name: 'cocktails' }">{{ t("cancel") }}</RouterLink>
                <button type="submit" class="button button--dark" :disabled="isImporting"><OverlayLoader v-if="isImporting" />{{ t("import.continue") }}</button>
            </div>
        </div>
    </form>
</template>

<style scoped>
.scraper-form .form-group {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}

.scraper-form .form-group label {
    flex-basis: 250px;
}

.scraper-form .form-group :is(input, select, textarea) {
    flex-grow: 1;
    width: auto;
}

.scraper-ingredients__ingredient {
    margin-bottom: 1rem;
}

.scraper-ingredients__ingredient p {
    color: var(--clr-accent-700);
    margin-bottom: var(--gap-size-3);
}

.dark-theme .scraper-ingredients__ingredient p {
    color: var(--clr-accent-300);
}

.scraper-ingredients__ingredient__inputs {
    display: flex;
    /* flex-wrap: wrap; */
    align-items: center;
    gap: var(--gap-size-2);
}

.scraper-ingredients__ingredient .form-group {
    margin-bottom: 0;
}

.scraper-ingredients__ingredient .form-group label,
.scraper-ingredients__ingredient .form-group :is(input, select, textarea) {
    width: 100%;
}

.scraper-ingredients__ingredient__existing {
    font-weight: var(--fw-bold);
}

.import-types {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr;
    gap: var(--gap-size-2);
}

@media (max-width: 450px) {
    .scraper-ingredients__ingredient__inputs {
        flex-wrap: wrap;
    }
    .import-types {
        grid-template-columns: 1fr;
    }
}

.import-image-preview {
    max-width: 150px;
    max-height: 200px;
}

.similar-cocktails-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-size-3);
}
</style>
