<script setup lang="ts">
import { ref } from 'vue'
import type { components } from '@/api/api'
import BarAssistantClient from '@/api/BarAssistantClient';
import PageHeader from '../PageHeader.vue';
import OverlayLoader from './../OverlayLoader.vue'
import { useConfirm } from '@/composables/confirm';
import { useTitle } from '@/composables/title'
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';
import { useSaltRimToast } from '@/composables/toast'
import ListItemContainer from '../ListItemContainer.vue';
import EmptyState from './../EmptyState.vue'
import IconCalculator from '../Icons/IconCalculator.vue';
import { useClipboard } from '@vueuse/core'
import SaltRimDialog from './../Dialog/SaltRimDialog.vue'
import FeedsRecipe from './FeedsRecipe.vue';

type FeedsRecipe = components["schemas"]["FeedsRecipe"]

const { t } = useI18n()
const toast = useSaltRimToast()
const confirm = useConfirm()
const recipes = ref<FeedsRecipe[]>([])
const isLoading = ref<boolean>(false)
const showImportDialog = ref<boolean>(false)
const { copy, copied, isSupported } = useClipboard()

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
                <small>Bar Assistant Feeds</small>
                <p>Here you can find the latest interesting news and recipes from the web. You can also quickly import recipe if feed entry supports it. Use github issues to give feedback or to recommend sites that you would like to see included.</p>
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
