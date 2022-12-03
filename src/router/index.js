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
                    path: '/shelf-cocktails',
                    name: 'shelf-cocktails',
                    component: () => import('../views/ShelfCocktailsView.vue'),
                },
                {
                    path: '/profile',
                    name: 'profile',
                    component: () => import('../views/ProfileView.vue'),
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
