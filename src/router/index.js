import { createRouter, createWebHistory } from 'vue-router'
import Page1 from "@/views/Page1.vue";
import Page2 from "@/views/Page2.vue";
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/page1',
      name: 'page1',
      component: Page1
    },
    {
      path: '/page2',
      name: 'page2',
      component: Page2
    }
  ]
})

export default router
