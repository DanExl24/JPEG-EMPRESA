<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    
    <!-- Top Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <h2 class="text-2xl font-black text-gray-800 tracking-tight">Mis Fichas de Formación</h2>
          <span
            :class="`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              auth.isAdmin
                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                : 'bg-teal-100 text-teal-800 border border-teal-200'
            }`"
          >
            {{ auth.isAdmin ? 'Supervisión Global (Admin)' : 'Instructor Titular' }}
          </span>
        </div>
        <p class="text-gray-500 mt-1 text-sm">
          Supervisa el rendimiento académico, actividades resueltas, módulos y experiencia (XP) de tus aprendices.
        </p>
      </div>

      <!-- Action buttons -->
      <div class="flex items-center gap-2.5">
        <button
          @click="fetchCohorts"
          :disabled="loading"
          class="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 active:bg-gray-100 transition shadow-xs cursor-pointer disabled:opacity-50"
          title="Recargar datos de las fichas"
        >
          <span :class="`material-symbols-outlined text-base text-[#006688] ${loading ? 'animate-spin' : ''}`">
            refresh
          </span>
          Actualizar
        </button>
        <button
          v-if="activeCohort && activeCohort.apprentices.length > 0"
          @click="exportCohortCsv"
          class="flex items-center gap-1.5 px-3.5 py-2 bg-[#006688] hover:bg-[#004e69] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          title="Descargar informe de la ficha en CSV"
        >
          <span class="material-symbols-outlined text-base">download</span>
          Exportar Ficha
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-3xl border border-gray-100 shadow-xs">
      <div class="w-12 h-12 rounded-full border-4 border-[#006688]/20 border-t-[#006688] animate-spin"></div>
      <p class="text-xs font-bold text-gray-400">Cargando fichas y métricas de aprendices...</p>
    </div>

    <!-- Empty State: No Cohorts Assigned -->
    <div v-else-if="cohorts.length === 0" class="bg-white rounded-3xl p-10 text-center border border-dashed border-gray-200 shadow-xs space-y-3">
      <div class="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
        <span class="material-symbols-outlined text-3xl">groups_3</span>
      </div>
      <h3 class="text-base font-bold text-gray-800">No tienes fichas de formación asignadas</h3>
      <p class="text-xs text-gray-500 max-w-md mx-auto">
        Actualmente no estás asignado a ninguna ficha de formación. Solicita a un administrador que te vincule como instructor a las fichas correspondientes.
      </p>
    </div>

    <template v-else>
      <!-- Cohort Selection Bar / Tabs -->
      <div class="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 space-y-3">
        <div class="flex items-center justify-between">
          <label class="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <span class="material-symbols-outlined text-base text-[#006688]">badge</span>
            Selecciona la Ficha de Formación:
          </label>
          <span class="text-xs text-gray-400 font-semibold">
            {{ cohorts.length }} {{ cohorts.length === 1 ? 'ficha asignada' : 'fichas asignadas' }}
          </span>
        </div>

        <div class="flex flex-wrap gap-2.5">
          <button
            v-for="cohort in cohorts"
            :key="cohort.id"
            @click="selectedCohortId = cohort.id"
            :class="`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              selectedCohortId === cohort.id
                ? 'bg-[#006688] text-white shadow-sm ring-2 ring-[#006688]/30 scale-[1.01]'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/80'
            }`"
          >
            <span class="material-symbols-outlined text-sm">school</span>
            <span>Ficha {{ cohort.cohort_number }}</span>
            <span
              :class="`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                selectedCohortId === cohort.id
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`"
            >
              {{ cohort.totalApprentices }} aprendices
            </span>
          </button>
        </div>
      </div>

      <div v-if="activeCohort" class="space-y-6">
        
        <!-- Cohort Banner & Global KPI Cards -->
        <div class="bg-gradient-to-r from-[#004e69] via-[#006688] to-teal-700 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
          <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-black bg-white/20 px-2.5 py-0.5 rounded-full tracking-wider uppercase">
                  Ficha {{ activeCohort.cohort_number }}
                </span>
                <span class="text-teal-200 text-xs font-semibold">
                  {{ activeCohort.programName }}
                </span>
              </div>
              <h3 class="text-2xl font-black tracking-tight">Rendimiento Consolidado de la Ficha</h3>
              <p class="text-teal-100 text-xs">
                Métricas globales de dominio y progreso acumulado de los aprendices matriculados.
              </p>
            </div>

            <!-- Global XP Big Badge -->
            <div class="flex items-center gap-4 bg-white/10 backdrop-blur-xs border border-white/20 px-5 py-3.5 rounded-2xl shrink-0">
              <div class="w-12 h-12 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center shadow-md">
                <span class="material-symbols-outlined text-2xl font-black">stars</span>
              </div>
              <div>
                <span class="text-[11px] font-bold text-teal-100 uppercase tracking-wider block">XP Global de la Ficha</span>
                <span class="text-3xl font-black text-amber-300 leading-none">
                  {{ activeCohort.globalXp.toLocaleString() }} <span class="text-xs text-white/80 font-bold">XP</span>
                </span>
                <span class="text-[10px] text-teal-200 block mt-0.5">
                  Promedio: ~{{ activeCohort.averageXp.toLocaleString() }} XP / aprendiz
                </span>
              </div>
            </div>
          </div>

          <!-- Decorative background element -->
          <span class="material-symbols-outlined absolute -right-6 -bottom-8 text-9xl text-white/5 pointer-events-none select-none">
            military_tech
          </span>
        </div>

        <!-- 4 Stat Summary Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Card 1: Total Aprendices -->
          <div class="bg-white rounded-2xl p-4.5 shadow-xs border border-gray-100 flex items-center gap-3.5">
            <div class="w-11 h-11 rounded-xl bg-blue-50 text-[#006688] flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-2xl">group</span>
            </div>
            <div>
              <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Aprendices</p>
              <p class="text-xl font-black text-gray-800">{{ activeCohort.totalApprentices }}</p>
              <span class="text-[10px] font-semibold text-teal-600">Matriculados en ficha</span>
            </div>
          </div>

          <!-- Card 2: XP Global -->
          <div class="bg-white rounded-2xl p-4.5 shadow-xs border border-gray-100 flex items-center gap-3.5">
            <div class="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-2xl">emoji_events</span>
            </div>
            <div>
              <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wide">XP Global</p>
              <p class="text-xl font-black text-amber-600">{{ activeCohort.globalXp.toLocaleString() }}</p>
              <span class="text-[10px] font-semibold text-gray-400">Puntos acumulados</span>
            </div>
          </div>

          <!-- Card 3: Actividades Resueltas -->
          <div class="bg-white rounded-2xl p-4.5 shadow-xs border border-gray-100 flex items-center gap-3.5">
            <div class="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-2xl">task_alt</span>
            </div>
            <div>
              <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Actividades</p>
              <p class="text-xl font-black text-emerald-600">{{ activeCohort.totalActivitiesPassed }}</p>
              <span class="text-[10px] font-semibold text-gray-400">Entregas aprobadas</span>
            </div>
          </div>

          <!-- Card 4: Módulos Culminados -->
          <div class="bg-white rounded-2xl p-4.5 shadow-xs border border-gray-100 flex items-center gap-3.5">
            <div class="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-2xl">workspace_premium</span>
            </div>
            <div>
              <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Módulos Completados</p>
              <p class="text-xl font-black text-indigo-600">{{ activeCohort.totalModulesCompleted }}</p>
              <span class="text-[10px] font-semibold text-gray-400">Cursos al 100%</span>
            </div>
          </div>
        </div>

        <!-- Apprentices Detailed Section -->
        <div class="bg-white rounded-3xl shadow-xs border border-gray-100 overflow-hidden">
          
          <!-- Table Toolbar -->
          <div class="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
            <div class="flex items-center gap-2.5">
              <h4 class="font-extrabold text-gray-800 text-base">Aprendices de la Ficha</h4>
              <span class="text-xs font-bold text-[#006688] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                {{ filteredApprentices.length }} de {{ activeCohort.apprentices.length }}
              </span>
            </div>

            <div class="flex flex-wrap items-center gap-2.5">
              <!-- Search Bar -->
              <div class="relative min-w-[240px]">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  search
                </span>
                <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="Buscar por nombre o documento..."
                  class="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006688]/30 focus:border-[#006688]"
                />
              </div>

              <!-- Sort Dropdown -->
              <select
                v-model="sortBy"
                class="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006688]/30 focus:border-[#006688] text-gray-700 font-semibold cursor-pointer"
              >
                <option value="xp">Ordenar por: Mayor XP</option>
                <option value="activities">Ordenar por: Más Actividades</option>
                <option value="modules">Ordenar por: Más Módulos</option>
                <option value="name">Ordenar por: Nombre (A-Z)</option>
              </select>
            </div>
          </div>

          <!-- Empty list message -->
          <div v-if="filteredApprentices.length === 0" class="p-12 text-center text-gray-400 space-y-2">
            <span class="material-symbols-outlined text-4xl text-gray-300">person_search</span>
            <p class="text-sm font-semibold">No se encontraron aprendices con los filtros aplicados.</p>
          </div>

          <!-- Apprentices Table -->
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-gray-50/80 text-gray-500 font-bold border-b border-gray-100 uppercase tracking-wider text-[10px]">
                <tr>
                  <th class="py-3 px-4"># Ranking</th>
                  <th class="py-3 px-4">Aprendiz</th>
                  <th class="py-3 px-4 text-center">XP Individual</th>
                  <th class="py-3 px-4 text-center">Actividades Resueltas</th>
                  <th class="py-3 px-4">Módulos Completados</th>
                  <th class="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="(apprentice, idx) in filteredApprentices"
                  :key="apprentice.id"
                  class="hover:bg-gray-50/70 transition-colors"
                >
                  <!-- Rank Badge -->
                  <td class="py-3 px-4 whitespace-nowrap">
                    <span
                      :class="`w-6 h-6 rounded-full inline-flex items-center justify-center text-[10px] font-black ${
                        idx === 0
                          ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-300'
                          : idx === 1
                            ? 'bg-slate-200 text-slate-800'
                            : idx === 2
                              ? 'bg-amber-700/20 text-amber-900'
                              : 'bg-gray-100 text-gray-500'
                      }`"
                    >
                      {{ idx + 1 }}
                    </span>
                  </td>

                  <!-- Apprentice Info -->
                  <td class="py-3 px-4 whitespace-nowrap">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-[#006688] to-teal-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {{ getInitials(apprentice.nombre, apprentice.apellido) }}
                      </div>
                      <div>
                        <p class="font-bold text-gray-800 text-xs">{{ apprentice.fullName }}</p>
                        <div class="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                          <span>Doc: {{ apprentice.cedula }}</span>
                          <span v-if="apprentice.correo" class="truncate max-w-[160px]" :title="apprentice.correo">· {{ apprentice.correo }}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- Individual XP -->
                  <td class="py-3 px-4 whitespace-nowrap text-center">
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200/80 rounded-lg font-black text-xs">
                      <span class="material-symbols-outlined text-sm text-amber-500">stars</span>
                      {{ apprentice.xp.toLocaleString() }} XP
                    </span>
                  </td>

                  <!-- Activities Passed -->
                  <td class="py-3 px-4 whitespace-nowrap text-center">
                    <div class="inline-flex flex-col items-center">
                      <span class="font-black text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded-md text-xs flex items-center gap-1">
                        <span class="material-symbols-outlined text-xs">check_circle</span>
                        {{ apprentice.activitiesPassedCount }} {{ apprentice.activitiesPassedCount === 1 ? 'actividad' : 'actividades' }}
                      </span>
                    </div>
                  </td>

                  <!-- Completed Modules -->
                  <td class="py-3 px-4">
                    <div class="space-y-1.5 max-w-xs">
                      <!-- Count Badge -->
                      <div class="flex items-center gap-1.5">
                        <span
                          :class="`text-[11px] font-black px-2 py-0.5 rounded-md ${
                            apprentice.completedModulesCount > 0
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/70'
                              : 'bg-gray-100 text-gray-500'
                          }`"
                        >
                          {{ apprentice.completedModulesCount }} {{ apprentice.completedModulesCount === 1 ? 'módulo finalizado' : 'módulos finalizados' }}
                        </span>
                        <span v-if="apprentice.inProgressModulesCount > 0" class="text-[10px] text-[#006688] font-bold">
                          ({{ apprentice.inProgressModulesCount }} en curso)
                        </span>
                      </div>

                      <!-- List of Completed Course Badges -->
                      <div v-if="apprentice.completedModules.length > 0" class="flex flex-wrap gap-1">
                        <span
                          v-for="mod in apprentice.completedModules"
                          :key="mod.id"
                          class="text-[10px] font-bold bg-green-50 text-green-700 border border-green-200/80 px-2 py-0.5 rounded flex items-center gap-0.5 truncate max-w-[200px]"
                          :title="`Completado al 100%: ${mod.title}`"
                        >
                          <span class="material-symbols-outlined text-[11px]">done_all</span>
                          {{ mod.title }}
                        </span>
                      </div>
                      <p v-else class="text-[11px] text-gray-400 italic">
                        Sin módulos finalizados aún
                      </p>
                    </div>
                  </td>

                  <!-- Action: Open Detail Modal -->
                  <td class="py-3 px-4 whitespace-nowrap text-center">
                    <button
                      @click="selectedApprenticeDetail = apprentice"
                      class="px-2.5 py-1.5 bg-gray-100 hover:bg-[#006688] text-gray-600 hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 mx-auto"
                      title="Ver desglose detallado del aprendiz"
                    >
                      <span class="material-symbols-outlined text-sm">visibility</span>
                      Detalle
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </template>

    <!-- Modal: Detalle Completo del Aprendiz -->
    <div
      v-if="selectedApprenticeDetail"
      class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
      @click.self="selectedApprenticeDetail = null"
    >
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-fade-in">
        
        <!-- Modal Header -->
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-[#006688] text-white font-black text-sm flex items-center justify-center shadow-xs">
              {{ getInitials(selectedApprenticeDetail.nombre, selectedApprenticeDetail.apellido) }}
            </div>
            <div>
              <h3 class="text-base font-black text-gray-800">{{ selectedApprenticeDetail.fullName }}</h3>
              <p class="text-xs text-gray-500">Doc: {{ selectedApprenticeDetail.cedula }} · {{ selectedApprenticeDetail.correo }}</p>
            </div>
          </div>
          <button
            @click="selectedApprenticeDetail = null"
            class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer transition"
          >
            <span class="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <!-- Metric Badges in Modal -->
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-amber-50/80 border border-amber-200/70 rounded-2xl p-3 text-center">
            <span class="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Experiencia Acumulada</span>
            <span class="text-xl font-black text-amber-600">{{ selectedApprenticeDetail.xp.toLocaleString() }} XP</span>
          </div>
          <div class="bg-emerald-50/80 border border-emerald-200/70 rounded-2xl p-3 text-center">
            <span class="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Actividades Aprobadas</span>
            <span class="text-xl font-black text-emerald-600">{{ selectedApprenticeDetail.activitiesPassedCount }}</span>
          </div>
        </div>

        <!-- Módulos Finalizados -->
        <div class="space-y-2">
          <h4 class="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
            <span class="material-symbols-outlined text-sm text-green-600">verified</span>
            Módulos Finalizados al 100% ({{ selectedApprenticeDetail.completedModules.length }})
          </h4>
          <div v-if="selectedApprenticeDetail.completedModules.length > 0" class="space-y-1.5 max-h-36 overflow-y-auto">
            <div
              v-for="mod in selectedApprenticeDetail.completedModules"
              :key="mod.id"
              class="p-2.5 bg-green-50/70 border border-green-200/70 rounded-xl flex items-center justify-between text-xs text-green-800 font-bold"
            >
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-sm text-green-600">check_circle</span>
                <span>{{ mod.title }}</span>
              </div>
              <span class="text-[10px] bg-green-600 text-white px-2 py-0.5 rounded-full font-black">100%</span>
            </div>
          </div>
          <p v-else class="text-xs text-gray-400 italic p-3 bg-gray-50 rounded-xl">
            El aprendiz aún no ha finalizado ningún módulo formativo.
          </p>
        </div>

        <!-- Módulos en Progreso -->
        <div class="space-y-2">
          <h4 class="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
            <span class="material-symbols-outlined text-sm text-[#006688]">pending</span>
            Módulos en Curso ({{ selectedApprenticeDetail.inProgressModules.length }})
          </h4>
          <div v-if="selectedApprenticeDetail.inProgressModules.length > 0" class="space-y-1.5 max-h-36 overflow-y-auto">
            <div
              v-for="mod in selectedApprenticeDetail.inProgressModules"
              :key="mod.id"
              class="p-2.5 bg-blue-50/70 border border-blue-200/70 rounded-xl text-xs space-y-1"
            >
              <div class="flex items-center justify-between text-[#006688] font-bold">
                <span>{{ mod.title }}</span>
                <span class="text-[11px] font-black">{{ mod.progress }}%</span>
              </div>
              <div class="w-full bg-blue-200/60 rounded-full h-1.5 overflow-hidden">
                <div class="bg-[#006688] h-1.5 rounded-full transition-all" :style="`width: ${mod.progress}%`"></div>
              </div>
            </div>
          </div>
          <p v-else class="text-xs text-gray-400 italic p-3 bg-gray-50 rounded-xl">
            No hay otros módulos iniciados actualmente.
          </p>
        </div>

        <div class="pt-2 text-right">
          <button
            @click="selectedApprenticeDetail = null"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { getApiBaseUrl } from '../../lib/api'

const auth = useAuthStore()
const apiBaseUrl = getApiBaseUrl()

const loading = ref(true)
const cohorts = ref([])
const selectedCohortId = ref(null)
const searchQuery = ref('')
const sortBy = ref('xp')
const selectedApprenticeDetail = ref(null)

function getToken() {
  const rawToken = auth.token || auth.user?.token
  if (rawToken) return typeof rawToken === 'string' ? rawToken : rawToken.value
  try {
    const stored = localStorage.getItem('nursed.auth.user') || sessionStorage.getItem('nursed.auth.user')
    return stored ? JSON.parse(stored)?.token : null
  } catch {
    return null
  }
}

async function fetchCohorts() {
  loading.value = true
  try {
    const token = getToken()
    const res = await fetch(`${apiBaseUrl}/api/instructor/cohorts`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    if (res.ok) {
      const json = await res.json()
      const list = json?.data || json || []
      cohorts.value = Array.isArray(list) ? list : []
      if (cohorts.value.length > 0 && !selectedCohortId.value) {
        selectedCohortId.value = cohorts.value[0].id
      }
    }
  } catch (err) {
    console.error('Error fetching instructor cohorts:', err)
  } finally {
    loading.value = false
  }
}

const activeCohort = computed(() => {
  if (!selectedCohortId.value && cohorts.value.length > 0) return cohorts.value[0]
  return cohorts.value.find(c => c.id === selectedCohortId.value) || null
})

const filteredApprentices = computed(() => {
  if (!activeCohort.value) return []
  let list = [...(activeCohort.value.apprentices || [])]

  // Filter by search query
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(a =>
      a.fullName.toLowerCase().includes(q) ||
      a.cedula.toLowerCase().includes(q) ||
      a.correo.toLowerCase().includes(q)
    )
  }

  // Sort
  if (sortBy.value === 'xp') {
    list.sort((a, b) => b.xp - a.xp)
  } else if (sortBy.value === 'activities') {
    list.sort((a, b) => b.activitiesPassedCount - a.activitiesPassedCount)
  } else if (sortBy.value === 'modules') {
    list.sort((a, b) => b.completedModulesCount - a.completedModulesCount)
  } else if (sortBy.value === 'name') {
    list.sort((a, b) => a.fullName.localeCompare(b.fullName))
  }

  return list
})

function getInitials(nombre, apellido) {
  const n = (nombre || '').trim().charAt(0)
  const a = (apellido || '').trim().charAt(0)
  return `${n}${a}`.toUpperCase() || 'AP'
}

function exportCohortCsv() {
  if (!activeCohort.value || activeCohort.value.apprentices.length === 0) return
  const headers = ['Ranking', 'Nombre', 'Apellido', 'Documento', 'Correo', 'XP Individual', 'Actividades Aprobadas', 'Modulos Completados']
  const rows = activeCohort.value.apprentices.map((a, idx) => [
    idx + 1,
    `"${a.nombre}"`,
    `"${a.apellido}"`,
    `"${a.cedula}"`,
    `"${a.correo}"`,
    a.xp,
    a.activitiesPassedCount,
    a.completedModulesCount
  ])

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `Ficha_${activeCohort.value.cohort_number}_Aprendices.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(fetchCohorts)
</script>
