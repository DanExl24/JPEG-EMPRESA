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
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()

const unlocked = [
  { id: 1, name: 'Primer Paso', desc: 'Completaste tu primer curso', emoji: '🎯', bg: 'bg-blue-100', pts: 100 },
  { id: 2, name: 'Estudiante Activo', desc: '7 días seguidos de estudio', emoji: '🔥', bg: 'bg-orange-100', pts: 150 },
  { id: 3, name: 'Quiz Master', desc: 'Calificación perfecta en un quiz', emoji: '🧠', bg: 'bg-purple-100', pts: 200 },
  { id: 4, name: 'Madrugador', desc: 'Estudia antes de las 7am', emoji: '🌅', bg: 'bg-yellow-100', pts: 50 },
  { id: 5, name: 'Social Learner', desc: 'Completa 3 actividades grupales', emoji: '🤝', bg: 'bg-green-100', pts: 100 },
  { id: 6, name: 'Velocista', desc: 'Termina un módulo en 1 día', emoji: '⚡', bg: 'bg-cyan-100', pts: 80 },
  { id: 7, name: 'Enfermero Pro', desc: 'Completa módulo de Fundamentos', emoji: '👩‍⚕️', bg: 'bg-red-100', pts: 300 },
]

const locked = [
  { id: 8, name: 'Experto Clínico', hint: 'Completa 5 cursos avanzados', emoji: '🏆', progress: 40 },
  { id: 9, name: 'Mentor', hint: 'Ayuda a 10 compañeros', emoji: '🌟', progress: 20 },
  { id: 10, name: 'Maratón', hint: '30 días seguidos de estudio', emoji: '🏃', progress: 65 },
  { id: 11, name: 'Perfeccionista', hint: '10 calificaciones perfectas', emoji: '💎', progress: 30 },
  { id: 12, name: 'Investigador', hint: 'Lee 50 materiales de apoyo', emoji: '📚', progress: 55 },
  { id: 13, name: 'Top 1', hint: 'Llega al puesto #1 del ranking', emoji: '👑', progress: 10 },
]
</script>
