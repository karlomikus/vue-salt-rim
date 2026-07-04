<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ $t("exports.dialog-title") }}</div>
        <div class="form-group">
            <label class="form-label form-label--required" for="bar-name">{{ $t("bars.bar") }}:</label>
            <select id="bar-name" v-model="exportModel.bar_id" class="form-select" required>
                <option :value="undefined" disabled>{{ $t("exports.bar-select") }}...</option>
                <option v-for="bar in bars" :key="bar.id" :value="bar.id">{{ bar.name }}</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label form-label--required" for="export-type">{{ $t("type") }}:</label>
            <select id="export-type" v-model="exportModel.type" class="form-select" required>
                <option v-for="type in types" :key="type.id" :value="type.id">{{ type.name }}</option>
            </select>
            <p class="form-input-hint">
                <a href="https://docs.barassistant.app/data">{{ $t("exports.types-hint") }}</a>
            </p>
        </div>
        <div class="form-group">
            <label class="form-label form-label--required" for="force-units">{{ $t("exports.force-units") }}:</label>
            <select id="force-units" v-model="exportModel.units" class="form-select" required>
                <option v-for="unit in units" :key="unit.id" :value="unit.id">{{ unit.name }}</option>
            </select>
        </div>
        <div class="alert alert--warning">{{ $t("exports.export-notice") }}</div>
        <div class="dialog-actions">
            <button class="button button--outline" @click.prevent="$emit('exportDialogClosed')">{{ $t("cancel") }}</button>
            <button class="button button--dark" type="submit">{{ $t("start") }}</button>
        </div>
    </form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import BarAssistantClient from "@/api/BarAssistantClient";
import OverlayLoader from "@/components/OverlayLoader.vue";
import { useSaltRimToast } from "@/composables/toast";
import type { components } from "@/api/api";

type Bar = components["schemas"]["Bar"];

const { t } = useI18n();
const toast = useSaltRimToast();

const emit = defineEmits<{ exportDialogClosed: [] }>();

const isLoading = ref(false);
const exportModel = ref<{ type: string; units: string; bar_id?: number }>({
    type: "schema",
    units: "none",
});
const bars = ref<Bar[]>([]);
const types = [
    { id: "datapack", name: "Bar Assistant Datapack" },
    { id: "schema", name: "JSON (Schema draft 2)" },
    { id: "xml", name: "XML" },
    { id: "md", name: "Markdown" },
    { id: "json-ld", name: "Schema.org Recipe (JSON-LD)" },
    { id: "yaml", name: "YAML" },
];
const units = [
    { id: "none", name: t("unit.original") },
    { id: "ml", name: t("unit.ml-full") },
    { id: "oz", name: t("unit.oz-full") },
    { id: "cl", name: t("unit.cl-full") },
];

refreshBars();

function refreshBars() {
    isLoading.value = true;
    BarAssistantClient.getBars()
        .then((resp) => {
            bars.value = (resp.data ?? []).filter((bar) => {
                // Show only owned bars
                return bar.access.can_delete;
            });
            isLoading.value = false;
        })
        .catch((e) => {
            toast.error(e.message);
            isLoading.value = false;
        });
}

function submit() {
    isLoading.value = true;

    const postData = {
        bar_id: exportModel.value.bar_id,
        type: exportModel.value.type as components["schemas"]["ExportTypeEnum"],
        units: exportModel.value.units as components["schemas"]["ForceUnitConvertEnum"],
    };

    BarAssistantClient.saveExport(postData)
        .then(() => {
            isLoading.value = false;
            toast.default(t("exports.start-success"));
            emit("exportDialogClosed");
        })
        .catch((e) => {
            toast.error(e.message);
            isLoading.value = false;
        });
}
</script>
