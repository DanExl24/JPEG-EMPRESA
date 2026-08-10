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
          {{ userInitials }}
        </div>
        <div>
          <h3 class="text-2xl font-bold">{{ auth.user.name }}</h3>
          <p class="text-blue-100 text-sm">{{ auth.user.email }}</p>
          <div class="flex items-center gap-3 mt-2">
            <span class="text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white">{{ auth.roleLabel }}</span>
            <span v-if="profile.xp !== undefined" class="text-xs font-bold px-3 py-1 rounded-full bg-amber-400/30 text-amber-100 flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">stars</span>
              {{ profile.xp }} XP
            </span>
          </div>
        </div>
        <button @click="editing = !editing" class="ml-auto px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
          <span class="material-symbols-outlined text-base">{{ editing ? 'close' : 'edit' }}</span>
          {{ editing ? 'Cancelar' : 'Editar Perfil' }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Info Card -->
      <div class="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 class="text-lg font-bold text-gray-800 mb-5">Información Personal</h3>

        <div v-if="loading" class="flex items-center justify-center py-8 text-gray-400">
          <div class="w-8 h-8 rounded-full border-2 border-[#006688]/20 border-t-[#006688] animate-spin mr-3"></div>
          Cargando...
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">Nombre</label>
            <div v-if="!editing" class="text-sm font-medium text-gray-800 bg-gray-50 px-4 py-2.5 rounded-xl">{{ editForm.nombre }}</div>
            <input v-else v-model="editForm.nombre" class="w-full text-sm text-gray-800 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#006688]/20" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">Apellido</label>
            <div v-if="!editing" class="text-sm font-medium text-gray-800 bg-gray-50 px-4 py-2.5 rounded-xl">{{ editForm.apellido }}</div>
            <input v-else v-model="editForm.apellido" class="w-full text-sm text-gray-800 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#006688]/20" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">Correo Electrónico</label>
            <div class="text-sm font-medium text-gray-800 bg-gray-50 px-4 py-2.5 rounded-xl">{{ profile.correo || '—' }}</div>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">Cédula</label>
            <div class="text-sm font-medium text-gray-800 bg-gray-50 px-4 py-2.5 rounded-xl">{{ profile.cedula || '—' }}</div>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">Rol</label>
            <div class="text-sm font-medium text-gray-800 bg-gray-50 px-4 py-2.5 rounded-xl">{{ auth.roleLabel }}</div>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">Actividades aprobadas</label>
            <div class="text-sm font-medium text-gray-800 bg-gray-50 px-4 py-2.5 rounded-xl">{{ profile.stats?.passedSubmissions ?? '—' }} / {{ profile.stats?.totalSubmissions ?? '—' }}</div>
          </div>
        </div>

        <div v-if="editing" class="flex gap-3 mt-6">
          <button @click="saveProfile" :disabled="saving" class="px-5 py-2 bg-[#006688] text-white text-sm font-semibold rounded-xl hover:bg-[#004e69] transition-colors disabled:opacity-60">
            {{ saving ? 'Guardando...' : 'Guardar cambios' }}
          </button>
          <button @click="editing = false" class="px-5 py-2 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">Cancelar</button>
        </div>
        <p v-if="saveMsg" class="mt-3 text-sm font-semibold text-green-600">{{ saveMsg }}</p>
      </div>

      <!-- Stats + Badges -->
      <div class="space-y-4">
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Estadísticas</h3>
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-amber-50">
                <span class="material-symbols-outlined text-base" style="color:#f59e0b">stars</span>
              </div>
              <div>
                <p class="text-lg font-bold text-gray-800 leading-tight">{{ profile.xp ?? 0 }} XP</p>
                <p class="text-xs text-gray-500">Puntos totales</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-green-50">
                <span class="material-symbols-outlined text-base" style="color:#10b981">task_alt</span>
              </div>
              <div>
                <p class="text-lg font-bold text-gray-800 leading-tight">{{ profile.stats?.passedSubmissions ?? 0 }}</p>
                <p class="text-xs text-gray-500">Actividades aprobadas</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-purple-50">
                <span class="material-symbols-outlined text-base" style="color:#8b5cf6">emoji_events</span>
              </div>
              <div>
                <p class="text-lg font-bold text-gray-800 leading-tight">{{ profile.badges?.length ?? 0 }}</p>
                <p class="text-xs text-gray-500">Logros desbloqueados</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Badges earned -->
        <div v-if="profile.badges?.length" class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Mis Logros</h3>
          <div class="grid grid-cols-3 gap-2">
            <div v-for="badge in profile.badges" :key="badge.key" class="flex flex-col items-center gap-1 p-2 rounded-xl bg-amber-50 border border-amber-100" :title="badge.description">
              <span class="text-2xl">{{ badge.iconEmoji }}</span>
              <p class="text-[10px] font-bold text-amber-800 text-center leading-tight">{{ badge.name }}</p>
            </div>
          </div>
        </div>
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

const loading = ref(true)
const saving = ref(false)
const editing = ref(false)
const saveMsg = ref('')
const profile = ref({})
const editForm = ref({ nombre: '', apellido: '' })

const userInitials = computed(() =>
  auth.user.name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'NA'
)

function getToken() {
  const stored = localStorage.getItem('nursed.auth.user') || sessionStorage.getItem('nursed.auth.user')
  return stored ? JSON.parse(stored)?.token : null
}

async function loadProfile() {
  loading.value = true
  try {
    const token = getToken()
    if (!token) { loading.value = false; return }
    const res = await fetch(`${apiBaseUrl}/api/learner/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) {
      profile.value = await res.json()
      editForm.value.nombre = profile.value.nombre || ''
      editForm.value.apellido = profile.value.apellido || ''
    }
  } catch (e) { console.error(e) } finally { loading.value = false }
}

async function saveProfile() {
  saving.value = true
  saveMsg.value = ''
  try {
    const token = getToken()
    const res = await fetch(`${apiBaseUrl}/api/learner/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ nombre: editForm.value.nombre, apellido: editForm.value.apellido })
    })
    if (res.ok) {
      const updated = await res.json()
      profile.value = { ...profile.value, ...updated }
      editing.value = false
      saveMsg.value = '✓ Perfil actualizado correctamente.'
      notificationStore.notify({ type: 'success', title: 'Perfil guardado', message: 'Tus datos fueron actualizados.' })
      setTimeout(() => { saveMsg.value = '' }, 3000)
    }
  } catch (e) {
    notificationStore.notify({ type: 'error', title: 'Error', message: 'No se pudo guardar el perfil.' })
  } finally { saving.value = false }
}

onMounted(loadProfile)
</script>
