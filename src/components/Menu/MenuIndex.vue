<template>
    <form @submit.prevent="saveMenu">
        <OverlayLoader v-if="isLoading"></OverlayLoader>
        <PageHeader>
            {{ $t('menu.bar-title-menu', { name: appState.bar.name }) }}
        </PageHeader>
        <div class="menu-details">
            <div class="block-container block-container--padded" style="width: 100%;">
                <p style="margin-bottom: 1rem;">{{ $t('menu.description') }}</p>
                <div class="form-group">
                    <label class="form-label" for="menu-is-active">{{ $t('menu.url') }}:</label>
                    <p class="menu-url"><a :href="menu.url">{{ menu.url }}</a></p>
                </div>
                <div style="margin: 1rem 0;">
                    <label class="form-checkbox">
                        <input v-model="menu.is_enabled" :value="true" type="checkbox">
                        <span>{{ $t('menu.is-active') }}</span>
                    </label>
                </div>
                <p>
                    <a href="#" @click.prevent="quickAddShelf">{{ $t('menu.add-shelf-cocktails') }}</a>
                    &middot;
                    <a href="#" @click.prevent="exportMenu">{{ $t('menu.export') }}</a>
                </p>
            </div>
            <div class="block-container block-container--padded menu-qr-code">
                <QRCodeVue3
                    v-if="menu.url"
                    :width="200" :height="200" :value="menu.url" :image-options="{ hideBackgroundDots: true, imageSize: 0.5, margin: 6 }" :dots-options="{
                        type: 'square',
                        color: '#000000'
                    }" image="/logo-black.png" :background-options="{ color: '#ffffff' }" :corners-square-options="{ color: '#000000' }" :corners-dot-options="{ color: '#000000' }" file-ext="png" :download="false" download-button="button button--outline" :download-options="{ name: 'bar-menu-qr', extension: 'png' }"
                ></QRCodeVue3>
            </div>
        </div>
        <div class="menu-categories">
            <div v-for="(category, idx) in categories" :key="idx" class="menu-category">
                <div class="menu-category__info">
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label" :for="'menu-category-' + idx">{{ $t('menu.category-title') }}:</label>
                        <input :id="'menu-category-' + idx" v-model="category.name" class="form-input" type="text">
                    </div>
                    <a href="#" @click.prevent="removeCategory(category)">{{ $t('menu.remove-category') }}</a>
                    &middot;
                    <a href="#" @click.prevent="clearCategory(category)">{{ $t('menu.clear-category') }}</a>
                </div>
                <div ref="cocktailsList" class="menu-category-cocktails" :data-category-idx="idx">
                    <div v-for="(cocktail, cidx) in category.cocktails" :key="cocktail.id" class="block-container menu-category__cocktail" :data-id="cocktail.id">
                        <div class="drag-handle"></div>
                        <div class="menu-category__cocktail__content">
                            <div>
                                <h4>{{ cocktail.name }}</h4>
                                <small>{{ cocktail.short_ingredients.join(', ') }}</small><br>
                                <a href="#" @click.prevent="copyCurrency(cocktail.price.currency)">{{ $t('menu.copy-currency') }}</a> &middot; <a href="#" @click.prevent="removeCocktail(category, cocktail)">{{ $t('remove') }}</a> &middot;
                                <SaltRimDialog v-model="showCurrencyCalculator[cidx + '-' + idx]">
                                    <template #trigger>
                                        <a style="margin-top: 0.5rem; display: inline-block;" href="#addcocktail" @click.prevent="showCurrencyCalculator[cidx + '-' + idx] = !showCurrencyCalculator[cidx + '-' + idx]">
                                            {{ $t('menu.calculate-price') }}
                                        </a>
                                    </template>
                                    <template #dialog>
                                        <CocktailPriceCalculator :cocktail="cocktail" @selected-price="price => handleCalculatedPrice(cocktail, price)" @closed="showCurrencyCalculator[cidx + '-' + idx] = false"></CocktailPriceCalculator>
                                    </template>
                                </SaltRimDialog>
                            </div>
                            <div class="menu-category__cocktail__content__price">
                                <div class="form-group">
                                    <label class="form-label" :for="'cocktail-category-price-' + idx + '-' + cidx">{{ $t('menu.price') }}:</label>
                                    <input :id="'cocktail-category-price-' + idx + '-' + cidx" v-model="cocktail.price.price" class="form-input" type="text">
                                </div>
                                <div class="form-group">
                                    <label class="form-label" :for="'cocktail-category-currency-' + idx + '-' + cidx">{{ $t('menu.currency') }}:</label>
                                    <input :id="'cocktail-category-currency-' + idx + '-' + cidx" v-model="cocktail.price.currency" class="form-input" type="text">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <SaltRimDialog v-model="showCocktailFinder[idx]">
                    <template #trigger>
                        <a style="margin-top: 0.5rem; display: inline-block;" href="#addcocktail" @click.prevent="showCocktailFinder[idx] = !showCocktailFinder[idx]">
                            {{ $t('menu.add-cocktail') }}
                        </a>
                    </template>
                    <template #dialog>
                        <CocktailFinder @cocktail-selected="cocktail => selectCocktail(cocktail, category, idx)" @closed="showCocktailFinder[idx] = false"></CocktailFinder>
                    </template>
                </SaltRimDialog>
            </div>
        </div>
        <div style="margin: 1rem 0; text-align: center;">
            <button type="button" class="button button--outline" @click="addCategory">{{ $t('menu.add-category') }}</button>
        </div>
        <div class="form-actions">
            <button type="submit" class="button button--dark">{{ $t('save') }}</button>
        </div>
    </form>
