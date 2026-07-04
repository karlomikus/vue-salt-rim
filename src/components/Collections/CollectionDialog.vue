<template>
    <div>
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ title }}</div>
        <div class="dialog-content">
            <SubscriptionCheck v-if="collections.length >= 3">Subscribe to "Mixologist" plan to create unlimited collections!</SubscriptionCheck>
            <form action="">
                <div class="form-group">
                    <label class="form-label" for="dialog-collection-id">{{ $t("collections.collection") }}:</label>
                    <select id="dialog-collection-id" v-model="collectionId" class="form-select">
                        <option :value="null">- {{ $t("collections.create") }} -</option>
                        <option v-for="collection in collections" :key="collection.id" :value="collection.id">{{ collection.name }}</option>
                    </select>
                </div>
                <template v-if="!collectionId">
                    <div class="form-group">
                        <label class="form-label" for="dialog-collection-name">{{ $t("name") }}:</label>
                        <input id="dialog-collection-name" v-model="newCollection.name" class="form-input" type="text" ref="collectionName" />
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="dialog-collection-description">{{ $t("description") }}:</label>
                        <textarea id="dialog-collection-description" v-model="newCollection.description" rows="5" class="form-input"></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-checkbox" for="share-in-bar">
                            <input id="share-in-bar" v-model="newCollection.is_bar_shared" type="checkbox" :value="true" />
                            <span>{{ $t("collections.share-in-bar") }}</span>
                        </label>
                    </div>
                </template>
            </form>
        </div>
        <div class="dialog-actions" style="margin-top: 1rem">
            <button type="button" class="button button--outline" @click="$emit('collectionDialogClosed')">{{ $t("cancel") }}</button>
            <button v-if="isPartOfCollection" type="button" class="button button--dark" @click="removeCocktailFromCollection">
                {{ $t("remove-cocktail-from-collection") }}
            </button>
            <button v-else type="button" class="button button--dark" @click="saveAndClose">
                {{ $t("collections.add-to") }} <template v-if="cocktails.length > 1">({{ cocktails.length }} {{ $t("cocktail.cocktails") }})</template>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

import type { components } from "@/api/api";
import BarAssistantClient from "@/api/BarAssistantClient";
import { useConfirm } from "@/composables/confirm";
import { useSaltRimToast } from "@/composables/toast";
import OverlayLoader from "./../OverlayLoader.vue";
import SubscriptionCheck from "../SubscriptionCheck.vue";

type Collection = components["schemas"]["Collection"];
type CollectionRequest = components["schemas"]["CollectionRequest"];

const props = withDefaults(
    defineProps<{
        cocktails?: number[];
        title: string;
    }>(),
    {
        cocktails: () => [],
    },
);

const emit = defineEmits<{
    (event: "collectionDialogClosed"): void;
}>();

const { t } = useI18n();
const confirm = useConfirm();
const toast = useSaltRimToast();

const isLoading = ref(false);
const collections = ref<Collection[]>([]);
const newCollection = ref<CollectionRequest>({
    name: "",
    description: null,
    is_bar_shared: false,
});
const collectionId = ref<number | null>(null);
const collectionName = ref<HTMLInputElement | null>(null);

const isManagingSingleCocktail = computed(() => props.cocktails.length === 1);

const cocktailCollections = computed(() => {
    if (isManagingSingleCocktail.value) {
        return collections.value.filter((collection) => collection.cocktails?.some((cocktail) => cocktail.id === props.cocktails[0]));
    }

    return collections.value;
});

const isPartOfCollection = computed(() => {
    if (!collectionId.value || !isManagingSingleCocktail.value) {
        return false;
    }

    return cocktailCollections.value.find((collection) => collection.id === collectionId.value);
});

function getSelectedCollection() {
    return collections.value.find((collection) => collection.id === collectionId.value);
}

async function fetchCollections() {
    isLoading.value = true;

    try {
        const resp = await BarAssistantClient.getCollections({ include: "cocktails" });
        collections.value = resp?.data ?? [];
    } finally {
        isLoading.value = false;
    }
}

function removeCocktailFromCollection() {
    if (!isManagingSingleCocktail.value || !collectionId.value) {
        return;
    }

    const selectedCollectionId = collectionId.value;

    confirm.show(t("collections.confirm-remove-cocktail"), {
        onResolved: async (dialog: { close: () => void }) => {
            const selectedCollection = getSelectedCollection();

            if (!selectedCollection?.cocktails) {
                return;
            }

            isLoading.value = true;
            dialog.close();

            const existingCollectionCocktailIds = selectedCollection.cocktails.map((cocktail) => cocktail.id);
            existingCollectionCocktailIds.splice(existingCollectionCocktailIds.indexOf(props.cocktails[0]), 1);

            try {
                await BarAssistantClient.syncCollectionCocktails(selectedCollectionId, existingCollectionCocktailIds);
                toast.default(t("collections.cocktail-remove-success"));
                emit("collectionDialogClosed");
            } catch (e) {
                toast.error((e as Error).message);
            } finally {
                isLoading.value = false;
            }
        },
    });
}

async function saveAndClose() {
    if (collectionId.value) {
        const selectedCollection = getSelectedCollection();

        if (!selectedCollection?.cocktails) {
            return;
        }

        const existingCollectionCocktailIds = selectedCollection.cocktails.map((cocktail) => cocktail.id);
        const newCocktailCollections = existingCollectionCocktailIds.concat(props.cocktails);
        isLoading.value = true;

        try {
            await BarAssistantClient.syncCollectionCocktails(collectionId.value, newCocktailCollections);
            toast.default(t("collections.cocktail-add-success"));
            emit("collectionDialogClosed");
        } catch (e) {
            toast.error((e as Error).message);
        } finally {
            isLoading.value = false;
        }

        return;
    }

    isLoading.value = true;
    newCollection.value.cocktails = props.cocktails;

    try {
        const resp = await BarAssistantClient.saveCollection(newCollection.value);
        toast.default(t("collections.cocktail-add-success"));
        const location = resp.response.headers.get("location");

        if (location) {
            collectionId.value = Number(location.substring(location.lastIndexOf("/") + 1));
        }

        emit("collectionDialogClosed");
    } catch (e) {
        toast.error((e as Error).message);
    } finally {
        isLoading.value = false;
    }
}

onMounted(() => {
    collectionName.value?.focus();
    void fetchCollections();
});
</script>
