<template>
    <OverlayLoader v-if="!cocktail.id" />
    <div v-else class="cocktail-details">
        <OverlayLoader v-if="isLoading" />
        <div class="cocktail-details__title">
            <h2>{{ cocktail.name }}</h2>
            <p>{{ $t('added-on-by', { date: createdDate, name: cocktail.created_user.name }) }}</p>
        </div>
        <div v-if="cocktail.id" class="cocktail-details__graphic">
            <swiper v-if="cocktail.images.length > 0" :modules="sliderModules" navigation :pagination="{ clickable: true }" :follow-finger="false">
                <swiper-slide v-for="image in sortedImages" :key="image.sort">
                    <img :src="image.url" :alt="image.copyright" />
                    <div v-if="image.copyright" class="cocktail-details__graphic__copyright">{{ $t('image-copyright-notice', { copyright: image.copyright }) }}</div>
                </swiper-slide>
            </swiper>
            <img v-else src="/no-cocktail.jpg" alt="This cocktail does not have an image." />
        </div>
        <div class="cocktail-details__main">
            <div class="cocktail-details__main__content">
                <div class="details-block-container details-block-container--blue cocktail-details-box" style="margin-top: 0">
                    <h3 class="details-block-container__title">{{ $t('description') }}</h3>
                    <div class="item-details__chips">
                        <div v-if="cocktail.tags.length > 0" class="item-details__chips__group">
                            <div class="item-details__chips__group__title">{{ $t('tags') }}:</div>
                            <ul class="chips-list">
                                <li v-for="tag in cocktail.tags" :key="tag.id">
                                    <RouterLink :to="{ name: 'cocktails', query: { 'filter[tag_id]': tag.id } }">{{ tag.name }}</RouterLink>
                                </li>
                            </ul>
                        </div>
                        <div v-if="cocktail.glass" class="item-details__chips__group">
                            <div class="item-details__chips__group__title">{{ $t('glass-type') }}:</div>
                            <ul class="chips-list">
                                <li>
                                    <RouterLink :to="{ name: 'cocktails', query: { 'filter[glass_id]': cocktail.glass.id } }">{{ cocktail.glass.name }}</RouterLink>
                                </li>
                            </ul>
                        </div>
                        <div v-if="cocktail.method" class="item-details__chips__group">
                            <div class="item-details__chips__group__title">{{ $t('method') }}:</div>
                            <ul class="chips-list">
                                <li>
                                    <RouterLink :to="{ name: 'cocktails', query: { 'filter[cocktail_method_id]': cocktail.method.id } }">{{ $t('method.' + cocktail.method.name) }}</RouterLink>
                                </li>
                            </ul>
                        </div>
                        <div v-if="cocktail.abv && cocktail.abv > 0" class="item-details__chips__group">
                            <div class="item-details__chips__group__title">{{ $t('ABV') }}:</div>
                            <ul class="chips-list">
                                <li>
                                    <RouterLink :to="{ name: 'cocktails', query: { 'filter[abv_min]': cocktail.abv } }">{{ cocktail.abv }}%</RouterLink>
                                </li>
                            </ul>
                        </div>
                        <div class="item-details__chips__group">
                            <div class="item-details__chips__group__title">{{ $t('avg-rating') }}:</div>
                            <ul class="chips-list">
                                <li>
                                    <RouterLink :to="{ name: 'cocktails', query: { 'filter[user_rating_min]': cocktail.average_rating } }">{{ cocktail.average_rating }} ★</RouterLink>
                                </li>
                            </ul>
                        </div>
                        <div class="item-details__chips__group">
                            <div class="item-details__chips__group__title">{{ $t('your-rating') }}:</div>
                            <Rating :id="cocktail.id" :rating="cocktail.user_rating" type="cocktail"></Rating>
                        </div>
                        <div v-if="cocktail.public_id" class="item-details__chips__group">
                            <div class="item-details__chips__group__title">{{ $t('public-link') }}:</div>
                            <RouterLink :to="{ name: 'e.cocktail', params: { ulid: cocktail.public_id, slug: cocktail.slug } }" target="_blank">{{ $t('click-here') }}</RouterLink>
                        </div>
                    </div>
                    <div class="cocktail-details-box__description" v-html="parsedDescription"></div>
                    <div class="cocktail-details-box__actions">
                        <button type="button" class="button-circle" @click="favorite">
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
                                <button type="button" class="button-circle" @click="toggleDropdown">
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
                                    {{ $t('print-recipe') }}
                                </RouterLink>
                                <SaltRimDialog v-model="showPublicDialog">
                                    <template #trigger>
                                        <a class="dropdown-menu__item" href="#makepublic" @click.prevent="showPublicDialog = !showPublicDialog">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                                <path fill="none" d="M0 0h24v24H0z" />
                                                <path d="M18.364 15.536L16.95 14.12l1.414-1.414a5 5 0 1 0-7.071-7.071L9.879 7.05 8.464 5.636 9.88 4.222a7 7 0 0 1 9.9 9.9l-1.415 1.414zm-2.828 2.828l-1.415 1.414a7 7 0 0 1-9.9-9.9l1.415-1.414L7.05 9.88l-1.414 1.414a5 5 0 1 0 7.071 7.071l1.414-1.414 1.415 1.414zm-.708-10.607l1.415 1.415-7.071 7.07-1.415-1.414 7.071-7.07z" />
                                            </svg>
                                            {{ $t('create-public-link') }}
                                        </a>
                                    </template>
                                    <template #dialog>
                                        <PublicLinkDialog :cocktail="cocktail" @public-dialog-closed="showPublicDialog = false; fetchCocktail()" />
                                    </template>
                                </SaltRimDialog>
                                <SaltRimDialog v-model="showDownloadImageDialog">
                                    <template #trigger>
                                        <a class="dropdown-menu__item" href="#generateimage" @click.prevent="showDownloadImageDialog = !showDownloadImageDialog">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                                <path fill="none" d="M0 0h24v24H0z" />
                                                <path d="M4.828 21l-.02.02-.021-.02H2.992A.993.993 0 0 1 2 20.007V3.993A1 1 0 0 1 2.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 0 1-.992.993H4.828zM20 15V5H4v14L14 9l6 6zm0 2.828l-6-6L6.828 19H20v-1.172zM8 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
                                            </svg>
                                            {{ $t('generate-image') }}
                                        </a>
                                    </template>
                                    <template #dialog>
                                        <GenerateImageDialog :cocktail="cocktail" @generate-image-dialog-closed="showDownloadImageDialog = false" />
                                    </template>
                                </SaltRimDialog>
                                <a class="dropdown-menu__item" href="#copy" @click.prevent="shareFromFormat('text')">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                        <path d="M6.9998 6V3C6.9998 2.44772 7.44752 2 7.9998 2H19.9998C20.5521 2 20.9998 2.44772 20.9998 3V17C20.9998 17.5523 20.5521 18 19.9998 18H16.9998V20.9991C16.9998 21.5519 16.5499 22 15.993 22H4.00666C3.45059 22 3 21.5554 3 20.9991L3.0026 7.00087C3.0027 6.44811 3.45264 6 4.00942 6H6.9998ZM5.00242 8L5.00019 20H14.9998V8H5.00242ZM8.9998 6H16.9998V16H18.9998V4H8.9998V6ZM7 11H13V13H7V11ZM7 15H13V17H7V15Z"></path>
                                    </svg>
                                    {{ $t('share-copy-text') }}
                                </a>
                                <a class="dropdown-menu__item" href="#copy" @click.prevent="shareFromFormat('json')">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                        <path d="M4 18V14.3C4 13.4716 3.32843 12.8 2.5 12.8H2V11.2H2.5C3.32843 11.2 4 10.5284 4 9.7V6C4 4.34315 5.34315 3 7 3H8V5H7C6.44772 5 6 5.44772 6 6V10.1C6 10.9858 5.42408 11.7372 4.62623 12C5.42408 12.2628 6 13.0142 6 13.9V18C6 18.5523 6.44772 19 7 19H8V21H7C5.34315 21 4 19.6569 4 18ZM20 14.3V18C20 19.6569 18.6569 21 17 21H16V19H17C17.5523 19 18 18.5523 18 18V13.9C18 13.0142 18.5759 12.2628 19.3738 12C18.5759 11.7372 18 10.9858 18 10.1V6C18 5.44772 17.5523 5 17 5H16V3H17C18.6569 3 20 4.34315 20 6V9.7C20 10.5284 20.6716 11.2 21.5 11.2H22V12.8H21.5C20.6716 12.8 20 13.4716 20 14.3Z"></path>
                                    </svg>
                                    {{ $t('share-copy-json') }}
                                </a>
                                <a class="dropdown-menu__item" href="#copy" @click.prevent="shareFromFormat('markdown')">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                        <path d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM4 5V19H20V5H4ZM7 15.5H5V8.5H7L9 10.5L11 8.5H13V15.5H11V11.5L9 13.5L7 11.5V15.5ZM18 12.5H20L17 15.5L14 12.5H16V8.5H18V12.5Z"></path>
                                    </svg>
                                    {{ $t('share-copy-md') }}
                                </a>
                            </template>
                        </Dropdown>
                        <Dropdown>
                            <template #default="{ toggleDropdown }">
                                <button type="button" class="button-circle" @click="toggleDropdown"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                    <path fill="none" d="M0 0h24v24H0z" />
                                    <path d="M12 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 14c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                </svg></button>
                            </template>
                            <template #content>
                                <RouterLink class="dropdown-menu__item" :to="{ name: 'cocktails.form', query: { id: cocktail.id } }">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                        <path fill="none" d="M0 0h24v24H0z" />
                                        <path d="M6.414 16L16.556 5.858l-1.414-1.414L5 14.586V16h1.414zm.829 2H3v-4.243L14.435 2.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 18zM3 20h18v2H3v-2z" />
                                    </svg>
                                    {{ $t('edit') }}
                                </RouterLink>
                                <SaltRimDialog v-model="showCollectionDialog">
                                    <template #trigger>
                                        <a class="dropdown-menu__item" href="#" @click.prevent="showCollectionDialog = !showCollectionDialog">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                                <path fill="none" d="M0 0h24v24H0z" />
                                                <path d="M12.414 5H21a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7.414l2 2zM4 5v14h16V7h-8.414l-2-2H4zm7 7V9h2v3h3v2h-3v3h-2v-3H8v-2h3z" />
                                            </svg>
                                            {{ $t('collections.add-to') }}
                                        </a>
                                    </template>
                                    <template #dialog>
                                        <CollectionDialog :cocktails="[cocktail.id]" :cocktail-collections="cocktail.collections" @collection-dialog-closed="showCollectionDialog = false; fetchCocktail()" />
                                    </template>
                                </SaltRimDialog>
                                <SaltRimDialog v-model="showNoteDialog">
                                    <template #trigger>
                                        <a class="dropdown-menu__item" href="#" @click.prevent="showNoteDialog = !showNoteDialog">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                                <path d="M21 15L15 20.996L4.00221 21C3.4487 21 3 20.5551 3 20.0066V3.9934C3 3.44476 3.44495 3 3.9934 3H20.0066C20.5552 3 21 3.45576 21 4.00247V15ZM19 5H5V19H13V14C13 13.4872 13.386 13.0645 13.8834 13.0067L14 13L19 12.999V5ZM18.171 14.999L15 15V18.169L18.171 14.999Z"></path>
                                            </svg>
                                            {{ $t('note.add') }}
                                        </a>
                                    </template>
                                    <template #dialog>
                                        <NoteDialog :resource-id="cocktail.id" resource="cocktail" @note-dialog-closed="showNoteDialog = false; refreshNotes()" />
                                    </template>
                                </SaltRimDialog>
                                <a v-show="cocktail.source" class="dropdown-menu__item" target="_blank" :href="cocktail.source">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                        <path fill="none" d="M0 0h24v24H0z" />
                                        <path d="M10 6v2H5v11h11v-5h2v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6zm11-3v8h-2V6.413l-7.793 7.794-1.414-1.414L17.585 5H13V3h8z" />
                                    </svg>
                                    {{ $t('cocktail-source') }}
                                </a>
                                <a class="dropdown-menu__item" href="javascript:;" @click.prevent="deleteCocktail">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                        <path fill="none" d="M0 0h24v24H0z" />
                                        <path d="M7 4V2h10v2h5v2h-2v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6H2V4h5zM6 6v14h12V6H6zm3 3h2v8H9V9zm4 0h2v8h-2V9z" />
                                    </svg>
                                    {{ $t('remove') }}
                                </a>
                            </template>
                        </Dropdown>
                    </div>
                </div>
                <div v-if="cocktail.ingredients.length > 0" class="details-block-container details-block-container--green">
                    <h3 class="details-block-container__title">{{ $t('ingredients') }}</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr;">
                        <div class="cocktail-button-group">
                            <h4>{{ $t('servings') }}:</h4>
                            <button @click="servings <= 1 ? servings = 1 : servings--">-</button>
                            <button class="active-serving">{{ servings }}</button>
                            <button @click="servings++">+</button>
                        </div>
                        <div class="cocktail-button-group" style="text-align:right">
                            <h4>{{ $t('units') }}:</h4>
                            <button type="button" :class="{ 'active-serving': currentUnit == 'ml' }" @click="changeMeasurementUnit('ml')">ml</button>
                            <button type="button" :class="{ 'active-serving': currentUnit == 'oz' }" @click="changeMeasurementUnit('oz')">oz</button>
                            <button type="button" :class="{ 'active-serving': currentUnit == 'cl' }" @click="changeMeasurementUnit('cl')">cl</button>
                        </div>
                    </div>
                    <ul class="cocktail-ingredients">
                        <li v-for="ing in cocktail.ingredients" :key="ing.sort">
                            <div class="cocktail-ingredients__ingredient">
                                <RouterLink class="cocktail-ingredients__ingredient__name" :to="{ name: 'ingredients.show', params: { id: ing.ingredient_slug } }" data-ingredient="preferred">
                                    {{ ing.name }} <small v-if="ing.optional">({{ $t('optional') }})</small>
                                </RouterLink>
                                <div class="cocktail-ingredients__ingredient__amount">{{ parseIngredientAmount(ing) }}</div>
                            </div>
                            <div class="cocktail-ingredients__flags">
                                <div v-if="ing.substitutes.length > 0" class="cocktail-ingredients__flags__flag">
                                    &middot; {{ $t('substitutes') }}:
                                    <template v-for="(sub, index) in ing.substitutes" :key="index">
                                        <RouterLink :to="{ name: 'ingredients.show', params: { id: sub.slug } }" data-ingredient="substitute">{{ sub.name }}</RouterLink>
                                        <template v-if="index + 1 !== ing.substitutes.length">, </template>
                                    </template>
                                </div>
                                <div v-if="!userShelfIngredients.map(i => i.ingredient_id).includes(ing.ingredient_id)" class="cocktail-ingredients__flags__flag">&middot; {{ $t('cocktail.missing-ing') }}</div>
                                <div v-if="userShoppingListIngredients.map(i => i.ingredient_id).includes(ing.ingredient_id)" class="cocktail-ingredients__flags__flag">&middot; {{ $t('ingredient.on-shopping-list') }}</div>
                            </div>
                        </li>
                    </ul>
                    <!-- <div class="cocktail-ingredients__total-amount">
                        Total: ~{{ totalLiquid }}
                    </div> -->
                    <a v-show="missingIngredientIds.length > 0" href="#" @click.prevent="addMissingIngredients">{{ $t('cocktail.missing-ing-action') }}</a>
                </div>
                <div class="details-block-container details-block-container--yellow">
                    <h3 class="details-block-container__title">{{ $t('instructions') }}</h3>
                    <div v-html="parsedInstructions"></div>
                    <div v-if="cocktail.utensils.length > 0">
                        <br>
                        <strong>{{ $t('utensils.title') }}</strong>: {{ cocktail.utensils.map(u => u.name).join(', ') }}
                    </div>
                </div>
                <div v-if="cocktail.garnish" class="details-block-container details-block-container--red">
                    <h3 class="details-block-container__title">{{ $t('garnish') }}</h3>
                    <div v-html="parsedGarnish"></div>
                </div>
                <div v-if="notes.length > 0" class="details-block-container details-block-container--purple">
                    <OverlayLoader v-if="isLoadingNotes" />
                    <h3 class="details-block-container__title">{{ $t('notes') }}</h3>
                    <Note v-for="note in notes" :key="note.id" :note="note" @note-deleted="refreshNotes"></Note>
                </div>
                <div class="cocktail-details__navigation">
                    <RouterLink v-if="cocktail.navigation.prev" :to="{ name: 'cocktails.show', params: { id: cocktail.navigation.prev } }">{{ $t('cocktail-prev') }}</RouterLink>
                    <RouterLink v-if="cocktail.navigation.next" :to="{ name: 'cocktails.show', params: { id: cocktail.navigation.next } }">{{ $t('cocktail-next') }}</RouterLink>
                </div>
            </div>
            <div class="cocktail-details__main__aside">
                <h3 class="page-subtitle" style="margin-top: 0">{{ $t('cocktails-similar') }}</h3>
                <SimilarCocktails :from-cocktail="cocktail"></SimilarCocktails>
                <template v-if="cocktail.ingredients.length > 0">
                    <h3 class="page-subtitle">{{ $t('ingredient-spotlight') }}</h3>
                    <IngredientSpotlight :id="cocktail.ingredients[0].ingredient_id"></IngredientSpotlight>
                </template>
                <template v-if="cocktail.collections.length > 0">
                    <h3 class="page-subtitle">{{ $t('cocktail-collections') }}</h3>
                    <CocktailCollections :cocktail="cocktail" @cocktail-removed-from-collection="fetchCocktail"></CocktailCollections>
                </template>
            </div>
        </div>
    </div>
