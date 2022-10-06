import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
    // {
    //   path: '/shelf',
    //   name: 'shelf',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/ShelfView.vue')
    // },
    // {
    //   path: '/profile',
    //   name: 'profile',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/ProfileView.vue')
    // }
  ]
})

export default router
