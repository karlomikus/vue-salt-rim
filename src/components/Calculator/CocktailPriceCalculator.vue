<template>
    <div>
        <div class="dialog-title">{{ props.cocktail.name }}</div>
        <OverlayLoader v-if="isLoadingPrices"></OverlayLoader>
        <SubscriptionCheck>Subscribe to "Mixologist" plan to unlock automatic price calculation!</SubscriptionCheck>
        <div class="cocktail-price-calculator__prices" v-if="cocktailPrices.length > 0">
            <div v-for="cocktailPrice in cocktailPrices">
                <CocktailPrice :cocktail-price=cocktailPrice></CocktailPrice>
                <a href="#" @click.prevent="selectedCocktailPrice = cocktailPrice"><span style="letter-spacing: -4px;">&boxur;&rtrif;</span> {{ $t('price.select') }}</a>
            </div>
        </div>
        <EmptyState style="margin-bottom: 1rem;">{{ t('price.missing-cocktail-price-calculator') }}</EmptyState>
        <div class="form-group">
            <label class="form-label form-label--required" for="name">{{ $t('target-pour-cost') }}:</label>
            <input id="name" v-model="targetPourCost" class="form-input" type="text" required>
            <span class="form-input-hint">{{ $t('target-pour-cost-help') }}</span>
        </div>
        <h2 class="cocktail-price-calculator__price" v-if="finalPrice && appState.isSubscribed()">
            <small>{{ $t('price.price') }}</small>
            {{ unitHandler.formatPrice(parseFloat(finalPrice.price), finalPrice.currency) }}
        </h2>
        <div class="dialog-actions" v-if="appState.isSubscribed()">
            <button class="button button--outline" @click="emit('closed')">{{ $t('cancel') }}</button>
            <button type="button" class="button button--dark" :disabled="!finalPrice" @click="selectFinalPrice">{{ $t('price.select') }}</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { components } from '@/api/api'
import { unitHandler } from '@/composables/useUnits'
import BarAssistantClient from '@/api/BarAssistantClient';
import CocktailPrice from './../Cocktail/CocktailPrice.vue'
import OverlayLoader from '../OverlayLoader.vue';
import SubscriptionCheck from '../SubscriptionCheck.vue';
import AppState from '@/AppState';
import EmptyState from '@/components/EmptyState.vue';
import { useI18n } from 'vue-i18n'

type Cocktail = components["schemas"]["Cocktail"]
type CocktailPrice = components["schemas"]["CocktailPrice"]

const props = defineProps<{
    cocktail: Cocktail
}>()

const emit = defineEmits(['closed', 'selectedPrice'])

const { t } = useI18n()
const appState = new AppState()
const targetPourCost = ref(22)
const isLoadingPrices = ref(false)
const cocktailPrices = ref([] as CocktailPrice[])
const selectedCocktailPrice = ref(null as CocktailPrice|null)

const finalPrice = computed(() => {
    if (!selectedCocktailPrice.value) {
        return null
    }

    return {
        price: ((selectedCocktailPrice.value.total_price.price / targetPourCost.value) * 100).toFixed(2),
        currency: selectedCocktailPrice.value.price_category.currency,
    }
})

async function fetchCocktailPrices() {
    isLoadingPrices.value = true
    cocktailPrices.value = (await BarAssistantClient.getCocktailPrices(props.cocktail.id.toString()))?.data ?? [] as CocktailPrice[]
    isLoadingPrices.value = false
}

function selectFinalPrice() {
    emit('selectedPrice', finalPrice.value)
    emit('closed')
}

fetchCocktailPrices()
</script>

<style scoped>
.cocktail-price-calculator__prices {
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-2);
    max-height: 450px;
    overflow-y: auto;
    margin-bottom: var(--gap-size-3);
}

.cocktail-price-calculator__price {
    font-size: 1.5rem;
    font-weight: var(--fw-bold);
    text-align: right;
}

.cocktail-price-calculator__price small {
    display: block;
    font-size: 0.85rem;
}
</style>