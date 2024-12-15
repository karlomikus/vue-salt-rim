<script setup>
import UnitHandler from '../../UnitHandler.js'
</script>
<template>
    <OverlayLoader v-if="isLoadingIngredient" />
    <div v-if="ingredient.id">
        <PageHeader>
            {{ ingredient.name }}
            <small :title="$t('added-on-by', { date: createdDate, name: ingredient.created_user.name })">
                <template v-if="ingredient.category">
                    <RouterLink :to="{ name: 'ingredients', query: { 'filter[category_id]': ingredient.category.id } }">{{ ingredient.category.name }}</RouterLink> &middot;
                </template>
                <template v-if="ingredient.updated_user">{{ $t('updated-on-by', { date: updatedDate, name: ingredient.updated_user.name }) }}</template>
                <template v-else>{{ $t('added-on-by', { date: createdDate, name: ingredient.created_user.name }) }}</template>
            </small>
        </PageHeader>
        <div class="ingredient-details">
            <div class="ingredient-details__column-image">
                <div class="ingredient-details__graphic" :style="{ 'background-color': backgroundColor }">
                    <div v-if="mainIngredientImage.copyright" class="ingredient-details__graphic__copyright">{{ $t('imageupload.copyright-notice', { copyright: mainIngredientImage.copyright }) }}</div>
                    <img :src="mainIngredientImage.url" :alt="ingredient.name" />
                </div>
            </div>
            <div class="ingredient-details__column-sidebar">
                <div v-if="ingredient.varieties.length > 0">
                    <h3 class="page-subtitle">{{ $t('see-also') }}</h3>
                    <ul class="ingredient-chips-list">
                        <li v-for="variety in ingredient.varieties" :key="variety.slug">
                            <RouterLink :to="{ name: 'ingredients.show', params: { id: variety.slug } }">{{ variety.name }}</RouterLink>
                        </li>
                    </ul>
                </div>
                <div v-if="ingredient.used_as_substitute_for && ingredient.used_as_substitute_for.length > 0">
                    <h3 class="page-subtitle">{{ $t('ingredient.used_as_substitute_for') }}</h3>
                    <ul class="ingredient-chips-list">
                        <li v-for="s in ingredient.used_as_substitute_for" :key="s.slug">
                            <RouterLink :to="{ name: 'ingredients.show', params: { id: s.slug } }">{{ s.name }}</RouterLink>
                        </li>
                        <li>
                            <RouterLink :to="{name: 'cocktails', query: {'filter[ingredient_substitute_id]': ingredient.id}}">
                                View all
                            </RouterLink>
                        </li>
                    </ul>
                </div>
                <div v-if="ingredient.can_be_substituted_with && ingredient.can_be_substituted_with.length > 0">
                    <h3 class="page-subtitle">{{ $t('ingredient.can_be_substituted_with') }}</h3>
                    <ul class="ingredient-chips-list">
                        <li v-for="s in ingredient.can_be_substituted_with" :key="s.slug">
                            <RouterLink :to="{ name: 'ingredients.show', params: { id: s.slug } }">{{ s.name }}</RouterLink>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="ingredient-details__column-content">
                <div v-if="ingredient.access && (ingredient.access.can_edit || ingredient.access.can_delete)" class="ingredient-details__actions">
                    <Dropdown>
                        <template #default="{ toggleDropdown }">
                            <button type="button" class="button button-circle" @click.prevent="toggleDropdown"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path fill="none" d="M0 0h24v24H0z" />
                                <path d="M12 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 14c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                            </svg></button>
                        </template>
                        <template #content>
                            <RouterLink v-if="ingredient.access.can_edit" class="dropdown-menu__item" :to="{ name: 'ingredients.form', query: { id: ingredient.id } }">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                    <path fill="none" d="M0 0h24v24H0z" />
                                    <path d="M6.414 16L16.556 5.858l-1.414-1.414L5 14.586V16h1.414zm.829 2H3v-4.243L14.435 2.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 18zM3 20h18v2H3v-2z" />
                                </svg>
                                {{ $t('edit') }}
                            </RouterLink>
                            <hr v-if="ingredient.access.can_delete" class="dropdown-menu__separator">
                            <a v-if="ingredient.access.can_delete" class="dropdown-menu__item" href="javascript:;" @click.prevent="deleteIngredient">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                    <path fill="none" d="M0 0h24v24H0z" />
                                    <path d="M7 4V2h10v2h5v2h-2v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6H2V4h5zM6 6v14h12V6H6zm3 3h2v8H9V9zm4 0h2v8h-2V9z" />
                                </svg>
                                {{ $t('remove') }}
                            </a>
                        </template>
                    </Dropdown>
                </div>
                <div class="block-container block-container--padded">
                    <h2 class="details-block-container__title">{{ $t('description') }}</h2>
                    <div class="item-details__chips">
                        <div class="item-details__chips__group">
                            <div class="item-details__chips__group__title">{{ $t('strength') }}:</div>
                            <ul v-if="ingredient.strength > 0" class="chips-list">
                                <li>
                                    <span><abbr :title="$t('ABV-definition')">{{ $t('ABV') }}</abbr>: {{ ingredient.strength + '%' }}</span>
                                </li>
                                <li>
                                    <span>{{ $t('alcohol-proof') }}: {{ ingredient.strength * 2 }}</span>
                                </li>
                            </ul>
                            <ul v-else class="chips-list">
                                <li>
                                    <span>{{ $t('non-alcoholic') }}</span>
                                </li>
                            </ul>
                        </div>
                        <div v-if="ingredient.origin" class="item-details__chips__group">
                            <div class="item-details__chips__group__title">{{ $t('origin') }}:</div>
                            <ul class="chips-list">
                                <li>
                                    <span>{{ ingredient.origin }}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <ul class="block-container block-container--inset ingredient-details__more">
                        <OverlayLoader v-if="isLoadingExtra" />
                        <li>
                            <div class="shelf-actions">
                                <div class="block-container shelf-actions__action" v-if="appState.isAdmin() || appState.isModerator()">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M8.755 2.308A4 4 0 0 0 5.46 6.733l.017.14a1 1 0 0 0 .992.879h1.764L5.267 21.595a.75.75 0 0 0 1.467.314l.944-4.407h8.644l.945 4.407a.75.75 0 0 0 1.466-.314L15.767 7.752h1.764a1 1 0 0 0 .993-.88l.017-.139a4 4 0 0 0-3.295-4.425l-.373-.064a17 17 0 0 0-5.745 0l-.373.064Zm5.495 5.444h-4.5a.753.753 0 0 1-.016.157l-1.735 8.093h8.002l-1.734-8.093a.755.755 0 0 1-.017-.157Z" clip-rule="evenodd"/></svg>
                                    <ToggleIngredientBarShelf :ingredient="ingredient" :status="ingredient.in_bar_shelf"></ToggleIngredientBarShelf>
                                    <br>
                                    <small>{{ $t('ingredient.shelf-bar-help') }}</small>
                                </div>
                                <div class="block-container shelf-actions__action">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16.533 18H6.75v2a.75.75 0 1 1-1.5 0v-2.324c-.829-.362-1.49-1.005-1.808-1.817-.01-.023-.02-.05-.039-.102L2.1 12.264C1.685 11.15 2.613 10 3.927 10c.81 0 1.534.453 1.81 1.134l1.098 2.706c.1.246.15.37.222.47a1.2 1.2 0 0 0 .74.463c.13.027.277.027.57.027h6.98c.569 0 .853 0 1.091-.098.13-.054.248-.128.349-.219.184-.166.281-.405.475-.883l1.001-2.466c.276-.68 1-1.134 1.81-1.134 1.314 0 2.242 1.15 1.827 2.264l-1.12 3c-.195.524-.292.785-.421 1.008a3.43 3.43 0 0 1-1.609 1.404V20a.75.75 0 1 1-1.5 0v-2.005c-.187.005-.415.005-.717.005Z"/><path d="M13.236 3.5h-2.472c-1.1 0-1.976 0-2.66.088-.706.09-1.285.28-1.746.72-.464.441-.669 1.003-.765 1.685-.093.658-.093 1.495-.093 2.54v.88l.21.15c.416.294.752.698.954 1.195L7.898 13.8h7.449l.363-.001h.002l.388-.007.126-.3.11-.268 1-2.466c.202-.497.538-.9.954-1.196l.21-.15v-.88c0-1.044 0-1.881-.093-2.539-.096-.682-.301-1.244-.765-1.686-.46-.438-1.04-.629-1.745-.72-.685-.087-1.56-.087-2.661-.087Z"/></svg>
                                    <ToggleIngredientShelf :ingredient="ingredient" :status="ingredient.in_shelf"></ToggleIngredientShelf>
                                    <br>
                                    <small>{{ $t('ingredient.shelf-user-help') }}</small>
                                </div>
                                <div class="block-container shelf-actions__action">
                                    <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox="0 0 24 24"><path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25zm1.5 18a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zm12.75 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0z"/></svg>
                                    <ToggleIngredientShoppingCart :ingredient="ingredient" :status="ingredient.in_shopping_list"></ToggleIngredientShoppingCart>
                                </div>
                            </div>
                        </li>
                        <li v-if="ingredient.ingredient_parts.length">
                            {{ $t('contains-ingredients') }}:
                            <template v-for="(part, index) in ingredient.ingredient_parts" :key="part.id">
                                <RouterLink :to="{name: 'ingredients.show', params: {id: part.slug}}">{{ part.name }}</RouterLink><template v-if="index + 1 !== ingredient.ingredient_parts.length">, </template>
                            </template>
                        </li>
                        <li>
                            <RouterLink :to="{name: 'cocktails', query: {'filter[ingredient_id]': ingredient.id}}">
                                Used in <strong>{{ ingredient.cocktails_count }} <template v-if="ingredient.cocktails_as_substitute_count && ingredient.cocktails_as_substitute_count > 0">(+{{ ingredient.cocktails_as_substitute_count }} as substitute)</template></strong> cocktail recipes
                            </RouterLink>
                        </li>
                        <li v-if="extraIfAddedToShelf.length > 0">{{ $t('ingredient.extra-cocktails') }}: <RouterLink :to="{name: 'cocktails', query: {'filter[id]': extraCocktailsIds}}">{{ extraIfAddedToShelf.length }} {{ $t('cocktail.cocktails') }}</RouterLink></li>
                    </ul>
                    <div v-html="parsedDescription" class="has-markdown"></div>
                </div>
                <div v-if="ingredient.prices.length > 0" class="block-container block-container--padded ingredient-details__prices">
                    <h2 class="details-block-container__title">{{ $t('price.prices') }}</h2>
                    <div class="ingredient-details__prices__list">
                        <div v-for="ingredientPrice in ingredient.prices" :key="ingredientPrice.id" class="ingredient-details__prices__list__item">
                            <h5>{{ ingredientPrice.price_category.name }} ({{ ingredientPrice.price_category.currency }})</h5>
                            <p>
                                {{ UnitHandler.formatPrice(ingredientPrice.price.price, ingredientPrice.price_category.currency) }} &middot; {{ ingredientPrice.amount }}{{ ingredientPrice.units }} <template v-if="ingredientPrice.description">&middot; {{ ingredientPrice.description }}</template>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import OverlayLoader from '@/components/OverlayLoader.vue'
