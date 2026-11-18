<template>
    <nav v-if="appState.bar.id" class="bottom-nav">
        <RouterLink :to="{ name: 'home' }" class="bottom-nav__item" :class="{ 'bottom-nav__item--active': route.name === 'home' }">
            <IconBarShelf aria-hidden="true" />
            <span class="bottom-nav__label">{{ t("bars.bar") }}</span>
        </RouterLink>
        <RouterLink
            :to="{ name: 'cocktails' }"
            class="bottom-nav__item"
            :class="{ 'bottom-nav__item--active': route.path.startsWith('/cocktails') }"
        >
            <IconCocktail aria-hidden="true" />
            <span class="bottom-nav__label">{{ t("cocktail.cocktails") }}</span>
        </RouterLink>
        <RouterLink
            :to="{ name: 'ingredients' }"
            class="bottom-nav__item"
            :class="{ 'bottom-nav__item--active': route.path.startsWith('/ingredients') }"
        >
            <IconIngredients aria-hidden="true" />
            <span class="bottom-nav__label">{{ t("ingredient.ingredients") }}</span>
        </RouterLink>
        <RouterLink
            :to="{ name: 'shopping-list.index' }"
            class="bottom-nav__item"
            :class="{ 'bottom-nav__item--active': route.path.startsWith('/shopping-list') }"
        >
            <IconShoppingCart aria-hidden="true" />
            <span class="bottom-nav__label">{{ t("shopping") }}</span>
        </RouterLink>
        <button
            type="button"
            class="bottom-nav__item"
            :class="{ 'bottom-nav__item--active': isMoreActive || showMore }"
            aria-haspopup="dialog"
            :aria-expanded="showMore"
            @click="showMore = true"
        >
            <IconMore aria-hidden="true" />
            <span class="bottom-nav__label">{{ t("more") }}</span>
        </button>
    </nav>

    <Drawer v-model="showMore" :title="t('more')" side="bottom">
        <nav class="more-nav">
            <RouterLink v-for="item in moreItems" :key="item.route" :to="{ name: item.route }" class="more-nav__item" @click="showMore = false">
                {{ t(item.label) }}
            </RouterLink>
        </nav>
    </Drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import AppState from "@/AppState";
import Drawer from "@/components/Drawer.vue";
import IconCocktail from "@/components/Icons/IconCocktail.vue";
import IconMore from "@/components/Icons/IconMore.vue";
import IconShoppingCart from "@/components/Icons/IconShoppingCart.vue";
import IconBarShelf from "@/components/Icons/IconBarShelf.vue";
import IconIngredients from "../Icons/IconIngredients.vue";

const { t } = useI18n();
const route = useRoute();
const appState = new AppState();
const showMore = ref(false);

const moreItems = computed(() => {
    const items = [
        { route: "collections.cocktails", label: "collections.title" },
        { route: "calculators.index", label: "calculators.title" },
        { route: "settings", label: "settings" },
    ];

    if (appState.isAdmin()) {
        items.splice(1, 0, { route: "menu", label: "menu.title" });
    }

    return items;
});

const isMoreActive = computed(() => {
    return ["/collections", "/menu", "/calculators", "/settings"].some((path) => route.path.startsWith(path));
});

watch(
    () => route.fullPath,
    () => {
        showMore.value = false;
    },
);
</script>

<style scoped>
.bottom-nav {
    display: none;
}

.more-nav {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.more-nav__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.85rem 1rem;
    border-radius: var(--radius-2);
    color: var(--clr-body-font);
    font-weight: var(--fw-bold);
    text-decoration: none;
}

.more-nav__item::after {
    content: "›";
    font-size: 1.4rem;
    line-height: 1;
    opacity: 0.5;
}

.more-nav__item:hover,
.more-nav__item:focus-visible {
    background-color: var(--clr-gray-100);
}

.dark-theme .more-nav__item:hover,
.dark-theme .more-nav__item:focus-visible {
    background-color: var(--clr-gray-700);
}

@media (max-width: 750px) {
    .bottom-nav {
        position: fixed;
        right: 0.5rem;
        bottom: calc(0.5rem + env(safe-area-inset-bottom));
        left: 0.5rem;
        z-index: 2;
        display: flex;
        justify-content: space-around;
        gap: 0.15rem;
        padding: 0.35rem;
        background-color: var(--clr-gray-900);
        border-radius: var(--radius-4);
        box-shadow: var(--shadow-elevation-medium-dark);
    }

    .dark-theme .bottom-nav {
        background-color: var(--clr-gray-100);
        box-shadow: var(--shadow-elevation-medium-dark);
    }

    .bottom-nav__item {
        display: flex;
        flex: 1;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-width: 0;
        gap: 2px;
        padding: 0.35rem 0.1rem;
        border: 0;
        border-radius: var(--radius-3);
        background: none;
        color: var(--clr-gray-200);
        font-family: inherit;
        font-size: 0.65rem;
        font-weight: var(--fw-bold);
        text-decoration: none;
        cursor: pointer;
    }

    .dark-theme .bottom-nav__item {
        color: var(--clr-gray-800);
    }

    .bottom-nav__item svg {
        width: 22px;
        height: 22px;
        flex-shrink: 0;
        fill: currentColor;
    }

    .bottom-nav__label {
        max-width: 100%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .bottom-nav__item--active {
        color: var(--clr-gray-800);
        background: var(--clr-gray-100);
        border-top: 2px solid #fff;
        border-radius: var(--radius-3);
    }

    .dark-theme .bottom-nav__item--active {
        border-top: none;
        border-bottom: 2px solid var(--clr-gray-50);
        color: var(--clr-gray-100);
        background-color: var(--clr-gray-600);
    }
}

@media (max-width: 360px) {
    .bottom-nav__item {
        font-size: 0.6rem;
    }
}
</style>
