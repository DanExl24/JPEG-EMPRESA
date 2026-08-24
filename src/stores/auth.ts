import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { ComputedRef } from 'vue'
import { apiFetch, ApiError } from '../lib/apiClient'
import type {
  AuthUser,
  LoginCredentials,
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
    const cleanIdentifier: string = (credentials.identifier || '').trim()
    const cleanPassword: string = credentials.password || ''

    if (!cleanIdentifier || !cleanPassword) {
      const err: AuthCustomError = new Error('Por favor ingresa tu usuario/correo y contraseña.')
      err.status = 400
      throw err
    }

    try {
      const data = await apiFetch<{ token: string; user: AuthUser }>('/api/auth/login', {
        method: 'POST',
        skipAuth: true,
        body: JSON.stringify({
          identifier: cleanIdentifier,
          password: cleanPassword,
        }),
      })

      if (!data?.user) {
        const err: AuthCustomError = new Error('Respuesta del servidor incompleta.')
        throw err
      }

      const sessionData: AuthUser = {
        ...data.user,
        token: data.token || '',
      }

      setUser(sessionData, credentials.remember ?? true)
      return data.user
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        const customErr: AuthCustomError = new Error(error.message)
        customErr.status = error.status
        customErr.isLockout = error.isLockout
        customErr.isConflict = error.isConflict
        throw customErr
      }
      throw error
    }
  }

  async function register(payload: RegisterPayload): Promise<AuthApiResponse> {
    try {
      const data = await apiFetch<AuthApiResponse>('/api/auth/register', {
        method: 'POST',
        skipAuth: true,
        body: JSON.stringify(payload),
      })
      return data
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        const customErr: AuthCustomError = new Error(error.message)
        customErr.status = error.status
        customErr.isConflict = error.isConflict
        throw customErr
      }
      throw error
    }
  }

  async function checkAuth(): Promise<AuthUser | null> {
    const currentStored = user.value || getStoredUser()
    if (!currentStored?.token) {
      clearUser()
      return null
    }

    try {
      const data = await apiFetch<{ user: AuthUser }>('/api/auth/me', {
        method: 'GET',
      })

      if (data?.user) {
        const updatedData: AuthUser = {
          ...data.user,
          token: currentStored.token,
        }
        user.value = updatedData
        // Preservar en el storage donde estuviera
        if (localStorage.getItem(STORAGE_KEY)) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData))
        } else if (sessionStorage.getItem(STORAGE_KEY)) {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData))
        }
        return updatedData
      }
      return null
    } catch (error) {
      console.warn('[Auth Store] Session validation failed:', error)
      clearUser()
      return null
    }
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

  const isAuthenticated: ComputedRef<boolean> = computed(() => Boolean(user.value && user.value.id && user.value.token))
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
    checkAuth,
  }
})
