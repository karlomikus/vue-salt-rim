<template>
    <PageHeader>
        {{ t('billing.title') }}
    </PageHeader>
    <div class="settings-page">
        <div class="settings-page__nav">
            <Navigation />
        </div>
        <div class="settings-page__content">
            <OverlayLoader v-if="isLoading" />
            <div v-show="!isLoading" class="block-container block-container--padded">
                <div class="billing">
                    <div v-if="showBuyingOptions" class="billing__card billing--inactive">
                        <h3>{{ t('billing.inactive-title', {name: 'Mixologist'}) }}</h3>
                        <p style="margin-bottom: 1rem;">For enthusiasts that want to create a community around their bar</p>
                        <ul>
                            <li>Create and manage up to 10 bars</li>
                            <li>Add unlimited cocktail recipes</li>
                            <li>Invite users to your bar</li>
                            <li>Share your recipes with bar members</li>
                            <li>Manage user roles</li>
                            <li>Enable sharing recipes via public links</li>
                            <li>Add more images to recipes</li>
                            <li>Enable image editing</li>
                            <li>Add unlimited cocktail collections</li>
                            <li>No rate limits for import actions</li>
                            <li>Create personal access API tokens</li>
                            <li>Automatic cocktail price menu suggestions</li>
                            <li>Bulk ingredient import</li>
                            <li>Unlimited price categories</li>
                            <li>Save <span>15%</span> when paying annually</li>
                        </ul>
                        <div class="form-group">
                            <div class="billing__price-categories">
                                <SaltRimRadio v-for="price in productPrices" :key="price.price.id" v-model="selectedPriceCategory" :title="price.formattedTotals.total" :description="price.price.description" :value="price.price.id"></SaltRimRadio>
                            </div>
                        </div>
                        <div v-if="showBuyingOptions" class="alert alert--info" style="margin-bottom: 1rem;">
                            <p>Please note that you need to use the same email address you use to sign in Bar Assistant when buying a subscription</p>
                        </div>
                        <button class="button button--dark" :disabled="selectedPriceCategory == null" @click.prevent="upgradePlan">Upgrade now</button>
                        <p>
                            <a href="https://barassistant.app/terms.html" target="_blank">Terms of service</a>
                        </p>
                    </div>
                    <div v-else class="billing__card billing--active">
                        <div class="billing__card__icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17.0007 1.20801 18.3195 3.68083 20.7923 4.99968 18.3195 6.31852 17.0007 8.79134 15.6818 6.31852 13.209 4.99968 15.6818 3.68083 17.0007 1.20801ZM10.6673 9.33301 15.6673 11.9997 10.6673 14.6663 8.00065 19.6663 5.33398 14.6663.333984 11.9997 5.33398 9.33301 8.00065 4.33301 10.6673 9.33301ZM11.4173 11.9997 9.18905 10.8113 8.00065 8.58301 6.81224 10.8113 4.58398 11.9997 6.81224 13.1881 8.00065 15.4163 9.18905 13.1881 11.4173 11.9997ZM19.6673 16.333 18.0007 13.208 16.334 16.333 13.209 17.9997 16.334 19.6663 18.0007 22.7913 19.6673 19.6663 22.7923 17.9997 19.6673 16.333Z"></path></svg>
                        </div>
                        <h3>{{ t('billing.is_active', {name: 'Mixologist'}) }}</h3>
                        <template v-if="billing.subscription">
                            <div v-if="billing.subscription.next_billed_at">
                                {{ t('billing.subscribed-on') }} <DateFormatter :date="billing.subscription.created_at" /> &middot; {{ billing.customer.paddle_email }}
                                <br>
                                {{ t('billing.next_bill_at') }} <DateFormatter :date="billing.subscription.next_billed_at.date" /> ({{ billing.subscription.next_billed_at.amount }})
                            </div>
                            <div v-if="billing.subscription.paused_at">
                                {{ t('billing.end_at') }} <DateFormatter :date="billing.subscription.paused_at" />
                            </div>
                            <div v-if="billing.subscription.ends_at">
                                {{ t('billing.end_at') }} <DateFormatter :date="billing.subscription.ends_at" />
                            </div>
                            <a v-if="billing.subscription.paused_at" href="#" @click.prevent="updateSubscription('resume')">{{ t('billing.resume') }}</a>
                            <template v-if="billing.subscription.status === 'active' && !(billing.subscription.ends_at != null || billing.subscription.paused_at != null)">
                                <template v-if="billing.subscription.update_payment_url">
                                    <a :href="billing.subscription.update_payment_url" target="_blank">{{ t('billing.update-payment-method') }}</a>
                                    &middot;
                                </template>
                                <a href="#" @click.prevent="updateSubscription('pause')">{{ t('billing.pause') }}</a>
                                &middot;
                                <a :href="billing.subscription.cancel_url" target="_blank">{{ t('billing.cancel') }}</a>
                            </template>
                        </template>
                    </div>
                </div>
            </div>
            <template v-if="billing.subscription && billing.subscription.transactions && billing.subscription.transactions.length > 0">
                <h3 class="form-section-title">{{ t('billing.transactions') }}</h3>
                <div class="block-container block-container--padded">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>{{ t('billing.billed_at') }}</th>
                                <th>{{ t('billing.amount') }}</th>
                                <th>{{ t('billing.currency') }}</th>
                                <th>{{ t('billing.invoice-number') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="tx in billing.subscription.transactions" :key="tx.invoice_number">
                                <td><DateFormatter :date="tx.billed_at" format="long" /></td>
                                <td>{{ new Intl.NumberFormat(userLocale, { style: "currency", currency: tx.currency }).format(parseFloat(tx.total) / 100) }}</td>
                                <td>{{ tx.currency }}</td>
                                <td>
                                    <template v-if="tx.invoice_number">
                                        <a v-if="tx.url" :href="tx.url" target="_blank">{{ tx.invoice_number }}</a>
                                        <span v-else>{{ tx.invoice_number }}</span>
                                    </template>
                                    <template v-else>&mdash;</template>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { initializePaddle, type CheckoutCustomer, type Environments, type Paddle } from '@paddle/paddle-js'
import BarAssistantClient from '@/api/BarAssistantClient'
import OverlayLoader from './../OverlayLoader.vue'
import DateFormatter from './../DateFormatter.vue'
import SaltRimRadio from './../SaltRimRadio.vue'
import PageHeader from './../PageHeader.vue'
import Navigation from './../Settings/SettingsNavigation.vue'
import AppState from '../../AppState'
import { useI18n } from 'vue-i18n'
import type { components } from '@/api/api'
import type { LineItem } from '@paddle/paddle-js/types/price-preview/price-preview'
import { useConfirm } from '@/composables/confirm'

type UserSubscription = components["schemas"]["UserSubscription"]

const confirm = useConfirm()
const { t } = useI18n()
const isLoading = ref(false)
const productPrices = ref<LineItem[]>([])
const selectedPriceCategory = ref<any>(null)
const paddle = ref<Paddle | null>(null)
const billing = ref<UserSubscription>({} as UserSubscription)
const userLocale = navigator.languages && navigator.languages.length ? navigator.languages[0] : navigator.language

const showBuyingOptions = computed(() => {
    if (!billing.value) {
        return false
    }

    return billing.value?.subscription == null || billing.value?.subscription.status == 'canceled'
})

async function fetchSubscriptionStatus() {
    isLoading.value = true
    const resp = (await BarAssistantClient.getSubscriptionStatus())?.data ?? null
    if (resp === null) {
        return
    }

    billing.value = resp

    await fetchProductsFromPaddle()

    isLoading.value = false
}

function updateSubscription(type: string) {
    confirm.show(t('billing.confirm-sub-update-' + type), {
        onResolved(dialog: any) {
            dialog.close()
            isLoading.value = true
            BarAssistantClient.updateSubscriptionStatus(type).then(() => {
                isLoading.value = false
                fetchSubscriptionStatus()
            })
        }
    })
}

function upgradePlan() {
    if (!selectedPriceCategory.value || !paddle.value) {
        return
    }

    const customer = {} as CheckoutCustomer

    if (billing.value.customer.paddle_id) {
        customer.id = billing.value.customer.paddle_id
    } else {
        customer.email = billing.value.customer.paddle_email ?? undefined
    }

    paddle.value.Checkout.open({
        items: [
            {priceId: selectedPriceCategory.value}
        ],
        customer: customer
    })
}

async function fetchProductsFromPaddle() {
    if (!showBuyingOptions.value || !paddle.value || !billing.value) {
        return
    }

    const result = await paddle.value.PricePreview({
        items: billing.value.prices.map(priceId => {
            return { priceId: priceId, quantity: 1 }
        })
    })

    productPrices.value = result.data.details.lineItems
}

async function refreshUser() {
    const appState = new AppState()

    const resp = (await BarAssistantClient.getProfile())?.data
    if (!resp) {
        return
    }

    appState.setUser(resp)
}

function afterCheckoutHook() {
    isLoading.value = true
    setTimeout(() => {
        isLoading.value = false
        window.location.reload()
    }, 3000)
}

refreshUser()

initializePaddle({
    environment: (window.srConfig.BILLING_ENV as Environments),
    token: window.srConfig.BILLING_TOKEN,
    checkout: {
        settings: {
            showAddTaxId: false,
            allowLogout: false,
            theme: 'light'
        }
    },
    eventCallback(data) {
        if (data.name == 'checkout.closed') {
            afterCheckoutHook()
        }
    }
}).then(paddleInstance => {
    paddle.value = paddleInstance ?? null
    fetchSubscriptionStatus()
})
</script>

<style scoped>
.billing__card {
    text-align: center;
}

.billing__card__icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--clr-rating-bg);
    margin: 0 auto var(--gap-size-3) auto;
}

.billing__card__icon svg {
    width: 40px;
    height: 40px;
    fill: var(--clr-rating);
}

.billing__card h3 {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: var(--fw-bold);
}

.billing__price-categories {
    display: grid;
    gap: var(--gap-size-3);
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr;
    margin: 1rem 0;
}

.billing ul {
    text-align: left;
    list-style: square;
    margin: 0;
    padding: 0 0 0 var(--gap-size-3);
}

.billing ul li::marker {
    color: var(--clr-accent-700);
}
</style>