</template>

<script>
import PageHeader from '../PageHeader.vue'
import Sortable from 'sortablejs'
import SaltRimDialog from './../Dialog/SaltRimDialog.vue'
import CocktailFinder from './../CocktailFinder.vue'
import CocktailPriceCalculator from './../Calculator/CocktailPriceCalculator.vue'
import AppState from '../../AppState'
import QRCodeVue3 from 'qrcode-vue3'
import OverlayLoader from '../OverlayLoader.vue'
import { useTitle } from '@/composables/title'
import BarAssistantClient from '@/api/BarAssistantClient'

export default {
    components: {
        CocktailFinder,
        PageHeader,
        SaltRimDialog,
        QRCodeVue3,
        OverlayLoader,
        CocktailPriceCalculator,
    },
    data() {
        return {
            isLoading: false,
            showCocktailFinder: {},
            showCurrencyCalculator: {},
            appState: new AppState(),
            categories: [],
            bar: {},
            menu: {
                is_enabled: false,
                url: null
            },
            sortableInstances: [],
        }
    },
    computed: {
        cocktails() {
            return this.categories.flatMap(c => c.cocktails).sort((a, b) => { a.sort - b.sort })
        },
        guessCurrency() {
            // Use map() to create a new array with just the currencies
            let currencyArray = this.cocktails.map(item => item.price.currency)

            // Convert it into a Set, which will automatically remove any duplicates
            let uniqueCurrencySet = new Set(currencyArray)

            // Now convert back into an Array using Array.from()
            let uniqueCurrencies = Array.from(uniqueCurrencySet)

            if (uniqueCurrencies.length == 0) {
                return null
            }

            return uniqueCurrencies[0]
        }
    },
    created() {
        useTitle(this.$t('menu.title'))
        this.refreshMenu()
        this.refreshBar()
    },
    methods: {
        addCocktailToCategory(cocktail, category) {
            if (this.cocktails.findIndex(c => parseInt(c.id) == parseInt(cocktail.id)) >= 0) {
                return
            }

            category.cocktails.push({
                id: cocktail.id,
                slug: cocktail.slug,
                name: cocktail.name,
                sort: 0,
                short_ingredients: cocktail.short_ingredients,
                price: {
                    price: '0.00',
                    currency: this.guessCurrency,
                },
            })
        },
        selectCocktail(cocktail, category, finderIdx) {
            if (this.cocktails.findIndex(c => parseInt(c.id) == parseInt(cocktail.id)) >= 0) {
                this.$toast.default(this.$t('menu.cocktail-already-added', {name: cocktail.name}))

                return
            }

            this.showCocktailFinder[finderIdx] = false

            this.addCocktailToCategory(cocktail, category)

            this.$toast.default(this.$t('menu.cocktail-added', {name: cocktail.name}))
        },
        addCategory(e, name) {
            if (!name) {
                name = 'Category name ' + (this.categories.length + 1)
            }

            const category = {
                name: name,
                cocktails: []
            };

            this.categories.push(category)

            this.$toast.default(this.$t('menu.category-added'))

            this.$nextTick(() => {
                this.refreshSortable()
                document.querySelector(`[data-category-idx="${this.categories.length - 1}"]`).scrollIntoView(true)
            })

            return category
        },
        removeCategory(category) {
            if (category.cocktails.length > 0) {
                this.$confirm(this.$t('menu.delete-category-confirm', {name: category.name}), {
                    onResolved: (dialog) => {
                        dialog.close()
                        this.$toast.default(this.$t('menu.category-removed'))
                        this.categories.splice(
                            this.categories.findIndex(i => i == category),
                            1
                        )
                    }
                })

                return
            }

            this.categories.splice(
                this.categories.findIndex(i => i == category),
                1
            )
        },
        clearCategory(category) {
            if (category.cocktails.length == 0) {
                return
            }

            this.$confirm(this.$t('menu.clear-category-confirm', {name: category.name}), {
                onResolved: (dialog) => {
                    dialog.close()
                    this.$toast.default(this.$t('menu.category-cleared'))
                    category.cocktails = []
                }
            })
        },
        removeCocktail(category, cocktail) {
            this.$confirm(this.$t('menu.delete-cocktail-confirm', {name: cocktail.name}), {
                onResolved: (dialog) => {
                    dialog.close()
                    this.$toast.default(this.$t('menu.cocktail-removed'))
                    category.cocktails.splice(
                        category.cocktails.findIndex(i => i == cocktail),
                        1
                    )
                }
            })
        },
        refreshMenu() {
            this.isLoading = true
            BarAssistantClient.getMenu().then(resp => {
                this.isLoading = false
                this.menu.is_enabled = resp.data.is_enabled
                this.categories = resp.data.categories
                this.$nextTick(() => {
                    this.refreshSortable()
                })
            }).catch(() => {
                this.isLoading = false
                this.categories = []
            })
        },
        refreshBar() {
            BarAssistantClient.getBar(this.appState.bar.id).then(resp => {
                this.bar = resp.data
                this.menu.url = `${window.location.origin}/menu/${this.bar.slug}`
            }).catch(() => {
            })
        },
        async exportMenu() {
            const csv = await BarAssistantClient.getMenuExport()
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

            const url = window?.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', this.appState.bar.slug + '-menu.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window?.URL.revokeObjectURL(url);
        },
        refreshSortable() {
            this.sortableInstances = []
            const self = this
            document.querySelectorAll('.menu-category-cocktails').forEach(el => {
                this.sortableInstances.push(Sortable.create(el, {
                    group: 'nested',
                    handle: '.drag-handle',
                    ghostClass: 'block-container--placeholder',
                    animation: 150,
                    fallbackOnBody: true,
                    swapThreshold: 0.65,
                    onAdd: function (evt) {
                        const sourceCocktail = self.cocktails.find(c => c.id == evt.item.dataset.id)
                        const fromCategory = self.categories[evt.from.dataset.categoryIdx]
                        const targetCategory = self.categories[evt.to.dataset.categoryIdx]

                        // Remove from old cat
                        fromCategory.cocktails.splice(
                            fromCategory.cocktails.findIndex(i => i == sourceCocktail),
                            1
                        )

                        sourceCocktail.sort = evt.newIndex + 1

                        // Add to new cat
                        targetCategory.cocktails.splice(evt.newIndex, 0, sourceCocktail)
                    },
                }))
            })
        },
        copyCurrency(currency) {
            this.categories.forEach(cat => {
                cat.cocktails.forEach(cocktail => {
                    cocktail.price.currency = currency
                })
            })
        },
        handleCalculatedPrice(cocktail, e) {
            cocktail.price.price = e.price
            cocktail.price.currency = e.currency
        },
        quickAddShelf() {
            this.isLoading = true
            BarAssistantClient.getBarShelfCocktails(this.appState.user.id).then((resp) => {
                const cat = this.addCategory(null, 'Bar shelf')
                resp.data.forEach(cocktail => {
                    this.addCocktailToCategory(cocktail, cat)
                })
                this.isLoading = false
                this.$toast.default(this.$t('menu.added-multiple-cocktails'))
            }).catch(() => {
                this.isLoading = false
            })
        },
        saveMenu() {
            this.isLoading = true

            const sortedCocktails = this.sortableInstances.flatMap(sortableInstance => sortableInstance.toArray())
            const cocktails = this.categories.flatMap(cat => {
                return cat.cocktails.map(cocktail => ({
                    cocktail_id: cocktail.id,
                    category_name: cat.name,
                    sort: sortedCocktails.findIndex(sortedId => sortedId == cocktail.id) + 1,
                    price: cocktail.price.price,
                    currency: cocktail.price.currency,
                }))
            })

            if (cocktails.length == 0) {
                this.$toast.error(this.$t('menu.no-cocktails-added'))
                this.isLoading = false

                return
            }

            const postData = {
                is_enabled: this.menu.is_enabled,
                cocktails: cocktails
            }

            BarAssistantClient.updateMenu(postData).then(() => {
                this.isLoading = false
                this.refreshMenu()
                this.$toast.default(this.$t('menu.saved'))
            }).catch(e => {
                this.isLoading = false
                this.$toast.error(this.$t('menu.update-error') + ': ' + e.message)
            })
        },
    }
}
</script>

