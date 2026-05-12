import { createRouter, createWebHistory } from 'vue-router'
import Home      from '../views/Home.vue'
import LoginView from '../views/Login/LoginView.vue'
import RecoverPassword from '../views/Login/RecoverPassword.vue'

const routes = [
  { path: '/',      component: Home },
  { path: '/login', component: LoginView },
  { path: '/recover', component: RecoverPassword }
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})