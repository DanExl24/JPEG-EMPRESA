/**
 * Roles disponibles en la plataforma Nursing Academy
 */
export type UserRole = 'ADMIN' | 'INSTRUCTOR' | 'APRENDIZ' | 'admin' | 'instructor' | 'aprendiz'

/**
 * Entidad de usuario autenticado
 */
export interface AuthUser {
  id: number | null
  nombre?: string
  apellido?: string
  name: string
  rol?: string
  role: 'admin' | 'instructor' | 'aprendiz'
  correo?: string
  email: string
  cedula?: string
  xp?: number
  token?: string
}

/**
 * Credenciales para el envío de formulario de login
 */
export interface LoginCredentials {
  identifier: string
  password: string
  remember?: boolean
}

/**
 * Respuesta del endpoint /api/auth/login
 */
export interface LoginResponse {
  token: string
  user: AuthUser
  message?: string
}

/**
 * Payload para registro de nuevos aprendices
 */
export interface RegisterPayload {
  nombre: string
  apellido: string
  cedula: string
  correo: string
  password: string
}

/**
 * Respuesta general de la API de autenticación
 */
export interface AuthApiResponse {
  message?: string
  token?: string
  user?: AuthUser
  error?: string
}

/**
 * Estado del formulario de Login en Vue
 */
export interface LoginFormState {
  identifier: string
  password: string
  remember: boolean
}

/**
 * Estado de interacción de los campos
 */
export interface FormTouchedState {
  identifier: boolean
  password: boolean
}

/**
 * Error personalizado de autenticación
 */
export interface AuthCustomError extends Error {
  status?: number
  isLockout?: boolean
  isConflict?: boolean
}
