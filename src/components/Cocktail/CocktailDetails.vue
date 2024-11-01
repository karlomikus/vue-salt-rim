<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useEventListener } from '@vueuse/core'
import { micromark } from 'micromark'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTitle } from '@/composables/title'
import { useSaltRimToast } from '@/composables/toast.js'
import { useConfirm } from '@/composables/confirm.js'
import BarAssistantClient from '@/api/BarAssistantClient';
import PageHeader from '@/components/PageHeader.vue'
import SimilarCocktails from '@/components/Cocktail/SimilarCocktails.vue'
import IngredientSpotlight from '@/components/Ingredient/IngredientSpotlight.vue'
import OverlayLoader from '@/components/OverlayLoader.vue'
import UnitHandler from '@/UnitHandler'
import NoteDetails from '@/components/Note/NoteDetails.vue'
import NoteDialog from '@/components/Note/NoteDialog.vue'
import SaltRimDialog from '@/components/Dialog/SaltRimDialog.vue'
import CollectionDialog from '@/components/Collections/CollectionDialog.vue'
import CocktailCollections from '@/components/Collections/CollectionWidget.vue'
import PublicLinkDialog from '@/components/Cocktail/PublicLinkDialog.vue'
import GenerateImageDialog from '@/components/Cocktail/GenerateImageDialog.vue'
import Dropdown from '@/components/SaltRimDropdown.vue'
import type { components } from '@/api/api'
import Rating from '@/components/RatingActions.vue'
import DateFormatter from '@/components/DateFormatter.vue'
import AppState from '@/AppState'
import UnitConverter from '@/components/Units/UnitConverter.vue'
import UnitPicker from '@/components/Units/UnitPicker.vue'
import WakeLockToggle from '../WakeLockToggle.vue'

type Cocktail = components["schemas"]["Cocktail"]
type Note = components["schemas"]["Note"]
type ShoppingList = components["schemas"]["ShoppingList"]
type CocktailBasic = components["schemas"]["CocktailBasic"]

const { t } = useI18n()
const appState = new AppState()
const route = useRoute()
const router = useRouter()
const toast = useSaltRimToast()
const confirm = useConfirm()
const isLoading = ref(false)
const isLoadingNotes = ref(false)
const isLoadingShoppingList = ref(false)
const isLoadingShare = ref(false)
const isLoadingFavorite = ref(false)
const isFavorited = ref(false)
const showNoteDialog = ref(false)
const showCollectionDialog = ref(false)
const showPublicDialog = ref(false)
const showDownloadImageDialog = ref(false)
const cocktail = ref({} as Cocktail)
const userNotes = ref([] as Note[])
const userShoppingListIngredients = ref([] as ShoppingList[])
const servings = ref(1)
const currentUnit = ref(appState.defaultUnit)

watch(() => route.params.id as string, fetchCocktail, { immediate: true })

useEventListener(document, 'keydown', (e) => {
    if (e.key === "p" && e.ctrlKey === true) {
        e.preventDefault();
        const routeData = router.resolve({ name: 'print.cocktail', params: { id: cocktail.value.slug } });
        window.open(routeData.href, "_blank");
    }
})

const sortedImages = computed(() => {
    if (!cocktail.value.images) {
        return []
    }

    return cocktail.value.images.slice(0).sort((a, b) => (a?.sort ?? 0) - (b?.sort ?? 0))
})

const parsedInstructions = computed(() => {
    if (!cocktail.value.instructions) {
        return null
    }

    return micromark(cocktail.value.instructions)
})

const parsedDescription = computed(() => {
    if (!cocktail.value.description) {
        return null
    }

    return micromark(cocktail.value.description)
})

const parsedGarnish = computed(() => {
    if (!cocktail.value.garnish) {
        return null
    }

    return micromark(cocktail.value.garnish)
})

const totalLiquid = computed(() => {
    const amount = parseFloat(cocktail.value?.volume_ml?.toString() ?? '')

    return UnitHandler.print({ amount: amount, units: 'ml' }, currentUnit.value, servings.value) 
})

const missingIngredientIds = computed(() => {
    return cocktail.value?.ingredients?.filter(cocktailIngredient => {
        return !cocktailIngredient.in_shelf
            && !userShoppingListIngredients.value.map(i => i.ingredient.id).includes(cocktailIngredient.ingredient.id)
    }).map(cocktailIngredient => cocktailIngredient.ingredient.id) ?? []
})

