<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-gray-800">Ranking</h2>
      <p class="text-gray-500 mt-1">Tabla de líderes. ¡Completa actividades y sube posiciones!</p>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-24 gap-4 flex-col">
      <div class="w-14 h-14 rounded-full border-4 border-[#006688]/20 border-t-[#006688] animate-spin"></div>
      <p class="text-gray-400 text-sm font-semibold">Cargando ranking...</p>
    </div>

    <template v-else>
      <!-- Top 3 Podium -->
      <div v-if="ranking.length >= 3" class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 class="text-lg font-bold text-gray-800 mb-6 text-center">Top 3 Líderes</h3>
        <div class="flex items-end justify-center gap-4">
          <!-- 2nd -->
          <div class="flex flex-col items-center gap-2">
            <div class="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600 border-4 border-gray-300">{{ ranking[1].initials }}</div>
            <p class="text-sm font-semibold text-gray-700">{{ ranking[1].name.split(' ')[0] }}</p>
            <p class="text-xs text-gray-500">{{ ranking[1].points.toLocaleString() }} XP</p>
            <div class="w-16 h-16 bg-gray-300 rounded-t-xl flex items-center justify-center"><span class="text-2xl font-black text-white">2</span></div>
          </div>
          <!-- 1st -->
          <div class="flex flex-col items-center gap-2">
            <span class="text-2xl">👑</span>
            <div class="w-16 h-16 rounded-full bg-[#006688] flex items-center justify-center text-2xl font-bold text-white border-4 border-[#c2e8ff]">{{ ranking[0].initials }}</div>
            <p class="text-sm font-semibold text-gray-700">{{ ranking[0].name.split(' ')[0] }}</p>
            <p class="text-xs text-[#006688] font-bold">{{ ranking[0].points.toLocaleString() }} XP</p>
            <div class="w-16 h-24 bg-[#006688] rounded-t-xl flex items-center justify-center"><span class="text-3xl font-black text-white">1</span></div>
          </div>
          <!-- 3rd -->
          <div class="flex flex-col items-center gap-2">
            <div class="w-14 h-14 rounded-full bg-amber-200 flex items-center justify-center text-2xl font-bold text-amber-700 border-4 border-amber-300">{{ ranking[2].initials }}</div>
            <p class="text-sm font-semibold text-gray-700">{{ ranking[2].name.split(' ')[0] }}</p>
            <p class="text-xs text-gray-500">{{ ranking[2].points.toLocaleString() }} XP</p>
            <div class="w-16 h-10 bg-amber-400 rounded-t-xl flex items-center justify-center"><span class="text-xl font-black text-white">3</span></div>
          </div>
        </div>
      </div>

      <!-- Full table -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="font-bold text-gray-800">Tabla General — Top 10</h3>
          <span class="text-xs text-gray-400 font-semibold">Ordenado por XP total</span>
        </div>
        <div v-if="ranking.length === 0" class="py-12 text-center text-gray-400 font-semibold">
          Aún no hay aprendices con actividades completadas.
        </div>
        <div class="divide-y divide-gray-50">
          <div
            v-for="entry in ranking"
            :key="entry.id"
            :class="`flex items-center gap-4 p-4 transition-colors ${entry.isMe ? 'bg-[#006688]/5 border-l-4 border-[#006688]' : 'hover:bg-gray-50'}`"
          >
            <div :class="`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${entry.rank <= 3 ? 'bg-[#006688] text-white' : 'bg-gray-100 text-gray-600'}`">
              {{ entry.rank }}
            </div>
            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold shrink-0 text-blue-600">
              {{ entry.initials }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-sm text-gray-800">
                {{ entry.name }}
                <span v-if="entry.isMe" class="text-xs text-[#006688] font-bold">(Tú)</span>
              </p>
              <p class="text-xs text-gray-500">{{ entry.activitiesPassed }} actividades aprobadas</p>
            </div>
            <div class="text-right shrink-0">
              <p class="font-bold text-[#006688]">{{ entry.points.toLocaleString() }} XP</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { getApiBaseUrl } from '../../lib/api'

const auth = useAuthStore()
const apiBaseUrl = getApiBaseUrl()
const loading = ref(true)
const ranking = ref([])

function getToken() {
  const stored = localStorage.getItem('nursed.auth.user') || sessionStorage.getItem('nursed.auth.user')
  return stored ? JSON.parse(stored)?.token : null
}

async function loadLeaderboard() {
  loading.value = true
  try {
    const token = getToken()
    if (!token) { loading.value = false; return }
    const res = await fetch(`${apiBaseUrl}/api/learner/leaderboard`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) {
      const data = await res.json()
      ranking.value = data.map(entry => ({
        ...entry,
        isMe: entry.id === auth.user?.id
      }))
    }
  } catch (e) { console.error(e) } finally { loading.value = false }
}

onMounted(loadLeaderboard)
</script>
