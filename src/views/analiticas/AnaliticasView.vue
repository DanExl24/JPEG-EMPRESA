<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Analíticas</h2>
        <p class="text-gray-500 mt-1">{{ auth.isAdmin ? 'Métricas globales de la plataforma.' : 'Analítica de tus cursos y estudiantes.' }}</p>
      </div>
      <button class="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
        <span class="material-symbols-outlined text-base">download</span>
        Exportar
      </button>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="kpi in kpis" :key="kpi.label" class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <p class="text-xs font-medium text-gray-500 mb-1">{{ kpi.label }}</p>
        <p class="text-3xl font-bold text-gray-800">{{ kpi.value }}</p>
        <div :class="`flex items-center gap-1 mt-1 text-xs font-semibold ${kpi.trend > 0 ? 'text-green-600' : 'text-red-500'}`">
          <span class="material-symbols-outlined text-sm">{{ kpi.trend > 0 ? 'trending_up' : 'trending_down' }}</span>
          {{ Math.abs(kpi.trend) }}% vs mes anterior
        </div>
      </div>
    </div>

    <!-- Enrollment Chart -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 class="text-lg font-bold text-gray-800 mb-5">Matriculaciones por Mes</h3>
      <div class="flex items-end gap-2 h-40">
        <div v-for="m in monthData" :key="m.month" class="flex-1 flex flex-col items-center gap-1">
          <span class="text-xs text-gray-500">{{ m.count }}</span>
          <div class="w-full rounded-t-md hover:opacity-80 transition-opacity cursor-pointer"
            :style="`height: ${(m.count / 280) * 120}px; background: linear-gradient(to top, #006688, #4fc3f7)`"></div>
          <span class="text-xs text-gray-400 font-medium">{{ m.month }}</span>
        </div>
      </div>
    </div>

    <!-- Completion Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-5 border-b border-gray-100">
        <h3 class="font-bold text-gray-800">Tasa de Finalización por Curso</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50">
              <th class="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3">Curso</th>
              <th class="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3">Matriculados</th>
              <th class="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3">Completos</th>
              <th class="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3">Tasa</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="row in tableData" :key="row.course" class="hover:bg-gray-50 transition-colors">
              <td class="px-5 py-4 text-sm font-medium text-gray-800">{{ row.course }}</td>
              <td class="px-5 py-4 text-sm text-gray-600 text-right">{{ row.enrolled }}</td>
              <td class="px-5 py-4 text-sm text-gray-600 text-right">{{ row.completed }}</td>
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div class="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div class="h-1.5 rounded-full bg-[#006688]" :style="`width: ${row.rate}%`"></div>
                  </div>
                  <span :class="`text-xs font-bold ${row.rate >= 70 ? 'text-green-600' : row.rate >= 40 ? 'text-yellow-600' : 'text-red-500'}`">{{ row.rate }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()

const kpis = [
  { label: 'Usuarios Activos', value: '1,240', trend: 12 },
  { label: 'Matriculaciones', value: '4,830', trend: 8 },
  { label: 'Tasa Finalización', value: '64%', trend: 3 },
  { label: 'Satisfacción', value: '4.7 ★', trend: 5 },
]

const monthData = [
  { month: 'Ene', count: 120 },
  { month: 'Feb', count: 145 },
  { month: 'Mar', count: 180 },
  { month: 'Abr', count: 210 },
  { month: 'May', count: 280 },
  { month: 'Jun', count: 240 },
  { month: 'Jul', count: 195 },
  { month: 'Ago', count: 220 },
  { month: 'Sep', count: 265 },
  { month: 'Oct', count: 245 },
  { month: 'Nov', count: 190 },
  { month: 'Dic', count: 160 },
]

const tableData = [
  { course: 'Fundamentos de Enfermería', enrolled: 340, completed: 272, rate: 80 },
  { course: 'Farmacología Clínica', enrolled: 215, completed: 129, rate: 60 },
  { course: 'Cuidados Críticos UCI', enrolled: 98, completed: 39, rate: 40 },
  { course: 'Salud Mental y Psiquiatría', enrolled: 178, completed: 142, rate: 80 },
  { course: 'Atención Materno-Infantil', enrolled: 262, completed: 236, rate: 90 },
  { course: 'Urgencias y Emergencias', enrolled: 143, completed: 57, rate: 40 },
]
</script>