async function fetchCocktail(idOrSlug: string) {
    isLoading.value = true
    cocktail.value = (await BarAssistantClient.getCocktail(idOrSlug))?.data ?? {} as Cocktail
    useTitle(cocktail.value.name)
    isLoading.value = false

    await fetchCocktailUserNotes()
    fetchFavorites()
}

async function deleteCocktail() {
    confirm.show(t('cocktail.confirm-delete', { name: cocktail.value.name }), {
        onResolved: (dialog: any) => {
            dialog.close()
            BarAssistantClient.deleteCocktail(cocktail.value.id).then(() => {
                toast.default(t('cocktail.delete-success', { name: cocktail.value.name }))
                router.push({ name: 'cocktails' })
                dialog.close()
            }).catch(e => {
                toast.error(e.message)
                dialog.close()
            })
        }
    })
}

async function fetchCocktailUserNotes() {
    isLoadingNotes.value = true
    userNotes.value = (await BarAssistantClient.getNotes({ 'filter[cocktail_id]': cocktail.value.id }))?.data ?? [] as Note[]
    isLoadingNotes.value = false
}

async function fetchShoppingList() {
    isLoadingShoppingList.value = true
    userShoppingListIngredients.value = (await BarAssistantClient.getShoppingList(appState.user.id))?.data ?? [] as ShoppingList[]
    isLoadingShoppingList.value = false
}

async function fetchFavorites() {
    isLoadingFavorite.value = true
    const favorites = (await BarAssistantClient.getUserCocktailFavorites(appState.user.id))?.data ?? [] as CocktailBasic[]
    isFavorited.value = favorites.map(f => f.id).includes(cocktail.value.id)
    isLoadingFavorite.value = false
}

async function copy() {
    isLoading.value = true
    BarAssistantClient.copyCocktail(cocktail.value.slug).then(resp => {
        isLoading.value = false
        toast.default(t('cocktail.copy-success'))
        router.push({ name: 'cocktails.form', query: { id: resp?.data?.id } })
    }).catch(e => {
        isLoading.value = false
        toast.error(e.message)
    })
}

function buildSubstituteString(sub: components["schemas"]["CocktailIngredientSubstitute"]) {
    return new String(sub.ingredient.name + ' ' + UnitHandler.print(sub, currentUnit.value, servings.value)).trim()
}

function shareFromFormat(format: string) {
    isLoadingShare.value = true
    BarAssistantClient.shareCocktail(cocktail.value.slug, { type: format, units: currentUnit.value }).then(resp => {
        isLoadingShare.value = false
        navigator.clipboard.writeText(resp?.data?.content ?? '').then(() => {
            toast.default(t('share.format-copied'))
        }, () => {
            toast.error(t('share.format-copy-failed'))
        })
    })
}

function favorite() {
    isLoadingFavorite.value = true
    BarAssistantClient.favoriteCocktail(cocktail.value.id).then(resp => {
        isFavorited.value = resp?.data?.is_favorited ?? false
        isLoadingFavorite.value = false
        toast.default(isFavorited.value ? t('cocktail.favorited', { name: cocktail.value.name }) : t('cocktail.unfavorited', { name: cocktail.value.name }))
    }).catch(e => {
        isLoadingFavorite.value = false
        toast.error(e.message)
    })
}

async function addMissingIngredients() {
    const postData = {
        ingredients: missingIngredientIds.value.map(id => ({ id: id, quantity: 1 }))
    }

    isLoading.value = true
    BarAssistantClient.addToShoppingList(appState.user.id, postData).then(async () => {
        toast.default(t('cocktail.ingredients-added-success', { total: missingIngredientIds.value.length }))
        await fetchShoppingList()
        isLoading.value = false
    }).catch(e => {
        toast.error(e.message)
        isLoading.value = false
    })
}

fetchShoppingList()
</script>