</template>

<script>
import { micromark } from 'micromark'
import ApiRequests from './../../ApiRequests.js';
import AppState from './../../AppState';
import OverlayLoader from './../OverlayLoader.vue'
import Dropdown from './../SaltRimDropdown.vue';
import Rating from './../RatingActions.vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination } from 'swiper';
import Utils from '@/Utils';
import SaltRimDialog from './../Dialog/SaltRimDialog.vue';
import Note from './../Note/NoteDetails.vue'
import NoteDialog from './../Note/NoteDialog.vue'
import PublicLinkDialog from './PublicLinkDialog.vue';
import GenerateImageDialog from './GenerateImageDialog.vue';
import SimilarCocktails from './SimilarCocktails.vue';
import IngredientSpotlight from './../Ingredient/IngredientSpotlight.vue';
import CocktailCollections from './../Collections/CollectionWidget.vue';
import CollectionDialog from './../Collections/CollectionDialog.vue';
import dayjs from 'dayjs'

export default {
    components: {
        OverlayLoader,
        Dropdown,
        Rating,
        Swiper,
        SwiperSlide,
        SaltRimDialog,
        PublicLinkDialog,
        Note,
        NoteDialog,
        GenerateImageDialog,
        SimilarCocktails,
        CollectionDialog,
        CocktailCollections,
        IngredientSpotlight,
    },
    data: () => ({
        cocktail: {},
        notes: [],
        isLoading: false,
        isLoadingNotes: false,
        isLoadingShare: false,
        isLoadingFavorite: false,
        isFavorited: false,
        servings: 1,
        userShelfIngredients: [],
        userShoppingListIngredients: [],
        currentUnit: 'ml',
        sliderModules: [Navigation, Pagination],
        showPublicDialog: false,
        showNoteDialog: false,
        showDownloadImageDialog: false,
        showCollectionDialog: false,
    }),
    computed: {
        parsedInstructions() {
            if (!this.cocktail.instructions) {
                return null;
            }

            return micromark(this.cocktail.instructions)
        },
        parsedGarnish() {
            if (!this.cocktail.garnish) {
                return null;
            }

            return micromark(this.cocktail.garnish)
        },
        parsedDescription() {
            if (!this.cocktail.description) {
                return null;
            }

            return micromark(this.cocktail.description)
        },
        missingIngredientIds() {
            return this.cocktail.ingredients.filter(userIngredient => {
                return !this.userShelfIngredients.map(i => i.ingredient_id).includes(userIngredient.ingredient_id)
                    && !this.userShoppingListIngredients.map(i => i.ingredient_id).includes(userIngredient.ingredient_id)
            }).map(cocktailIngredient => cocktailIngredient.ingredient_id)
        },
        sortedImages() {
            return this.cocktail.images.slice(0).sort((a, b) => a.sort - b.sort)
        },
        createdDate() {
            const date = dayjs(this.cocktail.created_at).toDate();

            return this.$d(date, 'long');
        },
        totalLiquid() {
            const amount = this.cocktail.ingredients.filter(ing => ['ml', 'cl', 'oz'].includes(ing.units)).reduce((acc, ing) => {
                return parseFloat(ing.amount) + acc
            }, 0) * this.servings;

            return Utils.printIngredientAmount({ amount: amount, units: 'ml' }, this.currentUnit, this.servings);
        }
    },
    created() {
        document.title = `${this.$t('cocktail')} \u22C5 ${this.site_title}`
        this.$watch(
            () => this.$route.params,
            () => {
                if (this.$route.name == 'cocktails.show') {
                    this.fetchCocktail();
                }
            },
            { immediate: true }
        )
    },
    methods: {
        async fetchCocktail() {
            this.isLoading = true;

            this.userShelfIngredients = await ApiRequests.fetchMyShelf().catch(() => []);
            this.userShoppingListIngredients = await ApiRequests.fetchShoppingList().catch(() => []);
            const userFavorites = await ApiRequests.fetchCocktailFavorites().catch(() => []);

            ApiRequests.fetchCocktail(this.$route.params.id, { navigation: true }).then(data => {
                this.isLoading = false;
                this.cocktail = data
                this.isFavorited = userFavorites.includes(data.id)
                document.title = `${this.cocktail.name} \u22C5 ${this.site_title}`
            }).catch(e => {
                this.isLoading = false;
                this.$toast.error(e.message);
            })

            const appState = new AppState();

            if (appState.defaultUnit) {
                this.currentUnit = appState.defaultUnit
            }
        },
        favorite() {
            this.isLoadingFavorite = true;
            ApiRequests.favoriteCocktail(this.cocktail.id).then(resp => {
                this.isFavorited = resp.is_favorited
                this.isLoadingFavorite = false;
                this.$toast.default(this.isFavorited ? this.$t('cocktail.favorited', { name: this.cocktail.name }) : this.$t('cocktail.unfavorited', { name: this.cocktail.name }));
            }).catch(e => {
                this.isLoadingFavorite = false;
                this.$toast.error(e.message);
            })
        },
        deleteCocktail() {
            this.$confirm(this.$t('cocktail.confirm-delete', { name: this.cocktail.name }), {
                onResolved: (dialog) => {
                    dialog.close()
                    ApiRequests.deleteCocktail(this.cocktail.id).then(() => {
                        this.$toast.default(this.$t('cocktail.delete-success', { name: this.cocktail.name }));
                        this.$router.push({ name: 'cocktails' })
                        dialog.close()
                    }).catch(e => {
                        this.$toast.error(e.message);
                        dialog.close()
                    })
                }
            });
        },
        addMissingIngredients() {
            const postData = {
                ingredient_ids: this.missingIngredientIds
            };

            this.isLoading = true;
            ApiRequests.addIngredientsToShoppingList(postData).then(async data => {
                this.$toast.default(this.$t('cocktail.ingredients-added-success', { total: data.length }))
                this.userShoppingListIngredients = await ApiRequests.fetchShoppingList().catch(() => []);
                this.isLoading = false;
            }).catch(e => {
                this.$toast.error(e.message);
                this.isLoading = false;
            })
        },
        parseIngredientAmount(ingredient) {
            return Utils.printIngredientAmount(ingredient, this.currentUnit, this.servings);
        },
        changeMeasurementUnit(toUnit) {
            const appState = new AppState();
            this.currentUnit = toUnit;
            appState.setDefaultUnit(toUnit);
        },
        shareFromFormat(format) {
            this.isLoadingShare = true;
            ApiRequests.shareCocktail(this.cocktail.slug, { type: format }).then(data => {
                this.isLoadingShare = false;
                navigator.clipboard.writeText(data).then(() => {
                    this.$toast.default(this.$t('share-format-copied'));
                }, () => {
                    this.$toast.error(this.$t('share-format-copy-failed'));
                });
            })
        },
        refreshNotes() {
            this.isLoadingNotes = true;
            ApiRequests.fetchNotes({ 'filter[cocktail_id]': this.cocktail.id }).then(data => {
                this.isLoadingNotes = false;
                this.notes = data;
            }).catch(() => {
                this.isLoadingNotes = false;
            })
        }
    }
}
</script>

