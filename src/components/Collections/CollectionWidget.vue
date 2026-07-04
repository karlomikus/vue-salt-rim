<template>
    <div class="cocktail-collections-wrapper">
        <OverlayLoader v-if="isLoading" />
        <EmptyState v-if="collections.length == 0">
            <template #icon><span></span></template>
            {{ $t("cocktail-no-collection") }}
            <br />
            <a href="#" @click.prevent="$emit('addToCollection')">{{ $t("collections.add-to") }}</a>
        </EmptyState>
        <template v-else>
            <div class="block-container block-container--inset" style="padding: 0.5rem">
                <div v-for="collection in collections" :key="collection.id" class="block-container cocktail-collections__item">
                    <h3>{{ collection.name }}</h3>
                    <div class="cocktail-collections__item__actions">
                        <RouterLink :to="{ name: 'cocktails', query: { 'filter[collection_id]': collection.id } }">
                            {{ $t("view") }}
                        </RouterLink>
                        &middot;
                        <a href="#" @click.prevent="removeCocktailFromCollection(collection.id)">
                            {{ $t("remove-cocktail-from-collection") }}
                        </a>
                    </div>
                </div>
                <a href="#" @click.prevent="$emit('addToCollection')">{{ $t("collections.add-to") }}</a>
            </div>
        </template>
    </div>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import BarAssistantClient from "@/api/BarAssistantClient";
import OverlayLoader from "@/components/OverlayLoader.vue";
import EmptyState from "@/components/EmptyState.vue";
import { useSaltRimToast } from "@/composables/toast";
import { useConfirm } from "@/composables/confirm";
import type { components } from "@/api/api";

type Collection = components["schemas"]["Collection"];
type CocktailRef = { id?: number; slug?: string };

const props = withDefaults(defineProps<{ cocktail?: CocktailRef }>(), {
    cocktail: () => ({}),
});
const { t } = useI18n();
const toast = useSaltRimToast();
const confirm = useConfirm();

const emit = defineEmits<{ cocktailRemovedFromCollection: [slug: string | undefined]; addToCollection: [] }>();

const isLoading = ref(false);
const collections = ref<Collection[]>([]);

watch(
    () => props.cocktail,
    () => {
        fetchCocktailCollections();
    },
);

fetchCocktailCollections();

function fetchCocktailCollections() {
    isLoading.value = true;
    BarAssistantClient.getCollections({ "filter[cocktail_id]": props.cocktail.id, include: "cocktails" } as unknown as Parameters<typeof BarAssistantClient.getCollections>[0])
        .then((resp) => {
            collections.value = resp.data ?? [];
            isLoading.value = false;
        })
        .catch(() => {
            collections.value = [];
            isLoading.value = false;
        });
}

function removeCocktailFromCollection(collectionId: number) {
    confirm.show(t("collections.confirm-remove-cocktail"), {
        onResolved: (dialog: { close: () => void }) => {
            isLoading.value = true;
            dialog.close();
            const target = collections.value.find((c) => c.id == collectionId);
            const existingCollectionCocktailIds = (target?.cocktails ?? []).map((c) => c.id);
            existingCollectionCocktailIds.splice(existingCollectionCocktailIds.indexOf(props.cocktail.id as number), 1);
            BarAssistantClient.syncCollectionCocktails(collectionId, existingCollectionCocktailIds)
                .then(() => {
                    toast.default(t("collections.cocktail-remove-success"));
                    emit("cocktailRemovedFromCollection", props.cocktail.slug);
                    isLoading.value = false;
                })
                .catch((e) => {
                    toast.error(e.message);
                    isLoading.value = false;
                });
        },
    });
}
</script>
<style scoped>
.cocktail-collections__item {
    display: block;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
}

.cocktail-collections__item__actions {
    font-size: 0.85rem;
}
</style>
