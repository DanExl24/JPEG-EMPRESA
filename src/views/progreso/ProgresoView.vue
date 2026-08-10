<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-gray-800">Progreso</h2>
      <p class="text-gray-500 mt-1">Visualiza tu avance real en actividades y cursos.</p>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-24 gap-4 flex-col">
      <div class="w-14 h-14 rounded-full border-4 border-[#006688]/20 border-t-[#006688] animate-spin"></div>
      <p class="text-gray-400 text-sm font-semibold">Calculando tu progreso...</p>
    </div>

    <template v-else>
      <!-- Overall Progress -->
      <div class="bg-gradient-to-r from-[#006688] to-[#4fc3f7] rounded-2xl p-6 text-white">
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="text-blue-100 text-sm font-medium">Progreso General</p>
            <p class="text-5xl font-bold mt-1">{{ progress.overallPct }}%</p>
            <p class="text-blue-100 text-xs mt-1">{{ progress.totalPassed }} de {{ progress.totalActivities }} actividades aprobadas</p>
          </div>
          <div class="text-center">
            <div class="w-20 h-20 rounded-full border-4 border-white/30 flex flex-col items-center justify-center">
              <span class="material-symbols-outlined text-3xl">stars</span>
              <span class="text-xs font-bold mt-0.5">{{ progress.xp }} XP</span>
            </div>
          </div>
        </div>
        <div class="w-full bg-white/20 rounded-full h-2 mb-2">
          <div class="h-2 rounded-full bg-white transition-all" :style="`width: ${progress.overallPct}%`"></div>
        </div>
      </div>

      <!-- Course Progress -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 class="text-lg font-bold text-gray-800 mb-5">Progreso por Curso</h3>
        <div v-if="progress.courses?.length" class="space-y-5">
          <div v-for="course in progress.courses" :key="course.name">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50">
                  <span class="material-symbols-outlined text-sm" style="color:#006688">school</span>
                </div>
                <span class="text-sm font-semibold text-gray-700">{{ course.name }}</span>
              </div>
              <div class="text-right">
                <span :class="`text-sm font-bold ${course.pct === 100 ? 'text-green-600' : 'text-[#006688]'}`">{{ course.pct }}%</span>
                <span class="text-xs text-gray-400 ml-2">{{ course.passed }}/{{ course.total }}</span>
              </div>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
              <div :class="`h-2 rounded-full transition-all ${course.pct === 100 ? 'bg-green-500' : 'bg-[#006688]'}`" :style="`width: ${course.pct}%`"></div>
            </div>
          </div>
        </div>
        <p v-else class="text-gray-400 text-sm text-center py-8">No hay actividades disponibles aún.</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getApiBaseUrl } from '../../lib/api'

const apiBaseUrl = getApiBaseUrl()
const loading = ref(true)
const progress = ref({ overallPct: 0, totalActivities: 0, totalPassed: 0, xp: 0, courses: [] })

function getToken() {
  const stored = localStorage.getItem('nursed.auth.user') || sessionStorage.getItem('nursed.auth.user')
  return stored ? JSON.parse(stored)?.token : null
}

async function loadProgress() {
  loading.value = true
  try {
    const token = getToken()
    if (!token) { loading.value = false; return }
    const res = await fetch(`${apiBaseUrl}/api/learner/progress`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) progress.value = await res.json()
  } catch (e) { console.error(e) } finally { loading.value = false }
}

onMounted(loadProgress)
</script>
