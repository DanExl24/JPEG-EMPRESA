import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const role = ref('admin') // admin | instructor | aprendiz
  const user = ref({
    name: 'Juan Pérez',
    email: 'juan@nursedacademy.com',
    avatar: null,
  })

  const isAdmin = computed(() => role.value === 'admin')
  const isInstructor = computed(() => role.value === 'instructor')
  const isAprendiz = computed(() => role.value === 'aprendiz')

  const roleLabel = computed(() => {
    const labels = { admin: 'Administrador', instructor: 'Instructor', aprendiz: 'Aprendiz' }
    return labels[role.value] || role.value
  })

  const roleColor = computed(() => {
    const colors = {
      admin: 'bg-red-100 text-red-700',
      instructor: 'bg-blue-100 text-blue-700',
      aprendiz: 'bg-green-100 text-green-700',
    }
    return colors[role.value] || 'bg-gray-100 text-gray-700'
  })

  // Permissions per role
  const ROLE_PERMISSIONS = {
    admin: ['dashboard', 'cursos', 'actividades', 'progreso', 'ranking', 'logros', 'juegos', 'settings', 'perfil', 'analiticas', 'usuarios'],
    instructor: ['dashboard', 'cursos', 'actividades', 'progreso', 'ranking', 'logros', 'juegos', 'settings', 'perfil', 'analiticas'],
    aprendiz: ['dashboard', 'cursos', 'actividades', 'progreso', 'ranking', 'logros', 'juegos', 'settings', 'perfil'],
  }

  const permissions = computed(() => ROLE_PERMISSIONS[role.value] || [])

  function can(section) {
    return permissions.value.includes(section)
  }

  function setRole(newRole) {
    role.value = newRole
  }

  function setUser(userData) {
    user.value = { ...user.value, ...userData }
  }

  return { role, user, isAdmin, isInstructor, isAprendiz, roleLabel, roleColor, permissions, can, setRole, setUser }
})
