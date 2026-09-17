<template>
  <div class="space-y-6">
    <!-- Header Title -->
    <div>
      <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <span class="material-symbols-outlined text-[#006688] text-3xl">account_circle</span>
        Mi Perfil
      </h2>
      <p class="text-gray-500 text-sm mt-1">
        Consulta y actualiza tu información personal, credenciales de acceso y logros en la plataforma.
      </p>
    </div>

    <!-- Profile Hero Card -->
    <div
      class="bg-gradient-to-r from-[#006688] via-[#00779f] to-[#38bdf8] rounded-2xl p-6 sm:p-8 text-white shadow-md shadow-[#006688]/15 relative overflow-hidden"
    >
      <!-- Background subtle pattern/glow -->
      <div class="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>

      <div class="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative z-10">
        <!-- Avatar and Info -->
        <div class="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
          <div
            class="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-4xl font-black shadow-inner shrink-0 select-none"
          >
            {{ userInitials }}
          </div>

          <div class="space-y-1.5">
            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h3 class="text-2xl sm:text-3xl font-black tracking-tight">
                {{ displayName }}
              </h3>
              <span
                class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/25 text-white backdrop-blur-sm shadow-sm"
              >
                {{ roleLabel }}
              </span>
            </div>

            <p class="text-sky-100 text-sm flex items-center justify-center sm:justify-start gap-1.5">
              <span class="material-symbols-outlined text-base opacity-80">mail</span>
              {{ displayEmail }}
            </p>

            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <span class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-black/20 text-white backdrop-blur-sm">
                <span class="material-symbols-outlined text-sm opacity-80">badge</span>
                Doc: {{ profile.cedula || auth.user?.cedula || 'N/A' }}
              </span>

              <span
                v-if="profile.xp !== undefined || auth.user?.xp !== undefined"
                class="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-400 text-amber-950 shadow-sm"
              >
                <span class="material-symbols-outlined text-sm">stars</span>
                {{ profile.xp ?? auth.user?.xp ?? 0 }} XP
              </span>

              <span
                v-if="profile.createdAt"
                class="inline-flex items-center gap-1 text-xs font-medium text-sky-100/90 px-2 py-1"
              >
                <span class="material-symbols-outlined text-sm opacity-80">calendar_today</span>
                Miembro desde {{ formattedCreatedAt }}
              </span>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
          <button
            @click="openChangePasswordModal"
            class="px-4 py-2.5 bg-white/20 hover:bg-white/30 active:scale-95 border border-white/30 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 backdrop-blur-sm shadow-sm"
          >
            <span class="material-symbols-outlined text-lg">lock_reset</span>
            Cambiar Contraseña
          </button>

          <button
            @click="toggleEditMode"
            class="px-4 py-2.5 bg-white text-[#006688] hover:bg-sky-50 active:scale-95 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shadow-md shadow-black/10"
          >
            <span class="material-symbols-outlined text-lg">{{ editing ? 'close' : 'edit' }}</span>
            {{ editing ? 'Cancelar Edición' : 'Editar Datos' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left 2 Cols: Personal Info & Editable Form -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
            <div>
              <h3 class="text-base font-bold text-gray-800 flex items-center gap-2">
                <span class="material-symbols-outlined text-[#006688] text-xl">person</span>
                Información Personal
              </h3>
              <p class="text-xs text-gray-400 mt-0.5">Tus datos identificatorios dentro de la institución</p>
            </div>
            <span
              :class="[
                'text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1',
                editing ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700'
              ]"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="editing ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'"></span>
              {{ editing ? 'Modo edición activo' : 'Cuenta activa' }}
            </span>
          </div>

          <!-- Loading Skeleton -->
          <div v-if="loading" class="py-12 flex flex-col items-center justify-center text-gray-400">
            <span class="material-symbols-outlined text-3xl text-[#006688] animate-spin mb-2">progress_activity</span>
            <p class="text-xs font-medium">Cargando información del perfil...</p>
          </div>

          <!-- Profile Form / Details -->
          <div v-else>
            <form @submit.prevent="saveProfile" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Nombres -->
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Nombres <span v-if="editing" class="text-red-500">*</span>
                  </label>
                  <div
                    v-if="!editing"
                    class="text-sm font-semibold text-gray-800 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100"
                  >
                    {{ editForm.nombre || '—' }}
                  </div>
                  <input
                    v-else
                    v-model="editForm.nombre"
                    type="text"
                    required
                    placeholder="Tus nombres"
                    class="w-full text-sm text-gray-800 bg-white px-4 py-2.5 rounded-xl border border-gray-300 outline-none focus:border-[#006688] focus:ring-2 focus:ring-[#006688]/20 transition-all font-medium"
                  />
                </div>

                <!-- Apellidos -->
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Apellidos <span v-if="editing" class="text-red-500">*</span>
                  </label>
                  <div
                    v-if="!editing"
                    class="text-sm font-semibold text-gray-800 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100"
                  >
                    {{ editForm.apellido || '—' }}
                  </div>
                  <input
                    v-else
                    v-model="editForm.apellido"
                    type="text"
                    required
                    placeholder="Tus apellidos"
                    class="w-full text-sm text-gray-800 bg-white px-4 py-2.5 rounded-xl border border-gray-300 outline-none focus:border-[#006688] focus:ring-2 focus:ring-[#006688]/20 transition-all font-medium"
                  />
                </div>

                <!-- Correo Electrónico -->
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Correo Electrónico</label>
                  <div class="text-sm font-medium text-gray-800 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 flex items-center justify-between">
                    <span>{{ profile.correo || auth.user?.email || '—' }}</span>
                    <span class="text-[10px] bg-gray-200/70 text-gray-600 px-2 py-0.5 rounded-md font-semibold">Institucional</span>
                  </div>
                </div>

                <!-- Cédula -->
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Documento de Identidad</label>
                  <div class="text-sm font-mono font-bold text-gray-800 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 flex items-center justify-between">
                    <span>{{ profile.cedula || auth.user?.cedula || '—' }}</span>
                    <span class="text-[10px] bg-gray-200/70 text-gray-600 px-2 py-0.5 rounded-md font-semibold">Verificado</span>
                  </div>
                </div>

                <!-- Rol -->
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Rol de Usuario</label>
                  <div class="text-sm font-semibold text-gray-800 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 flex items-center gap-2">
                    <span
                      class="w-2 h-2 rounded-full"
                      :class="auth.isAdmin ? 'bg-red-500' : auth.isInstructor ? 'bg-blue-500' : 'bg-emerald-500'"
                    ></span>
                    {{ roleLabel }}
                  </div>
                </div>

                <!-- Actividades o Alcance -->
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {{ auth.isApprentice ? 'Actividades Aprobadas' : 'Privilegios del Sistema' }}
                  </label>
                  <div class="text-sm font-semibold text-gray-800 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 flex items-center gap-2">
                    <span class="material-symbols-outlined text-base text-[#006688]">
                      {{ auth.isApprentice ? 'task_alt' : 'verified_user' }}
                    </span>
                    <span v-if="auth.isApprentice">
                      {{ profile.stats?.passedSubmissions ?? 0 }} de {{ profile.stats?.totalSubmissions ?? 0 }} entregas
                    </span>
                    <span v-else>
                      {{ auth.isAdmin ? 'Administración Total y Curricular' : 'Docente e Instructor Clínico' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Action buttons in edit mode -->
              <div v-if="editing" class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  @click="cancelEdit"
                  class="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  :disabled="saving"
                  class="px-5 py-2 bg-[#006688] hover:bg-[#004e69] text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-[#006688]/20 flex items-center gap-2 disabled:opacity-50"
                >
                  <span v-if="saving" class="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  <span v-else class="material-symbols-outlined text-base">save</span>
                  {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Historial / Actividad Reciente -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 class="text-base font-bold text-gray-800 flex items-center gap-2 mb-4">
            <span class="material-symbols-outlined text-[#006688] text-xl">history</span>
            Actividad Reciente
          </h3>

          <div v-if="recentActivity.length > 0" class="divide-y divide-gray-50">
            <div
              v-for="item in recentActivity"
              :key="item.id"
              class="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0 hover:bg-gray-50/50 rounded-xl px-2 transition-colors"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-sky-50 text-[#006688] flex items-center justify-center font-bold shrink-0 text-base">
                  {{ item.badge || '📌' }}
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-800">{{ item.title }}</p>
                  <p class="text-[11px] text-gray-400">{{ formatRelativeTime(item.createdAt) }}</p>
                </div>
              </div>
              <span class="text-xs font-mono font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">
                {{ item.action }}
              </span>
            </div>
          </div>

          <div v-else class="text-center py-6 text-gray-400">
            <span class="material-symbols-outlined text-3xl mb-1">hourglass_empty</span>
            <p class="text-xs">No hay eventos registrados recientemente.</p>
          </div>
        </div>
      </div>

      <!-- Right Col: Stats & Badges Sidebar -->
      <div class="space-y-6">
        <!-- Stat Cards -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h3 class="text-base font-bold text-gray-800 flex items-center gap-2">
            <span class="material-symbols-outlined text-amber-500 text-xl">insights</span>
            Resumen de Actividad
          </h3>

          <div class="space-y-3">
            <!-- Puntos Totales XP -->
            <div class="flex items-center gap-3.5 p-3 rounded-xl bg-amber-50/70 border border-amber-100">
              <div class="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <span class="material-symbols-outlined text-xl">military_tech</span>
              </div>
              <div>
                <p class="text-xl font-black text-gray-800 leading-tight">
                  {{ profile.xp ?? auth.user?.xp ?? 0 }} XP
                </p>
                <p class="text-xs text-gray-500">Puntos de experiencia acumulados</p>
              </div>
            </div>

            <!-- Actividades Aprobadas -->
            <div class="flex items-center gap-3.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <div class="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <span class="material-symbols-outlined text-xl">check_circle</span>
              </div>
              <div>
                <p class="text-xl font-black text-gray-800 leading-tight">
                  {{ profile.stats?.passedSubmissions ?? 0 }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ auth.isApprentice ? 'Actividades aprobadas' : 'Tareas evaluadas' }}
                </p>
              </div>
            </div>

            <!-- Logros Desbloqueados -->
            <div class="flex items-center gap-3.5 p-3 rounded-xl bg-purple-50/70 border border-purple-100">
              <div class="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <span class="material-symbols-outlined text-xl">emoji_events</span>
              </div>
              <div>
                <p class="text-xl font-black text-gray-800 leading-tight">
                  {{ profile.badges?.length ?? 0 }}
                </p>
                <p class="text-xs text-gray-500">Insignias conquistadas</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Badges Earned Mini-Grid -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold text-gray-800 flex items-center gap-2">
              <span class="material-symbols-outlined text-amber-500 text-xl">military_tech</span>
              Mis Logros
            </h3>
            <router-link
              to="/dashboard/logros"
              class="text-xs font-bold text-[#006688] hover:underline flex items-center gap-0.5"
            >
              Ver todos
              <span class="material-symbols-outlined text-sm">chevron_right</span>
            </router-link>
          </div>

          <div v-if="profile.badges && profile.badges.length > 0" class="grid grid-cols-3 gap-2.5">
            <div
              v-for="badge in profile.badges.slice(0, 6)"
              :key="badge.key"
              class="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-gradient-to-b from-amber-50/80 to-white border border-amber-200/60 text-center hover:scale-105 transition-transform shadow-sm"
              :title="badge.description"
            >
              <span class="text-3xl select-none">{{ badge.iconEmoji || '🏆' }}</span>
              <p class="text-[11px] font-bold text-gray-800 leading-tight line-clamp-1">{{ badge.name }}</p>
              <span class="text-[9px] font-semibold text-amber-700 bg-amber-100/70 px-1.5 py-0.2 rounded">
                {{ badge.xpRequired }} XP
              </span>
            </div>
          </div>

          <div v-else class="bg-gray-50 rounded-xl p-6 text-center border border-gray-100">
            <span class="material-symbols-outlined text-gray-400 text-3xl mb-1">lock</span>
            <p class="text-xs font-semibold text-gray-600">Aún no tienes insignias</p>
            <p class="text-[11px] text-gray-400 mt-0.5">Suma XP superando retos clínicos para desbloquearlas.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== MODAL CAMBIAR CONTRASEÑA ==================== -->
    <div
      v-if="showPasswordModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
      >
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-[#006688]/10 text-[#006688] flex items-center justify-center font-bold">
              <span class="material-symbols-outlined text-xl">lock_reset</span>
            </div>
            <div>
              <h3 class="text-base font-bold text-gray-800">Cambiar Contraseña</h3>
              <p class="text-xs text-gray-400">Actualiza tus credenciales de acceso</p>
            </div>
          </div>
          <button
            @click="closeChangePasswordModal"
            class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleChangePassword" class="p-6 space-y-4">
          <!-- Contraseña Actual -->
          <div>
            <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
              Contraseña Actual <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                v-model="passwordForm.currentPassword"
                :type="passwordForm.showCurrent ? 'text' : 'password'"
                required
                placeholder="Ingresa tu contraseña actual"
                class="w-full pl-3.5 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:bg-white focus:border-[#006688] focus:ring-1 focus:ring-[#006688] transition-all font-mono"
              />
              <button
                type="button"
                @click="passwordForm.showCurrent = !passwordForm.showCurrent"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabindex="-1"
              >
                <span class="material-symbols-outlined text-base">
                  {{ passwordForm.showCurrent ? 'visibility_off' : 'visibility' }}
                </span>
              </button>
            </div>
          </div>

          <!-- Nueva Contraseña -->
          <div>
            <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
              Nueva Contraseña <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                v-model="passwordForm.newPassword"
                :type="passwordForm.showNew ? 'text' : 'password'"
                required
                placeholder="Mínimo 8 caracteres, mayúscula y símbolo"
                class="w-full pl-3.5 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:bg-white focus:border-[#006688] focus:ring-1 focus:ring-[#006688] transition-all font-mono"
              />
              <button
                type="button"
                @click="passwordForm.showNew = !passwordForm.showNew"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabindex="-1"
              >
                <span class="material-symbols-outlined text-base">
                  {{ passwordForm.showNew ? 'visibility_off' : 'visibility' }}
                </span>
              </button>
            </div>
            <p class="text-[11px] text-gray-400 mt-1">
              Debe contener al menos 8 caracteres, 1 letra mayúscula y 1 carácter especial (@#$%&*!._-).
            </p>
          </div>

          <!-- Confirmar Nueva Contraseña -->
          <div>
            <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
              Confirmar Nueva Contraseña <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                v-model="passwordForm.confirmPassword"
                :type="passwordForm.showConfirm ? 'text' : 'password'"
                required
                placeholder="Repite la nueva contraseña"
                class="w-full pl-3.5 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:bg-white focus:border-[#006688] focus:ring-1 focus:ring-[#006688] transition-all font-mono"
              />
              <button
                type="button"
                @click="passwordForm.showConfirm = !passwordForm.showConfirm"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabindex="-1"
              >
                <span class="material-symbols-outlined text-base">
                  {{ passwordForm.showConfirm ? 'visibility_off' : 'visibility' }}
                </span>
              </button>
            </div>
            <p
              v-if="passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword"
              class="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1"
            >
              <span class="material-symbols-outlined text-sm">error</span>
              Las contraseñas no coinciden.
            </p>
          </div>

          <!-- Action buttons -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <button
              type="button"
              @click="closeChangePasswordModal"
              class="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="passwordSaving"
              class="px-5 py-2 bg-[#006688] hover:bg-[#004e69] text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-[#006688]/20 flex items-center gap-2 disabled:opacity-50"
            >
              <span v-if="passwordSaving" class="material-symbols-outlined text-base animate-spin">progress_activity</span>
              <span v-else class="material-symbols-outlined text-base">check</span>
              Actualizar Contraseña
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useNotificationStore } from '../../stores/notification'
import { getApiBaseUrl } from '../../lib/api'

const auth = useAuthStore()
const notificationStore = useNotificationStore()
const apiBaseUrl = getApiBaseUrl()

const loading = ref(true)
const saving = ref(false)
const editing = ref(false)
const profile = ref({})
const recentActivity = ref([])

const editForm = reactive({
  nombre: '',
  apellido: ''
})

// Change Password Modal State
const showPasswordModal = ref(false)
const passwordSaving = ref(false)
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  showCurrent: false,
  showNew: false,
  showConfirm: false
})

const displayName = computed(() => {
  if (profile.value.nombre && profile.value.apellido) {
    return `${profile.value.nombre} ${profile.value.apellido}`
  }
  return auth.user?.name || 'Usuario'
})

const displayEmail = computed(() => {
  return profile.value.correo || auth.user?.email || 'Sin correo'
})

const roleLabel = computed(() => {
  const role = (profile.value.rol || auth.role || 'APRENDIZ').toUpperCase()
  if (role === 'ADMIN') return 'Administrador'
  if (role === 'INSTRUCTOR') return 'Instructor'
  return 'Aprendiz'
})

const userInitials = computed(() => {
  const name = displayName.value || ''
  const parts = name.split(' ').filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase() || 'NA'
})

const formattedCreatedAt = computed(() => {
  const dateStr = profile.value.createdAt || auth.user?.createdAt
  if (!dateStr) return 'reciente'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long' })
  } catch {
    return 'reciente'
  }
})

function getToken() {
  const stored = localStorage.getItem('nursed.auth.user') || sessionStorage.getItem('nursed.auth.user')
  return stored ? JSON.parse(stored)?.token : null
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return ''
  }
}

async function loadProfile() {
  loading.value = true
  try {
    const token = getToken()
    if (!token) {
      loading.value = false
      return
    }

    const res = await fetch(`${apiBaseUrl}/api/learner/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (res.ok) {
      const data = await res.json()
      profile.value = data
      editForm.nombre = data.nombre || ''
      editForm.apellido = data.apellido || ''
      recentActivity.value = data.recentActivity || []
    }
  } catch (err) {
    console.error('Error al cargar perfil:', err)
  } finally {
    loading.value = false
  }
}

function toggleEditMode() {
  if (editing.value) {
    cancelEdit()
  } else {
    editForm.nombre = profile.value.nombre || ''
    editForm.apellido = profile.value.apellido || ''
    editing.value = true
  }
}

function cancelEdit() {
  editForm.nombre = profile.value.nombre || ''
  editForm.apellido = profile.value.apellido || ''
  editing.value = false
}

async function saveProfile() {
  if (!editForm.nombre.trim() || !editForm.apellido.trim()) {
    notificationStore.notify({
      type: 'warning',
      title: 'Campos requeridos',
      message: 'Nombre y apellido no pueden estar vacíos.'
    })
    return
  }

  saving.value = true
  try {
    const token = getToken()
    const res = await fetch(`${apiBaseUrl}/api/learner/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        nombre: editForm.nombre.trim(),
        apellido: editForm.apellido.trim()
      })
    })

    const updated = await res.json()
    if (!res.ok) {
      throw new Error(updated.message || 'Error al guardar el perfil.')
    }

    profile.value = { ...profile.value, ...updated }
    editing.value = false

    // Sincronizar el authStore global reactivo para que navbar y sidebar se actualicen de inmediato
    if (auth.user) {
      auth.setUser({
        ...auth.user,
        nombre: updated.nombre,
        apellido: updated.apellido,
        name: `${updated.nombre} ${updated.apellido}`
      })
    }

    notificationStore.notify({
      type: 'success',
      title: 'Perfil actualizado',
      message: 'Tus datos personales fueron actualizados correctamente.'
    })
  } catch (err) {
    notificationStore.notify({
      type: 'error',
      title: 'Error de actualización',
      message: err.message || 'No se pudo guardar el perfil.'
    })
  } finally {
    saving.value = false
  }
}

