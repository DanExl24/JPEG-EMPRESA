import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'
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
import VocabularioView from '../views/vocabulario/VocabularioView.vue'
import GlosarioView from '../views/glosario/GlosarioView.vue'
import CurriculumView from '../views/curriculum/CurriculumView.vue'
import DialogosView from '../views/dialogos/DialogosView.vue'
import MisFichasView from '../views/instructor/MisFichasView.vue'
import { useAuthStore } from '../stores/auth'

const routes: RouteRecordRaw[] = [
  { path: '/', component: Home },
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
      { path: 'juegos/:gameId', component: JuegosView },
      { path: 'analiticas', component: AnaliticasView },
      { path: 'usuarios', component: UsuariosView, meta: { requiresAdmin: true } },
      { path: 'perfil', component: PerfilView },
      { path: 'settings', component: SettingsView },
      { path: 'vocabulario', component: VocabularioView },
      { path: 'glosario', component: GlosarioView },
      { path: 'curriculum', component: CurriculumView, meta: { requiresAdmin: true } },
      { path: 'dialogos', component: DialogosView },
      { path: 'fichas', component: MisFichasView, meta: { requiresInstructorOrAdmin: true } },
    ],
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

let hasCheckedAuth = false

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // Validar sesión con el backend en la primera carga si existe token guardado
  if (!hasCheckedAuth && auth.isAuthenticated) {
    hasCheckedAuth = true
    try {
      await auth.checkAuth()
    } catch {
      // Ignorar error, el store ya limpia el estado si el token es inválido
    }
  }

  if (to.meta['requiresAuth'] && !auth.isAuthenticated) {
    return '/login'
  }

  if (to.meta['requiresAdmin'] && !auth.isAdmin) {
    return '/dashboard/inicio'
  }

  if (to.meta['requiresInstructorOrAdmin'] && !auth.isAdmin && !auth.isInstructor) {
    return '/dashboard/inicio'
  }

  if ((to.path === '/login' || to.path === '/recover') && auth.isAuthenticated) {
    return '/dashboard/inicio'
  }
})

// Auto-traducción en todas las vistas al cambiar de ruta
import { useI18nStore } from '../stores/i18n'

router.afterEach(() => {
  try {
    const i18n = useI18nStore()
    if (i18n.locale !== 'es') {
      setTimeout(() => i18n.translateDOM(), 30)
      setTimeout(() => i18n.translateDOM(), 200)
      setTimeout(() => i18n.translateDOM(), 600)
    }
  } catch {}
})

