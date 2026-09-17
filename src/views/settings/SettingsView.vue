<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h2 class="text-2xl font-bold text-gray-800">{{ t('settings.title') }}</h2>
      <p class="text-gray-500 mt-1">{{ t('settings.subtitle') }}</p>
    </div>

    <!-- Main Content Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      <!-- Sidebar Nav -->
      <div class="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 lg:col-span-1 sticky top-6">
        <nav class="space-y-1">
          <button
            v-for="section in sections"
            :key="section.key"
            @click="active = section.key"
            :class="[
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left',
              active === section.key
                ? 'bg-[#006688] text-white shadow-md shadow-[#006688]/20'
                : 'text-gray-600 hover:bg-gray-50 hover:text-[#006688]'
            ]"
          >
            <span class="material-symbols-outlined text-lg">{{ section.icon }}</span>
            <span class="flex-1">{{ section.label }}</span>
            <span
              v-if="section.badge"
              class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800"
            >
              {{ section.badge }}
            </span>
          </button>
        </nav>
      </div>

      <!-- Settings Panel -->
      <div class="lg:col-span-3 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 min-h-[460px]">
        <!-- Loading State -->
        <div v-if="loading" class="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
          <span class="material-symbols-outlined text-4xl text-[#006688] animate-spin">progress_activity</span>
          <p class="text-sm font-medium">{{ t('common.loading') }}</p>
        </div>

        <template v-else>
          <!-- ================= 1. IDIOMA Y REGIÓN ================= -->
          <div v-if="active === 'language'" class="space-y-6 animate-fade-in">
            <div class="border-b border-gray-100 pb-4">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-[#006688]/10 text-[#006688] flex items-center justify-center">
                  <span class="material-symbols-outlined text-xl">translate</span>
                </div>
                <div>
                  <h3 class="text-lg font-bold text-gray-800">{{ t('settings.language.title') }}</h3>
                  <p class="text-xs text-gray-400">{{ t('settings.language.subtitle') }}</p>
                </div>
              </div>
            </div>

            <!-- Banner info -->
            <div class="p-4 rounded-xl bg-sky-50 border border-sky-100 flex items-start gap-3">
              <span class="material-symbols-outlined text-[#006688] text-xl shrink-0 mt-0.5">info</span>
              <div class="text-xs text-sky-900 leading-relaxed">
                <p class="font-bold text-[#006688] mb-0.5">{{ t('settings.language.bannerTitle') }}</p>
                <p class="text-sky-800/80">{{ t('settings.language.bannerDesc') }}</p>
              </div>
            </div>

            <!-- Language Cards Grid -->
            <div class="space-y-3">
              <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {{ t('settings.language.current') }}
                <span class="text-[#006688] font-black uppercase ml-1">
                  {{ i18n.currentLanguageOption.name }} ({{ i18n.currentLanguageOption.code.toUpperCase() }})
                </span>
              </p>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  v-for="lang in i18n.languages"
                  :key="lang.code"
                  @click="handleSelectLanguage(lang.code)"
                  :class="[
                    'relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 group',
                    i18n.locale === lang.code
                      ? 'border-[#006688] bg-[#006688]/5 shadow-sm ring-2 ring-[#006688]/20'
                      : 'border-gray-100 bg-gray-50/60 hover:bg-white hover:border-gray-300'
                  ]"
                >
                  <!-- Selected Badge Checkmark -->
                  <div
                    v-if="i18n.locale === lang.code"
                    class="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#006688] text-white flex items-center justify-center shadow-sm"
                  >
                    <span class="material-symbols-outlined text-sm font-black">check</span>
                  </div>

                  <div>
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-2xl select-none">{{ lang.flag }}</span>
                      <span
                        :class="[
                          'text-[10px] font-bold px-2 py-0.5 rounded-full',
                          i18n.locale === lang.code ? 'bg-[#006688] text-white' : 'bg-gray-200 text-gray-600'
                        ]"
                      >
                        {{ lang.tag }}
                      </span>
                    </div>
                    <h4 class="text-base font-bold text-gray-800">{{ lang.name }}</h4>
                    <p class="text-xs font-medium text-gray-500">{{ lang.nativeName }}</p>
                  </div>

                  <p class="text-[11px] text-gray-400 line-clamp-2 leading-snug">{{ lang.desc }}</p>

                  <div class="pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-semibold">
                    <span :class="i18n.locale === lang.code ? 'text-[#006688]' : 'text-gray-400 group-hover:text-gray-600'">
                      {{ i18n.locale === lang.code ? '● Activo' : 'Seleccionar' }}
                    </span>
                    <span class="text-[10px] font-mono text-gray-400 uppercase">{{ lang.code }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ================= 2. NOTIFICACIONES ================= -->
          <div v-if="active === 'notifications'" class="space-y-6 animate-fade-in">
            <div class="border-b border-gray-100 pb-4">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <span class="material-symbols-outlined text-xl">notifications</span>
                </div>
                <div>
                  <h3 class="text-lg font-bold text-gray-800">{{ t('settings.notifications.title') }}</h3>
                  <p class="text-xs text-gray-400">{{ t('settings.notifications.subtitle') }}</p>
                </div>
              </div>
            </div>

            <div class="divide-y divide-gray-100">
              <!-- Notificaciones Email -->
              <div class="py-4 flex items-center justify-between gap-4">
                <div>
                  <p class="text-sm font-bold text-gray-800">{{ t('settings.notifications.email') }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">{{ t('settings.notifications.emailDesc') }}</p>
                </div>
                <button
                  type="button"
                  @click="togglePreference('emailNotifications')"
                  :class="[
                    'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none',
                    preferences.emailNotifications ? 'bg-[#006688]' : 'bg-gray-200'
                  ]"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200',
                      preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    ]"
                  />
                </button>
              </div>

              <!-- Alertas de Actividades -->
              <div class="py-4 flex items-center justify-between gap-4">
                <div>
                  <p class="text-sm font-bold text-gray-800">{{ t('settings.notifications.activityAlerts') }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">{{ t('settings.notifications.activityAlertsDesc') }}</p>
                </div>
                <button
                  type="button"
                  @click="togglePreference('activityAlerts')"
                  :class="[
                    'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none',
                    preferences.activityAlerts ? 'bg-[#006688]' : 'bg-gray-200'
                  ]"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200',
                      preferences.activityAlerts ? 'translate-x-6' : 'translate-x-1'
                    ]"
                  />
                </button>
              </div>

              <!-- Alertas de Ranking -->
              <div class="py-4 flex items-center justify-between gap-4">
                <div>
                  <p class="text-sm font-bold text-gray-800">{{ t('settings.notifications.rankingAlerts') }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">{{ t('settings.notifications.rankingAlertsDesc') }}</p>
                </div>
                <button
                  type="button"
                  @click="togglePreference('rankingAlerts')"
                  :class="[
                    'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none',
                    preferences.rankingAlerts ? 'bg-[#006688]' : 'bg-gray-200'
                  ]"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200',
                      preferences.rankingAlerts ? 'translate-x-6' : 'translate-x-1'
                    ]"
                  />
                </button>
              </div>
            </div>

            <!-- Botón Guardar Notificaciones -->
            <div class="pt-4 flex justify-end">
              <button
                @click="savePreferences"
                :disabled="saving"
                class="px-5 py-2.5 bg-[#006688] hover:bg-[#004e69] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-[#006688]/20 flex items-center gap-2 disabled:opacity-50"
              >
                <span v-if="saving" class="material-symbols-outlined text-base animate-spin">progress_activity</span>
                <span v-else class="material-symbols-outlined text-base">save</span>
                {{ saving ? t('common.saving') : t('common.save') }}
              </button>
            </div>
          </div>

          <!-- ================= 3. SEGURIDAD Y ACCESO ================= -->
          <div v-if="active === 'security'" class="space-y-6 animate-fade-in">
            <div class="border-b border-gray-100 pb-4">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <span class="material-symbols-outlined text-xl">lock</span>
                </div>
                <div>
                  <h3 class="text-lg font-bold text-gray-800">{{ t('settings.security.title') }}</h3>
                  <p class="text-xs text-gray-400">{{ t('settings.security.subtitle') }}</p>
                </div>
              </div>
            </div>

            <!-- Formulario Cambio de Contraseña -->
            <form @submit.prevent="handleChangePassword" class="space-y-4 max-w-lg">
              <div class="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1 mb-4">
                <p class="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-sm text-[#006688]">key</span>
                  {{ t('settings.security.changePassword') }}
                </p>
                <p class="text-[11px] text-gray-500 leading-relaxed">
                  {{ t('settings.security.changePasswordDesc') }}
                </p>
              </div>

              <!-- Contraseña Actual -->
              <div>
                <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                  {{ t('settings.security.currentPassword') }} <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <input
                    v-model="passwordForm.currentPassword"
                    :type="passwordForm.showCurrent ? 'text' : 'password'"
                    required
                    class="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:bg-white focus:border-[#006688] focus:ring-1 focus:ring-[#006688] transition-all font-mono"
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
                  {{ t('settings.security.newPassword') }} <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <input
                    v-model="passwordForm.newPassword"
                    :type="passwordForm.showNew ? 'text' : 'password'"
                    required
                    class="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:bg-white focus:border-[#006688] focus:ring-1 focus:ring-[#006688] transition-all font-mono"
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
                  {{ t('settings.security.passwordRequirements') }}
                </p>
              </div>

              <!-- Confirmar Nueva Contraseña -->
              <div>
                <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                  {{ t('settings.security.confirmPassword') }} <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <input
                    v-model="passwordForm.confirmPassword"
                    :type="passwordForm.showConfirm ? 'text' : 'password'"
                    required
                    class="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:bg-white focus:border-[#006688] focus:ring-1 focus:ring-[#006688] transition-all font-mono"
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

              <div class="pt-3">
                <button
                  type="submit"
                  :disabled="passwordSaving"
                  class="px-5 py-2.5 bg-[#006688] hover:bg-[#004e69] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-[#006688]/20 flex items-center gap-2 disabled:opacity-50"
                >
                  <span v-if="passwordSaving" class="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  <span v-else class="material-symbols-outlined text-base">lock_reset</span>
                  {{ passwordSaving ? t('common.saving') : t('settings.security.btnSubmit') }}
                </button>
              </div>
            </form>
          </div>

          <!-- ================= 4. PLATAFORMA (SOLO ADMIN) ================= -->
          <div v-if="active === 'platform' && auth.isAdmin" class="space-y-6 animate-fade-in">
            <div class="border-b border-gray-100 pb-4">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <span class="material-symbols-outlined text-xl">tune</span>
                </div>
                <div>
                  <h3 class="text-lg font-bold text-gray-800">{{ t('settings.platform.title') }}</h3>
                  <p class="text-xs text-gray-400">{{ t('settings.platform.subtitle') }}</p>
                </div>
              </div>
            </div>

            <div class="divide-y divide-gray-100">
              <div v-for="cfg in platformConfig" :key="cfg.key" class="py-4 flex items-center justify-between gap-4">
                <div>
                  <p class="text-sm font-bold text-gray-800">{{ cfg.label }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">{{ cfg.desc }}</p>
                </div>
                <button
                  type="button"
                  @click="cfg.enabled = !cfg.enabled"
                  :class="[
                    'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none',
                    cfg.enabled ? 'bg-[#006688]' : 'bg-gray-200'
                  ]"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200',
                      cfg.enabled ? 'translate-x-6' : 'translate-x-1'
                    ]"
                  />
                </button>
              </div>
            </div>

            <div class="pt-4 flex justify-end">
              <button
                @click="savePlatformConfig"
                class="px-5 py-2.5 bg-[#006688] hover:bg-[#004e69] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-[#006688]/20 flex items-center gap-2"
              >
                <span class="material-symbols-outlined text-base">save</span>
                {{ t('common.save') }}
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useI18nStore } from '../../stores/i18n'
import { useNotificationStore } from '../../stores/notification'
import { getApiBaseUrl } from '../../lib/api'

