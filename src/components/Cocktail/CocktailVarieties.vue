<template>
    <div class="cocktail-varieties-wrapper">
        <div class="salt-rim-list" v-if="cocktails.length > 0">
            <ListItemContainer tag="RouterLink" v-for="cocktail in cocktails" :key="cocktail.id" :to="{ name: 'cocktails.show', params: { id: cocktail.slug } }">
                <template #image v-if="cocktail.image">
                    <ImageThumb :image="cocktail.image"></ImageThumb>
                </template>
                <template #content>
                    <h5 class="sr-list-item-title">{{ cocktail.name }}</h5>
                    <p v-if="cocktail.short_ingredients && cocktail.short_ingredients?.length > 0">{{ cocktail.short_ingredients?.join(', ') }}</p>
                </template>
            </ListItemContainer>
        </div>
        <EmptyState v-else>
            {{ $t('no-cocktails') }}
        </EmptyState>
    </div>
</template>

<script setup lang="ts">
import EmptyState from '../EmptyState.vue'
import type { components } from '@/api/api'
import ListItemContainer from '../ListItemContainer.vue'
import ImageThumb from '../ImageThumb.vue'

type CocktailBasic = components['schemas']['CocktailBasic']

defineProps<{
    cocktails: CocktailBasic[],
}>()
</script>
