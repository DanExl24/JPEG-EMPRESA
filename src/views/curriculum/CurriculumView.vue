<template>
  <div class="space-y-6 max-w-6xl mx-auto pb-12">
    
    <!-- Top Header -->
    <div class="bg-gradient-to-r from-[#006688] to-[#00a8cc] rounded-3xl p-6 text-white shadow-md flex items-center justify-between">
      <div class="space-y-1">
        <h2 class="text-2xl font-black">Gestión Curricular</h2>
        <p class="text-blue-100 text-sm">Administra programas de formación, competencias y resultados de aprendizaje (RAPs).</p>
      </div>
      <span class="material-symbols-outlined text-5xl opacity-40">schema</span>
    </div>

    <!-- Tab Selector -->
    <div class="flex border-b border-gray-200 gap-6 text-sm shrink-0">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id; clearSelection()"
        type="button"
        :class="`px-4 py-2.5 font-bold border-b-2 transition-all flex items-center gap-2 ${
          activeTab === tab.id 
            ? 'border-[#006688] text-[#006688]' 
            : 'border-transparent text-gray-400 hover:text-gray-600'
        }`"
      >
        <span class="material-symbols-outlined text-lg">{{ tab.icon }}</span>
        {{ tab.name }}
      </button>
    </div>

    <!-- Error/Loading states -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-3">
      <div class="w-12 h-12 rounded-full border-4 border-[#006688]/20 border-t-[#006688] animate-spin"></div>
      <p class="text-xs font-bold text-gray-400">Cargando datos curriculares...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-700 text-sm font-semibold space-y-2">
      <span class="material-symbols-outlined text-3xl text-red-400 block">error</span>
      <p>{{ error }}</p>
      <button @click="loadData" class="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors">Reintentar</button>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- List Panel (Left 2 cols) -->
      <div class="lg:col-span-2 space-y-4">
        
        <!-- Tab 1: Programs -->
        <div v-if="activeTab === 'programs'" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <span class="text-xs font-black text-gray-700 uppercase tracking-wider">Programas de Formación (Niveles)</span>
            <span class="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{{ programs.length }} total</span>
          </div>
          
          <div v-if="programs.length === 0" class="p-8 text-center text-gray-400 text-xs font-semibold">
            No hay programas creados todavía.
          </div>
          <div v-else class="divide-y divide-gray-50">
            <div v-for="p in programs" :key="p.id" class="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div class="space-y-0.5">
                <p class="text-sm font-bold text-gray-800">{{ p.name }}</p>
                <p class="text-[10px] text-gray-400 font-medium">ID: {{ p.id }} · {{ p.competencies?.length || 0 }} Competencias</p>
              </div>
              <div class="flex gap-2">
                <button @click="editProgram(p)" class="p-1.5 border border-gray-200 rounded-lg hover:border-[#006688] hover:text-[#006688] transition-colors" title="Editar"><span class="material-symbols-outlined text-base block">edit</span></button>
                <button @click="deleteProgramItem(p.id)" class="p-1.5 border border-red-100 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Eliminar"><span class="material-symbols-outlined text-base block">delete</span></button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 2: Competencies -->
        <div v-if="activeTab === 'competencies'" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-wrap items-center justify-between gap-3">
            <span class="text-xs font-black text-gray-700 uppercase tracking-wider">Competencias Curriculares</span>
            
            <!-- Program Filter -->
            <select v-model="filterProgramId" class="px-2 py-1 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-[#006688] font-bold text-gray-600">
              <option value="">Todos los programas</option>
              <option v-for="p in programs" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>

          <div v-if="filteredCompetencies.length === 0" class="p-8 text-center text-gray-400 text-xs font-semibold">
            No se encontraron competencias.
          </div>
          <div v-else class="divide-y divide-gray-50">
            <div v-for="c in filteredCompetencies" :key="c.id" class="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div class="space-y-0.5 max-w-[80%]">
                <div class="flex items-center gap-2">
                  <span class="text-[9px] uppercase tracking-wider font-extrabold bg-[#006688]/10 text-[#006688] px-1.5 py-0.5 rounded">{{ c.code }}</span>
                  <p class="text-xs text-gray-400 truncate">Programa: {{ c.program?.name }}</p>
                </div>
                <p class="text-sm font-bold text-gray-800 leading-snug">{{ c.name }}</p>
                <p class="text-[10px] text-gray-400 font-medium">{{ c.learning_outcomes?.length || 0 }} RAPs asociados</p>
              </div>
              <div class="flex gap-2 shrink-0">
                <button @click="editCompetency(c)" class="p-1.5 border border-gray-200 rounded-lg hover:border-[#006688] hover:text-[#006688] transition-colors" title="Editar"><span class="material-symbols-outlined text-base block">edit</span></button>
                <button @click="deleteCompetencyItem(c.id)" class="p-1.5 border border-red-100 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Eliminar"><span class="material-symbols-outlined text-base block">delete</span></button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 3: RAPs -->
        <div v-if="activeTab === 'raps'" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-wrap items-center justify-between gap-3">
            <span class="text-xs font-black text-gray-700 uppercase tracking-wider">Resultados de Aprendizaje (RAPs)</span>
            
            <!-- Competency Filter -->
            <select v-model="filterCompetencyId" class="px-2 py-1 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-[#006688] font-bold text-gray-600">
              <option value="">Todas las competencias</option>
              <option v-for="c in competencies" :key="c.id" :value="c.id">{{ c.code }} - {{ c.name.slice(0, 40) }}...</option>
            </select>
          </div>

          <div v-if="filteredRaps.length === 0" class="p-8 text-center text-gray-400 text-xs font-semibold">
            No se encontraron RAPs.
          </div>
          <div v-else class="divide-y divide-gray-50">
            <div v-for="r in filteredRaps" :key="r.id" class="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div class="space-y-0.5 max-w-[80%]">
                <div class="flex items-center gap-2">
                  <span class="text-[9px] uppercase tracking-wider font-extrabold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">{{ r.code }}</span>
                  <p class="text-xs text-gray-400 truncate">Competencia: {{ r.competency?.code }}</p>
                </div>
                <p class="text-sm font-bold text-gray-800 leading-snug">{{ r.name }}</p>
              </div>
              <div class="flex gap-2 shrink-0">
                <button @click="editRap(r)" class="p-1.5 border border-gray-200 rounded-lg hover:border-[#006688] hover:text-[#006688] transition-colors" title="Editar"><span class="material-symbols-outlined text-base block">edit</span></button>
                <button @click="deleteRapItem(r.id)" class="p-1.5 border border-red-100 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Eliminar"><span class="material-symbols-outlined text-base block">delete</span></button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Editor Panel (Right 1 col) -->
      <div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4 sticky top-6">
          <h3 class="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
            <span class="w-1.5 h-4 bg-[#006688] rounded-full"></span>
            {{ editingItem ? 'Editar Registro' : 'Nuevo Registro' }}
          </h3>

          <form @submit.prevent="saveItem" class="space-y-4 text-xs font-semibold">
            
            <!-- Program Form Fields -->
            <template v-if="activeTab === 'programs'">
              <div class="space-y-1">
                <label class="text-gray-550 block">Nombre del Programa/Nivel</label>
                <input type="text" v-model="programForm.name" required class="w-full px-3 py-2 border border-gray-200 rounded-xl font-medium outline-none focus:border-[#006688]" placeholder="Ej. Técnico en Auxiliar de Enfermería" />
              </div>
            </template>

            <!-- Competency Form Fields -->
            <template v-if="activeTab === 'competencies'">
              <div class="space-y-1">
                <label class="text-gray-550 block">Programa Asociado</label>
                <select v-model="competencyForm.programId" required class="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none font-medium focus:border-[#006688]">
                  <option value="">Selecciona programa...</option>
                  <option v-for="p in programs" :key="p.id" :value="p.id">{{ p.name }}</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="text-gray-550 block">Código Único (Competencia)</label>
                <input type="text" v-model="competencyForm.code" required class="w-full px-3 py-2 border border-gray-200 rounded-xl font-medium outline-none focus:border-[#006688]" placeholder="Ej. COMP-230101" />
              </div>
              <div class="space-y-1">
                <label class="text-gray-550 block">Nombre/Descripción de la Competencia</label>
                <textarea v-model="competencyForm.name" required rows="4" class="w-full px-3 py-2 border border-gray-200 rounded-xl font-medium outline-none focus:border-[#006688]" placeholder="Ej. Asistir procedimientos clínicos..."></textarea>
              </div>
            </template>

            <!-- RAP Form Fields -->
            <template v-if="activeTab === 'raps'">
              <div class="space-y-1">
                <label class="text-gray-550 block">Competencia Asociada</label>
                <select v-model="rapForm.competencyId" required class="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none font-medium focus:border-[#006688]">
                  <option value="">Selecciona competencia...</option>
                  <option v-for="c in competencies" :key="c.id" :value="c.id">{{ c.code }} - {{ c.name.slice(0, 45) }}...</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="text-gray-550 block">Código Único (RAP)</label>
                <input type="text" v-model="rapForm.code" required class="w-full px-3 py-2 border border-gray-200 rounded-xl font-medium outline-none focus:border-[#006688]" placeholder="Ej. RAP-01" />
              </div>
              <div class="space-y-1">
                <label class="text-gray-550 block">Resultado de Aprendizaje (RAP)</label>
                <textarea v-model="rapForm.name" required rows="4" class="w-full px-3 py-2 border border-gray-200 rounded-xl font-medium outline-none focus:border-[#006688]" placeholder="Ej. Monitorear y registrar signos vitales..."></textarea>
              </div>
            </template>

            <div class="flex gap-2 pt-2">
              <button 
                type="submit" 
                :disabled="saving"
                class="flex-1 py-2 bg-[#006688] hover:bg-[#004e69] text-white rounded-xl font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                <span class="material-symbols-outlined text-sm">save</span>
                {{ saving ? 'Guardando...' : (editingItem ? 'Actualizar' : 'Crear') }}
              </button>
              <button 
                v-if="editingItem"
                type="button" 
                @click="clearSelection"
                class="px-3 py-2 bg-gray-100 hover:bg-gray-250 text-gray-600 rounded-xl font-bold transition-all"
              >
                Cancelar
              </button>
            </div>

          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNotificationStore } from '../../stores/notification'
import { getApiBaseUrl } from '../../lib/api'

const notificationStore = useNotificationStore()
const apiBaseUrl = getApiBaseUrl()

const tabs = [
  { id: 'programs', name: '1. Programas / Niveles', icon: 'school' },
  { id: 'competencies', name: '2. Competencias', icon: 'menu_book' },
  { id: 'raps', name: '3. Resultados (RAPs)', icon: 'fact_check' }
]

const activeTab = ref('programs')
const loading = ref(true)
const saving = ref(false)
const error = ref(null)

const programs = ref([])
const competencies = ref([])
const raps = ref([])

// Filters
const filterProgramId = ref('')
const filterCompetencyId = ref('')

// Selection state
const editingItem = ref(null)

// Forms
const programForm = ref({ name: '' })
const competencyForm = ref({ code: '', name: '', programId: '' })
const rapForm = ref({ code: '', name: '', competencyId: '' })

// Filtered lists
const filteredCompetencies = computed(() => {
  if (!filterProgramId.value) return competencies.value
  return competencies.value.filter(c => c.program_id === parseInt(filterProgramId.value))
})

const filteredRaps = computed(() => {
  if (!filterCompetencyId.value) return raps.value
  return raps.value.filter(r => r.competency_id === parseInt(filterCompetencyId.value))
})

function getToken() {
  const stored = localStorage.getItem('nursed.auth.user') || sessionStorage.getItem('nursed.auth.user')
  return stored ? JSON.parse(stored)?.token : null
}

async function loadData() {
  loading.value = true
  error.value = null
  const token = getToken()
  if (!token) {
    error.value = 'Sesión no válida. Inicia sesión de nuevo.'
    loading.value = false
    return
  }

  try {
    const headers = { Authorization: `Bearer ${token}` }
    
    // Fetch all programs
    const progRes = await fetch(`${apiBaseUrl}/api/admin/curriculum/programs`, { headers })
    if (!progRes.ok) throw new Error('Error al cargar programas.')
    programs.value = await progRes.json()

    // Fetch competencies
    const compRes = await fetch(`${apiBaseUrl}/api/admin/curriculum/competencies`, { headers })
    if (!compRes.ok) throw new Error('Error al cargar competencias.')
    competencies.value = await compRes.json()

    // Fetch RAPs
    const rapsRes = await fetch(`${apiBaseUrl}/api/admin/curriculum/raps`, { headers })
    if (!rapsRes.ok) throw new Error('Error al cargar RAPs.')
    raps.value = await rapsRes.json()
  } catch (err) {
    console.error(err)
    error.value = err.message || 'Error al conectar con el servidor.'
  } finally {
    loading.value = false
  }
}

function clearSelection() {
  editingItem.value = null
  programForm.value = { name: '' }
  competencyForm.value = { code: '', name: '', programId: '' }
  rapForm.value = { code: '', name: '', competencyId: '' }
}

// --- EDIT HANDLERS ---
function editProgram(p) {
  editingItem.value = p
  programForm.value = { name: p.name }
}

function editCompetency(c) {
  editingItem.value = c
  competencyForm.value = { code: c.code, name: c.name, programId: c.program_id }
}

function editRap(r) {
  editingItem.value = r
  rapForm.value = { code: r.code, name: r.name, competencyId: r.competency_id }
}

// --- SAVE ACTION ---
async function saveItem() {
  saving.value = true
  const token = getToken()
  const headers = { 
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}` 
  }

  let url = ''
  let method = 'POST'
  let body = null

  if (activeTab.value === 'programs') {
    url = `${apiBaseUrl}/api/admin/curriculum/programs`
    body = programForm.value
  } else if (activeTab.value === 'competencies') {
    url = `${apiBaseUrl}/api/admin/curriculum/competencies`
    body = competencyForm.value
  } else if (activeTab.value === 'raps') {
    url = `${apiBaseUrl}/api/admin/curriculum/raps`
    body = rapForm.value
  }

  if (editingItem.value) {
    method = 'PUT'
    url += `/${editingItem.value.id}`
  }

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(body)
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Error al guardar el registro.')
    }

    notificationStore.notify({
      type: 'success',
      title: 'Guardado',
      message: 'El registro curricular se ha guardado exitosamente.'
    })
    
    clearSelection()
    await loadData()
  } catch (err) {
    console.error(err)
    notificationStore.notify({
      type: 'error',
      title: 'Error al Guardar',
      message: err.message || 'Intenta de nuevo.'
    })
  } finally {
    saving.value = false
  }
}

