import { createRouter, createWebHistory } from 'vue-router'
import Home      from '../views/Home.vue'
import LoginView from '../views/Login/LoginView.vue'
import RecoverPassword from '../views/Login/RecoverPassword.vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import DashboardView from '../views/dashboard/DashboardView.vue'
import CursosView from '../views/cursos/CursosView.vue'
import EstudiarCursoView from '../views/cursos/EstudiarCursoView.vue'
import ActividadesView from '../views/actividades/ActividadesView.vue'
import ActividadDetalleView from '../views/actividades/ActividadDetalleView.vue'
import ProgresoView from '../views/progreso/ProgresoView.vue'
import RankingView from '../views/ranking/RankingView.vue'
import LogrosView from '../views/logros/LogrosView.vue'
import JuegosView from '../views/juegos/JuegosView.vue'
import AnaliticasView from '../views/analiticas/AnaliticasView.vue'
import UsuariosView from '../views/usuarios/UsuariosView.vue'
import PerfilView from '../views/perfil/PerfilView.vue'
import SettingsView from '../views/settings/SettingsView.vue'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/',      component: Home },
  { path: '/login', component: LoginView },
  { path: '/recover', component: RecoverPassword },
  {
    path: '/dashboard',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard/inicio' },
      { path: 'inicio', component: DashboardView },
      { path: 'cursos', component: CursosView },
      { path: 'cursos/:courseId', component: EstudiarCursoView },
      { path: 'actividades', component: ActividadesView },
      { path: 'actividades/:activityId', component: ActividadDetalleView },
      { path: 'progreso', component: ProgresoView },
      { path: 'ranking', component: RankingView },
      { path: 'logros', component: LogrosView },
      { path: 'juegos', component: JuegosView },
      { path: 'analiticas', component: AnaliticasView },
      { path: 'usuarios', component: UsuariosView },
      { path: 'perfil', component: PerfilView },
      { path: 'settings', component: SettingsView },
    ],
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return '/login'
  }

  if ((to.path === '/login' || to.path === '/recover') && auth.isAuthenticated) {
    return '/dashboard/inicio'
  }
})