import { micromark } from 'micromark'
import dayjs from 'dayjs'
import PageHeader from '../PageHeader.vue'
import BarAssistantClient from '@/api/BarAssistantClient'
import AppState from '@/AppState.js'
import ToggleIngredientShoppingCart from '@/components/ToggleIngredientShoppingCart.vue'
import ToggleIngredientShelf from '@/components/ToggleIngredientShelf.vue'
import ToggleIngredientBarShelf from '../ToggleIngredientBarShelf.vue'
import Dropdown from '@/components/SaltRimDropdown.vue'
import { useTitle } from '@/composables/title'

export default {
    components: {
        OverlayLoader,
        PageHeader,
        ToggleIngredientShelf,
        ToggleIngredientShoppingCart,
        Dropdown,
        ToggleIngredientBarShelf,
    },
    data: () => ({
        appState: new AppState(),
        isLoadingIngredient: false,
        isLoadingExtra: false,
        ingredient: {},
        extraIfAddedToShelf: []
    }),
    computed: {
        mainIngredientImage() {
            if (this.ingredient.images.length <= 0) {
                return { url: '/no-ingredient.png', copyright: null }
            }

            return this.ingredient.images[0]
        },
        parsedDescription() {
            if (!this.ingredient.description) {
                return null
            }

            return micromark(this.ingredient.description)
        },
        createdDate() {
            const date = dayjs(this.ingredient.created_at).toDate()

            return this.$d(date, 'short')
        },
        updatedDate() {
            const date = dayjs(this.ingredient.updated_at).toDate()

            return this.$d(date, 'short')
        },
        extraCocktailsIds() {
            return this.extraIfAddedToShelf.map(c => c.id).join(',')
        },
        backgroundColor() {
            const hex = this.ingredient.color || '#51274c'

            let c
            if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
                c = hex.substring(1).split('')
                if (c.length == 3) {
                    c = [c[0], c[0], c[1], c[1], c[2], c[2]]
                }
                c = '0x' + c.join('')
                return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',.13)'
            }

            return hex
        },
    },
    watch: {
        ingredient(val) {
            useTitle(val.name)
        }
    },
    created() {
        this.$watch(
            () => this.$route.params.id,
            async () => {
                if (this.$route.name == 'ingredients.show') {
                    await this.refreshIngredient()
                }
            },
            { immediate: true }
        )
    },
    methods: {
        async refreshIngredient() {
            this.isLoadingIngredient = true
            this.ingredient = (await BarAssistantClient.getIngredient(this.$route.params.id)).data
            this.isLoadingIngredient = false

            this.isLoadingExtra = true
            this.extraIfAddedToShelf = (await BarAssistantClient.getExtraCocktailsWithIngredient(this.ingredient.id)).data
            this.isLoadingExtra = false
        },
        deleteIngredient() {
            this.$confirm(this.$t('ingredient.delete-confirm', { name: this.ingredient.name, total: this.ingredient.cocktails_count }), {
                onResolved: (dialog) => {
                    dialog.close()
                    this.isLoadingIngredient = true
                    BarAssistantClient.deleteIngredient(this.ingredient.id).then(() => {
                        this.$toast.default(`Ingredient "${this.ingredient.name}" successfully removed`)
                        this.$router.push({ name: 'ingredients' })
                        this.isLoadingIngredient = false
                    }).catch(e => {
                        this.$toast.error(e.message)
                        this.isLoadingIngredient = false
                    })
                }
            })
        },
    }
}
</script>