<template>
    <OverlayLoader v-if="!cocktail.id" />
    <div v-else>
        <OverlayLoader v-if="isLoading" />
        <PageHeader>
            {{ t(cocktail.name) }}
            <small>
                <DateFormatter :date="cocktail.created_at" format="short" /> <template v-if="cocktail?.updated_user">&middot; {{ cocktail.updated_user.name }}</template>
            </small>
        </PageHeader>
        <article class="cocktail-details">
            <div class="cocktail-details__column-image">
                <div class="cocktail-details__graphic">
                    <swiper-container v-if="cocktail.images && cocktail.images.length > 0" navigation="true" :pagination="{clickable: true}" follow-finger="false">
                        <swiper-slide v-for="image in sortedImages" :key="image.sort">
                            <img :src="image.url" :alt="image.copyright ?? ''" />
                            <div v-if="image.copyright" class="cocktail-details__graphic__copyright">{{ t('imageupload.copyright-notice', { copyright: image.copyright }) }}</div>
                        </swiper-slide>
                    </swiper-container>
                    <img v-else src="/no-cocktail.jpg" alt="This cocktail does not have an image." />
                </div>
            </div>
            <div class="cocktail-details__column-sidebar">
                <h3 class="page-subtitle" style="margin-top: 0;">{{ t('cocktail-collections') }}</h3>
                <CocktailCollections :cocktail="cocktail" @cocktail-removed-from-collection="fetchCocktail" @add-to-collection="showCollectionDialog = !showCollectionDialog"></CocktailCollections>
                <template v-if="cocktail.ingredients && cocktail.ingredients.length > 0">
                    <h3 class="page-subtitle">{{ t('ingredient.spotlight') }}</h3>
                    <IngredientSpotlight :id="cocktail.ingredients[0].ingredient.id"></IngredientSpotlight>
                </template>
                <h3 class="page-subtitle">{{ t('cocktails-similar') }}</h3>
                <SimilarCocktails :from-cocktail="cocktail"></SimilarCocktails>
            </div>
            <div class="cocktail-details__column-content">
                <div class="cocktail-details__actions">
                    <button type="button" class="button button-circle" @click="favorite">
                        <OverlayLoader v-if="isLoadingFavorite" />
                        <svg v-if="!isFavorited" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="none" d="M0 0H24V24H0z" />
                            <path d="M20.243 4.757c2.262 2.268 2.34 5.88.236 8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236 2.265-2.264 5.888-2.34 8.244-.228 2.349-2.109 5.979-2.039 8.242.228zM5.172 6.172c-1.49 1.49-1.565 3.875-.192 5.451L12 18.654l7.02-7.03c1.374-1.577 1.299-3.959-.193-5.454-1.487-1.49-3.881-1.562-5.453-.186l-4.202 4.203-1.415-1.414 2.825-2.827-.082-.069c-1.575-1.265-3.877-1.157-5.328.295z" />
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#C6375F">
                            <path fill="none" d="M0 0H24V24H0z" />
                            <path d="M20.243 4.757c2.262 2.268 2.34 5.88.236 8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236C5.515 3 8.093 2.56 10.261 3.44L6.343 7.358l1.414 1.415L12 4.53l-.013-.014.014.013c2.349-2.109 5.979-2.039 8.242.228z" />
                        </svg>
                    </button>
                    <Dropdown>
                        <template #default="{ toggleDropdown }">
                            <button type="button" class="button button-circle" @click="toggleDropdown">
                                <OverlayLoader v-if="isLoadingShare" />
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                    <path fill="none" d="M0 0h24v24H0z" />
                                    <path d="M13.12 17.023l-4.199-2.29a4 4 0 1 1 0-5.465l4.2-2.29a4 4 0 1 1 .959 1.755l-4.2 2.29a4.008 4.008 0 0 1 0 1.954l4.199 2.29a4 4 0 1 1-.959 1.755zM6 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm11-6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                                </svg>
                            </button>
                        </template>
                        <template #content>
                            <RouterLink class="dropdown-menu__item" target="_blank" :to="{ name: 'print.cocktail', params: { id: cocktail.slug } }">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                    <path fill="none" d="M0 0h24v24H0z" />
                                    <path d="M6 19H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h3V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v4h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-3v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-2zm0-2v-1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1h2V9H4v8h2zM8 4v3h8V4H8zm0 13v3h8v-3H8zm-3-7h3v2H5v-2z" />
                                </svg>
                                {{ t('print-recipe') }}
                            </RouterLink>
                            <SaltRimDialog v-if="cocktail.access && cocktail.access.can_edit" v-model="showPublicDialog">
                                <template #trigger>
                                    <a class="dropdown-menu__item" href="#makepublic" @click.prevent="showPublicDialog = !showPublicDialog">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                            <path fill="none" d="M0 0h24v24H0z" />
                                            <path d="M18.364 15.536L16.95 14.12l1.414-1.414a5 5 0 1 0-7.071-7.071L9.879 7.05 8.464 5.636 9.88 4.222a7 7 0 0 1 9.9 9.9l-1.415 1.414zm-2.828 2.828l-1.415 1.414a7 7 0 0 1-9.9-9.9l1.415-1.414L7.05 9.88l-1.414 1.414a5 5 0 1 0 7.071 7.071l1.414-1.414 1.415 1.414zm-.708-10.607l1.415 1.415-7.071 7.07-1.415-1.414 7.071-7.07z" />
                                        </svg>
                                        {{ t('create-public-link') }}
                                    </a>
                                </template>
                                <template #dialog>
                                    <PublicLinkDialog :cocktail="cocktail" @public-dialog-closed="showPublicDialog = false; fetchCocktail(cocktail.slug)" />
                                </template>
                            </SaltRimDialog>
                            <SaltRimDialog v-model="showDownloadImageDialog">
                                <template #trigger>
                                    <a class="dropdown-menu__item" href="#generateimage" @click.prevent="showDownloadImageDialog = !showDownloadImageDialog">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                            <path fill="none" d="M0 0h24v24H0z" />
                                            <path d="M4.828 21l-.02.02-.021-.02H2.992A.993.993 0 0 1 2 20.007V3.993A1 1 0 0 1 2.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 0 1-.992.993H4.828zM20 15V5H4v14L14 9l6 6zm0 2.828l-6-6L6.828 19H20v-1.172zM8 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
                                        </svg>
                                        {{ t('generate-image') }}
                                    </a>
                                </template>
                                <template #dialog>
                                    <GenerateImageDialog :cocktail="cocktail" @generate-image-dialog-closed="showDownloadImageDialog = false" />
                                </template>
                            </SaltRimDialog>
                            <hr class="dropdown-menu__separator">
                            <a class="dropdown-menu__item" href="#copy" @click.prevent="shareFromFormat('json')">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                    <path d="M4 18V14.3C4 13.4716 3.32843 12.8 2.5 12.8H2V11.2H2.5C3.32843 11.2 4 10.5284 4 9.7V6C4 4.34315 5.34315 3 7 3H8V5H7C6.44772 5 6 5.44772 6 6V10.1C6 10.9858 5.42408 11.7372 4.62623 12C5.42408 12.2628 6 13.0142 6 13.9V18C6 18.5523 6.44772 19 7 19H8V21H7C5.34315 21 4 19.6569 4 18ZM20 14.3V18C20 19.6569 18.6569 21 17 21H16V19H17C17.5523 19 18 18.5523 18 18V13.9C18 13.0142 18.5759 12.2628 19.3738 12C18.5759 11.7372 18 10.9858 18 10.1V6C18 5.44772 17.5523 5 17 5H16V3H17C18.6569 3 20 4.34315 20 6V9.7C20 10.5284 20.6716 11.2 21.5 11.2H22V12.8H21.5C20.6716 12.8 20 13.4716 20 14.3Z"></path>
                                </svg>
                                {{ t('share.copy-json') }}
                            </a>
                            <a class="dropdown-menu__item" href="#copy" @click.prevent="shareFromFormat('json-ld')">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"><path d="M15 3C15.5523 3 16 3.44772 16 4V8C16 8.55228 15.5523 9 15 9H13V11H17C17.5523 11 18 11.4477 18 12V15H20C20.5523 15 21 15.4477 21 16V20C21 20.5523 20.5523 21 20 21H14C13.4477 21 13 20.5523 13 20V16C13 15.4477 13.4477 15 14 15H16V13H8V15H10C10.5523 15 11 15.4477 11 16V20C11 20.5523 10.5523 21 10 21H4C3.44772 21 3 20.5523 3 20V16C3 15.4477 3.44772 15 4 15H6V12C6 11.4477 6.44772 11 7 11H11V9H9C8.44772 9 8 8.55228 8 8V4C8 3.44772 8.44772 3 9 3H15ZM9 17H5V19H9V17ZM19 17H15V19H19V17ZM14 5H10V7H14V5Z"></path></svg>
                                {{ t('share.copy-json-ld') }}
                            </a>
                            <a class="dropdown-menu__item" href="#copy" @click.prevent="shareFromFormat('yaml')">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                    <path d="M6.9998 6V3C6.9998 2.44772 7.44752 2 7.9998 2H19.9998C20.5521 2 20.9998 2.44772 20.9998 3V17C20.9998 17.5523 20.5521 18 19.9998 18H16.9998V20.9991C16.9998 21.5519 16.5499 22 15.993 22H4.00666C3.45059 22 3 21.5554 3 20.9991L3.0026 7.00087C3.0027 6.44811 3.45264 6 4.00942 6H6.9998ZM5.00242 8L5.00019 20H14.9998V8H5.00242ZM8.9998 6H16.9998V16H18.9998V4H8.9998V6ZM7 11H13V13H7V11ZM7 15H13V17H7V15Z"></path>
                                </svg>
                                {{ t('share.copy-yaml') }}
                            </a>
                            <a class="dropdown-menu__item" href="#copy" @click.prevent="shareFromFormat('markdown')">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                    <path d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM4 5V19H20V5H4ZM7 15.5H5V8.5H7L9 10.5L11 8.5H13V15.5H11V11.5L9 13.5L7 11.5V15.5ZM18 12.5H20L17 15.5L14 12.5H16V8.5H18V12.5Z"></path>
                                </svg>
                                {{ t('share.copy-md') }}
                            </a>
                            <a class="dropdown-menu__item" href="#copy" @click.prevent="shareFromFormat('xml')">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M15 4H5V20H19V8H15V4ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918ZM17.6569 12L14.1213 15.5355L12.7071 14.1213L14.8284 12L12.7071 9.87868L14.1213 8.46447L17.6569 12ZM6.34315 12L9.87868 8.46447L11.2929 9.87868L9.17157 12L11.2929 14.1213L9.87868 15.5355L6.34315 12Z"></path></svg>
                                {{ t('share.copy-xml') }}
                            </a>
                        </template>
                    </Dropdown>
                    <Dropdown>
                        <template #default="{ toggleDropdown }">
                            <button type="button" class="button button-circle" @click="toggleDropdown"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path fill="none" d="M0 0h24v24H0z" />
                                <path d="M12 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 14c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                            </svg></button>
                        </template>
                        <template #content>
                            <RouterLink v-if="cocktail.access && cocktail.access.can_edit" class="dropdown-menu__item" :to="{ name: 'cocktails.form', query: { id: cocktail.id } }">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                    <path fill="none" d="M0 0h24v24H0z" />
                                    <path d="M6.414 16L16.556 5.858l-1.414-1.414L5 14.586V16h1.414zm.829 2H3v-4.243L14.435 2.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 18zM3 20h18v2H3v-2z" />
                                </svg>
                                {{ t('edit') }}
                            </RouterLink>
                            <a v-if="cocktail.access && cocktail.access.can_edit" class="dropdown-menu__item" target="_blank" href="#" @click.prevent="copy">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"><path d="M6.9998 6V3C6.9998 2.44772 7.44752 2 7.9998 2H19.9998C20.5521 2 20.9998 2.44772 20.9998 3V17C20.9998 17.5523 20.5521 18 19.9998 18H16.9998V20.9991C16.9998 21.5519 16.5499 22 15.993 22H4.00666C3.45059 22 3 21.5554 3 20.9991L3.0026 7.00087C3.0027 6.44811 3.45264 6 4.00942 6H6.9998ZM5.00242 8L5.00019 20H14.9998V8H5.00242ZM8.9998 6H16.9998V16H18.9998V4H8.9998V6Z"></path></svg>
                                {{ t('cocktail.copy-action') }}
                            </a>
                            <SaltRimDialog v-model="showCollectionDialog">
                                <template #trigger>
                                    <a class="dropdown-menu__item" href="#" @click.prevent="showCollectionDialog = !showCollectionDialog">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                            <path fill="none" d="M0 0h24v24H0z" />
                                            <path d="M12.414 5H21a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7.414l2 2zM4 5v14h16V7h-8.414l-2-2H4zm7 7V9h2v3h3v2h-3v3h-2v-3H8v-2h3z" />
                                        </svg>
                                        {{ t('collections.add-to') }}
                                    </a>
                                </template>
                                <template #dialog>
                                    <CollectionDialog :cocktails="[cocktail.id]" @collection-dialog-closed="showCollectionDialog = false; fetchCocktail(cocktail.slug)" />
                                </template>
                            </SaltRimDialog>
                            <SaltRimDialog v-if="cocktail.access && cocktail.access.can_add_note" v-model="showNoteDialog">
                                <template #trigger>
                                    <a class="dropdown-menu__item" href="#" @click.prevent="showNoteDialog = !showNoteDialog">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                            <path d="M21 15L15 20.996L4.00221 21C3.4487 21 3 20.5551 3 20.0066V3.9934C3 3.44476 3.44495 3 3.9934 3H20.0066C20.5552 3 21 3.45576 21 4.00247V15ZM19 5H5V19H13V14C13 13.4872 13.386 13.0645 13.8834 13.0067L14 13L19 12.999V5ZM18.171 14.999L15 15V18.169L18.171 14.999Z"></path>
                                        </svg>
                                        {{ t('note.add') }}
                                    </a>
                                </template>
                                <template #dialog>
                                    <NoteDialog :resource-id="cocktail.id" resource="cocktail" @note-dialog-closed="showNoteDialog = false; fetchCocktailUserNotes()" />
                                </template>
                            </SaltRimDialog>
                            <a v-if="cocktail.source" class="dropdown-menu__item" target="_blank" :href="cocktail.source">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                    <path fill="none" d="M0 0h24v24H0z" />
                                    <path d="M10 6v2H5v11h11v-5h2v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6zm11-3v8h-2V6.413l-7.793 7.794-1.414-1.414L17.585 5H13V3h8z" />
                                </svg>
                                {{ t('cocktail.source') }}
                            </a>
                            <hr v-if="cocktail.access && cocktail.access.can_delete" class="dropdown-menu__separator">
                            <a v-if="cocktail.access && cocktail.access.can_delete" class="dropdown-menu__item" href="javascript:;" @click.prevent="deleteCocktail">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                    <path fill="none" d="M0 0h24v24H0z" />
                                    <path d="M7 4V2h10v2h5v2h-2v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6H2V4h5zM6 6v14h12V6H6zm3 3h2v8H9V9zm4 0h2v8h-2V9z" />
                                </svg>
                                {{ t('remove') }}
                            </a>
                        </template>
                    </Dropdown>
                </div>
                <div class="block-container block-container--padded">
                    <h3 class="details-block-container__title">{{ t('description') }}</h3>
                    <div class="item-details__chips">
                        <div v-if="cocktail.tags && cocktail.tags.length > 0" class="item-details__chips__group">
                            <div class="item-details__chips__group__title">{{ t('tag.tags') }}:</div>
                            <ul class="chips-list">
                                <li v-for="tag in cocktail.tags" :key="tag.id">
                                    <RouterLink class="chip" :to="{ name: 'cocktails', query: { 'filter[tag_id]': tag.id } }">{{ tag.name }}</RouterLink>
                                </li>
                            </ul>
                        </div>
                        <div v-if="cocktail.glass" class="item-details__chips__group">
                            <div class="item-details__chips__group__title">{{ t('glass-type.title') }}:</div>
                            <ul class="chips-list">
                                <li>
                                    <RouterLink class="chip" :to="{ name: 'cocktails', query: { 'filter[glass_id]': cocktail.glass.id } }">{{ cocktail.glass.name }}</RouterLink>
                                </li>
                            </ul>
                        </div>
                        <div v-if="cocktail.method" class="item-details__chips__group">
                            <div class="item-details__chips__group__title">{{ t('method.title') }}:</div>
                            <ul class="chips-list">
                                <li>
                                    <RouterLink class="chip" :to="{ name: 'cocktails', query: { 'filter[cocktail_method_id]': cocktail.method.id } }">{{ t('method.' + cocktail.method.name) }}</RouterLink>
                                </li>
                            </ul>
                        </div>
                        <div v-if="cocktail.abv && cocktail.abv > 0" class="item-details__chips__group">
                            <div class="item-details__chips__group__title">{{ t('ABV') }}:</div>
                            <ul class="chips-list">
                                <li>
                                    <RouterLink class="chip" :to="{ name: 'cocktails', query: { 'filter[abv_min]': cocktail.abv } }">{{ cocktail.abv }}%</RouterLink>
                                </li>
                            </ul>
                        </div>
                        <div v-if="cocktail.rating" class="item-details__chips__group">
                            <div class="item-details__chips__group__title">{{ t('avg-rating') }}:</div>
                            <ul class="chips-list">
                                <li>
                                    <RouterLink class="chip" :to="{ name: 'cocktails', query: { 'filter[user_rating_min]': cocktail.rating.average } }">{{ cocktail.rating.average }} ★</RouterLink>
                                </li>
                            </ul>
                        </div>
                        <div class="item-details__chips__group">
                            <div class="item-details__chips__group__title">{{ t('your-rating') }}:</div>
                            <Rating :id="cocktail.id" :rating="(cocktail.rating && cocktail.rating.user) ?? 0" type="cocktail"></Rating>
                        </div>
                        <div v-if="cocktail.public_id" class="item-details__chips__group">
                            <div class="item-details__chips__group__title">{{ t('public-link') }}:</div>
                            <RouterLink :to="{ name: 'e.cocktail', params: { ulid: cocktail.public_id, slug: cocktail.slug } }" target="_blank">{{ t('click-here') }}</RouterLink>
                        </div>
                    </div>
                    <div class="has-markdown" v-html="parsedDescription"></div>
                </div>
                <UnitConverter @unit-changed="(u: string) => currentUnit = u">
                    <div v-if="cocktail.ingredients && cocktail.ingredients.length > 0" class="block-container block-container--padded">
                        <h3 class="details-block-container__title">{{ t('ingredient.ingredients') }}</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; margin-bottom: 1rem;">
                            <div class="button-group">
                                <h4>{{ t('servings') }}:</h4>
                                <button @click="servings <= 1 ? servings = 1 : servings--">-</button>
                                <button class="is-active">{{ servings }}</button>
                                <button @click="servings++">+</button>
                            </div>
                            <UnitPicker></UnitPicker>
                        </div>
                        <ul class="cocktail-ingredients">
                            <li v-for="ing in cocktail.ingredients" :key="ing.sort">
                                <div class="cocktail-ingredients__ingredient">
                                    <span class="ingredient-shelf-status" :class="{'ingredient-shelf-status--in-shelf': ing.in_shelf, 'ingredient-shelf-status--missing': !ing.in_shelf, 'ingredient-shelf-status--substitute': !ing.in_shelf && ing.in_shelf_as_substitute, 'ingredient-shelf-status--complex': !ing.in_shelf && ing.in_shelf_as_complex_ingredient}"></span>
                                    <RouterLink class="cocktail-ingredients__ingredient__name" :to="{ name: 'ingredients.show', params: { id: ing.ingredient.slug } }" data-ingredient="preferred">
                                        {{ ing.ingredient.name }} <span v-if="ing.note" class="cocktail-ingredients__flags__flag">&ndash; {{ ing.note }}</span> <small v-if="ing.optional">({{ t('optional') }})</small>
                                    </RouterLink>
                                    <div class="cocktail-ingredients__ingredient__amount">{{ UnitHandler.print(ing, currentUnit, servings) }}</div>
                                </div>
                                <div class="cocktail-ingredients__flags">
                                    <div v-if="ing.substitutes && ing.substitutes.length > 0" class="cocktail-ingredients__flags__flag">
                                        <div v-if="!ing.in_shelf && ing.in_shelf_as_substitute" class="cocktail-ingredients__flags__flag">&middot; {{ t('cocktail.missing-ing-sub-available') }}</div>
                                        &middot; {{ t('substitutes') }}:
                                        <template v-for="(sub, index) in ing.substitutes" :key="index">
                                            <RouterLink :style="{'font-weight': sub.in_shelf ? 'bold' : 'normal'}" :to="{ name: 'ingredients.show', params: { id: sub.ingredient.slug } }" data-ingredient="substitute">
                                                {{ buildSubstituteString(sub) }}
                                            </RouterLink>
                                            <template v-if="index + 1 !== ing.substitutes.length">, </template>
                                        </template>
                                    </div>
                                    <div v-if="!ing.in_shelf && !ing.in_shelf_as_substitute && !ing.in_shelf_as_complex_ingredient" class="cocktail-ingredients__flags__flag">&middot; {{ t('cocktail.missing-ing') }}</div>
                                    <div v-if="!ing.in_shelf && ing.in_shelf_as_complex_ingredient" class="cocktail-ingredients__flags__flag">&middot; {{ t('cocktail.missing-ing-complex') }}</div>
                                    <div v-if="userShoppingListIngredients.map(i => i.ingredient.id).includes(ing.ingredient.id)" class="cocktail-ingredients__flags__flag">&middot; {{ t('ingredient.on-shopping-list') }}</div>
                                </div>
                            </li>
                        </ul>
                        <div v-if="cocktail.volume_ml" class="cocktail-ingredients__total-amount">
                            Approx: {{ totalLiquid }} <span v-show="(cocktail?.calories ?? 0) > 0">&middot; {{ cocktail.calories?.toFixed(0) }} kcal</span> <span v-show="(cocktail?.alcohol_units ?? 0) > 0">&middot; {{ cocktail.alcohol_units?.toFixed(2) }} units</span>
                        </div>
                        <a v-show="missingIngredientIds.length > 0" href="#" @click.prevent="addMissingIngredients">{{ t('cocktail.missing-ing-action') }}</a>
                    </div>
                </UnitConverter>
                <div class="block-container block-container--padded has-markdown">
                    <h3 class="details-block-container__title">{{ t('instructions') }}</h3>
                    <WakeLockToggle></WakeLockToggle>
                    <div v-html="parsedInstructions"></div>
                    <div v-if="cocktail.utensils && cocktail.utensils.length > 0">
                        <br>
                        <strong>{{ t('utensils.title') }}</strong>: {{ cocktail.utensils.map(u => u.name).join(', ') }}
                    </div>
                </div>
                <div v-if="cocktail.garnish" class="block-container block-container--padded">
                    <h3 class="details-block-container__title">{{ t('garnish') }}</h3>
                    <div v-html="parsedGarnish"></div>
                </div>
                <div v-if="userNotes.length > 0" class="block-container block-container--padded">
                    <OverlayLoader v-if="isLoadingNotes" />
                    <h3 class="details-block-container__title">{{ t('notes') }}</h3>
                    <NoteDetails v-for="note in userNotes" :key="note.id" :note="note" @note-deleted="fetchCocktailUserNotes"></NoteDetails>
                </div>
                <!-- <div class="cocktail-details__navigation">
                    <RouterLink v-if="cocktail.navigation.prev" :to="{ name: 'cocktails.show', params: { id: cocktail.navigation.prev } }">{{ t('pagination.cocktail-prev') }}</RouterLink>
                    <RouterLink v-if="cocktail.navigation.next" :to="{ name: 'cocktails.show', params: { id: cocktail.navigation.next } }">{{ t('pagination.cocktail-next') }}</RouterLink>
                </div> -->
            </div>
        </article>
    </div>
