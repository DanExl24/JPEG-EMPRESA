<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-gray-800">Configuración</h2>
      <p class="text-gray-500 mt-1">Personaliza tu experiencia en la plataforma.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Sidebar nav -->
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 h-fit">
        <nav class="space-y-1">
          <button v-for="section in sections" :key="section.key" @click="active = section.key"
            :class="`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${active === section.key ? 'bg-[#006688] text-white' : 'text-gray-600 hover:bg-gray-50'}`">
            <span class="material-symbols-outlined text-lg">{{ section.icon }}</span>
            {{ section.label }}
          </button>
        </nav>
      </div>

      <!-- Settings Panel -->
      <div class="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <!-- Notifications -->
        <div v-if="active === 'notifications'">
          <h3 class="text-lg font-bold text-gray-800 mb-5">Notificaciones</h3>
          <div class="space-y-4">
            <div v-for="notif in notifications" :key="notif.key" class="flex items-center justify-between py-3 border-b border-gray-50">
              <div>
                <p class="text-sm font-semibold text-gray-800">{{ notif.label }}</p>
                <p class="text-xs text-gray-500">{{ notif.desc }}</p>
              </div>
              <button @click="notif.enabled = !notif.enabled"
                :class="`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notif.enabled ? 'bg-[#006688]' : 'bg-gray-200'}`">
                <span :class="`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notif.enabled ? 'translate-x-6' : 'translate-x-1'}`"></span>
              </button>
            </div>
          </div>
        </div>

        <!-- Apariencia -->
        <div v-if="active === 'appearance'">
          <h3 class="text-lg font-bold text-gray-800 mb-5">Apariencia</h3>
          <div class="space-y-4">
            <div>
              <p class="text-sm font-semibold text-gray-800 mb-3">Tema</p>
              <div class="flex gap-3">
                <button v-for="theme in themes" :key="theme.value" @click="selectedTheme = theme.value"
                  :class="`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${selectedTheme === theme.value ? 'border-[#006688] bg-[#006688]/5 text-[#006688]' : 'border-gray-200 text-gray-600'}`">
                  <span class="material-symbols-outlined text-lg">{{ theme.icon }}</span>
                  {{ theme.label }}
                </button>
              </div>
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-800 mb-3">Idioma</p>
              <select class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#006688]/20">
                <option>Español</option>
                <option>English</option>
                <option>Português</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Privacidad -->
        <div v-if="active === 'privacy'">
          <h3 class="text-lg font-bold text-gray-800 mb-5">Privacidad y Seguridad</h3>
          <div class="space-y-4">
            <div class="p-4 bg-gray-50 rounded-xl">
              <p class="text-sm font-semibold text-gray-800 mb-1">Cambiar Contraseña</p>
              <p class="text-xs text-gray-500 mb-3">Actualiza tu contraseña regularmente para mayor seguridad.</p>
              <button class="px-4 py-2 bg-[#006688] text-white text-sm font-semibold rounded-xl hover:bg-[#004e69] transition-colors">Cambiar contraseña</button>
            </div>
            <div class="p-4 bg-gray-50 rounded-xl">
              <p class="text-sm font-semibold text-gray-800 mb-1">Autenticación de 2 Factores</p>
              <p class="text-xs text-gray-500 mb-3">Añade una capa extra de seguridad a tu cuenta.</p>
              <button class="px-4 py-2 border border-[#006688] text-[#006688] text-sm font-semibold rounded-xl hover:bg-[#006688]/5 transition-colors">Activar 2FA</button>
            </div>
          </div>
        </div>

        <!-- Admin only: Platform -->
        <div v-if="active === 'platform' && auth.isAdmin">
          <h3 class="text-lg font-bold text-gray-800 mb-5">Configuración de Plataforma</h3>
          <div class="space-y-4">
            <div v-for="cfg in platformConfig" :key="cfg.key" class="flex items-center justify-between py-3 border-b border-gray-50">
              <div>
                <p class="text-sm font-semibold text-gray-800">{{ cfg.label }}</p>
                <p class="text-xs text-gray-500">{{ cfg.desc }}</p>
              </div>
              <button @click="cfg.enabled = !cfg.enabled"
                :class="`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${cfg.enabled ? 'bg-[#006688]' : 'bg-gray-200'}`">
                <span :class="`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${cfg.enabled ? 'translate-x-6' : 'translate-x-1'}`"></span>
              </button>
            </div>
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
const active = ref('notifications')
const selectedTheme = ref('light')

const allSections = [
  { key: 'notifications', label: 'Notificaciones', icon: 'notifications', roles: ['admin', 'instructor', 'aprendiz'] },
  { key: 'appearance', label: 'Apariencia', icon: 'palette', roles: ['admin', 'instructor', 'aprendiz'] },
  { key: 'privacy', label: 'Privacidad', icon: 'lock', roles: ['admin', 'instructor', 'aprendiz'] },
  { key: 'platform', label: 'Plataforma', icon: 'tune', roles: ['admin'] },
]

const sections = computed(() => allSections.filter(s => s.roles.includes(auth.role)))

const notifications = ref([
  { key: 'email', label: 'Notificaciones por Email', desc: 'Recibe actualizaciones de cursos y actividades', enabled: true },
  { key: 'push', label: 'Notificaciones Push', desc: 'Alertas en tiempo real en el navegador', enabled: false },
  { key: 'logros', label: 'Nuevos Logros', desc: 'Notificar cuando desbloquees un logro', enabled: true },
  { key: 'ranking', label: 'Cambios en Ranking', desc: 'Alerta cuando subas o bajes posiciones', enabled: true },
])

const themes = [
  { label: 'Claro', value: 'light', icon: 'light_mode' },
  { label: 'Oscuro', value: 'dark', icon: 'dark_mode' },
  { label: 'Sistema', value: 'system', icon: 'brightness_auto' },
]

const platformConfig = ref([
  { key: 'registration', label: 'Registro Abierto', desc: 'Permitir nuevos registros en la plataforma', enabled: true },
  { key: 'gamification', label: 'Gamificación Activa', desc: 'Puntos, ranking y logros habilitados', enabled: true },
  { key: 'maintenance', label: 'Modo Mantenimiento', desc: 'Bloquea acceso a usuarios no-admin', enabled: false },
])
</script>
