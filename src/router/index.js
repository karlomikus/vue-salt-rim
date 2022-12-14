import { createRouter, createWebHistory } from 'vue-router'
import Auth from '../Auth'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve(savedPosition)
                }, 300)
            })
        } else {
            return { top: 0 }
        }
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
            path: '/',
            component: () => import('../AuthLayout.vue'),
            children: [
                {
                    path: '/',
                    name: 'home',
                    component: () => import('../views/HomeView.vue'),
                },
                {
                    path: '/cocktails',
                    name: 'cocktails',
                    component: () => import('../views/CocktailsView.vue'),
                },
                {
                    path: '/cocktails/form',
                    name: 'cocktails.form',
                    component: () => import('../views/CocktailsFormView.vue'),
                },
                {
                    path: '/cocktails/:id',
                    name: 'cocktails.show',
                    component: () => import('../views/CocktailView.vue'),
                },
                {
                    path: '/ingredients/:id',
                    name: 'ingredients.show',
                    component: () => import('../views/IngredientView.vue'),
                },
                {
                    path: '/ingredients/form',
                    name: 'ingredients.form',
                    component: () => import('../views/IngredientFormView.vue'),
                },
                {
                    path: '/ingredients',
                    name: 'ingredients',
                    component: () => import('../views/ShelfHomeView.vue'),
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
                },
                {
                    path: '/settings/categories/form',
                    name: 'settings.categories.form',
                    component: () => import('../views/CategoryFormView.vue'),
                },
                {
                    path: '/settings/glasses',
                    name: 'settings.glasses',
                    component: () => import('../views/SettingsGlassesView.vue'),
                },
                {
                    path: '/settings/glasses/form',
                    name: 'settings.glasses.form',
                    component: () => import('../views/GlassFormView.vue'),
                },
                {
                    path: '/settings/users',
                    name: 'settings.users',
                    component: () => import('../views/SettingsUsersView.vue'),
                },
                {
                    path: '/settings/users/form',
                    name: 'settings.users.form',
                    component: () => import('../views/UserFormView.vue'),
                },
                {
                    path: '/shelf/cocktails',
                    name: 'shelf.cocktails',
                    component: () => import('../views/ShelfCocktailsView.vue'),
                },
                {
                    path: '/shelf/shopping-list',
                    name: 'shelf.shopping-list',
                    component: () => import('../views/ShelfShoppingListView.vue'),
                },
                {
                    path: '/settings/tags',
                    name: 'settings.tags',
                    component: () => import('../views/SettingsTagsView.vue'),
                },
                {
                    path: '/settings/tags/form',
                    name: 'settings.tags.form',
                    component: () => import('../views/TagFormView.vue'),
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
});

router.beforeEach(async (to, from) => {
    const requiresAuth = to.meta.requiresAuth ?? true;

    if (requiresAuth && !await Auth.isLoggedIn()) {
        return {
            path: '/login',
            query: { redirect: to.fullPath },
        }
    }
})

export default router
