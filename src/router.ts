import { createRouter, createWebHistory } from 'vue-router';
import Index from './pages/Index.vue';
import Game from './pages/Game.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [{
    path: '/',
    component: Index,
  }, {
    path: '/game',
    component: Game
  }],
});

export default router;
