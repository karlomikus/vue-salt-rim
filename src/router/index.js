import { createRouter, createWebHistory } from 'vue-router'
import Auth from '../Auth'
import {nextTick} from 'vue';

const DEFAULT_TITLE = "";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
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
          meta: { title: 'Home' }
        },
        {
          path: '/cocktails',
          name: 'cocktails',
          component: () => import('../views/CocktailsView.vue'),
          meta: { title: 'Cocktails' }
        },
        {
          path: '/cocktails/form',
          name: 'cocktails.form',
          component: () => import('../views/CocktailsFormView.vue'),
          meta: { title: 'Update cocktail' }
        },
        {
          path: '/cocktails/:id',
          name: 'cocktails.show',
          component: () => import('../views/CocktailView.vue'),
          meta: { title: 'Cocktails - NAME' }
        },
        {
          path: '/ingredients/:id',
          name: 'ingredients.show',
          component: () => import('../views/IngredientView.vue'),
          meta: { title: 'Ingredients - NAME' }
        },
        {
          path: '/shelf',
          name: 'shelf',
          component: () => import('../views/ShelfHomeView.vue'),
          meta: { title: 'My shelf' }
        },
        {
          path: '/shelf-cocktails',
          name: 'shelf-cocktails',
          component: () => import('../views/ShelfCocktailsView.vue'),
          meta: { title: 'Shelf cocktails' }
        }
      ]
    }
  ]
});

router.afterEach((to) => {
  nextTick(() => {
      document.title = 'Salt Rim - ' + (to.meta.title || DEFAULT_TITLE);
  });
});

router.beforeEach(async (to, from) => {
  const auth = new Auth();

  const requiresAuth = to.meta.requiresAuth ?? true;

  if (requiresAuth && !await auth.isLoggedIn()) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    }
  }
})

export default router