// --- DELETE ACTIONS ---
async function deleteProgramItem(id) {
  if (!confirm('¿Estás seguro de que deseas eliminar este programa? Se eliminarán todas sus competencias y RAPs asociados de forma permanente.')) return
  await performDelete(`${apiBaseUrl}/api/admin/curriculum/programs/${id}`)
}

async function deleteCompetencyItem(id) {
  if (!confirm('¿Estás seguro de que deseas eliminar esta competencia? Se eliminarán todos sus RAPs asociados.')) return
  await performDelete(`${apiBaseUrl}/api/admin/curriculum/competencies/${id}`)
}

async function deleteRapItem(id) {
  if (!confirm('¿Estás seguro de que deseas eliminar este Resultado de Aprendizaje (RAP)?')) return
  await performDelete(`${apiBaseUrl}/api/admin/curriculum/raps/${id}`)
}

async function performDelete(url) {
  const token = getToken()
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Error al eliminar el registro.')
    }
    notificationStore.notify({
      type: 'success',
      title: 'Eliminado',
      message: 'El registro fue eliminado correctamente.'
    })
    clearSelection()
    await loadData()
  } catch (err) {
    console.error(err)
    notificationStore.notify({
      type: 'error',
      title: 'Error al Eliminar',
      message: err.message || 'No se pudo completar la eliminación.'
    })
  }
}

onMounted(loadData)
</script>
