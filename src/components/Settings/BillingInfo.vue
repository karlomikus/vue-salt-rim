<template>
    <div class="billing">
        <OverlayLoader v-if="isLoading" />
        <template v-if="billing.subscription == null">
            <h3>Upgrade to "Mixologist" plan today.</h3>
            <p>For enthusiasts that want to create a community around their bar </p>
            <div class="form-group">
                <div class="billing__price-categories">
                    <SaltRimRadio v-for="price in productPrices" v-model="selectedPriceCategory" :title="price.formattedTotals.total" :description="price.price.description" :value="price.price.id"></SaltRimRadio>
                </div>
            </div>
            <button class="button button--dark" @click.prevent="upgradePlan">Upgrade now</button>
        </template>
        <div v-else class="billing__active">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32"><path d="M17.0007 1.20801 18.3195 3.68083 20.7923 4.99968 18.3195 6.31852 17.0007 8.79134 15.6818 6.31852 13.209 4.99968 15.6818 3.68083 17.0007 1.20801ZM10.6673 9.33301 15.6673 11.9997 10.6673 14.6663 8.00065 19.6663 5.33398 14.6663.333984 11.9997 5.33398 9.33301 8.00065 4.33301 10.6673 9.33301ZM11.4173 11.9997 9.18905 10.8113 8.00065 8.58301 6.81224 10.8113 4.58398 11.9997 6.81224 13.1881 8.00065 15.4163 9.18905 13.1881 11.4173 11.9997ZM19.6673 16.333 18.0007 13.208 16.334 16.333 13.209 17.9997 16.334 19.6663 18.0007 22.7913 19.6673 19.6663 22.7923 17.9997 19.6673 16.333Z"></path></svg>
            <h3>You are currently subscribed to "Mixologist" plan!</h3>
            <div v-if="billing.subscription.next_billed_at">
                Your next payment will be on <DateFormatter :date="billing.subscription.next_billed_at" />
            </div>
            <div v-if="billing.subscription.paused_at">
                You ended your subscription, you will have access to the plan until <DateFormatter :date="billing.subscription.paused_at" />
            </div>
            <a v-if="billing.subscription.paused_at" href="#" @click.prevent="updateSubscription('resume')">Resume subscription</a>
            <a v-else href="#" @click.prevent="updateSubscription('pause')">Pause subscription</a>
        </div>
    </div>
</template>

<script>
import ApiRequests from './../../ApiRequests.js'
import OverlayLoader from './../OverlayLoader.vue'
import DateFormatter from './../DateFormatter.vue'
import SaltRimRadio from './../SaltRimRadio.vue'

export default {
    components: {
        OverlayLoader,
        DateFormatter,
        SaltRimRadio,
    },
    data() {
        return {
            isLoading: false,
            productPrices: [],
            selectedPriceCategory: null,
            billing: {
                prices: [],
                customer: {},
                subscription: null,
            }
        }
    },
    created() {
        Paddle.Environment.set('sandbox')
        Paddle.Setup({
            token: window.srConfig.BILLING_TOKEN,
            eventCallback: function (data) {
                if (data.name == 'checkout.completed') {
                    this.fetchBilling()
                }
            }
        })

        this.fetchBilling()
    },
    methods: {
        fetchBilling() {
            this.isLoading = true
            ApiRequests.fetchSubscription().then(data => {
                this.billing = data
                this.fetchProduct()
                this.isLoading = false
            })
        },
        updateSubscription(type) {
            this.$confirm(this.$t('billing.confirm-sub-update-' + type), {
                onResolved: (dialog) => {
                    dialog.close()
                    this.isLoading = true
                    ApiRequests.updateSubscription({
                        type: type
                    }).then(data => {
                        this.isLoading = false
                    })
                }
            })
        },
        upgradePlan() {
            Paddle.Checkout.open({
                items: [
                    {priceId: this.selectedPriceCategory}
                ],
                customer: {
                    id: this.billing.customer.paddle_id,
                }
            })
        },
        fetchProduct() {
            Paddle.PricePreview({
                items: this.billing.prices.map(priceId => {
                    return { priceId: priceId, quantity: 1 }
                })
            })
                .then((result) => {
                    this.productPrices = result.data.details.lineItems
                })
        }
    }
}
</script>

<style scoped>
.billing__active {
    /* padding: 1rem;
    border-radius: var(--radius-2);
    border: 2px solid rgb(252, 158, 19);
    background-color: rgb(255, 250, 242);
    color: rgb(173, 84, 0);
    box-shadow: inset 0 2px 0 rgba(255, 255, 255, .6); */
}
.billing__price-categories {
    display: grid;
    gap: var(--gap-size-3);
    grid-template-columns: 1fr 1fr;
}
</style>