<style scoped>
.ingredient-details {
    display: grid;
    gap: var(--gap-size-3);
    grid-template-columns: 300px minmax(0, 1fr);
    grid-template-rows: 400px 1fr;
    grid-template-areas:
        "image content"
        "sidebar content";
}

@media (max-width: 800px) {
    .ingredient-details {
        grid-template-columns: 200px minmax(0, 1fr);
    }
}

@media (max-width: 600px) {
    .ingredient-details {
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: 1fr;
        grid-template-areas:
            "image"
            "content"
            "sidebar";
    }
}

.ingredient-details__column-image {
    grid-area: image;
}

.ingredient-details__column-content {
    grid-area: content;
}

.ingredient-details__column-sidebar {
    grid-area: sidebar;
}

.ingredient-details .ingredient-details__image {
    flex-shrink: 0;
    padding: 30px;
    background-color: #fff;
    border-radius: var(--radius-4);
}

.ingredient-details__actions {
    position: absolute;
    right: 20px;
    top: -25px;
    display: grid;
    grid-template-columns: 1fr;
    column-gap: var(--gap-size-1);
    z-index: 1;
}

.ingredient-details__graphic {
    width: auto;
    height: 100%;
    max-height: 400px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: var(--gap-size-3);
    border-radius: var(--radius-3);
    border-bottom: 1px solid #fff;
    box-shadow:
        inset 0px 0.4px 0.5px rgba(0, 0, 0, .04),
        inset 0px 1.1px 1.2px -0.8px rgba(0, 0, 0, .04),
        inset 0px 2.6px 2.9px -1.7px rgba(0, 0, 0, .04),
        inset 0px 6.3px 7.1px -2.5px rgba(0, 0, 0, .04);
}

