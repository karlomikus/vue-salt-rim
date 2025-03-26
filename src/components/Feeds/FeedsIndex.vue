<script setup lang="ts">
import { ref } from 'vue'
import type { components } from '@/api/api'
import BarAssistantClient from '@/api/BarAssistantClient';
import PageHeader from '../PageHeader.vue';
import OverlayLoader from './../OverlayLoader.vue'
import { useTitle } from '@/composables/title'
import { useI18n } from 'vue-i18n';
import FeedsRecipe from './FeedsRecipe.vue';

type FeedsRecipe = components["schemas"]["FeedsRecipe"]

const { t } = useI18n()
const recipes = ref<FeedsRecipe[]>([])
const isLoading = ref<boolean>(false)

useTitle(t('feeds.title'))

async function fetchFeeds() {
    isLoading.value = true
    try {
        recipes.value = (await BarAssistantClient.getFeeds())?.data ?? []
    } catch (e: any) {
        return
    } finally {
        isLoading.value = false
    }
}

fetchFeeds()
</script>

<template>
    <PageHeader>
        {{ t('feeds.title') }}
    </PageHeader>
    <div class="feeds-container">
        <OverlayLoader v-if="isLoading" />
        <div class="block-container block-container--padded feeds-recipe">
            <div class="feeds-recipe__content">
                <h5 class="sr-list-item-title">[Beta] From the web</h5>
                <p>Here you can find the latest interesting cocktail news and recipes from the web. You can also quickly import recipe if feed entry supports it. Use <a href="https://github.com/karlomikus/bar-assistant/issues" target="_blank">github issues to give feedback</a> or to recommend sites that you would like to see included.</p>
            </div>
        </div>
        <FeedsRecipe :recipe="feed" v-for="feed in recipes" :key="feed.title"></FeedsRecipe>
    </div>
</template>

<style scoped>
.feeds-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(550px, 1fr));
    gap: 1rem;
}
</style>
