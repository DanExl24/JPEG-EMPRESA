<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-gray-800">Juegos Educativos</h2>
      <p class="text-gray-500 mt-1">Aprende jugando con dinámicas interactivas y gamificadas.</p>
    </div>

    <!-- Featured Game -->
    <div class="bg-gradient-to-r from-[#006688] to-purple-600 rounded-2xl p-6 text-white flex items-center justify-between">
      <div>
        <span class="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">Destacado</span>
        <h3 class="text-2xl font-bold mt-3">Trivia Médica</h3>
        <p class="text-blue-100 text-sm mt-1">Pon a prueba tus conocimientos en farmacología y cuidados clínicos.</p>
        <div class="flex items-center gap-4 mt-4">
          <span class="flex items-center gap-1 text-sm"><span class="material-symbols-outlined text-base">people</span> 234 jugando</span>
          <span class="flex items-center gap-1 text-sm"><span class="material-symbols-outlined text-base">emoji_events</span> +50 pts por partida</span>
        </div>
        <button class="mt-4 px-6 py-2 bg-white text-[#006688] font-bold rounded-full text-sm hover:bg-blue-50 transition-colors">
          Jugar Ahora
        </button>
      </div>
      <span class="material-symbols-outlined text-8xl opacity-30 hidden sm:block">sports_esports</span>
    </div>

    <!-- Games Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="game in games" :key="game.id" class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer">
        <div :class="`h-28 flex items-center justify-center ${game.bg}`">
          <span class="material-symbols-outlined text-5xl group-hover:scale-110 transition-transform" :style="`color:${game.iconColor}`">{{ game.icon }}</span>
        </div>
        <div class="p-5">
          <div class="flex items-center justify-between mb-2">
            <span :class="`text-xs font-bold px-2 py-1 rounded-full ${game.diffBg} ${game.diffText}`">{{ game.difficulty }}</span>
            <span class="flex items-center gap-1 text-xs text-amber-600 font-semibold">
              <span class="material-symbols-outlined text-sm">emoji_events</span>
              +{{ game.pts }} pts
            </span>
          </div>
          <h4 class="font-bold text-gray-800 mb-1">{{ game.name }}</h4>
          <p class="text-xs text-gray-500 mb-3">{{ game.desc }}</p>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1 text-xs text-gray-400">
              <span class="material-symbols-outlined text-sm">timer</span>
              {{ game.duration }}
            </div>
            <button class="px-4 py-1.5 bg-[#006688] text-white text-xs font-bold rounded-full hover:bg-[#004e69] transition-colors">
              Jugar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()

const games = [
  { id: 1, name: 'Trivia Médica', desc: 'Preguntas rápidas de conocimiento clínico y farmacológico.', icon: 'quiz', bg: 'bg-blue-50', iconColor: '#3b82f6', difficulty: 'Fácil', diffBg: 'bg-green-100', diffText: 'text-green-700', pts: 50, duration: '5 min' },
  { id: 2, name: 'Anatomy Explorer', desc: 'Identifica estructuras anatómicas en modelos 3D interactivos.', icon: 'biotech', bg: 'bg-red-50', iconColor: '#ef4444', difficulty: 'Medio', diffBg: 'bg-yellow-100', diffText: 'text-yellow-700', pts: 80, duration: '10 min' },
  { id: 3, name: 'Drug Match', desc: 'Empareja medicamentos con sus indicaciones y efectos.', icon: 'medication', bg: 'bg-orange-50', iconColor: '#f97316', difficulty: 'Medio', diffBg: 'bg-yellow-100', diffText: 'text-yellow-700', pts: 70, duration: '7 min' },
  { id: 4, name: 'Caso de Emergencia', desc: 'Toma decisiones clínicas en simulaciones de emergencia.', icon: 'emergency', bg: 'bg-purple-50', iconColor: '#8b5cf6', difficulty: 'Difícil', diffBg: 'bg-red-100', diffText: 'text-red-700', pts: 150, duration: '15 min' },
  { id: 5, name: 'Memory Cards', desc: 'Memoriza conceptos clave con tarjetas de repetición espaciada.', icon: 'style', bg: 'bg-teal-50', iconColor: '#14b8a6', difficulty: 'Fácil', diffBg: 'bg-green-100', diffText: 'text-green-700', pts: 40, duration: '5 min' },
  { id: 6, name: 'Diagnóstico Rápido', desc: 'Identifica diagnósticos a partir de síntomas presentados.', icon: 'stethoscope', bg: 'bg-pink-50', iconColor: '#ec4899', difficulty: 'Difícil', diffBg: 'bg-red-100', diffText: 'text-red-700', pts: 120, duration: '12 min' },
]
</script>