<style scoped>
.menu-details {
    display: flex;
    gap: var(--gap-size-3);
    margin-bottom: 1rem;
}

.menu-qr-code {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

@media (max-width: 450px) {
    .menu-details {
        flex-direction: column;
    }
}

.menu-categories {
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-2);
    margin-top: 1rem;
}

.menu-category {
    padding: var(--gap-size-3);
    background-color: #f4edf2;
    border-radius: var(--radius-2);
    border-bottom: 1px solid #fff;
    box-shadow: inset 0px 0.4px 0.5px hsl(var(--shadow-color) / 0.25), inset 0px 1.1px 1.2px -0.8px hsl(var(--shadow-color) / 0.25), inset 0px 2.6px 2.9px -1.7px hsl(var(--shadow-color) / 0.25), inset 0px 6.3px 7.1px -2.5px hsl(var(--shadow-color) / 0.25);
}

@media (max-width: 450px) {
    .menu-category {
        padding: var(--gap-size-2);
    }
}

.dark-theme .menu-category {
    background-color: rgba(0, 0, 0, .15);
    border-bottom: 1px solid rgba(255, 255, 255, .1);
    box-shadow:
        inset 0px 0.4px 0.5px hsl(var(--shadow-color-dark) / 0.25),
        inset 0px 1.1px 1.2px -0.8px hsl(var(--shadow-color-dark) / 0.25),
        inset 0px 2.6px 2.9px -1.7px hsl(var(--shadow-color-dark) / 0.25),
        inset 0px 6.3px 7.1px -2.5px hsl(var(--shadow-color-dark) / 0.25);
}