<style scoped>
.cocktail-details {
    max-width: 1200px;
    margin: 0 auto;
    --cocktail-graphic-height: 1000px;
    --swiper-theme-color: #fff;
    --swiper-pagination-bottom: 1.5rem;
    --swiper-pagination-bullet-size: 0.65rem;
    --swiper-navigation-size: 2rem;
    --swiper-pagination-bullet-inactive-color: #fff;
}

.cocktail-details__main {
    display: flex;
    gap: 1rem;
}

.cocktail-details__main__content {
    flex-basis: 100%;
    isolation: isolate;
}

.cocktail-details__main__aside {
    flex-basis: 300px;
}

@media (max-width: 450px) {
    .cocktail-details {
        --cocktail-graphic-height: 500px;
        --swiper-navigation-size: 1.5rem;
        --swiper-pagination-bullet-size: 0.45rem;
    }
}

@media (max-width: 800px) {
    .cocktail-details__main {
        display: block;
    }

    .cocktail-details__main__aside {
        margin-top: 2rem;
    }
}

.cocktail-details__graphic {
    background-color: #fff;
    box-shadow: 0 -3px 15px rgba(0, 0, 0, .03);
    border-radius: 20px;
    overflow: hidden;
    isolation: isolate;
    margin-bottom: 2rem;
}

