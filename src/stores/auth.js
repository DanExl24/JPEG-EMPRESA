import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getApiBaseUrl } from '../lib/api'

const STORAGE_KEY = 'nursed.auth.user'

function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (e) {
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(getStoredUser())

  function setUser(userData, remember = true) {
    user.value = userData
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)

    const targetStorage = remember ? localStorage : sessionStorage
    try {
      targetStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
    } catch (e) {
      console.warn('[Auth Store] No se pudo persistir la sesión en storage:', e)
    }
  }

  function clearUser() {
    user.value = null
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
  }

  async function login(credentials) {
    const apiBaseUrl = getApiBaseUrl()
    const cleanIdentifier = (credentials.identifier || '').trim()
    const cleanPassword   = credentials.password || ''

    if (!cleanIdentifier || !cleanPassword) {
      throw new Error('Por favor ingresa tu usuario/correo y contraseña.')
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 12000)

    let response
    try {
      response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          identifier: cleanIdentifier,
          password: cleanPassword,
        }),
        signal: controller.signal,
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        throw new Error('El servidor tardó demasiado en responder. Por favor intenta de nuevo.')
      }
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.')
    } finally {
      clearTimeout(timeoutId)
    }

    let payload = {}
    try {
      payload = await response.json()
    } catch {
      payload = {}
    }

    if (!response.ok) {
      const errorMsg = payload.message || (response.status === 401 ? 'Credenciales inválidas.' : 'Error al procesar el inicio de sesión.')
      const err = new Error(errorMsg)
      err.status = response.status
      err.isLockout = response.status === 423
      throw err
    }

    if (!payload.user) {
      throw new Error('Respuesta del servidor incompleta.')
    }

    const sessionData = {
      ...payload.user,
      token: payload.token || '',
    }

    setUser(sessionData, credentials.remember ?? true)
    return payload.user
  }

  async function register(payload) {
    const apiBaseUrl = getApiBaseUrl()

    const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    }).catch(() => {
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.')
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const err = new Error(data.message || 'Error en el registro.')
      err.status = response.status
      err.isConflict = response.status === 409
      throw err
    }

    return data
  }

  const safeUser = computed(() => {
    if (!user.value) {
      return {
        id: null,
        name: '',
        email: '',
        role: 'aprendiz',
      }
    }
    const rawRole = (user.value.role || user.value.rol || 'APRENDIZ').toLowerCase()
    const fullName = user.value.name || [user.value.nombre, user.value.apellido].filter(Boolean).join(' ') || 'Usuario'

    return {
      ...user.value,
      name: fullName,
      email: user.value.email || user.value.correo || '',
      role: rawRole,
    }
  })

  const isAuthenticated = computed(() => Boolean(user.value && user.value.id))
  const role = computed(() => safeUser.value.role)
  const isAdmin = computed(() => role.value === 'admin')
  const isInstructor = computed(() => role.value === 'instructor')
  const isApprentice = computed(() => role.value === 'aprendiz')

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
    isApprentice,
    isAuthenticated,
    setUser,
    clearUser,
    login,
    register,
  }
})
