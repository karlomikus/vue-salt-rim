import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Auth from '../Auth'

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
      name: 'home',
      component: HomeView
    },
    {
      path: '/cocktails',
      name: 'cocktails',
      component: () => import('../views/CocktailsView.vue')
    },
    {
      path: '/cocktails/:id',
      name: 'cocktails.show',
      component: () => import('../views/CocktailView.vue')
    },
    {
      path: '/my-ingredients',
      name: 'my-ingredients',
      component: () => import('../views/MyIngredientsView.vue')
    }
  ]
})

router.beforeEach(async (to, from) => {
  const auth = new Auth();

  const requiresAuth = to.meta.requiresAuth ?? true;

  if (requiresAuth && !auth.isLoggedIn()) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    }
  }
})

export default router
