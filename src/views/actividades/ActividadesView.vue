<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Actividades</h2>
        <p class="text-gray-500 mt-1">{{ auth.isAdmin || auth.isInstructor ? 'Gestiona y asigna actividades.' : 'Tus tareas y actividades pendientes.' }}</p>
      </div>
      <button v-if="auth.isAdmin || auth.isInstructor" class="flex items-center gap-2 px-4 py-2 bg-[#006688] text-white rounded-xl text-sm font-semibold hover:bg-[#004e69] transition-colors">
        <span class="material-symbols-outlined text-base">add</span>
        Nueva Actividad
      </button>
    </div>

    <!-- Summary pills -->
    <div class="flex flex-wrap gap-3">
      <div v-for="s in summary" :key="s.label" :class="`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${s.bg} ${s.text}`">
        <span class="material-symbols-outlined text-base">{{ s.icon }}</span>
        {{ s.count }} {{ s.label }}
      </div>
    </div>

    <!-- Activity List -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center gap-3">
        <span class="material-symbols-outlined text-gray-400">filter_list</span>
        <div class="flex gap-2">
          <button v-for="f in filters" :key="f.value" @click="activeFilter = f.value"
            :class="`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${activeFilter === f.value ? 'bg-[#006688] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`">
            {{ f.label }}
          </button>
        </div>
      </div>
      <div class="divide-y divide-gray-50">
        <div v-for="act in filteredActivities" :key="act.id" class="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
          <div :class="`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${act.iconBg}`">
            <span class="material-symbols-outlined text-lg" :style="`color:${act.iconColor}`">{{ act.icon }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-800 text-sm">{{ act.title }}</p>
            <p class="text-xs text-gray-500">{{ act.course }} · Vence: {{ act.due }}</p>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <span :class="`text-xs font-bold px-2 py-1 rounded-full ${act.statusBg} ${act.statusText}`">{{ act.status }}</span>
            <button class="text-[#006688] hover:text-[#004e69]">
              <span class="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const activeFilter = ref('all')
const filters = [
  { label: 'Todas', value: 'all' },
  { label: 'Pendientes', value: 'pending' },
  { label: 'Completadas', value: 'done' },
  { label: 'Vencidas', value: 'overdue' },
]

const activities = [
  { id: 1, title: 'Caso Clínico: Insuficiencia Cardíaca', course: 'Cuidados Críticos UCI', due: '15 May 2026', status: 'Pendiente', statusBg: 'bg-orange-100', statusText: 'text-orange-700', icon: 'description', iconBg: 'bg-orange-50', iconColor: '#f97316', state: 'pending' },
  { id: 2, title: 'Quiz: Farmacología Básica', course: 'Farmacología Clínica', due: '12 May 2026', status: 'Completada', statusBg: 'bg-green-100', statusText: 'text-green-700', icon: 'quiz', iconBg: 'bg-green-50', iconColor: '#10b981', state: 'done' },
  { id: 3, title: 'Simulación: RCP Avanzado', course: 'Urgencias y Emergencias', due: '10 May 2026', status: 'Vencida', statusBg: 'bg-red-100', statusText: 'text-red-700', icon: 'favorite', iconBg: 'bg-red-50', iconColor: '#ef4444', state: 'overdue' },
  { id: 4, title: 'Lectura: Psicología del Paciente', course: 'Salud Mental y Psiquiatría', due: '20 May 2026', status: 'Pendiente', statusBg: 'bg-orange-100', statusText: 'text-orange-700', icon: 'menu_book', iconBg: 'bg-purple-50', iconColor: '#8b5cf6', state: 'pending' },
  { id: 5, title: 'Evaluación: Cuidados Neonatales', course: 'Atención Materno-Infantil', due: '18 May 2026', status: 'Completada', statusBg: 'bg-green-100', statusText: 'text-green-700', icon: 'fact_check', iconBg: 'bg-pink-50', iconColor: '#ec4899', state: 'done' },
]

const filteredActivities = computed(() =>
  activeFilter.value === 'all' ? activities : activities.filter(a => a.state === activeFilter.value)
)

const summary = [
  { label: 'Pendientes', count: 2, icon: 'pending', bg: 'bg-orange-100', text: 'text-orange-700' },
  { label: 'Completadas', count: 2, icon: 'check_circle', bg: 'bg-green-100', text: 'text-green-700' },
  { label: 'Vencidas', count: 1, icon: 'warning', bg: 'bg-red-100', text: 'text-red-700' },
]
</script>
