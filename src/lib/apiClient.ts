import { getApiBaseUrl } from './api'

const STORAGE_KEY = 'nursed.auth.user'

export interface ApiFetchOptions extends RequestInit {
  timeoutMs?: number
  skipAuth?: boolean
}

export class ApiError extends Error {
  status: number
  data: unknown
  isLockout?: boolean
  isConflict?: boolean

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
    this.isLockout = status === 423
    this.isConflict = status === 409
  }
}

/**
 * Obtiene el token JWT actual almacenado en el navegador.
 */
export function getAuthToken(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.token || null
  } catch {
    return null
  }
}

/**
 * Cliente HTTP unificado para todas las peticiones hacia la API.
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { timeoutMs = 15000, skipAuth = false, headers = {}, ...restOptions } = options

  const baseUrl = getApiBaseUrl()
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const fullUrl = `${baseUrl}${cleanEndpoint}`

  const requestHeaders: Record<string, string> = {
    'Accept': 'application/json',
    ...(headers as Record<string, string>),
  }

  // Si hay body y no es FormData, asegurar Content-Type
  if (restOptions.body && !(restOptions.body instanceof FormData) && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json'
  }

  // Inyectar token Bearer si existe y no se omitió explícitamente
  if (!skipAuth && !requestHeaders['Authorization']) {
    const token = getAuthToken()
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`
    }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  let response: Response
  try {
    response = await fetch(fullUrl, {
      ...restOptions,
      headers: requestHeaders,
      signal: controller.signal,
    })
  } catch (err: unknown) {
    clearTimeout(timeoutId)
    const errorObj = err as Error
    if (errorObj?.name === 'AbortError') {
      throw new ApiError('El servidor tardó demasiado en responder.', 408)
    }
    throw new ApiError('No se pudo conectar con el servidor backend.', 0)
  } finally {
    clearTimeout(timeoutId)
  }

  // Si la respuesta es 401 en un endpoint autenticado, limpiar almacenamiento
  if (response.status === 401 && !skipAuth && !endpoint.includes('/api/auth/login')) {
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
  }

  let responseData: any = null
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    try {
      responseData = await response.json()
    } catch {
      responseData = null
    }
  } else if (response.status !== 204) {
    try {
      responseData = await response.text()
    } catch {
      responseData = null
    }
  }

  if (!response.ok) {
    const message =
      (responseData && typeof responseData === 'object' && responseData.message) ||
      (typeof responseData === 'string' && responseData) ||
      `Error en la petición (Código: ${response.status})`

    throw new ApiError(message, response.status, responseData)
  }

  return responseData as T
}
