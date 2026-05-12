<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Usuarios</h2>
        <p class="text-gray-500 mt-1">Gestiona todos los usuarios de la plataforma.</p>
      </div>
      <button class="flex items-center gap-2 px-4 py-2 bg-[#006688] text-white rounded-xl text-sm font-semibold hover:bg-[#004e69] transition-colors">
        <span class="material-symbols-outlined text-base">person_add</span>
        Nuevo Usuario
      </button>
    </div>

    <!-- Summary -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div v-for="s in summary" :key="s.label" :class="`bg-white rounded-2xl p-5 shadow-sm border border-gray-100`">
        <div :class="`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.bg}`">
          <span class="material-symbols-outlined text-base" :style="`color:${s.iconColor}`">{{ s.icon }}</span>
        </div>
        <p class="text-2xl font-bold text-gray-800">{{ s.count }}</p>
        <p class="text-xs text-gray-500 mt-0.5">{{ s.label }}</p>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center gap-3">
        <div class="flex-1 relative">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
          <input v-model="search" placeholder="Buscar usuarios..." class="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-xl text-sm outline-none border border-gray-200 focus:ring-2 focus:ring-[#006688]/20" />
        </div>
        <select v-model="filterRole" class="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none">
          <option value="">Todos los roles</option>
          <option value="admin">Admin</option>
          <option value="instructor">Instructor</option>
          <option value="aprendiz">Aprendiz</option>
        </select>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50">
              <th class="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3">Usuario</th>
              <th class="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3">Rol</th>
              <th class="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3">Cursos</th>
              <th class="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3">Estado</th>
              <th class="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3">Último acceso</th>
              <th class="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div :class="`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${user.avatarBg}`" :style="`color:${user.avatarColor}`">
                    {{ user.initials }}
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-gray-800">{{ user.name }}</p>
                    <p class="text-xs text-gray-400">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4">
                <span :class="`text-xs font-bold px-2 py-1 rounded-full ${user.roleBg} ${user.roleText}`">{{ user.roleLabel }}</span>
              </td>
              <td class="px-5 py-4 text-sm text-gray-600">{{ user.courses }}</td>
              <td class="px-5 py-4">
                <span :class="`flex items-center gap-1 text-xs font-semibold ${user.active ? 'text-green-600' : 'text-gray-400'}`">
                  <span class="w-1.5 h-1.5 rounded-full" :class="user.active ? 'bg-green-500' : 'bg-gray-300'"></span>
                  {{ user.active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="px-5 py-4 text-xs text-gray-400">{{ user.lastAccess }}</td>
              <td class="px-5 py-4">
                <div class="flex items-center gap-2">
                  <button class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#006688] transition-colors">
                    <span class="material-symbols-outlined text-base">edit</span>
                  </button>
                  <button class="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                    <span class="material-symbols-outlined text-base">delete</span>
                  </button>
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
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const search = ref('')
const filterRole = ref('')

const summary = [
  { label: 'Total Usuarios', count: 1240, icon: 'group', bg: 'bg-blue-50', iconColor: '#3b82f6' },
  { label: 'Administradores', count: 3, icon: 'admin_panel_settings', bg: 'bg-red-50', iconColor: '#ef4444' },
  { label: 'Instructores', count: 24, icon: 'school', bg: 'bg-purple-50', iconColor: '#8b5cf6' },
  { label: 'Aprendices', count: 1213, icon: 'person', bg: 'bg-green-50', iconColor: '#10b981' },
]

const users = [
  { id: 1, name: 'Carlos Díaz', email: 'carlos@example.com', initials: 'C', role: 'admin', roleLabel: 'Admin', roleBg: 'bg-red-100', roleText: 'text-red-700', courses: 6, active: true, lastAccess: 'Hace 2h', avatarBg: 'bg-blue-100', avatarColor: '#3b82f6' },
  { id: 2, name: 'María López', email: 'maria@example.com', initials: 'M', role: 'instructor', roleLabel: 'Instructor', roleBg: 'bg-blue-100', roleText: 'text-blue-700', courses: 5, active: true, lastAccess: 'Hace 5h', avatarBg: 'bg-pink-100', avatarColor: '#ec4899' },
  { id: 3, name: 'Ana Torres', email: 'ana@example.com', initials: 'A', role: 'aprendiz', roleLabel: 'Aprendiz', roleBg: 'bg-green-100', roleText: 'text-green-700', courses: 3, active: true, lastAccess: 'Ayer', avatarBg: 'bg-amber-100', avatarColor: '#f59e0b' },
  { id: 4, name: 'Juan Pérez', email: 'juan@example.com', initials: 'J', role: 'aprendiz', roleLabel: 'Aprendiz', roleBg: 'bg-green-100', roleText: 'text-green-700', courses: 4, active: true, lastAccess: 'Hace 1h', avatarBg: 'bg-green-100', avatarColor: '#10b981' },
  { id: 5, name: 'Luis García', email: 'luis@example.com', initials: 'L', role: 'instructor', roleLabel: 'Instructor', roleBg: 'bg-blue-100', roleText: 'text-blue-700', courses: 4, active: false, lastAccess: 'Hace 3 días', avatarBg: 'bg-purple-100', avatarColor: '#8b5cf6' },
  { id: 6, name: 'Sofia Ruiz', email: 'sofia@example.com', initials: 'S', role: 'aprendiz', roleLabel: 'Aprendiz', roleBg: 'bg-green-100', roleText: 'text-green-700', courses: 2, active: true, lastAccess: 'Hace 6h', avatarBg: 'bg-orange-100', avatarColor: '#f97316' },
]

const filteredUsers = computed(() => {
  return users.filter(u => {
    const matchSearch = !search.value || u.name.toLowerCase().includes(search.value.toLowerCase()) || u.email.toLowerCase().includes(search.value.toLowerCase())
    const matchRole = !filterRole.value || u.role === filterRole.value
    return matchSearch && matchRole
  })
})
</script>
