import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import LoginView from '../views/LoginView.vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'
const routes = [
  { path: '/', component: Home },
  { path: '/login', component: LoginView },

  {
    path: '/dashboard',
    component: DashboardLayout,
    redirect: '/dashboard/inicio',
    children: [
      { path: 'inicio', component: () => import('../views/dashboard/DashboardView.vue') },
      { path: 'cursos', component: () => import('../views/cursos/CursosView.vue') },
      { path: 'actividades', component: () => import('../views/actividades/ActividadesView.vue') },
      { path: 'progreso', component: () => import('../views/progreso/ProgresoView.vue') },
      { path: 'ranking', component: () => import('../views/ranking/RankingView.vue') },
      { path: 'logros', component: () => import('../views/logros/LogrosView.vue') },
      { path: 'juegos', component: () => import('../views/juegos/JuegosView.vue') },
      { path: 'settings', component: () => import('../views/settings/SettingsView.vue') },
      { path: 'perfil', component: () => import('../views/perfil/PerfilView.vue') },
      { path: 'analiticas', component: () => import('../views/analiticas/AnaliticasView.vue') },
      { path: 'usuarios', component: () => import('../views/usuarios/UsuariosView.vue') },
    ],
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