.cocktail-details__graphic img {
    width: 100%;
    height: var(--cocktail-graphic-height);
    object-fit: cover;
    display: block;
}

.cocktail-details__title {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid var(--clr-red-200);
}

.dark-theme .cocktail-details__title {
    border-bottom: 2px solid var(--clr-dark-main-800);
}

.cocktail-details__title h2 {
    font-family: var(--font-heading);
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0;
    line-height: 1.3;
}

.cocktail-details__title p {
    font-size: 0.85rem;
    color: var(--clr-dark-main-800);
    opacity: .5;
}

.dark-theme .cocktail-details__title p {
    color: var(--clr-gray-300);
}

@media (max-width: 450px) {
    .cocktail-details__title h2 {
        font-size: 2rem;
    }
}

.cocktail-details__graphic__copyright {
    position: absolute;
    top: 1rem;
    left: 1rem;
    display: inline-block;
    background-color: rgba(0, 0, 0, .4);
    color: #fff;
    border-radius: 15px;
    padding: 2px 7px;
    font-size: 0.7rem;
}

.cocktail-title {
    font-family: var(--font-heading);
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 1.5rem 0;
    line-height: 1.3;
}

.cocktail-ingredients {
    --ci-clr-list-bg: rgba(255, 255, 255, .3);
    list-style: none;
    padding: 0;
    margin: 0;
}

