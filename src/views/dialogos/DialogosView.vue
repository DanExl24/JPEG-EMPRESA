<template>
  <div class="space-y-6 max-w-5xl mx-auto pb-12">
    
    <!-- Top Header -->
    <div class="bg-gradient-to-r from-teal-600 to-emerald-500 rounded-3xl p-6 text-white shadow-md">
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <span class="material-symbols-outlined text-3xl">chat</span>
          </div>
          <div>
            <h2 class="text-2xl font-black">Diálogos Clínicos</h2>
            <p class="text-teal-100 text-sm mt-0.5">Escucha y practica conversaciones estándar de enfermería en inglés técnico.</p>
          </div>
        </div>

        <button 
          v-if="canManage"
          @click="openCreateModal"
          class="flex items-center gap-2 px-4 py-2 bg-white text-teal-700 rounded-xl text-xs font-bold hover:bg-teal-50 transition-colors shadow-sm"
        >
          <span class="material-symbols-outlined text-sm">add</span>
          Crear Diálogo
        </button>
      </div>
    </div>

    <!-- Loading / Error -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-3">
      <div class="w-10 h-10 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin"></div>
      <p class="text-xs font-bold text-gray-400">Cargando diálogos...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-750 text-xs font-semibold space-y-2">
      <p>{{ error }}</p>
      <button @click="loadDialogues" class="px-4 py-1.5 bg-red-650 text-white rounded-xl">Reintentar</button>
    </div>

    <!-- Main Section: Dialogue List or Active Player -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Dialogue List (1 Col) -->
      <div class="space-y-3">
        <span class="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Conversaciones disponibles</span>
        
        <div v-if="dialogues.length === 0" class="bg-white border border-gray-150 p-6 rounded-2xl text-center text-xs text-gray-400 font-semibold">
          No hay diálogos clínicos creados.
        </div>
        <div 
          v-for="d in dialogues" 
          :key="d.id"
          @click="selectDialogue(d)"
          :class="`p-4 bg-white border rounded-2xl text-left transition-all cursor-pointer hover:shadow-sm ${
            activeDialogue?.id === d.id 
              ? 'border-teal-500 bg-teal-50/10 ring-2 ring-teal-500/10' 
              : 'border-gray-100 hover:border-teal-300'
          }`"
        >
          <div class="flex justify-between items-start gap-2">
            <h4 class="font-bold text-gray-800 text-sm leading-snug">{{ d.title }}</h4>
            <span class="material-symbols-outlined text-teal-600 text-lg shrink-0">play_circle</span>
          </div>
          <p class="text-xs text-gray-500 line-clamp-2 mt-1 leading-normal">{{ d.description }}</p>
          
          <!-- Instructor tools on list items -->
          <div v-if="canManage" class="flex gap-2 justify-end mt-3 pt-2 border-t border-gray-50" @click.stop>
            <button @click="editDialogue(d)" class="p-1 border border-gray-200 rounded-lg hover:border-teal-600 hover:text-teal-600 transition-all" title="Editar"><span class="material-symbols-outlined text-xs block">edit</span></button>
            <button @click="deleteDialogueItem(d.id)" class="p-1 border border-red-100 rounded-lg text-red-500 hover:bg-red-50 transition-all" title="Eliminar"><span class="material-symbols-outlined text-xs block">delete</span></button>
          </div>
        </div>
      </div>

      <!-- Dialogue Player/Details (2 Cols) -->
      <div class="lg:col-span-2">
        <div v-if="!activeDialogue" class="bg-white border border-dashed border-gray-200 rounded-3xl p-16 text-center text-gray-400 flex flex-col items-center justify-center h-full min-h-[300px]">
          <span class="material-symbols-outlined text-5xl mb-3 text-gray-300">chat_bubble</span>
          <p class="font-bold text-sm">Selecciona una conversación</p>
          <p class="text-xs text-gray-400 mt-1 max-w-xs">Elige un diálogo clínico del menú izquierdo para iniciar la práctica de audio y lectura.</p>
        </div>

        <!-- Active dialogue chat view -->
        <div v-else class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div class="border-b border-gray-100 pb-4 flex justify-between items-center gap-3">
            <div>
              <h3 class="font-black text-gray-800 text-base">{{ activeDialogue.title }}</h3>
              <p class="text-xs text-gray-500 mt-0.5">{{ activeDialogue.description }}</p>
            </div>
            
            <button 
              @click="showTranslations = !showTranslations"
              class="px-3.5 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 transition-all flex items-center gap-1.5 shrink-0"
            >
              <span class="material-symbols-outlined text-sm">{{ showTranslations ? 'visibility_off' : 'visibility' }}</span>
              {{ showTranslations ? 'Ocultar Español' : 'Mostrar Español' }}
            </button>
          </div>

          <!-- Chat bubble layout -->
          <div class="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            <div 
              v-for="(line, idx) in activeDialogueLines" 
              :key="idx" 
              :class="`flex flex-col max-w-[85%] p-3.5 rounded-2xl space-y-1 transition-all ${
                line.speaker.toLowerCase() === 'nurse' || line.speaker.toLowerCase() === 'enfermera'
                  ? 'bg-teal-50/40 border border-teal-100/55 ml-auto rounded-tr-none'
                  : 'bg-gray-50 border border-gray-150 rounded-tl-none mr-auto'
              }`"
            >
              <!-- Speaker Name and Play Button -->
              <div class="flex items-center justify-between gap-4">
                <span class="text-[9px] uppercase tracking-wider font-extrabold text-gray-400">{{ line.speaker }}</span>
                <button 
                  @click="playLineAudio(line.textEn, idx)"
                  class="w-6 h-6 rounded-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center shadow-xs transition-transform hover:scale-105 active:scale-95 shrink-0"
                  title="Escuchar audio"
                >
                  <span class="material-symbols-outlined text-xs">
                    {{ playingLineIdx === idx ? 'pause' : 'volume_up' }}
                  </span>
                </button>
              </div>

              <!-- Content in English -->
              <p class="text-sm font-bold text-gray-850 leading-relaxed">{{ line.textEn }}</p>
              
              <!-- Content in Spanish (conditional) -->
              <transition name="fade">
                <p v-if="showTranslations" class="text-xs font-semibold text-teal-700/85 pt-1 border-t border-gray-100/60 leading-relaxed">
                  {{ line.textEs }}
                </p>
              </transition>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Instructor Dialog Form Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
      <div class="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        
        <div class="bg-teal-700 text-white p-5 flex justify-between items-center shrink-0">
          <h3 class="text-sm font-black">{{ editingDialogue ? 'Editar Diálogo Clínico' : 'Nuevo Diálogo de Práctica' }}</h3>
          <button @click="showModal = false" class="text-white hover:text-teal-200 transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form @submit.prevent="saveDialogue" class="p-6 overflow-y-auto flex-1 space-y-4 text-xs font-semibold">
          <div class="space-y-1">
            <label class="text-gray-500">Título de la Conversación</label>
            <input type="text" v-model="form.title" required class="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-teal-600 font-medium" placeholder="Ej. Admisión de Paciente en Urgencias" />
          </div>
          <div class="space-y-1">
            <label class="text-gray-500">Descripción / Contexto</label>
            <input type="text" v-model="form.description" class="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-teal-600 font-medium" placeholder="Ej. Diálogo introductorio de llenado de ficha médica en urgencias." />
          </div>

          <!-- Lines Editor -->
          <div class="space-y-3 pt-3 border-t border-gray-100">
            <div class="flex justify-between items-center">
              <span class="text-xs font-black text-teal-800 uppercase tracking-wider">Líneas de la Conversación</span>
              <button 
                type="button" 
                @click="addDialogueLine"
                class="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 font-bold rounded-lg transition-all flex items-center gap-1"
              >
                <span class="material-symbols-outlined text-xs">add</span>
                Agregar Línea
              </button>
            </div>

            <div v-for="(line, idx) in form.lines" :key="idx" class="bg-gray-50 p-4 border border-gray-200 rounded-2xl relative space-y-3">
              <button 
                v-if="form.lines.length > 1"
                @click="form.lines.splice(idx, 1)"
                type="button" 
                class="absolute top-2.5 right-2.5 text-red-400 hover:text-red-650"
              >
                <span class="material-symbols-outlined text-sm">close</span>
              </button>

              <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div class="space-y-1">
                  <label class="text-[9px] font-bold text-gray-400 uppercase">Hablante / Rol</label>
                  <select v-model="line.speaker" required class="w-full px-2 py-1.5 border border-gray-200 rounded-lg outline-none font-medium focus:border-teal-600 bg-white">
                    <option value="Nurse">Enfermera (Nurse)</option>
                    <option value="Patient">Paciente (Patient)</option>
                    <option value="Doctor">Médico (Doctor)</option>
                  </select>
                </div>
                <div class="space-y-1 sm:col-span-3">
                  <label class="text-[9px] font-bold text-gray-400 uppercase">Texto en Inglés (English)</label>
                  <input type="text" v-model="line.textEn" required class="w-full px-3 py-1.5 border border-gray-200 rounded-lg outline-none font-medium focus:border-teal-600" placeholder="Ej. Can you describe the pain?" />
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-[9px] font-bold text-gray-400 uppercase">Traducción al Español</label>
                <input type="text" v-model="line.textEs" required class="w-full px-3 py-1.5 border border-gray-200 rounded-lg outline-none font-medium focus:border-teal-600" placeholder="Ej. ¿Puede describir el dolor?" />
              </div>
            </div>
          </div>

          <div class="flex gap-3 pt-3 border-t border-gray-100">
            <button type="submit" :disabled="saving" class="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-1.5">
              <span class="material-symbols-outlined text-sm">save</span>
              {{ saving ? 'Guardando...' : (editingDialogue ? 'Guardar Cambios' : 'Crear Diálogo') }}
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

const auth = useAuthStore()
const notificationStore = useNotificationStore()
const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const dialogues = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref(null)

const activeDialogue = ref(null)
const showTranslations = ref(true)
const playingLineIdx = ref(null)

// Modal states
const showModal = ref(false)
const editingDialogue = ref(null)
const form = ref({ title: '', description: '', lines: [{ speaker: 'Nurse', textEn: '', textEs: '' }] })

const canManage = computed(() => auth.isAdmin || auth.isInstructor)

const activeDialogueLines = computed(() => {
  if (!activeDialogue.value?.content) return []
  try {
    return typeof activeDialogue.value.content === 'string' 
      ? JSON.parse(activeDialogue.value.content)
      : activeDialogue.value.content
  } catch (e) {
    console.error('Error parsing dialogue content:', e)
    return []
  }
})

function getToken() {
  const stored = localStorage.getItem('nursed.auth.user') || sessionStorage.getItem('nursed.auth.user')
  return stored ? JSON.parse(stored)?.token : null
}

async function loadDialogues() {
  loading.value = true
  error.value = null
  try {
    const token = getToken()
    const res = await fetch(`${apiBaseUrl}/api/content/dialogues`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('No se pudieron cargar los diálogos.')
    dialogues.value = await res.json()
    if (dialogues.value.length > 0 && !activeDialogue.value) {
      activeDialogue.value = dialogues.value[0]
    }
  } catch (err) {
    console.error(err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

function selectDialogue(d) {
  activeDialogue.value = d
  playingLineIdx.value = null
}

function playLineAudio(text, idx) {
  if (playingLineIdx.value === idx) {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    playingLineIdx.value = null
    return
  }

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.onend = () => {
      playingLineIdx.value = null
    }
    playingLineIdx.value = idx
    window.speechSynthesis.speak(utterance)
  } else {
    notificationStore.notify({ type: 'info', title: 'TTS', message: text })
  }
}

// --- CRUD Operations ---
function openCreateModal() {
  editingDialogue.value = null
  form.value = { title: '', description: '', lines: [{ speaker: 'Nurse', textEn: '', textEs: '' }] }
  showModal.value = true
}

function addDialogueLine() {
  const lastSpeaker = form.value.lines[form.value.lines.length - 1]?.speaker || 'Nurse'
  const nextSpeaker = lastSpeaker === 'Nurse' ? 'Patient' : 'Nurse'
  form.value.lines.push({ speaker: nextSpeaker, textEn: '', textEs: '' })
}

function editDialogue(d) {
  editingDialogue.value = d
  let lines = [{ speaker: 'Nurse', textEn: '', textEs: '' }]
  try {
    lines = typeof d.content === 'string' ? JSON.parse(d.content) : d.content
  } catch (e) {
    console.error(e)
  }
  form.value = { title: d.title, description: d.description, lines }
  showModal.value = true
}

async function saveDialogue() {
  saving.value = true
  const token = getToken()
  const headers = { 
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }

  let method = 'POST'
  let url = `${apiBaseUrl}/api/content/dialogues`
  if (editingDialogue.value) {
    method = 'PUT'
    url += `/${editingDialogue.value.id}`
  }

  const payload = {
    title: form.value.title,
    description: form.value.description,
    content: JSON.stringify(form.value.lines)
  }

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.message || 'Error al guardar el diálogo.')
    }

    notificationStore.notify({ type: 'success', title: 'Diálogo Guardado', message: 'El diálogo clínico fue actualizado.' })
    showModal.value = false
    await loadDialogues()
  } catch (err) {
    console.error(err)
    notificationStore.notify({ type: 'error', title: 'Error', message: err.message })
  } finally {
    saving.value = false
  }
}

async function deleteDialogueItem(id) {
  if (!confirm('¿Deseas eliminar este diálogo de práctica?')) return
  const token = getToken()
  try {
    const res = await fetch(`${apiBaseUrl}/api/content/dialogues/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Error al eliminar el diálogo.')
    notificationStore.notify({ type: 'success', title: 'Eliminado', message: 'Diálogo clínico borrado de forma permanente.' })
    if (activeDialogue.value?.id === id) activeDialogue.value = null
    await loadDialogues()
  } catch (err) {
    console.error(err)
    notificationStore.notify({ type: 'error', title: 'Error', message: err.message })
  }
}

onMounted(loadDialogues)
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
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