.dark-theme .ingredient-details__graphic {
    border-bottom: 1px solid rgba(255, 255, 255, .15);
    box-shadow:
        inset 0px 0.4px 0.5px rgba(0, 0, 0, .1),
        inset 0px 1.1px 1.2px -0.8px rgba(0, 0, 0, .1),
        inset 0px 2.6px 2.9px -1.7px rgba(0, 0, 0, .1),
        inset 0px 6.3px 7.1px -2.5px rgba(0, 0, 0, .1);
}

.ingredient-details__graphic img {
    display: block;
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
}

@media (max-width: 450px) {
    .ingredient-details__graphic {
        max-height: none;
    }

    .ingredient-details__graphic img {
        max-height: 300px;
    }
}

.ingredient-details__graphic__copyright {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    display: inline-block;
    background-color: rgba(0, 0, 0, .5);
    color: #fff;
    border-radius: var(--radius-3);
    padding: 2px 7px;
    font-size: 0.7rem;
    z-index: 1;
    text-shadow: 1px 1px 0 rgba(0, 0, 0, .8);
}

.ingredient-chips-list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-size-1);
    align-items: center;
}

.ingredient-chips-list .chip {
    font-size: 1rem;
}

.ingredient-details__actions {
    position: absolute;
    top: -25px;
    right: 20px;
    display: flex;
    gap: var(--gap-size-1);
}

