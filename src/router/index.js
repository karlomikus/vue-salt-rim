import { createRouter, createWebHistory } from 'vue-router'
import qs from 'qs'
import AppState from './../AppState'

const router = createRouter({
    history: createWebHistory(),
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(savedPosition)
                }, 300)
            })
        } else {
            return { top: 0 }
        }
    },
    parseQuery(query) {
        return qs.parse(query)
    },
    stringifyQuery(query) {
        const result = qs.stringify(query)

        return result ? `${result}` : ''
    },
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/LoginView.vue'),
            meta: { requiresAuth: false }
        },
        {
            path: '/register',
            name: 'register',
            component: () => import('../views/RegisterView.vue'),
            meta: { requiresAuth: false }
        },
        {
            path: '/e/cocktail/:ulid/:slug',
            name: 'e.cocktail',
            component: () => import('../views/PublicCocktailView.vue'),
            meta: { requiresAuth: false }
        },
        {
            path: '/',
            component: () => import('../AuthLayout.vue'),
            children: [
                {
                    path: '/',
                    name: 'home',
                    component: () => import('../views/HomeView.vue'),
                    meta: { requiresBar: true },
                },
                {
                    path: '/cocktails',
                    name: 'cocktails',
                    component: () => import('../views/CocktailsView.vue'),
                    meta: { requiresBar: true },
                },
                {
                    path: '/cocktails/form',
                    name: 'cocktails.form',
                    component: () => import('../views/CocktailsFormView.vue'),
                    meta: { requiresBar: true },
                },
                {
                    path: '/cocktails/scrape',
                    name: 'cocktails.scrape',
                    component: () => import('../views/CocktailsScrapeView.vue'),
                    meta: { requiresBar: true },
                },
                {
                    path: '/cocktails/:id',
                    name: 'cocktails.show',
                    component: () => import('../views/CocktailView.vue'),
                    meta: { requiresBar: true },
                },
                {
                    path: '/ingredients/:id',
                    name: 'ingredients.show',
                    component: () => import('../views/IngredientView.vue'),
                    meta: { requiresBar: true },
                },
                {
                    path: '/ingredients/form',
                    name: 'ingredients.form',
                    component: () => import('../views/IngredientFormView.vue'),
                    meta: { requiresBar: true },
                },
                {
                    path: '/ingredients',
                    name: 'ingredients',
                    component: () => import('../views/IngredientsView.vue'),
                    meta: { requiresBar: true },
                },
                {
                    path: '/settings',
                    name: 'settings',
                    redirect: { name: 'settings.profile' }
                },
                {
                    path: '/settings/profile',
                    name: 'settings.profile',
                    component: () => import('../views/SettingsProfileView.vue'),
                },
                {
                    path: '/settings/categories',
                    name: 'settings.categories',
                    component: () => import('../views/SettingsCategoriesView.vue'),
                    meta: { requiresBar: true },
                },
                {
                    path: '/settings/glasses',
                    name: 'settings.glasses',
                    component: () => import('../views/SettingsGlassesView.vue'),
                    meta: { requiresBar: true },
                },
                {
                    path: '/settings/users',
                    name: 'settings.users',
                    component: () => import('../views/SettingsUsersView.vue'),
                    meta: { requiresBar: true },
                },
                {
                    path: '/settings/tags',
                    name: 'settings.tags',
                    component: () => import('../views/SettingsTagsView.vue'),
                    meta: { requiresBar: true },
                },
                {
                    path: '/collections/cocktail',
                    name: 'collections.cocktails',
                    component: () => import('../views/CocktailCollections.vue'),
                    meta: { requiresBar: true },
                },
                {
                    path: '/settings/utensils',
                    name: 'settings.utensils',
                    component: () => import('../views/SettingsUtensilsView.vue'),
                    meta: { requiresBar: true },
                },
                {
                    path: '/bars',
                    name: 'bars',
                    component: () => import('../views/BarsView.vue'),
                },
                {
                    path: '/bars/form',
                    name: 'bars.form',
                    component: () => import('../views/BarFormView.vue'),
                },
            ]
        },
        {
            path: '/print',
            component: () => import('../PrintLayout.vue'),
            children: [
                {
                    path: 'cocktail/:id',
                    name: 'print.cocktail',
                    component: () => import('../views/CocktailPrintView.vue'),
                },
                {
                    path: 'shopping-list',
                    name: 'print.shopping-list',
                    component: () => import('../views/ShelfShoppingListPrintView.vue'),
                },
            ]
        }
    ]
})

router.beforeEach(async (to) => {
    const requiresAuth = to.meta.requiresAuth ?? true
    const requiresBar = to.meta.requiresBar ?? false
    const appState = new AppState()

    if (requiresBar && !appState.bar.id) {
        return {
            name: 'bars',
        }
    }

    if (requiresAuth && !appState.hasUserInfo()) {
        return {
            path: '/login',
            query: { redirect: to.fullPath },
        }
    }
})

export default router
