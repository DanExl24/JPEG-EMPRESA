<template>
  <div class="dashboard-layout bg-gray-50 min-h-screen flex">

    <!-- Sidebar -->
    <aside :class="`${sidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-gray-100 flex flex-col transition-all duration-300 shrink-0 relative`">

      <!-- Brand -->
      <div class="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
        <div class="w-8 h-8 rounded-xl bg-[#006688] flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-white text-base">medical_services</span>
        </div>
        <span v-if="sidebarOpen" class="text-sm font-black text-[#006688] tracking-tight whitespace-nowrap">Nursing Academy</span>
      </div>

      <!-- Toggle button -->
      <button @click="sidebarOpen = !sidebarOpen"
        class="absolute -right-3 top-16 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow z-10 transition-all">
        <span class="material-symbols-outlined text-gray-400 text-sm">{{ sidebarOpen ? 'chevron_left' : 'chevron_right' }}</span>
      </button>

      <!-- Navigation -->
      <nav class="flex-1 px-2 py-4 overflow-y-auto space-y-1">
        <div v-for="group in menuGroups" :key="group.label">
          <p v-if="sidebarOpen && group.label" class="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-1 mt-3">{{ group.label }}</p>
          <router-link
            v-for="item in group.items"
            :key="item.path"
            :to="item.path"
            :title="!sidebarOpen ? item.name : ''"
            :class="`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${isActive(item.path) ? 'bg-[#006688] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-[#006688]'}`">
            <span class="material-symbols-outlined text-xl shrink-0">{{ item.icon }}</span>
            <span v-if="sidebarOpen" class="whitespace-nowrap">{{ item.name }}</span>
          </router-link>
        </div>
      </nav>

      <!-- User -->
      <div class="border-t border-gray-100 p-3">
        <div v-if="sidebarOpen" class="flex items-center gap-3 px-1">
          <div class="w-9 h-9 rounded-full bg-[#006688] flex items-center justify-center text-white text-sm font-bold shrink-0">
            {{ userInitials }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-bold text-gray-800 truncate">{{ auth.user.name }}</p>
            <p class="text-[10px] text-gray-400 truncate">{{ auth.user.email }}</p>
            <span class="inline-block mt-0.5 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
              :class="{
                'bg-purple-100 text-purple-700': auth.role === 'admin',
                'bg-blue-100 text-blue-700': auth.role === 'instructor',
                'bg-teal-100 text-teal-700': auth.role === 'aprendiz',
              }">
              {{ auth.roleLabel }}
            </span>
          </div>
        </div>

        <button
          :class="`${sidebarOpen ? 'mt-3 w-full justify-start px-3' : 'mt-3 w-10 h-10 justify-center mx-auto'} flex items-center gap-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-red-50 hover:border-red-100 hover:text-red-600 transition-colors`"
          :title="sidebarOpen ? '' : 'Cerrar sesión'"
          type="button"
          @click="handleLogout"
        >
          <span class="material-symbols-outlined text-xl shrink-0">logout</span>
          <span v-if="sidebarOpen" class="text-sm font-medium">Cerrar sesión</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">

      <!-- Top Header -->
      <header class="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 class="text-base font-bold text-gray-800">{{ currentPageTitle }}</h1>
          <p class="text-xs text-gray-400">{{ today }}</p>
        </div>
        <div class="flex items-center gap-3">
          <button class="relative w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors">
            <span class="material-symbols-outlined text-gray-500 text-xl">notifications</span>
            <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"></span>
          </button>
          <button class="w-9 h-9 rounded-xl bg-[#006688] flex items-center justify-center text-white text-sm font-bold">
            {{ userInitials }}
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-6 overflow-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const sidebarOpen = ref(true)

const menuGroups = computed(() => {
  if (auth.role === 'instructor') {
    return [
      {
        label: '',
        items: [
          { name: 'Dashboard', path: '/dashboard/inicio', icon: 'dashboard' },
        ]
      },
      {
        label: 'Aprendizaje',
        items: [
          { name: 'Cursos', path: '/dashboard/cursos', icon: 'school' },
          { name: 'Actividades', path: '/dashboard/actividades', icon: 'task' },
        ]
      },
      {
        label: 'Comunidad',
        items: [
          { name: 'Juegos', path: '/dashboard/juegos', icon: 'sports_esports' },
        ]
      }
    ]
  }
  return [
    {
      label: '',
      items: [
        { name: 'Dashboard', path: '/dashboard/inicio', icon: 'dashboard' },
      ]
    },
    {
      label: 'Aprendizaje',
      items: [
        { name: 'Cursos', path: '/dashboard/cursos', icon: 'school' },
        { name: 'Actividades', path: '/dashboard/actividades', icon: 'task' },
        { name: 'Progreso', path: '/dashboard/progreso', icon: 'trending_up' },
      ]
    },
    {
      label: 'Comunidad',
      items: [
        { name: 'Ranking', path: '/dashboard/ranking', icon: 'leaderboard' },
        { name: 'Logros', path: '/dashboard/logros', icon: 'emoji_events' },
        { name: 'Juegos', path: '/dashboard/juegos', icon: 'sports_esports' },
      ]
    },
    {
      label: 'Gestión',
      items: [
        { name: 'Analíticas', path: '/dashboard/analiticas', icon: 'analytics' },
        { name: 'Usuarios', path: '/dashboard/usuarios', icon: 'group' },
      ]
    },
    {
      label: 'Cuenta',
      items: [
        { name: 'Perfil', path: '/dashboard/perfil', icon: 'person' },
        { name: 'Configuración', path: '/dashboard/settings', icon: 'settings' },
      ]
    },
  ]
})

const pageTitles = {
  '/dashboard/inicio': 'Dashboard',
  '/dashboard/cursos': 'Cursos',
  '/dashboard/actividades': 'Actividades',
  '/dashboard/progreso': 'Progreso',
  '/dashboard/ranking': 'Ranking',
  '/dashboard/logros': 'Logros',
  '/dashboard/juegos': 'Juegos',
  '/dashboard/analiticas': 'Analíticas',
  '/dashboard/usuarios': 'Usuarios',
  '/dashboard/perfil': 'Perfil',
  '/dashboard/settings': 'Configuración',
}

const currentPageTitle = computed(() => pageTitles[route.path] || 'Dashboard')

const userInitials = computed(() => {
  return auth.user.name
    .split(' ')
    .filter(Boolean)
    .map((name) => name[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'NA'
})

const today = computed(() => {
  return new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
})

function isActive(path) {
  return route.path === path
}

async function handleLogout() {
  auth.clearUser()
  await router.push('/login')
}
</script>