.menu-category-cocktails {
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-2);
    margin-top: var(--gap-size-4);
}

.menu-category__cocktail {
    display: flex;
    gap: var(--gap-size-3);
    padding: var(--gap-size-3);
}

@media (max-width: 450px) {
    .menu-category__cocktail {
        gap: var(--gap-size-2);
        padding: var(--gap-size-2);
    }
}

.menu-category__cocktail .drag-handle {
    height: auto;
}

.menu-category__cocktail__content {
    display: flex;
    flex-direction: row;
    width: 100%;
}

@media (max-width: 450px) {
    .menu-category__cocktail__content {
        flex-direction: column;
    }
}

.menu-category__cocktail__content__price {
    display: flex;
    margin-left: auto;
    gap: var(--gap-size-2);
}

@media (max-width: 450px) {
    .menu-category__cocktail__content__price {
        margin-top: 0.5rem;
        margin-left: 0;
    }
}

.menu-category__cocktail__content h4 {
    font-weight: var(--fw-bold);
    font-family: var(--font-heading);
    font-size: 1.25rem;
}

@media (max-width: 450px) {
    .menu-category__cocktail__content h4 {
        font-size: 1rem;
    }
}

.menu-category__cocktail__content small {
    font-size: 0.85rem;
    color: var(--clr-gray-600);
}

.dark-theme .menu-category__cocktail__content small {
    color: var(--clr-gray-400);
}

.menu-category__cocktail__content a {
    font-size: 0.85rem;
}

.menu-category__cocktail .form-group {
    max-width: 100px;
    margin-bottom: 0;
}

.menu-category__cocktail .form-group .form-input {
    width: 100%;
}

.menu-url {
    background: var(--clr-accent-purple);
    padding: 0.5rem;
    font-weight: var(--fw-bold);
    border-radius: var(--radius-1);
    width: 100%;
}

.menu-url a {
    font-weight: var(--fw-bold);
}
</style>
