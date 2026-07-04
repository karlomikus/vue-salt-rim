<template>
    <div class="resource-search__content__pagination">
        <div class="resource-search__content__pagination__page_info">
            {{ $t("pagination.results", { on_page_results: meta.to || 0, total_results: meta.total }) }}
        </div>
        <div class="resource-search__content__pagination__links">
            <button type="button" class="button button--input" :disabled="currentPage == 1" @click="changePage('prev')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z"></path>
                </svg>
            </button>
            {{ $t("pagination.page") }} {{ meta.current_page }}/{{ meta.last_page }}
            <button type="button" class="button button--input" :disabled="currentPage == meta.last_page" @click="changePage('next')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M13.1714 12.0007L8.22168 7.05093L9.63589 5.63672L15.9999 12.0007L9.63589 18.3646L8.22168 16.9504L13.1714 12.0007Z"></path>
                </svg>
            </button>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";

type PaginationMeta = {
    current_page: number;
    last_page: number;
    to: number;
    total: number;
};

const props = withDefaults(defineProps<{ meta?: PaginationMeta }>(), {
    meta: () => ({
        current_page: 1,
        last_page: 1,
        to: 0,
        total: 0,
    }),
});

const emit = defineEmits<{ pageChanged: [page: number] }>();

const currentPage = ref(props.meta.current_page);

watch(
    () => props.meta,
    (newVal) => {
        currentPage.value = newVal.current_page;
    },
);

function changePage(dir: "prev" | "next") {
    if (dir == "prev") {
        if (currentPage.value > 1) {
            currentPage.value--;
        }
    }

    if (dir == "next") {
        if (currentPage.value < props.meta.last_page) {
            currentPage.value++;
        }
    }

    emit("pageChanged", currentPage.value);
}
</script>
