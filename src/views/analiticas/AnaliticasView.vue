<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <h2 class="text-2xl font-bold text-gray-800">{{ t('Analíticas') }}</h2>
          <span
            :class="`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              isInstructor
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-blue-100 text-blue-800 border border-blue-200'
            }`"
          >
            {{ isInstructor ? t('Instructor') : t('Administrador') }}
          </span>
        </div>
        <p class="text-gray-500 mt-1 text-sm">
          {{ isInstructor ? t('Analítica pedagógica de tus cursos y aprendices a cargo.') : t('Métricas institucionales y globales de la plataforma.') }}
        </p>
      </div>

      <!-- Action buttons -->
      <div class="flex items-center gap-3">
        <button
          @click="exportCsv"
          :disabled="isExporting"
          class="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 transition shadow-sm cursor-pointer disabled:opacity-50"
        >
          <span class="material-symbols-outlined text-base text-[#006688]">{{ isExporting ? 'hourglass_top' : 'download' }}</span>
          {{ isExporting ? t('Descargando reporte en formato CSV...') : t('Exportar Informe') }}
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="(kpi, idx) in kpis"
        :key="kpi.label || idx"
        class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow"
      >
        <div class="flex items-center justify-between mb-1">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide truncate">{{ t(kpi.label) }}</p>
          <span class="material-symbols-outlined text-gray-300 text-lg group-hover:text-[#006688] transition-colors">
            {{ getKpiIcon(kpi.label, idx) }}
          </span>
        </div>
        <p class="text-3xl font-extrabold text-gray-800 my-1 tracking-tight">{{ kpi.value }}</p>
        <div class="flex items-center justify-between text-xs mt-2">
          <span
            v-if="kpi.trend !== undefined"
            :class="`flex items-center gap-0.5 font-bold ${
              kpi.trend >= 0 ? 'text-green-600' : 'text-amber-600'
            }`"
          >
            <span class="material-symbols-outlined text-sm">{{ kpi.trend >= 0 ? 'trending_up' : 'trending_down' }}</span>
            {{ Math.abs(kpi.trend) }}% {{ t('vs mes anterior') }}
          </span>
          <span v-if="kpi.change" class="text-gray-400 font-medium truncate ml-1 text-[11px]">{{ t(kpi.change) }}</span>
        </div>
      </div>
    </div>

    <!-- Monthly Activity Chart -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-lg font-bold text-gray-800">{{ t(chartTitle) }}</h3>
          <p class="text-xs text-gray-400 mt-0.5">{{ isInstructor ? t('Entregas de retos y evaluaciones registradas durante el año') : t('Registro acumulado de usuarios y aprendices por mes') }}</p>
        </div>
        <div class="flex items-center gap-4 text-xs font-semibold text-gray-500">
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-sm bg-gradient-to-t from-[#006688] to-[#4fc3f7]"></span>
            <span>{{ isInstructor ? t('Entregas') : t('Registros') }}</span>
          </div>
        </div>
      </div>

      <!-- Bar Graph -->
      <div class="flex items-end gap-2 sm:gap-3 h-48 pt-4 pb-2 border-b border-gray-100">
        <div
          v-for="m in monthData"
          :key="m.month"
          class="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative"
        >
          <!-- Tooltip -->
          <div class="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-gray-800 text-white text-[11px] font-bold py-1 px-2 rounded-md pointer-events-none shadow-md whitespace-nowrap z-10">
            {{ m.count }} {{ isInstructor ? t('entregas') : t('usuarios') }}
          </div>

          <span class="text-xs font-bold text-gray-600 group-hover:text-[#006688] transition-colors">{{ m.count }}</span>
          <div
            class="w-full rounded-t-md transition-all duration-300 group-hover:brightness-110 cursor-pointer"
            :style="`height: ${getBarHeight(m.count)}px; background: linear-gradient(to top, #006688, #4fc3f7)`"
          ></div>
        </div>
      </div>

      <div class="flex items-center justify-between gap-2 sm:gap-3 mt-2">
        <div
          v-for="m in monthData"
          :key="m.month + '-lbl'"
          class="flex-1 text-center text-xs text-gray-400 font-semibold"
        >
          {{ m.month }}
        </div>
      </div>
    </div>

    <!-- Main Table: Courses or Activities -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 class="font-bold text-gray-800 text-base">{{ t(tableTitle) }}</h3>
          <p class="text-xs text-gray-400 mt-0.5">
            {{ isInstructor ? t('Detalle de aprobación y dificultades detectadas en cada actividad') : t('Tasa de avance y finalización por módulo clínico') }}
          </p>
        </div>
        <span class="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold">
          {{ tableData.length }} {{ isInstructor ? t('actividades') : t('cursos') }}
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-3">
                {{ isInstructor ? t('Actividad Formativa') : t('Curso') }}
              </th>
              <th class="text-right text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-3">
                {{ isInstructor ? t('Entregas') : t('Matriculados') }}
              </th>
              <th class="text-right text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-3">
                {{ isInstructor ? t('Aprobadas') : t('Completos') }}
              </th>
              <th class="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-3 w-48">
                {{ isInstructor ? t('Tasa de Éxito') : t('Tasa') }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="row in tableData" :key="row.course" class="hover:bg-gray-50 transition-colors">
              <td class="px-5 py-4 text-sm font-semibold text-gray-800 flex items-center gap-2.5">
                <span class="material-symbols-outlined text-[#006688] text-lg">
                  {{ isInstructor ? 'assignment' : 'school' }}
                </span>
                <span>{{ t(row.course) }}</span>
              </td>
              <td class="px-5 py-4 text-sm text-gray-600 text-right font-medium">{{ row.enrolled }}</td>
              <td class="px-5 py-4 text-sm text-gray-600 text-right font-medium">{{ row.completed }}</td>
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div class="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      class="h-2 rounded-full transition-all duration-500"
                      :class="row.rate >= 70 ? 'bg-emerald-500' : row.rate >= 40 ? 'bg-amber-500' : 'bg-red-500'"
                      :style="`width: ${row.rate}%`"
                    ></div>
                  </div>
                  <span
                    :class="`text-xs font-extrabold w-10 text-right ${
                      row.rate >= 70 ? 'text-emerald-600' : row.rate >= 40 ? 'text-amber-600' : 'text-red-500'
                    }`"
                  >
                    {{ row.rate }}%
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Instructor Specific View: At Risk Learners -->
    <div v-if="isInstructor" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="font-bold text-gray-800 text-base">{{ t('Aprendices en Seguimiento y Alerta Temprana') }}</h3>
            <span v-if="atRiskLearners.length > 0" class="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
              {{ atRiskLearners.filter(l => l.status === 'Riesgo Alto').length }} {{ t('Riesgo Alto') }}
            </span>
          </div>
          <p class="text-xs text-gray-400 mt-0.5">{{ t('Identificación pedagógica de aprendices con dificultades o actividades reprobadas.') }}</p>
        </div>
      </div>

      <div v-if="atRiskLearners.length === 0" class="p-8 text-center">
        <div class="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-2">
          <span class="material-symbols-outlined text-2xl">verified</span>
        </div>
        <p class="text-sm font-semibold text-gray-700">{{ t('Sin aprendices en estado de alerta actualmente.') }}</p>
        <p class="text-xs text-gray-400 mt-1">{{ t('Todos los aprendices registran un avance y rendimiento satisfactorio.') }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-3">{{ t('Aprendiz') }}</th>
              <th class="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-3">{{ t('Correo Institucional') }}</th>
              <th class="text-center text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-3">{{ t('Entregas Realizadas') }}</th>
              <th class="text-center text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-3">{{ t('Reprobadas') }}</th>
              <th class="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-3">{{ t('Rendimiento') }}</th>
              <th class="text-center text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-3">{{ t('Estado') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="learner in atRiskLearners" :key="learner.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-5 py-3.5 text-sm font-semibold text-gray-800 flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-blue-100 text-[#006688] flex items-center justify-center font-bold text-xs">
                  {{ learner.name.slice(0, 2).toUpperCase() }}
                </div>
                <span>{{ learner.name }}</span>
              </td>
              <td class="px-5 py-3.5 text-sm text-gray-500 font-medium">{{ learner.email }}</td>
              <td class="px-5 py-3.5 text-sm text-gray-700 text-center font-semibold">{{ learner.totalSubmissions }}</td>
              <td class="px-5 py-3.5 text-center">
                <span :class="`px-2 py-0.5 rounded-full text-xs font-bold ${learner.failedCount > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`">
                  {{ learner.failedCount }}
                </span>
              </td>
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-2">
                  <div class="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      class="h-1.5 rounded-full"
                      :class="learner.successRate >= 70 ? 'bg-emerald-500' : learner.successRate >= 50 ? 'bg-amber-500' : 'bg-red-500'"
                      :style="`width: ${learner.successRate}%`"
                    ></div>
                  </div>
                  <span class="text-xs font-bold text-gray-700">{{ learner.successRate }}%</span>
                </div>
              </td>
              <td class="px-5 py-3.5 text-center">
                <span
                  :class="`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                    learner.status === 'Riesgo Alto'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : learner.status === 'Seguimiento'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-green-50 text-green-700 border border-green-200'
                  }`"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="learner.status === 'Riesgo Alto' ? 'bg-red-500' : learner.status === 'Seguimiento' ? 'bg-amber-500' : 'bg-green-500'"></span>
                  {{ t(learner.status) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Admin Specific View: SENA Program Distribution -->
    <div v-else-if="isAdmin && programDistribution.length > 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-5 border-b border-gray-100">
        <h3 class="font-bold text-gray-800 text-base">{{ t('Distribución por Programas SENA') }}</h3>
        <p class="text-xs text-gray-400 mt-0.5">{{ t('Fichas y aprendices asociados a cada programa de formación') }}</p>
      </div>

      <div class="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="prog in programDistribution"
          :key="prog.program"
          class="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-[#006688]/30 transition shadow-xs"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="w-9 h-9 rounded-lg bg-teal-50 text-[#006688] flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-xl">schema</span>
            </div>
            <span class="text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">
              {{ prog.cohortsCount }} {{ t('Fichas / Cohortes') }}
            </span>
          </div>
          <h4 class="font-bold text-gray-800 text-sm mt-3">{{ t(prog.program) }}</h4>
          <div class="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
            <span>{{ t('Aprendices Matriculados') }}:</span>
            <span class="font-bold text-gray-800">{{ prog.apprenticesCount }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useI18nStore } from '../../stores/i18n'
import { getApiBaseUrl } from '../../lib/api'

const auth = useAuthStore()
const i18n = useI18nStore()
const apiBaseUrl = getApiBaseUrl()

const t = (phrase) => i18n.t(phrase)

const isInstructor = computed(() => auth.isInstructor || auth.user?.role?.toUpperCase() === 'INSTRUCTOR')
const isAdmin = computed(() => auth.isAdmin || auth.user?.role?.toUpperCase() === 'ADMIN')

const isExporting = ref(false)

const kpis = ref([
  { label: 'Usuarios Registrados', value: '1,240', trend: 12, change: '1,200 aprendices · 40 inst.' },
  { label: 'Programas SENA', value: '3', trend: 4, change: '6 fichas activas' },
  { label: 'Tasa Finalización', value: '64%', trend: 3, change: 'Promedio global' },
  { label: 'Entregas Totales', value: '4,830', trend: 8, change: 'Actividades evaluadas' },
])

const chartTitle = ref('Crecimiento de Nuevos Registros por Mes')

const monthData = ref([
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
])

const tableTitle = ref('Tasa de Finalización por Curso Clínico')

const tableData = ref([
  { course: 'Fundamentos de Enfermería', enrolled: 340, completed: 272, rate: 80 },
  { course: 'Farmacología Clínica', enrolled: 215, completed: 129, rate: 60 },
  { course: 'Cuidados Críticos UCI', enrolled: 98, completed: 39, rate: 40 },
  { course: 'Salud Mental y Psiquiatría', enrolled: 178, completed: 142, rate: 80 },
  { course: 'Atención Materno-Infantil', enrolled: 262, completed: 236, rate: 90 },
  { course: 'Urgencias y Emergencias', enrolled: 143, completed: 57, rate: 40 },
])

const atRiskLearners = ref([])
const programDistribution = ref([])

function getKpiIcon(label, idx) {
  const lbl = (label || '').toLowerCase()
  if (lbl.includes('usuario') || lbl.includes('aprendiz')) return 'group'
  if (lbl.includes('tasa') || lbl.includes('aprobación') || lbl.includes('finalización')) return 'trending_up'
  if (lbl.includes('entrega') || lbl.includes('calificar')) return 'fact_check'
  if (lbl.includes('programa') || lbl.includes('reto') || lbl.includes('curso')) return 'school'
  return ['group', 'school', 'trending_up', 'fact_check'][idx % 4]
}

function getBarHeight(count) {
  const max = Math.max(...monthData.value.map(m => m.count), 1)
  return Math.max(16, Math.round((count / max) * 140))
}

async function fetchAnalytics() {
  try {
    const endpoint = isInstructor.value ? `${apiBaseUrl}/api/analytics` : `${apiBaseUrl}/api/admin/analytics`
    const res = await fetch(endpoint, {
      headers: auth.token ? { 'Authorization': `Bearer ${auth.token}` } : {}
    })

    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data.kpis) && data.kpis.length > 0) {
        kpis.value = data.kpis
      }
      if (data.chartTitle) {
        chartTitle.value = data.chartTitle
      } else if (isInstructor.value) {
        chartTitle.value = 'Entregas y Evaluaciones por Mes'
      }
      if (Array.isArray(data.monthData) && data.monthData.length > 0) {
        monthData.value = data.monthData
      }
      if (data.tableTitle) {
        tableTitle.value = data.tableTitle
      } else if (isInstructor.value) {
        tableTitle.value = 'Rendimiento por Actividad / Reto'
      }
      if (Array.isArray(data.tableData) && data.tableData.length > 0) {
        tableData.value = data.tableData
      }
      if (Array.isArray(data.atRiskLearners)) {
        atRiskLearners.value = data.atRiskLearners
      }
      if (Array.isArray(data.programDistribution)) {
        programDistribution.value = data.programDistribution
      }
    }
  } catch (err) {
    console.warn('Could not fetch analytics from backend, using defaults:', err)
  }
}

function exportCsv() {
  isExporting.value = true
  try {
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'

    if (isInstructor.value) {
      csvContent += 'INFORME PEDAGÓGICO - INSTRUCTOR\n\n'
      csvContent += 'MÉTRICAS POR ACTIVIDAD\n'
      csvContent += 'Actividad,Entregas,Aprobadas,Tasa de Éxito (%)\n'
      tableData.value.forEach(row => {
        csvContent += `"${row.course}",${row.enrolled},${row.completed},${row.rate}%\n`
      })

      if (atRiskLearners.value.length > 0) {
        csvContent += '\nAPRENDICES EN SEGUIMIENTO / ALERTA TEMPRANA\n'
        csvContent += 'Nombre,Correo,Entregas,Reprobadas,Tasa de Éxito (%),Estado\n'
        atRiskLearners.value.forEach(l => {
          csvContent += `"${l.name}","${l.email}",${l.totalSubmissions},${l.failedCount},${l.successRate}%,"${l.status}"\n`
        })
      }
    } else {
      csvContent += 'INFORME INSTITUCIONAL - ADMINISTRACIÓN\n\n'
      csvContent += 'FINALIZACIÓN POR CURSO\n'
      csvContent += 'Curso,Matriculados,Completados,Tasa (%)\n'
      tableData.value.forEach(row => {
        csvContent += `"${row.course}",${row.enrolled},${row.completed},${row.rate}%\n`
      })

      if (programDistribution.value.length > 0) {
        csvContent += '\nPROGRAMAS FORMATIVOS SENA\n'
        csvContent += 'Programa,Fichas / Cohortes,Aprendices Matriculados\n'
        programDistribution.value.forEach(p => {
          csvContent += `"${p.program}",${p.cohortsCount},${p.apprenticesCount}\n`
        })
      }
    }

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    const dateStr = new Date().toISOString().slice(0, 10)
    link.setAttribute('download', `analiticas_${isInstructor.value ? 'instructor' : 'admin'}_${dateStr}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } finally {
    setTimeout(() => {
      isExporting.value = false
    }, 600)
  }
}

onMounted(() => {
  fetchAnalytics()
})
</script>
