<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import BarAssistantClient from "@/api/BarAssistantClient";
import AppState from "@/AppState";
import PrintCocktail from "@/components/Print/PrintCocktail.vue";
import { mapCocktailToPrintModel, type CocktailPrintModel } from "@/components/Print/types";

const route = useRoute();
const appState = new AppState();

const cocktail = ref<CocktailPrintModel | null>(null);
const scaleFactor = ref(1);
const units = ref(appState.defaultUnit);
const targetVolumeToScaleTo = ref<number | null>(null);
const targetVolumeDilution = ref(0);
const waterDilution = ref<number | null>(null);
const printReady = ref(false);

scaleFactor.value = parseFloat(route.query.scaleFactor as string) || 1;
targetVolumeToScaleTo.value = route.query.targetVolumeToScaleTo ? Number(route.query.targetVolumeToScaleTo) : null;
targetVolumeDilution.value = Number(route.query.targetVolumeDilution) || 0;
waterDilution.value = route.query.waterDilution ? Number(route.query.waterDilution) : null;

onMounted(async () => {
    try {
        const resp = await BarAssistantClient.getCocktail(route.params.id.toString());
        if (resp?.data) {
            cocktail.value = mapCocktailToPrintModel(resp.data);
        }
        printReady.value = true;
        nextTick().then(() => {
            window.print();
        });

        window.addEventListener("afterprint", () => {
            window.close();
        });
    } catch (e: unknown) {
        console.error("Failed to fetch cocktail for print:", e);
    }
});
</script>

<template>
    <main>
        <PrintCocktail
            v-if="cocktail"
            :cocktail="cocktail"
            :units="units"
            :scale-factor="scaleFactor"
            :target-volume-to-scale-to="targetVolumeToScaleTo"
            :target-volume-dilution="targetVolumeDilution"
            :water-dilution="waterDilution"
        />
    </main>
</template>
