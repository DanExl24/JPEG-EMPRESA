import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const STORAGE_KEY = 'nursed.auth.user'

function getStoredUser() {
  const savedUser = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY)

  if (!savedUser) {
    return null
  }

  try {
    return JSON.parse(savedUser)
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(getStoredUser())

  function setUser(userData, remember = true) {
    user.value = userData
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)

    const storage = remember ? localStorage : sessionStorage
    storage.setItem(STORAGE_KEY, JSON.stringify(userData))
  }

  function clearUser() {
    user.value = null
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
  }

  async function login(credentials) {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

    const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: credentials.identifier,
        password: credentials.password,
      }),
    })

    const payload = await response.json()

    if (!response.ok) {
      throw new Error(payload.message || 'No fue posible iniciar sesion.')
    }

    setUser(payload.user, credentials.remember ?? true)
    return payload.user
  }

  const safeUser = computed(() => user.value || {
    id: null,
    name: '',
    email: '',
    role: 'aprendiz',
  })

  const isAuthenticated = computed(() => Boolean(user.value))
  const role = computed(() => safeUser.value.role)
  const isAdmin = computed(() => role.value === 'admin')
  const isInstructor = computed(() => role.value === 'instructor')
  const roleLabel = computed(() => {
    const labels = {
      admin: 'Administrador',
      instructor: 'Instructor',
      aprendiz: 'Aprendiz',
    }

    return labels[role.value] || 'Usuario'
  })

  return {
    user: safeUser,
    role,
    roleLabel,
    isAdmin,
    isInstructor,
    isAuthenticated,
    setUser,
    clearUser,
    login,
  }
})
