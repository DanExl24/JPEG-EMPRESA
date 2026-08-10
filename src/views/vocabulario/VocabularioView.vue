<template>
  <div class="space-y-6 max-w-5xl mx-auto pb-12">

    <!-- Header -->
    <div class="bg-gradient-to-r from-[#006688] to-[#00a8cc] rounded-3xl p-6 text-white shadow-md">
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <span class="material-symbols-outlined text-3xl">translate</span>
          </div>
          <div>
            <h2 class="text-2xl font-black">Vocabulario de Enfermería</h2>
            <p class="text-blue-100 text-sm mt-0.5">Términos clave en inglés y español para la práctica clínica</p>
          </div>
        </div>
        
        <button 
          v-if="canManage"
          @click="openAddModal"
          class="flex items-center gap-2 px-4 py-2 bg-white text-[#006688] rounded-xl text-xs font-bold hover:bg-blue-50 transition-colors shadow-sm"
        >
          <span class="material-symbols-outlined text-sm">add</span>
          Agregar Término
        </button>
      </div>
      
      <!-- Search -->
      <div class="mt-4 relative">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">search</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar término..."
          class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-gray-800 text-sm font-medium outline-none focus:ring-2 focus:ring-white/50"
        />
      </div>
    </div>

    <!-- Category filters -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="cat in categories"
        :key="cat"
        @click="activeCategory = cat"
        :class="`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
          activeCategory === cat
            ? 'bg-[#006688] text-white shadow-sm'
            : 'bg-white text-gray-600 border border-gray-200 hover:border-[#006688]'
        }`"
      >{{ cat }}</button>
    </div>

    <!-- Loading / Error -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-3">
      <div class="w-10 h-10 rounded-full border-4 border-[#006688]/20 border-t-[#006688] animate-spin"></div>
      <p class="text-xs font-bold text-gray-400">Cargando vocabulario...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-750 text-xs font-semibold space-y-2">
      <p>{{ error }}</p>
      <button @click="loadVocabulary" class="px-4 py-1 bg-red-600 text-white rounded-lg">Reintentar</button>
    </div>

    <!-- Vocabulary grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="term in filteredTerms"
        :key="term.id"
        class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-[#006688]/30 transition-all group flex flex-col justify-between"
      >
        <div class="space-y-2">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="text-base font-black text-gray-800 group-hover:text-[#006688] transition-colors truncate">{{ term.wordEn }}</p>
              <p class="text-xs font-bold text-[#006688] mt-0.5">{{ term.wordEs }}</p>
            </div>
            <span class="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 shrink-0">
              {{ term.category }}
            </span>
          </div>
          <p class="text-xs text-gray-500 leading-relaxed">{{ term.definition }}</p>
          <div v-if="term.example" class="pt-2 border-t border-gray-50">
            <p class="text-[10px] text-gray-400 italic">"{{ term.example }}"</p>
          </div>
        </div>

        <!-- Management Actions -->
        <div v-if="canManage" class="flex gap-2 justify-end mt-4 pt-3 border-t border-gray-50">
          <button @click="editTerm(term)" class="p-1 border border-gray-200 rounded-lg hover:border-[#006688] hover:text-[#006688] transition-all" title="Editar"><span class="material-symbols-outlined text-sm block">edit</span></button>
          <button @click="deleteTerm(term.id)" class="p-1 border border-red-100 rounded-lg text-red-500 hover:bg-red-50 transition-all" title="Eliminar"><span class="material-symbols-outlined text-sm block">delete</span></button>
        </div>
      </div>
    </div>

    <p v-if="!loading && filteredTerms.length === 0" class="text-center text-gray-400 py-12 font-semibold text-xs">
      No se encontraron términos para "{{ searchQuery }}"
    </p>

    <!-- CRUD Form Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div class="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-slide-up">
        <div class="bg-[#006688] text-white p-5 flex justify-between items-center">
          <h3 class="text-sm font-black">{{ editingTerm ? 'Editar Término' : 'Nuevo Término de Vocabulario' }}</h3>
          <button @click="showModal = false" class="text-white hover:text-cyan-200 transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form @submit.prevent="saveTerm" class="p-5 space-y-4 text-xs font-semibold">
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="text-gray-500">Palabra en Inglés</label>
              <input type="text" v-model="form.wordEn" required class="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#006688] font-medium" />
            </div>
            <div class="space-y-1">
              <label class="text-gray-500">Traducción al Español</label>
              <input type="text" v-model="form.wordEs" required class="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#006688] font-medium" />
            </div>
          </div>
          <div class="space-y-1">
            <label class="text-gray-500">Categoría</label>
            <input type="text" v-model="form.category" required class="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#006688] font-medium" placeholder="Ej. Procedimientos, Anatomía..." />
          </div>
          <div class="space-y-1">
            <label class="text-gray-500">Definición</label>
            <textarea v-model="form.definition" required rows="3" class="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#006688] font-medium" placeholder="Definición corta en español..."></textarea>
          </div>
          <div class="space-y-1">
            <label class="text-gray-500">Ejemplo de Uso (Inglés - Opcional)</label>
            <input type="text" v-model="form.example" class="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#006688] font-medium" placeholder="Ej. Inject the drug intravenously." />
          </div>

          <div class="flex gap-3 pt-2">
            <button type="submit" :disabled="saving" class="flex-1 py-2.5 bg-[#006688] hover:bg-[#004e69] text-white rounded-xl font-bold transition-all disabled:opacity-60">
              {{ saving ? 'Guardando...' : (editingTerm ? 'Guardar Cambios' : 'Crear Término') }}
            </button>
            <button type="button" @click="showModal = false" class="px-4 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all">Cancelar</button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useNotificationStore } from '../../stores/notification'
import { getApiBaseUrl } from '../../lib/api'

const auth = useAuthStore()
const notificationStore = useNotificationStore()
const apiBaseUrl = getApiBaseUrl()

const vocabulary = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref(null)

const searchQuery = ref('')
const activeCategory = ref('Todos')

// Modal state
const showModal = ref(false)
const editingTerm = ref(null)
const form = ref({ wordEn: '', wordEs: '', category: 'Signos Vitales', definition: '', example: '' })

const canManage = computed(() => auth.isAdmin || auth.isInstructor)

const categories = computed(() => {
  const cats = new Set(vocabulary.value.map(v => v.category))
  return ['Todos', ...Array.from(cats)].sort()
})

function getToken() {
  const stored = localStorage.getItem('nursed.auth.user') || sessionStorage.getItem('nursed.auth.user')
  return stored ? JSON.parse(stored)?.token : null
}

async function loadVocabulary() {
  loading.value = true
  error.value = null
  try {
    const token = getToken()
    const res = await fetch(`${apiBaseUrl}/api/content/vocabulary`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('No se pudo cargar el vocabulario.')
    vocabulary.value = await res.json()
  } catch (err) {
    console.error(err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const filteredTerms = computed(() => {
  let list = vocabulary.value
  if (activeCategory.value !== 'Todos') {
    list = list.filter(t => t.category === activeCategory.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(t =>
      t.wordEn.toLowerCase().includes(q) ||
      t.wordEs.toLowerCase().includes(q) ||
      t.definition.toLowerCase().includes(q)
    )
  }
  return list
})

function openAddModal() {
  editingTerm.value = null
  form.value = { wordEn: '', wordEs: '', category: 'Signos Vitales', definition: '', example: '' }
  showModal.value = true
}

function editTerm(term) {
  editingTerm.value = term
  form.value = { ...term }
  showModal.value = true
}

async function saveTerm() {
  saving.value = true
  const token = getToken()
  const headers = { 
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }

  let method = 'POST'
  let url = `${apiBaseUrl}/api/content/vocabulary`
  if (editingTerm.value) {
    method = 'PUT'
    url += `/${editingTerm.value.id}`
  }

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(form.value)
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.message || 'Error al guardar el término.')
    }

    notificationStore.notify({ type: 'success', title: 'Término guardado', message: 'El término fue actualizado.' })
    showModal.value = false
    await loadVocabulary()
  } catch (err) {
    console.error(err)
    notificationStore.notify({ type: 'error', title: 'Error', message: err.message })
  } finally {
    saving.value = false
  }
}

async function deleteTerm(id) {
  if (!confirm('¿Deseas eliminar este término de vocabulario?')) return
  const token = getToken()
  try {
    const res = await fetch(`${apiBaseUrl}/api/content/vocabulary/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Error al eliminar el término.')
    notificationStore.notify({ type: 'success', title: 'Eliminado', message: 'Término borrado de forma permanente.' })
    await loadVocabulary()
  } catch (err) {
    console.error(err)
    notificationStore.notify({ type: 'error', title: 'Error', message: err.message })
  }
}

onMounted(loadVocabulary)
</script>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.3s ease-out forwards;
}
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.backdrop-blur-xs {
  backdrop-filter: blur(2px);
}
</style>
