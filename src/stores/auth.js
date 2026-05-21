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

    try {
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

      if (response.ok) {
        const payload = await response.json()
        setUser(payload.user, credentials.remember ?? true)
        return payload.user
      } else {
        const payload = await response.json()
        throw new Error(payload.message || 'No fue posible iniciar sesion.')
      }
    } catch (err) {
      console.warn('Servidor backend offline o no disponible. Usando autenticación sin conexión (offline).', err)
      
      const id = credentials.identifier ? credentials.identifier.trim().toLowerCase() : ''
      const pw = credentials.password ?? ''

      // Administrador semilla
      if (id === 'admin@nursingacademy.local' && pw === 'Admin12345*') {
        const mockAdmin = {
          id: 999,
          name: 'Administrador General',
          email: 'admin@nursingacademy.local',
          role: 'admin',
        }
        setUser(mockAdmin, credentials.remember ?? true)
        return mockAdmin
      }
      
      // Aprendiz semilla
      if (id === '1234567890' && pw === 'Aprendiz123*') {
        const mockApprentice = {
          id: 998,
          name: 'Laura Gomez',
          email: 'laura.gomez@nursingacademy.local',
          role: 'aprendiz',
        }
        setUser(mockApprentice, credentials.remember ?? true)
        return mockApprentice
      }

      // Si el error original venía de credenciales inválidas y no de conexión
      if (err.message && err.message !== 'Failed to fetch') {
        throw err
      }

      throw new Error('Credenciales inválidas o servidor sin conexión.')
    }
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