.dark-theme .cocktail-ingredients {
    --ci-clr-list-bg: rgba(0, 0, 0, .4);
}

.cocktail-ingredients__total-amount {
    text-align: right;
    font-weight: bold;
    font-size: 0.85rem;
}

.cocktail-ingredients li {
    background-color: var(--ci-clr-list-bg);
    border-radius: 4px;
    margin-bottom: 0.5rem;
    padding: 0.5rem 0.75rem;
}

.cocktail-ingredients__ingredient {
    display: flex;
}

.cocktail-ingredients__flags {
    font-size: 0.7rem;
}

.cocktail-ingredients__ingredient__name {
    font-weight: 700;
}

.cocktail-ingredients__ingredient__name small {
    font-size: 0.70rem;
}

.cocktail-ingredients__ingredient__amount {
    font-weight: 700;
    font-size: 1.2rem;
    margin-left: auto;
    text-align: right;
    font-feature-settings: "frac";
}

@media (max-width: 450px) {
    .cocktail-ingredients__ingredient__amount {
        font-size: 1rem;
    }
}

.cocktail-details-box__actions {
    position: absolute;
    right: 20px;
    top: -25px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    column-gap: 5px;
}

.cocktail-button-group {
    --cbg-clr-content: var(--clr-gray-800);
    --cbg-clr-bg: rgba(255, 255, 255, .2);
    --cbg-clr-bg-hover: rgb(255, 255, 255, .4);
    --cbg-clr-bg-active: rgb(255, 255, 255, .6);
    margin-bottom: 20px;
}

