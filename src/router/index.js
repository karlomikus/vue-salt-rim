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
                }
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
