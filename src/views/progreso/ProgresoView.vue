<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-gray-800">Progreso</h2>
      <p class="text-gray-500 mt-1">Visualiza tu avance académico y metas alcanzadas.</p>
    </div>

    <!-- Overall Progress -->
    <div class="bg-gradient-to-r from-[#006688] to-[#4fc3f7] rounded-2xl p-6 text-white">
      <div class="flex items-center justify-between mb-4">
        <div>
          <p class="text-blue-100 text-sm font-medium">Progreso General</p>
          <p class="text-5xl font-bold mt-1">68%</p>
        </div>
        <div class="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center">
          <span class="material-symbols-outlined text-4xl">trending_up</span>
        </div>
      </div>
      <div class="w-full bg-white/20 rounded-full h-2 mb-2">
        <div class="h-2 rounded-full bg-white transition-all" style="width: 68%"></div>
      </div>
      <p class="text-blue-100 text-xs">4 de 6 cursos en progreso activo · Meta: completar 6 cursos este semestre</p>
    </div>

    <!-- Course Progress -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 class="text-lg font-bold text-gray-800 mb-5">Progreso por Curso</h3>
      <div class="space-y-5">
        <div v-for="course in courses" :key="course.id">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-3">
              <div :class="`w-8 h-8 rounded-lg flex items-center justify-center ${course.iconBg}`">
                <span class="material-symbols-outlined text-sm" :style="`color:${course.iconColor}`">{{ course.icon }}</span>
              </div>
              <span class="text-sm font-semibold text-gray-700">{{ course.name }}</span>
            </div>
            <span :class="`text-sm font-bold ${course.pct === 100 ? 'text-green-600' : 'text-[#006688]'}`">{{ course.pct }}%</span>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2">
            <div :class="`h-2 rounded-full transition-all ${course.pct === 100 ? 'bg-green-500' : 'bg-[#006688]'}`" :style="`width: ${course.pct}%`"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Weekly Activity -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 class="text-lg font-bold text-gray-800 mb-5">Actividad Semanal (horas)</h3>
      <div class="flex items-end gap-3 h-32">
        <div v-for="day in weekActivity" :key="day.day" class="flex-1 flex flex-col items-center gap-1">
          <span class="text-xs text-gray-500 font-medium">{{ day.hours }}h</span>
          <div class="w-full rounded-t-lg transition-all hover:opacity-80" :style="`height: ${(day.hours / 5) * 80}px; background-color: ${day.hours > 0 ? '#006688' : '#e5e7eb'}`"></div>
          <span class="text-xs text-gray-400 font-medium">{{ day.day }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()

const courses = [
  { id: 1, name: 'Fundamentos de Enfermería', pct: 100, icon: 'medical_services', iconBg: 'bg-blue-50', iconColor: '#3b82f6' },
  { id: 2, name: 'Farmacología Clínica', pct: 75, icon: 'medication', iconBg: 'bg-orange-50', iconColor: '#f97316' },
  { id: 3, name: 'Cuidados Críticos UCI', pct: 55, icon: 'monitor_heart', iconBg: 'bg-red-50', iconColor: '#ef4444' },
  { id: 4, name: 'Salud Mental y Psiquiatría', pct: 30, icon: 'psychology', iconBg: 'bg-purple-50', iconColor: '#8b5cf6' },
  { id: 5, name: 'Atención Materno-Infantil', pct: 100, icon: 'child_care', iconBg: 'bg-pink-50', iconColor: '#ec4899' },
  { id: 6, name: 'Urgencias y Emergencias', pct: 10, icon: 'emergency', iconBg: 'bg-yellow-50', iconColor: '#f59e0b' },
]

const weekActivity = [
  { day: 'Lun', hours: 2 },
  { day: 'Mar', hours: 3 },
  { day: 'Mié', hours: 1 },
  { day: 'Jue', hours: 5 },
  { day: 'Vie', hours: 4 },
  { day: 'Sáb', hours: 2 },
  { day: 'Dom', hours: 0 },
]
</script>