</template>

<style scoped>
swiper-container {
    --swiper-theme-color: #fff;
    --swiper-pagination-bottom: 1.5rem;
    --swiper-pagination-bullet-size: 0.65rem;
    --swiper-navigation-size: 2rem;
    --swiper-pagination-bullet-inactive-color: #fff;
}

.cocktail-details {
    display: grid;
    gap: var(--gap-size-3);
    grid-template-columns: 500px minmax(0, 1fr);
    grid-template-rows: 1fr;
    grid-template-areas:
        "image content"
        "sidebar content";
}

@media (max-width: 1000px) {
    .cocktail-details {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    }
}

@media (max-width: 800px) {
    .cocktail-details {
        grid-template-columns: minmax(0, 1fr);
        grid-template-areas:
            "image"
            "content"
            "sidebar";
    }
}

.cocktail-details__column-image {
    grid-area: image;
}

.cocktail-details__column-content {
    grid-area: content;
}

.cocktail-details__column-sidebar {
    grid-area: sidebar;
}

.cocktail-details__graphic {
    background-color: #fff;
    border-radius: var(--radius-3);
    overflow: hidden;
    isolation: isolate;
}

.cocktail-details__graphic img {
    width: 100%;
    height: 700px;
    object-fit: cover;
    display: block;
}

