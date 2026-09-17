<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-gray-800">Logros</h2>
      <p class="text-gray-500 mt-1">{{ auth.isAdmin ? 'Administra los logros de todos los usuarios.' : 'Tus logros desbloqueados y los próximos a alcanzar.' }}</p>
    </div>

    <!-- Unlocked Summary -->
    <div class="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-6 text-white flex items-center justify-between">
      <div>
        <p class="text-amber-100 text-sm">Logros Desbloqueados</p>
        <p class="text-5xl font-bold">7 <span class="text-2xl text-amber-200">/ 20</span></p>
        <p class="text-amber-100 text-xs mt-1">35% completado</p>
      </div>
      <span class="material-symbols-outlined text-7xl opacity-50">emoji_events</span>
    </div>

    <!-- Unlocked -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 class="text-lg font-bold text-gray-800 mb-4">Desbloqueados</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="logro in unlocked" :key="logro.id" class="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-b from-amber-50 to-orange-50 border border-amber-200">
          <div :class="`w-14 h-14 rounded-full flex items-center justify-center text-3xl ${logro.bg}`">
            {{ logro.emoji }}
          </div>
          <p class="text-xs font-bold text-gray-800 text-center">{{ logro.name }}</p>
          <p class="text-[10px] text-gray-500 text-center">{{ logro.desc }}</p>
          <span class="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">+{{ logro.pts }} pts</span>
        </div>
      </div>
    </div>

    <!-- Locked -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 class="text-lg font-bold text-gray-800 mb-4">Por Desbloquear</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="logro in locked" :key="logro.id" class="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 border border-gray-200 opacity-60">
          <div class="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-3xl grayscale">
            {{ logro.emoji }}
          </div>
          <p class="text-xs font-bold text-gray-600 text-center">{{ logro.name }}</p>
          <p class="text-[10px] text-gray-400 text-center">{{ logro.hint }}</p>
          <div class="w-full bg-gray-200 rounded-full h-1.5">
            <div class="h-1.5 rounded-full bg-[#006688]" :style="`width: ${logro.progress}%`"></div>
          </div>
          <span class="text-[10px] text-gray-400">{{ logro.progress }}% completado</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { getApiBaseUrl } from '../../lib/api'

const auth = useAuthStore()
const apiBaseUrl = getApiBaseUrl()
const loading = ref(false)

const DEFAULT_UNLOCKED = [
  { id: 1, name: 'Primer Paso', desc: 'Completaste tu primera actividad', emoji: '🎯', bg: 'bg-blue-100', pts: 10 },
  { id: 2, name: 'Estudiante Activo', desc: 'Acumulaste 50 XP', emoji: '🔥', bg: 'bg-orange-100', pts: 50 },
  { id: 3, name: 'Quiz Master', desc: 'Acumulaste 100 XP', emoji: '🧠', bg: 'bg-purple-100', pts: 100 }
]

const DEFAULT_LOCKED = [
  { id: 4, name: 'Dedicado', hint: 'Acumula 250 XP', emoji: '⚡', progress: 40 },
  { id: 5, name: 'Enfermero Pro', hint: 'Acumula 500 XP', emoji: '👩‍⚕️', progress: 20 },
  { id: 6, name: 'Experto Clínico', hint: 'Acumula 1000 XP', emoji: '🏆', progress: 10 }
]

const unlocked = ref([...DEFAULT_UNLOCKED])
const locked = ref([...DEFAULT_LOCKED])
const totalCount = ref(6)

function getToken() {
  const stored = localStorage.getItem('nursed.auth.user') || sessionStorage.getItem('nursed.auth.user')
  return stored ? JSON.parse(stored)?.token : null
}

async function fetchBadges() {
  loading.value = true
  try {
    const token = getToken()
    const res = await fetch(`${apiBaseUrl}/api/learner/badges`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
    if (res.ok) {
      const responseData = await res.json()
      const data = responseData.data || responseData
      if (data.unlocked && data.locked) {
        unlocked.value = data.unlocked.map(b => ({
          id: b.id,
          name: b.name,
          desc: b.description,
          emoji: b.iconEmoji,
          bg: 'bg-amber-100',
          pts: b.xpRequired
        }))
        locked.value = data.locked.map(b => ({
          id: b.id,
          name: b.name,
          hint: b.description,
          emoji: b.iconEmoji,
          progress: b.progress || 0
        }))
        totalCount.value = data.totalBadges || 6
      }
    }
  } catch (error) {
    console.error('Error cargando insignias desde backend:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchBadges()
})
</script>