// ----------------- CHANGE PASSWORD MODAL -----------------
function openChangePasswordModal() {
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordForm.showCurrent = false
  passwordForm.showNew = false
  passwordForm.showConfirm = false
  showPasswordModal.value = true
}

function closeChangePasswordModal() {
  showPasswordModal.value = false
}

async function handleChangePassword() {
  if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
    notificationStore.notify({
      type: 'warning',
      title: 'Campos requeridos',
      message: 'Completa todos los campos de contraseña.'
    })
    return
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    notificationStore.notify({
      type: 'warning',
      title: 'Contraseñas no coinciden',
      message: 'La nueva contraseña y su confirmación deben ser idénticas.'
    })
    return
  }

  passwordSaving.value = true
  try {
    const token = getToken()
    const res = await fetch(`${apiBaseUrl}/api/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.message || 'Error al cambiar la contraseña.')
    }

    notificationStore.notify({
      type: 'success',
      title: 'Contraseña actualizada',
      message: 'Tu contraseña de acceso ha sido modificada con éxito.'
    })

    closeChangePasswordModal()
    await loadProfile()
  } catch (err) {
    notificationStore.notify({
      type: 'error',
      title: 'Error',
      message: err.message || 'No se pudo actualizar la contraseña.'
    })
  } finally {
    passwordSaving.value = false
  }
}

onMounted(loadProfile)
</script>