@media (max-width: 450px) {
    .cocktail-details__graphic img {
        height: 400px;
    }
}

.cocktail-details__graphic__copyright {
    position: absolute;
    top: 1rem;
    left: 1rem;
    display: inline-block;
    background-color: rgba(0, 0, 0, .5);
    color: #fff;
    border-radius: var(--radius-3);
    padding: 2px 7px;
    font-size: 0.7rem;
    text-shadow: 1px 1px 0 rgba(0, 0, 0, .8);
}

.cocktail-ingredients {
    --ci-clr-list-bg: var(--clr-accent-purple);
    list-style: none;
    padding: 0;
    margin: 0;
}

/* .dark-theme .cocktail-ingredients {
    --ci-clr-list-bg: rgba(0, 0, 0, .4);
} */

.cocktail-ingredients__total-amount,
.cocktail-ingredients__total-amount span {
    text-align: right;
    font-weight: var(--fw-bold);
    font-size: 0.85rem;
}

.cocktail-ingredients li {
    background-color: var(--ci-clr-list-bg);
    color: var(--clr-accent-purple-dark);
    border-radius: var(--radius-2);
    margin-bottom: 0.5rem;
    padding: 0.5rem 0.75rem;
}

.dark-theme .cocktail-ingredients li {
    color: var(--clr-gray-300);
}

.cocktail-ingredients__ingredient {
    display: flex;
}

.cocktail-ingredients__flags {
    font-size: 0.7rem;
}

.cocktail-ingredients__ingredient__name {
    font-weight: var(--fw-bold);
}

.cocktail-ingredients__ingredient__name small {
    font-size: 0.70rem;
}

.cocktail-ingredients__ingredient__amount {
    font-weight: var(--fw-bold);
    font-size: 1.2rem;
    margin-left: auto;
    text-align: right;
}

@media (max-width: 450px) {
    .cocktail-ingredients__ingredient__amount {
        font-size: 1rem;
    }
}

.cocktail-details__actions {
    position: absolute;
    right: 20px;
    top: -25px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    column-gap: var(--gap-size-1);
    z-index: 1;
}

@media (max-width: 450px) {
    .cocktail-details__actions {
        right: 10px;
        top: -20px;
    }
}
</style>
