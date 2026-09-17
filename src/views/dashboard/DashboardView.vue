<template>
  <div class="space-y-6">
    
    <!-- Top Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span 
            class="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full"
            :class="{
              'bg-purple-100 text-purple-700': auth.role === 'admin',
              'bg-blue-100 text-[#006688]': auth.role === 'instructor',
              'bg-teal-100 text-teal-700': auth.role === 'aprendiz',
            }"
          >
            {{ auth.role === 'instructor' ? 'Docencia y Seguimiento Clínico' : auth.role === 'admin' ? 'Control Institucional' : 'Formación en Enfermería' }}
          </span>
          <span class="text-xs text-gray-400">· SENA Nursing Academy</span>
        </div>
        <h2 class="text-2xl font-black text-gray-800">
          Bienvenido, {{ auth.user.name }}
        </h2>
        <p class="text-xs sm:text-sm text-gray-500">
          {{ auth.role === 'instructor' 
            ? 'Monitorea el progreso pedagógico, califica retos de los aprendices y gestiona tus módulos formativos.' 
            : auth.role === 'admin' 
              ? 'Supervisa métricas globales, usuarios y configuración institucional de la plataforma.' 
              : 'Aquí tienes un resumen de tu avance de aprendizaje y actividades recientes.' }}
        </p>
      </div>

      <div class="flex items-center gap-3">
        <router-link
          v-if="auth.isInstructor || auth.isAdmin"
          to="/dashboard/cursos"
          class="flex items-center gap-2 px-4 py-2.5 bg-[#006688] hover:bg-[#004e69] text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-[#006688]/20"
        >
          <span class="material-symbols-outlined text-base">school</span>
          Gestionar Cursos
        </router-link>
        <router-link
          v-if="auth.isInstructor || auth.isAdmin"
          to="/dashboard/actividades"
          class="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <span class="material-symbols-outlined text-base">task</span>
          Bandeja Tareas
        </router-link>
      </div>
    </div>

    <!-- Stats Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div 
        v-for="stat in visibleStats" 
        :key="stat.label" 
        class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden"
      >
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-bold text-gray-500">{{ stat.label }}</span>
          <div :class="`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`">
            <span class="material-symbols-outlined text-xl group-hover:scale-110 transition-transform" :style="`color: ${stat.iconColor}`">{{ stat.icon }}</span>
          </div>
        </div>
        <div class="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight">{{ stat.value }}</div>
        <div class="text-[11px] text-gray-400 mt-1 font-semibold flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
          {{ stat.change }}
        </div>
      </div>
    </div>

    <!-- Instructor Section: Bandeja de Evaluaciones Pendientes -->
    <div v-if="auth.isInstructor || auth.isAdmin" class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <span class="material-symbols-outlined text-xl">rate_review</span>
          </div>
          <div>
            <h3 class="text-base font-black text-gray-800">Entregas Recientes de Aprendices</h3>
            <p class="text-xs text-gray-400">Talleres, quizzes y ejercicios de pronunciación en espera de retroalimentación.</p>
          </div>
        </div>
        <router-link
          to="/dashboard/actividades"
          class="text-xs font-bold text-[#006688] hover:underline flex items-center gap-1"
        >
          Ver todas en Actividades
          <span class="material-symbols-outlined text-sm">arrow_forward</span>
        </router-link>
      </div>

      <!-- Reviews Table / List -->
      <div v-if="pendingReviews.length > 0" class="divide-y divide-gray-50 border border-gray-100 rounded-2xl overflow-hidden">
        <div 
          v-for="sub in pendingReviews" 
          :key="sub.id"
          class="p-4 bg-gray-50/40 hover:bg-gray-50 flex items-center justify-between gap-4 flex-wrap transition-colors"
        >
          <div class="flex items-center gap-3 min-w-[200px]">
            <div class="w-9 h-9 rounded-full bg-[#006688]/10 text-[#006688] font-bold text-xs flex items-center justify-center shrink-0">
              {{ sub.studentName ? sub.studentName[0] : 'A' }}
            </div>
            <div>
              <p class="text-xs font-bold text-gray-800">{{ sub.studentName }}</p>
              <p class="text-[10px] text-gray-400">{{ sub.studentEmail }}</p>
            </div>
          </div>

          <div class="flex-1 min-w-[200px]">
            <p class="text-xs font-bold text-[#006688]">{{ sub.activityTitle }}</p>
            <p class="text-[10px] text-gray-400">Entregado: {{ sub.submittedAt }} · Valor: {{ sub.points }} XP</p>
          </div>

          <div class="flex items-center gap-3">
            <span 
              :class="`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                sub.passed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`"
            >
              {{ sub.passed ? 'Completado' : 'Por Calificar' }}
            </span>
            <router-link
              :to="`/dashboard/actividades/${sub.activityId}`"
              class="px-3 py-1.5 bg-[#006688] hover:bg-[#004e69] text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 shadow-xs"
            >
              <span class="material-symbols-outlined text-xs">edit_note</span>
              Evaluar
            </router-link>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-8 bg-gray-50/60 rounded-2xl border border-dashed border-gray-200 space-y-2">
        <span class="material-symbols-outlined text-4xl text-gray-300 block">fact_check</span>
        <p class="text-xs font-bold text-gray-500">¡Bandeja al día!</p>
        <p class="text-[11px] text-gray-400">No hay entregas pendientes de calificación en este momento.</p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <h3 class="text-base font-black text-gray-800 mb-4">Accesos Rápidos</h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        <router-link
          v-for="action in quickActions"
          :key="action.path"
          :to="action.path"
          class="flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-100 hover:border-[#006688]/30 hover:bg-[#006688]/5 transition-all group text-center"
        >
          <div class="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-2 group-hover:bg-[#006688]/10 transition-colors">
            <span class="material-symbols-outlined text-2xl text-[#006688] group-hover:scale-110 transition-transform">{{ action.icon }}</span>
          </div>
          <span class="text-xs font-bold text-gray-700 group-hover:text-[#006688] transition-colors">{{ action.label }}</span>
        </router-link>
      </div>
    </div>

    <!-- Recent Activity Feed -->
    <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-black text-gray-800">
          {{ auth.isInstructor ? 'Actividad Reciente del Aula Clínica' : 'Actividad Reciente' }}
        </h3>
        <span class="text-xs text-gray-400 font-semibold">Eventos en vivo</span>
      </div>

      <div v-if="recentActivity.length > 0" class="space-y-3">
        <div 
          v-for="item in recentActivity" 
          :key="item.id" 
          class="flex items-center gap-4 p-3.5 rounded-2xl bg-gray-50/70 hover:bg-gray-50 transition-colors"
        >
          <div :class="`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.bg}`">
            <span class="material-symbols-outlined text-lg" :style="`color: ${item.iconColor}`">{{ item.icon }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs sm:text-sm font-bold text-gray-800 truncate">{{ item.title }}</p>
            <p class="text-[11px] text-gray-400 mt-0.5">{{ item.time }}</p>
          </div>
          <span :class="`text-[10px] font-black uppercase px-2.5 py-1 rounded-full shrink-0 ${item.badgeBg} ${item.badgeText}`">
            {{ item.badge }}
          </span>
        </div>
      </div>
      <div v-else class="text-center py-8 bg-gray-50/60 rounded-2xl border border-dashed border-gray-200 space-y-2">
        <span class="material-symbols-outlined text-4xl text-gray-300 block">history</span>
        <p class="text-xs font-bold text-gray-500">Sin actividad registrada aún</p>
        <p class="text-[11px] text-gray-400">Los eventos de aprendizaje y entregas de tus estudiantes aparecerán aquí en tiempo real a medida que interactúen con la plataforma.</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { getApiBaseUrl } from '../../lib/api'

const auth = useAuthStore()
const apiBaseUrl = getApiBaseUrl()

// Default stats for Admin
const defaultAdminStats = [
  { label: 'Cursos Activos', value: '...', change: 'Catálogo institucional', icon: 'school', bg: 'bg-blue-50', iconColor: '#006688' },
  { label: 'Total Usuarios', value: '...', change: 'Aprendices e instructores', icon: 'group', bg: 'bg-purple-50', iconColor: '#8b5cf6' },
  { label: 'Programas SENA', value: '...', change: 'Fichas activas', icon: 'schema', bg: 'bg-teal-50', iconColor: '#14b8a6' },
  { label: 'Banco Actividades', value: '...', change: 'Catálogo pedagógico', icon: 'task', bg: 'bg-orange-50', iconColor: '#f97316' },
  { label: 'Tasa de Aprobación', value: '...', change: 'Promedio global', icon: 'trending_up', bg: 'bg-green-50', iconColor: '#10b981' },
  { label: 'Entregas Registradas', value: '...', change: 'Evaluaciones realizadas', icon: 'fact_check', bg: 'bg-indigo-50', iconColor: '#6366f1' },
  { label: 'Fichas / Cohortes', value: '...', change: 'Grupos en formación', icon: 'domain', bg: 'bg-rose-50', iconColor: '#e11d48' },
  { label: 'Catálogo de Logros', value: '...', change: 'Insignias configuradas', icon: 'emoji_events', bg: 'bg-yellow-50', iconColor: '#f59e0b' },
]

// Default stats for Instructor
const defaultInstructorStats = [
  { label: 'Cursos en Docencia', value: '...', change: 'Cursos activos', icon: 'school', bg: 'bg-blue-50', iconColor: '#006688' },
  { label: 'Aprendices a Cargo', value: '...', change: 'Estudiantes en formación', icon: 'group', bg: 'bg-purple-50', iconColor: '#8b5cf6' },
  { label: 'Entregas por Calificar', value: '...', change: 'Pendientes de revisión', icon: 'rate_review', bg: 'bg-amber-50', iconColor: '#d97706' },
  { label: 'Tasa de Aprobación', value: '...', change: 'Rendimiento académico', icon: 'trending_up', bg: 'bg-green-50', iconColor: '#10b981' },
  { label: 'Banco de Actividades', value: '...', change: 'Módulos pedagógicos', icon: 'task', bg: 'bg-orange-50', iconColor: '#f97316' },
  { label: 'Fichas / Cohortes', value: '...', change: 'Programas formativos', icon: 'domain', bg: 'bg-rose-50', iconColor: '#e11d48' },
  { label: 'Términos Clínicos', value: '...', change: 'Vocabulario y conceptos', icon: 'translate', bg: 'bg-teal-50', iconColor: '#0d9488' },
  { label: 'Arcade y Retos', value: '...', change: 'Minijuegos lúdicos', icon: 'sports_esports', bg: 'bg-indigo-50', iconColor: '#6366f1' },
]

// Default stats for Apprentice
const defaultAprendizStats = [
  { label: 'Cursos Activos', value: '...', change: 'Disponibles para ti', icon: 'school', bg: 'bg-blue-50', iconColor: '#006688' },
  { label: 'Mi Progreso', value: '...', change: 'Rendimiento en cursos', icon: 'trending_up', bg: 'bg-green-50', iconColor: '#10b981' },
  { label: 'Mis Logros', value: '...', change: 'Insignias desbloqueadas', icon: 'emoji_events', bg: 'bg-yellow-50', iconColor: '#f59e0b' },
  { label: 'Actividades', value: '...', change: 'Retos pedagógicos', icon: 'task', bg: 'bg-orange-50', iconColor: '#f97316' },
  { label: 'Mi Ranking', value: '...', change: 'Cuadro de honor', icon: 'leaderboard', bg: 'bg-red-50', iconColor: '#ef4444' },
  { label: 'Mis Entregas', value: '...', change: 'Tareas completadas', icon: 'fact_check', bg: 'bg-teal-50', iconColor: '#14b8a6' },
  { label: 'Puntos XP', value: '...', change: 'Nivel académico', icon: 'stars', bg: 'bg-purple-50', iconColor: '#8b5cf6' },
  { label: 'Juegos y Retos', value: 'Activo', change: 'Supera mini-juegos', icon: 'sports_esports', bg: 'bg-indigo-50', iconColor: '#6366f1' },
]

const visibleStats = ref(
  auth.role === 'admin' 
    ? defaultAdminStats 
    : auth.role === 'instructor' 
      ? defaultInstructorStats 
      : defaultAprendizStats
)

const pendingReviews = ref([])

const quickActions = computed(() => {
  if (auth.isAdmin) {
    return [
      { label: 'Cursos', path: '/dashboard/cursos', icon: 'school' },
      { label: 'Actividades', path: '/dashboard/actividades', icon: 'task' },
      { label: 'Currículo SENA', path: '/dashboard/curriculum', icon: 'schema' },
      { label: 'Usuarios', path: '/dashboard/usuarios', icon: 'manage_accounts' },
      { label: 'Analíticas', path: '/dashboard/analiticas', icon: 'analytics' },
      { label: 'Vocabulario', path: '/dashboard/vocabulario', icon: 'translate' },
      { label: 'Glosario', path: '/dashboard/glosario', icon: 'menu_book' },
      { label: 'Diálogos', path: '/dashboard/dialogos', icon: 'chat' },
    ]
  }

  if (auth.isInstructor) {
    return [
      { label: 'Cursos', path: '/dashboard/cursos', icon: 'school' },
      { label: 'Actividades', path: '/dashboard/actividades', icon: 'task' },
      { label: 'Currículo SENA', path: '/dashboard/curriculum', icon: 'schema' },
      { label: 'Analíticas', path: '/dashboard/analiticas', icon: 'analytics' },
      { label: 'Vocabulario', path: '/dashboard/vocabulario', icon: 'translate' },
      { label: 'Diálogos', path: '/dashboard/dialogos', icon: 'chat' },
      { label: 'Arcade Lúdico', path: '/dashboard/juegos', icon: 'sports_esports' },
      { label: 'Glosario', path: '/dashboard/glosario', icon: 'menu_book' },
    ]
  }

  return [
    { label: 'Cursos', path: '/dashboard/cursos', icon: 'school' },
    { label: 'Actividades', path: '/dashboard/actividades', icon: 'task' },
    { label: 'Mi Progreso', path: '/dashboard/progreso', icon: 'trending_up' },
    { label: 'Ranking', path: '/dashboard/ranking', icon: 'leaderboard' },
    { label: 'Mis Logros', path: '/dashboard/logros', icon: 'emoji_events' },
    { label: 'Juegos', path: '/dashboard/juegos', icon: 'sports_esports' },
    { label: 'Vocabulario', path: '/dashboard/vocabulario', icon: 'translate' },
    { label: 'Glosario', path: '/dashboard/glosario', icon: 'menu_book' },
  ]
})

const recentActivity = ref([
  { id: 1, title: 'Aprendiz Laura Gómez completó "Fundamentos de Enfermería"', time: 'Hace 2 horas', icon: 'school', bg: 'bg-blue-100', iconColor: '#006688', badge: 'Completado', badgeBg: 'bg-green-100', badgeText: 'text-green-700' },
  { id: 2, title: 'Nueva entrega en "Caso Clínico #7: Signos Vitales"', time: 'Hace 4 horas', icon: 'task', bg: 'bg-amber-100', iconColor: '#d97706', badge: 'Por Calificar', badgeBg: 'bg-amber-100', badgeText: 'text-amber-700' },
  { id: 3, title: 'Nuevo récord en Trivia Médica Contrarreloj (320 pts)', time: 'Ayer', icon: 'sports_esports', bg: 'bg-purple-100', iconColor: '#8b5cf6', badge: 'Arcade', badgeBg: 'bg-purple-100', badgeText: 'text-purple-700' },
  { id: 4, title: '3 aprendices avanzaron al 100% en Farmacología', time: 'Hace 2 días', icon: 'trending_up', bg: 'bg-emerald-100', iconColor: '#10b981', badge: 'Rendimiento', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-700' },
])

onMounted(async () => {
  try {
    const rawToken = auth.token || auth.user?.token
    const token = typeof rawToken === 'string' ? rawToken : (rawToken && typeof rawToken === 'object' && 'value' in rawToken ? rawToken.value : '')
    const authToken = token || (() => {
      try {
        const stored = localStorage.getItem('nursed.auth.user') || sessionStorage.getItem('nursed.auth.user')
        return stored ? JSON.parse(stored)?.token : ''
      } catch {
        return ''
      }
    })()

    const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {}
    const res = await fetch(`${apiBaseUrl}/api/dashboard/summary`, { headers })
    if (res.ok) {
      const json = await res.json()
      const data = json?.data || json
      if (Array.isArray(data.stats) && data.stats.length > 0) {
        visibleStats.value = data.stats
      }
      if (Array.isArray(data.recentActivity)) {
        recentActivity.value = data.recentActivity
      }
      if (Array.isArray(data.pendingReviews)) {
        pendingReviews.value = data.pendingReviews
      }
    }
  } catch (err) {
    console.warn('Could not load dashboard summary from backend, using defaults:', err)
  }
})
</script>