.ingredient-details__more {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    margin: 0 0 1rem 0;
    list-style-type: none;
}

.dark-theme .ingredient-details__more {
    background-color: rgba(0, 0, 0, .4);
}

.ingredient-details__more svg {
    width: 16px;
    height: 16px;
}

.ingredient-details__prices {
    margin-top: 1rem;
}

.ingredient-details__prices__list {
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-1);
}

.ingredient-details__prices__list__item {
    /* background-color: var(--clr-gray-100); */
    /* padding: var(--gap-size-2); */
    border-radius: var(--radius-2);
}

.ingredient-details__prices__list__item h5 {
    font-size: 12px;
}

.shelf-actions {
    display: grid;
    gap: var(--gap-size-2);
    grid-template-columns: 1fr 1fr 1fr;
}

.shelf-actions__action {
    display: flex;
    align-items: center;
    flex-direction: column;
    padding: var(--gap-size-2);
    text-align: center;
}

.shelf-actions__action svg {
    width: 32px;
    height: 32px;
    display: block;
    fill: var(--clr-gray-500);
}

svg.shelf-actions__action__status {
    width: 16px;
    height: 16px;
    display: block;
    color: green;
}

.shelf-actions__action small {
    line-height: 1.2;
    color: var(--clr-gray-400);
}

@media (max-width: 450px) {
    .shelf-actions {
        display: flex;
        flex-direction: column;
    }
}
</style>
