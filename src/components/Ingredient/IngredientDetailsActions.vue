<template>
    <Dropdown>
        <template #default="{ toggleDropdown }">
            <button type="button" class="button button--outline button--has-icon" :aria-label="$t('actions')" @click.prevent="toggleDropdown">
                <IconMore />
            </button>
        </template>
        <template #content="{ closeDropdown }">
            <RouterLink
                v-if="ingredient.access?.can_edit"
                class="dropdown-menu__item"
                :to="{ name: 'ingredients.form', query: { id: ingredient.id } }"
                @click="closeDropdown"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path
                        d="M6.414 16L16.556 5.858l-1.414-1.414L5 14.586V16h1.414zm.829 2H3v-4.243L14.435 2.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 18zM3 20h18v2H3v-2z"
                    />
                </svg>
                {{ $t("edit") }}
            </RouterLink>
            <RouterLink
                v-if="ingredient.access?.can_edit"
                class="dropdown-menu__item"
                :to="{ name: 'ingredients.form', query: { variant: ingredient.id } }"
                @click="closeDropdown"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                    <path
                        d="M6.9998 6V3C6.9998 2.44772 7.44752 2 7.9998 2H19.9998C20.5521 2 20.9998 2.44772 20.9998 3V17C20.9998 17.5523 20.5521 18 19.9998 18H16.9998V20.9991C16.9998 21.5519 16.5499 22 15.993 22H4.00666C3.45059 22 3 21.5554 3 20.9991L3.0026 7.00087C3.0027 6.44811 3.45264 6 4.00942 6H6.9998ZM5.00242 8L5.00019 20H14.9998V8H5.00242ZM8.9998 6H16.9998V16H18.9998V4H8.9998V6Z"
                    />
                </svg>
                {{ $t("ingredient.clone-as-variety") }}
            </RouterLink>
            <SaltRimDialog v-if="ingredient.access?.can_edit" v-model="showAddToMenuDialog">
                <template #trigger>
                    <a class="dropdown-menu__item" href="#" @click.prevent="showAddToMenuDialog = true; closeDropdown()">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path
                                d="M12.414 5H21a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7.414l2 2zM4 5v14h16V7h-8.414l-2-2H4zm7 7V9h2v3h3v2h-3v3h-2v-3H8v-2h3z"
                            />
                        </svg>
                        {{ $t("menu.add-single") }}
                    </a>
                </template>
                <template #dialog>
                    <MenuAddDialog
                        :title="$t('menu.add-multiple')"
                        :items="[ingredient.id]"
                        menu-item-type="ingredient"
                        @menu-add-dialog-closed="showAddToMenuDialog = false"
                    />
                </template>
            </SaltRimDialog>
            <a
                v-if="canReview && !currentUserReview"
                class="dropdown-menu__item"
                href="#"
                @click.prevent="closeDropdown(); emit('writeReview')"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path
                        d="M12 14V16C8.68629 16 6 18.6863 6 22H4C4 17.5817 7.58172 14 12 14ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11ZM18 21.5L15.0611 23.0451L15.6224 19.7725L13.2447 17.4549L16.5305 16.9775L18 14L19.4695 16.9775L22.7553 17.4549L20.3776 19.7725L20.9389 23.0451L18 21.5Z"
                    />
                </svg>
                {{ $t("review.write") }}
            </a>
            <hr v-if="showDeleteSeparator" class="dropdown-menu__separator" />
            <a v-if="ingredient.access?.can_delete" class="dropdown-menu__item" href="#" @click.prevent="closeDropdown(); $emit('delete')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M7 4V2h10v2h5v2h-2v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6H2V4h5zM6 6v14h12V6H6zm3 3h2v8H9V9zm4 0h2v8h-2V9z" />
                </svg>
                {{ $t("remove") }}
            </a>
        </template>
    </Dropdown>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { components } from "@/api/api";
import type { IngredientReview } from "@/composables/ingredient/useIngredientReviews";
import Dropdown from "@/components/SaltRimDropdown.vue";
import IconMore from "@/components/Icons/IconMore.vue";
import SaltRimDialog from "@/components/Dialog/SaltRimDialog.vue";
import MenuAddDialog from "@/components/Menu/MenuAddDialog.vue";

type Ingredient = components["schemas"]["Ingredient"];

const props = defineProps<{
    ingredient: Ingredient;
    canReview: boolean;
    currentUserReview: IngredientReview | null;
}>();
const emit = defineEmits<{ delete: []; writeReview: [] }>();
const showAddToMenuDialog = ref(false);
const showDeleteSeparator = computed(() => {
    return Boolean(props.ingredient.access?.can_delete && (props.ingredient.access?.can_edit || (props.canReview && !props.currentUserReview)));
});

</script>