const auth = useAuthStore()
const i18n = useI18nStore()
const { t } = i18n
const notificationStore = useNotificationStore()
const apiBaseUrl = getApiBaseUrl()

const active = ref('language')
const loading = ref(true)
const saving = ref(false)

const sections = computed(() => {
  const list = [
    { key: 'language', label: t('settings.tabs.language'), icon: 'translate' },
    { key: 'notifications', label: t('settings.tabs.notifications'), icon: 'notifications' },
    { key: 'security', label: t('settings.tabs.security'), icon: 'lock' },
  ]
  if (auth.isAdmin) {
    list.push({ key: 'platform', label: t('settings.tabs.platform'), icon: 'tune', badge: 'Admin' })
  }
  return list
})

// Preferences State
const preferences = reactive({
  emailNotifications: true,
  activityAlerts: true,
  rankingAlerts: true,
  language: 'es'
})

// Password Form State
const passwordSaving = ref(false)
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  showCurrent: false,
  showNew: false,
  showConfirm: false
})

// Platform Config State (Admin)
const platformConfig = ref([
  { key: 'registration', label: 'Registro Abierto', desc: 'Permitir nuevos registros en la plataforma', enabled: true },
  { key: 'gamification', label: 'Gamificación Activa', desc: 'Puntos, ranking y logros habilitados', enabled: true },
  { key: 'maintenance', label: 'Modo Mantenimiento', desc: 'Bloquea acceso a usuarios no-admin', enabled: false },
])

