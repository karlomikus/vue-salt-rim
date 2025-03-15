<template>
    <div class="similar-cocktails-wrapper">
        <OverlayLoader v-if="isLoading" />
        <div class="salt-rim-list" v-if="similarCocktails.length > 0">
            <ListItemContainer tag="RouterLink" v-for="cocktail in similarCocktails" :key="cocktail.id" :to="{ name: 'cocktails.show', params: { id: cocktail.slug } }">
                <template #image v-if="cocktail.images && cocktail.images.length > 0">
                    <ImageThumb :image="cocktail.images[0]"></ImageThumb>
                </template>
                <template #content>
                    <h5 class="sr-list-item-title">{{ cocktail.name }}</h5>
                    <p v-if="cocktail.ingredients">{{ cocktail.ingredients.map(i => i.ingredient.name).join(', ') }}</p>
                </template>
            </ListItemContainer>
        </div>
        <EmptyState v-else>
            {{ $t('no-cocktails') }}
        </EmptyState>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BarAssistantClient from '@/api/BarAssistantClient'
import OverlayLoader from '@/components/OverlayLoader.vue'
import EmptyState from '../EmptyState.vue'
import type { components } from '@/api/api'
import ListItemContainer from '../ListItemContainer.vue'
import ImageThumb from '../ImageThumb.vue'

type Cocktail = components['schemas']['Cocktail']

const modelValue = defineModel<Cocktail>()

const isLoading = ref(false)
const similarCocktails = ref<Cocktail[]>([])

async function fetchRelated() {
    if (!modelValue.value) {
        return
    }

    isLoading.value = true
    try {
        similarCocktails.value = (await BarAssistantClient.getSimilarCocktail(modelValue.value.id))?.data ?? []
    } catch (e) {
        similarCocktails.value = []
    } finally {
        isLoading.value = false
    }
}

watch(() => modelValue.value, fetchRelated, { immediate: true })
</script>
