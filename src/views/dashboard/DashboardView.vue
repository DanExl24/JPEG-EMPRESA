<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-gray-800">Bienvenido, {{ auth.user.name }}</h2>
      <p class="text-gray-500 mt-1">Aquí tienes un resumen de tu actividad reciente.</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="stat in visibleStats" :key="stat.label" class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium text-gray-500">{{ stat.label }}</span>
          <div :class="`w-9 h-9 rounded-xl flex items-center justify-center ${stat.bg}`">
            <span class="material-symbols-outlined text-lg" :style="`color: ${stat.iconColor}`">{{ stat.icon }}</span>
          </div>
        </div>
        <div class="text-3xl font-bold text-gray-800">{{ stat.value }}</div>
        <div class="text-xs text-green-600 mt-1 font-medium">{{ stat.change }}</div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 class="text-lg font-bold text-gray-800 mb-4">Accesos Rápidos</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <router-link
          v-for="action in quickActions"
          :key="action.path"
          :to="action.path"
          class="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-[#006688] hover:bg-[#006688]/5 transition-all group"
        >
          <span class="material-symbols-outlined text-3xl text-[#006688] group-hover:scale-110 transition-transform">{{ action.icon }}</span>
          <span class="text-xs font-semibold text-gray-600 text-center">{{ action.label }}</span>
        </router-link>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 class="text-lg font-bold text-gray-800 mb-4">Actividad Reciente</h3>
      <div class="space-y-3">
        <div v-for="item in recentActivity" :key="item.id" class="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
          <div :class="`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.bg}`">
            <span class="material-symbols-outlined text-sm" :style="`color: ${item.iconColor}`">{{ item.icon }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-800">{{ item.title }}</p>
            <p class="text-xs text-gray-500">{{ item.time }}</p>
          </div>
          <span :class="`text-xs font-semibold px-2 py-1 rounded-full ${item.badgeBg} ${item.badgeText}`">{{ item.badge }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()

const allStats = [
  { label: 'Cursos Activos', value: '12', change: '+2 esta semana', icon: 'school', bg: 'bg-blue-50', iconColor: '#3b82f6', roles: ['admin', 'instructor', 'aprendiz'] },
  { label: 'Usuarios', value: '1,240', change: '+18 nuevos', icon: 'group', bg: 'bg-purple-50', iconColor: '#8b5cf6', roles: ['admin'] },
  { label: 'Mi Progreso', value: '68%', change: '+5% este mes', icon: 'trending_up', bg: 'bg-green-50', iconColor: '#10b981', roles: ['aprendiz', 'instructor'] },
  { label: 'Logros', value: '7', change: '+1 desbloqueado', icon: 'emoji_events', bg: 'bg-yellow-50', iconColor: '#f59e0b', roles: ['admin', 'instructor', 'aprendiz'] },
  { label: 'Actividades', value: '34', change: '5 pendientes', icon: 'task', bg: 'bg-orange-50', iconColor: '#f97316', roles: ['admin', 'instructor', 'aprendiz'] },
  { label: 'Ranking', value: '#3', change: 'Subiste 2 posiciones', icon: 'leaderboard', bg: 'bg-red-50', iconColor: '#ef4444', roles: ['instructor', 'aprendiz'] },
  { label: 'Ingresos Cursos', value: '$4,820', change: '+12% mensual', icon: 'payments', bg: 'bg-teal-50', iconColor: '#14b8a6', roles: ['admin'] },
  { label: 'Tiempo Estudio', value: '24h', change: '+3h esta semana', icon: 'schedule', bg: 'bg-indigo-50', iconColor: '#6366f1', roles: ['aprendiz'] },
]

const visibleStats = computed(() => allStats.filter(s => s.roles.includes(auth.role)))

const allQuickActions = [
  { label: 'Dashboard', path: '/dashboard/inicio', icon: 'dashboard', roles: ['admin', 'instructor', 'aprendiz'] },
  { label: 'Cursos', path: '/dashboard/cursos', icon: 'school', roles: ['admin', 'instructor', 'aprendiz'] },
  { label: 'Actividades', path: '/dashboard/actividades', icon: 'task', roles: ['admin', 'instructor', 'aprendiz'] },
  { label: 'Progreso', path: '/dashboard/progreso', icon: 'trending_up', roles: ['admin', 'instructor', 'aprendiz'] },
  { label: 'Ranking', path: '/dashboard/ranking', icon: 'leaderboard', roles: ['admin', 'instructor', 'aprendiz'] },
  { label: 'Logros', path: '/dashboard/logros', icon: 'emoji_events', roles: ['admin', 'instructor', 'aprendiz'] },
  { label: 'Juegos', path: '/dashboard/juegos', icon: 'sports_esports', roles: ['admin', 'instructor', 'aprendiz'] },
  { label: 'Analíticas', path: '/dashboard/analiticas', icon: 'analytics', roles: ['admin', 'instructor'] },
  { label: 'Usuarios', path: '/dashboard/usuarios', icon: 'manage_accounts', roles: ['admin'] },
]

const quickActions = computed(() => allQuickActions.filter(a => a.roles.includes(auth.role)))

const recentActivity = [
  { id: 1, title: 'Completaste "Fundamentos de Enfermería"', time: 'Hace 2 horas', icon: 'school', bg: 'bg-blue-100', iconColor: '#3b82f6', badge: 'Completado', badgeBg: 'bg-green-100', badgeText: 'text-green-700' },
  { id: 2, title: 'Nuevo logro desbloqueado: "Primer Examen"', time: 'Hace 5 horas', icon: 'emoji_events', bg: 'bg-yellow-100', iconColor: '#f59e0b', badge: 'Logro', badgeBg: 'bg-yellow-100', badgeText: 'text-yellow-700' },
  { id: 3, title: 'Actividad "Caso Clínico #7" asignada', time: 'Ayer', icon: 'task', bg: 'bg-orange-100', iconColor: '#f97316', badge: 'Pendiente', badgeBg: 'bg-orange-100', badgeText: 'text-orange-700' },
  { id: 4, title: 'Subiste al puesto #3 en el Ranking', time: 'Hace 2 días', icon: 'leaderboard', bg: 'bg-red-100', iconColor: '#ef4444', badge: 'Ranking', badgeBg: 'bg-red-100', badgeText: 'text-red-700' },
]
</script>
