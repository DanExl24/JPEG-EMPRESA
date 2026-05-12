import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import LoginView from '../views/Login/LoginView.vue'
import RecoverPassword from '../views/Login/RecoverPassword.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/recover',
    name: 'Recover',
    component: RecoverPassword
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export { router }
export default router