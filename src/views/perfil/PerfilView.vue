<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-gray-800">Perfil</h2>
      <p class="text-gray-500 mt-1">Gestiona tu información personal y preferencias.</p>
    </div>

    <!-- Profile Header -->
    <div class="bg-gradient-to-r from-[#006688] to-[#4fc3f7] rounded-2xl p-6 text-white">
      <div class="flex items-center gap-5">
        <div class="w-20 h-20 rounded-full bg-white/20 border-4 border-white/40 flex items-center justify-center text-3xl font-bold">
          JP
        </div>
        <div>
          <h3 class="text-2xl font-bold">{{ auth.user.name }}</h3>
          <p class="text-blue-100 text-sm">{{ auth.user.email }}</p>
          <span :class="`mt-2 inline-block text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white`">{{ auth.roleLabel }}</span>
        </div>
        <button class="ml-auto px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
          <span class="material-symbols-outlined text-base">edit</span>
          Editar Perfil
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Info Card -->
      <div class="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 class="text-lg font-bold text-gray-800 mb-5">Información Personal</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div v-for="field in fields" :key="field.label" class="space-y-1.5">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">{{ field.label }}</label>
            <div v-if="!editing" class="text-sm font-medium text-gray-800 bg-gray-50 px-4 py-2.5 rounded-xl">{{ field.value }}</div>
            <input v-else :value="field.value" class="w-full text-sm text-gray-800 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#006688]/20" />
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button v-if="!editing" @click="editing = true" class="px-5 py-2 bg-[#006688] text-white text-sm font-semibold rounded-xl hover:bg-[#004e69] transition-colors">
            Editar
          </button>
          <template v-else>
            <button @click="editing = false" class="px-5 py-2 bg-[#006688] text-white text-sm font-semibold rounded-xl hover:bg-[#004e69] transition-colors">Guardar</button>
            <button @click="editing = false" class="px-5 py-2 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">Cancelar</button>
          </template>
        </div>
      </div>

      <!-- Stats Card -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 class="text-lg font-bold text-gray-800 mb-5">Estadísticas</h3>
        <div class="space-y-4">
          <div v-for="stat in stats" :key="stat.label" class="flex items-center gap-3">
            <div :class="`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${stat.bg}`">
              <span class="material-symbols-outlined text-base" :style="`color:${stat.iconColor}`">{{ stat.icon }}</span>
            </div>
            <div>
              <p class="text-lg font-bold text-gray-800 leading-tight">{{ stat.value }}</p>
              <p class="text-xs text-gray-500">{{ stat.label }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const editing = ref(false)

const fields = [
  { label: 'Nombre Completo', value: 'Juan Pérez' },
  { label: 'Correo Electrónico', value: 'juan@nursedacademy.com' },
  { label: 'Teléfono', value: '+57 300 123 4567' },
  { label: 'Ciudad', value: 'Bogotá, Colombia' },
  { label: 'Especialidad', value: 'Enfermería Clínica' },
  { label: 'Institución', value: 'Hospital Central' },
  { label: 'Fecha de Ingreso', value: 'Enero 2024' },
  { label: 'Estado', value: 'Activo' },
]

const stats = [
  { label: 'Cursos Completados', value: '4', icon: 'school', bg: 'bg-blue-50', iconColor: '#3b82f6' },
  { label: 'Horas de Estudio', value: '127h', icon: 'schedule', bg: 'bg-green-50', iconColor: '#10b981' },
  { label: 'Logros', value: '7', icon: 'emoji_events', bg: 'bg-amber-50', iconColor: '#f59e0b' },
  { label: 'Puesto en Ranking', value: '#4', icon: 'leaderboard', bg: 'bg-red-50', iconColor: '#ef4444' },
  { label: 'Puntos Totales', value: '3,750', icon: 'stars', bg: 'bg-purple-50', iconColor: '#8b5cf6' },
]
</script>
