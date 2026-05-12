<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-gray-800">Ranking</h2>
      <p class="text-gray-500 mt-1">Tabla de líderes de la plataforma. ¡Sube posiciones completando cursos!</p>
    </div>

    <!-- Top 3 Podium -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 class="text-lg font-bold text-gray-800 mb-6 text-center">Top 3 Líderes</h3>
      <div class="flex items-end justify-center gap-4">
        <!-- 2nd place -->
        <div class="flex flex-col items-center gap-2">
          <div class="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600 border-4 border-gray-300">M</div>
          <p class="text-sm font-semibold text-gray-700">María López</p>
          <p class="text-xs text-gray-500">4,820 pts</p>
          <div class="w-16 h-16 bg-gray-300 rounded-t-xl flex items-center justify-center">
            <span class="text-2xl font-black text-white">2</span>
          </div>
        </div>
        <!-- 1st place -->
        <div class="flex flex-col items-center gap-2">
          <span class="text-2xl">👑</span>
          <div class="w-16 h-16 rounded-full bg-[#006688] flex items-center justify-center text-2xl font-bold text-white border-4 border-[#c2e8ff]">C</div>
          <p class="text-sm font-semibold text-gray-700">Carlos Díaz</p>
          <p class="text-xs text-[#006688] font-bold">5,640 pts</p>
          <div class="w-16 h-24 bg-[#006688] rounded-t-xl flex items-center justify-center">
            <span class="text-3xl font-black text-white">1</span>
          </div>
        </div>
        <!-- 3rd place -->
        <div class="flex flex-col items-center gap-2">
          <div class="w-14 h-14 rounded-full bg-amber-200 flex items-center justify-center text-2xl font-bold text-amber-700 border-4 border-amber-300">A</div>
          <p class="text-sm font-semibold text-gray-700">Ana Torres</p>
          <p class="text-xs text-gray-500">4,120 pts</p>
          <div class="w-16 h-10 bg-amber-400 rounded-t-xl flex items-center justify-center">
            <span class="text-xl font-black text-white">3</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Full Ranking Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-4 border-b border-gray-100">
        <h3 class="font-bold text-gray-800">Tabla General</h3>
      </div>
      <div class="divide-y divide-gray-50">
        <div v-for="entry in ranking" :key="entry.rank"
          :class="`flex items-center gap-4 p-4 transition-colors ${entry.isMe ? 'bg-[#006688]/5 border-l-4 border-[#006688]' : 'hover:bg-gray-50'}`">
          <div :class="`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${entry.rank <= 3 ? 'bg-[#006688] text-white' : 'bg-gray-100 text-gray-600'}`">
            {{ entry.rank }}
          </div>
          <div :class="`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${entry.avatarBg}`" :style="`color:${entry.avatarColor}`">
            {{ entry.initials }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-sm text-gray-800">{{ entry.name }} <span v-if="entry.isMe" class="text-xs text-[#006688] font-bold">(Tú)</span></p>
            <p class="text-xs text-gray-500">{{ entry.courses }} cursos completados</p>
          </div>
          <div class="text-right shrink-0">
            <p class="font-bold text-[#006688]">{{ entry.points.toLocaleString() }} pts</p>
            <p class="text-xs text-green-600">{{ entry.change }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()

const ranking = [
  { rank: 1, name: 'Carlos Díaz', initials: 'C', courses: 6, points: 5640, change: '↑ 0', avatarBg: 'bg-blue-100', avatarColor: '#3b82f6', isMe: false },
  { rank: 2, name: 'María López', initials: 'M', courses: 5, points: 4820, change: '↑ 1', avatarBg: 'bg-pink-100', avatarColor: '#ec4899', isMe: false },
  { rank: 3, name: 'Ana Torres', initials: 'A', courses: 5, points: 4120, change: '↓ 1', avatarBg: 'bg-amber-100', avatarColor: '#f59e0b', isMe: false },
  { rank: 4, name: 'Juan Pérez', initials: 'J', courses: 4, points: 3750, change: '↑ 2', avatarBg: 'bg-green-100', avatarColor: '#10b981', isMe: true },
  { rank: 5, name: 'Luis García', initials: 'L', courses: 4, points: 3210, change: '↓ 1', avatarBg: 'bg-purple-100', avatarColor: '#8b5cf6', isMe: false },
  { rank: 6, name: 'Sofia Ruiz', initials: 'S', courses: 3, points: 2980, change: '↑ 1', avatarBg: 'bg-orange-100', avatarColor: '#f97316', isMe: false },
  { rank: 7, name: 'Pedro Mora', initials: 'P', courses: 3, points: 2640, change: '↓ 2', avatarBg: 'bg-teal-100', avatarColor: '#14b8a6', isMe: false },
  { rank: 8, name: 'Laura Vega', initials: 'L', courses: 2, points: 1890, change: '↑ 3', avatarBg: 'bg-red-100', avatarColor: '#ef4444', isMe: false },
]
</script>
