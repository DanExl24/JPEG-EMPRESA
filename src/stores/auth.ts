import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { ComputedRef } from 'vue'
import { getApiBaseUrl } from '../lib/api'
import type {
  AuthUser,
  LoginCredentials,
  LoginResponse,
  RegisterPayload,
  AuthApiResponse,
  AuthCustomError,
  UserRole
} from '../types/auth.types'

const STORAGE_KEY = 'nursed.auth.user'

function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(getStoredUser())

  function setUser(userData: AuthUser, remember: boolean = true): void {
    user.value = userData
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)

    const targetStorage = remember ? localStorage : sessionStorage
    try {
      targetStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
    } catch (e) {
      console.warn('[Auth Store] Error persisting user session:', e)
    }
  }

  function clearUser(): void {
    user.value = null
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
  }

  async function login(credentials: LoginCredentials): Promise<AuthUser> {
    const apiBaseUrl: string = getApiBaseUrl()
    const cleanIdentifier: string = (credentials.identifier || '').trim()
    const cleanPassword: string = credentials.password || ''

    if (!cleanIdentifier || !cleanPassword) {
      const err: AuthCustomError = new Error('Por favor ingresa tu usuario/correo y contraseña.')
      err.status = 400
      throw err
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 12000)

    let response: Response
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
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId)
      const errorObj = fetchError as Error
      if (errorObj?.name === 'AbortError') {
        const err: AuthCustomError = new Error('El servidor tardó demasiado en responder. Por favor intenta de nuevo.')
        err.status = 408
        throw err
      }
      const err: AuthCustomError = new Error('No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.')
      throw err
    } finally {
      clearTimeout(timeoutId)
    }

    let payload: AuthApiResponse & { user?: AuthUser } = {}
    try {
      payload = (await response.json()) as AuthApiResponse & { user?: AuthUser }
    } catch {
      payload = {}
    }

    if (!response.ok) {
      const errorMsg: string = payload.message || (response.status === 401 ? 'Credenciales inválidas.' : 'Error al procesar el inicio de sesión.')
      const err: AuthCustomError = new Error(errorMsg)
      err.status = response.status
      err.isLockout = response.status === 423
      throw err
    }

    if (!payload.user) {
      const err: AuthCustomError = new Error('Respuesta del servidor incompleta.')
      throw err
    }

    const sessionData: AuthUser = {
      ...payload.user,
      token: payload.token || '',
    }

    setUser(sessionData, credentials.remember ?? true)
    return payload.user
  }

  async function register(payload: RegisterPayload): Promise<AuthApiResponse> {
    const apiBaseUrl: string = getApiBaseUrl()

    const response: Response = await fetch(`${apiBaseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    }).catch(() => {
      const err: AuthCustomError = new Error('No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.')
      throw err
    })

    const data = (await response.json().catch(() => ({}))) as AuthApiResponse

    if (!response.ok) {
      const err: AuthCustomError = new Error(data.message || 'Error en el registro.')
      err.status = response.status
      err.isConflict = response.status === 409
      throw err
    }

    return data
  }

  const safeUser: ComputedRef<AuthUser> = computed(() => {
    if (!user.value) {
      return {
        id: null,
        name: '',
        email: '',
        role: 'aprendiz' as const,
      }
    }
    const rawRole = (user.value.role || user.value.rol || 'APRENDIZ').toLowerCase() as 'admin' | 'instructor' | 'aprendiz'
    const fullName: string = user.value.name || [user.value.nombre, user.value.apellido].filter(Boolean).join(' ') || 'Usuario'

    return {
      ...user.value,
      name: fullName,
      email: user.value.email || user.value.correo || '',
      role: rawRole,
    }
  })

  const isAuthenticated: ComputedRef<boolean> = computed(() => Boolean(user.value && user.value.id))
  const role: ComputedRef<UserRole> = computed(() => safeUser.value.role)
  const isAdmin: ComputedRef<boolean> = computed(() => role.value === 'admin')
  const isInstructor: ComputedRef<boolean> = computed(() => role.value === 'instructor')
  const isApprentice: ComputedRef<boolean> = computed(() => role.value === 'aprendiz')

  const roleLabel: ComputedRef<string> = computed(() => {
    const labels: Record<string, string> = {
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