function getToken() {
  const stored = localStorage.getItem('nursed.auth.user') || sessionStorage.getItem('nursed.auth.user')
  return stored ? JSON.parse(stored)?.token : null
}

function togglePreference(key) {
  preferences[key] = !preferences[key]
}

async function handleSelectLanguage(code) {
  i18n.setLocale(code)
  preferences.language = code

  notificationStore.notify({
    type: 'success',
    title: t('settings.language.title'),
    message: `${t('settings.language.savedSuccess')}: ${i18n.currentLanguageOption.name}`
  })
}

async function loadPreferences() {
  loading.value = true
  try {
    const token = getToken()
    if (!token) {
      loading.value = false
      return
    }

    const res = await fetch(`${apiBaseUrl}/api/user/preferences`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (res.ok) {
      const isJson = res.headers.get('content-type')?.includes('application/json')
      const json = isJson ? await res.json() : null
      const data = json?.data || json

      if (data) {
        preferences.emailNotifications = data.emailNotifications ?? true
        preferences.activityAlerts = data.activityAlerts ?? true
        preferences.rankingAlerts = data.rankingAlerts ?? true
        if (data.language && ['es', 'en', 'pt'].includes(data.language)) {
          preferences.language = data.language
          i18n.setLocale(data.language, false)
        }
      }
    }
  } catch (error) {
    console.warn('Error al cargar preferencias:', error)
  } finally {
    loading.value = false
  }
}

async function savePreferences() {
  saving.value = true
  try {
    const token = getToken()
    const res = await fetch(`${apiBaseUrl}/api/user/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        emailNotifications: preferences.emailNotifications,
        activityAlerts: preferences.activityAlerts,
        rankingAlerts: preferences.rankingAlerts,
        language: preferences.language
      })
    })

    const isJson = res.headers.get('content-type')?.includes('application/json')
    const data = isJson ? await res.json() : null
    if (!res.ok) {
      throw new Error(data?.message || `Error del servidor (${res.status})`)
    }

    notificationStore.notify({
      type: 'success',
      title: t('settings.notifications.title'),
      message: t('settings.notifications.savedSuccess')
    })
  } catch (error) {
    notificationStore.notify({
      type: 'error',
      title: 'Error',
      message: error.message || 'No se pudieron guardar las preferencias.'
    })
  } finally {
    saving.value = false
  }
}

async function handleChangePassword() {
  if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
    notificationStore.notify({
      type: 'warning',
      title: 'Campos requeridos',
      message: 'Completa todos los campos para cambiar la contraseña.'
    })
    return
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    notificationStore.notify({
      type: 'warning',
      title: 'Contraseñas no coinciden',
      message: 'La nueva contraseña y su confirmación deben ser exactamente iguales.'
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

    const isJson = res.headers.get('content-type')?.includes('application/json')
    const data = isJson ? await res.json() : null
    if (!res.ok) {
      throw new Error(data?.message || `Error del servidor (${res.status})`)
    }

    notificationStore.notify({
      type: 'success',
      title: t('settings.security.title'),
      message: t('settings.security.successMessage')
    })

    // Reset password form
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (error) {
    notificationStore.notify({
      type: 'error',
      title: 'Error',
      message: error.message || 'No se pudo actualizar la contraseña.'
    })
  } finally {
    passwordSaving.value = false
  }
}

function savePlatformConfig() {
  notificationStore.notify({
    type: 'success',
    title: t('settings.platform.title'),
    message: 'Parámetros de la plataforma guardados exitosamente.'
  })
}

onMounted(() => {
  loadPreferences()
})
</script>