.dark-theme .cocktail-button-group {
    --cbg-clr-content: var(--clr-gray-200);
    --cbg-clr-bg: rgba(0, 0, 0, .2);
    --cbg-clr-bg-hover: rgb(0, 0, 0, .4);
    --cbg-clr-bg-active: rgb(0, 0, 0, .6);
}

.cocktail-button-group h4 {
    font-size: 0.7rem;
}

.cocktail-button-group button {
    background: none;
    border: none;
    font-size: 0.85rem;
    font-weight: bold;
    margin: 0;
    padding: 0.15rem 0.5rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    cursor: pointer;
    color: var(--cbg-clr-content);
    background-color: var(--cbg-clr-bg);
}

.cocktail-button-group button.active-serving {
    background-color: var(--cbg-clr-bg-active);
}

.cocktail-button-group button:hover {
    background-color: var(--cbg-clr-bg-hover);
}

:deep(.details-block-container ol) {
    padding-left: 30px;
}

:deep(.details-block-container ol li::marker) {
    font-size: 1rem;
    font-weight: bold;
}

:deep(.details-block-container hr) {
    border: 1px solid rgba(0, 0, 0, .15);
    margin: 0.75rem 0;
}

.cocktail-details__navigation {
    display: flex;
    margin-top: 0.5rem;
}

.cocktail-details__navigation a:last-child {
    margin-left: auto;
}
</style>
