/**
 * Roles disponibles en la plataforma Nursing Academy
 */
export type UserRole = 'ADMIN' | 'INSTRUCTOR' | 'APRENDIZ' | 'admin' | 'instructor' | 'aprendiz'

/**
 * Roles normalizados en mayúscula para la persistencia en Backend
 */
export type UserRoleUpper = 'ADMIN' | 'INSTRUCTOR' | 'APRENDIZ'

/**
 * Roles normalizados en minúscula para Frontend UI
 */
export type UserRoleLower = 'admin' | 'instructor' | 'aprendiz'

/**
 * Objeto de usuario autenticado
 */
export interface AuthUserDto {
  id: number | null
  nombre?: string
  apellido?: string
  name: string
  rol?: string
  role: UserRoleLower
  correo?: string | null
  email: string
  cedula?: string
  xp?: number
  token?: string
}

/**
 * Credenciales para el envío de formulario de Login
 */
export interface LoginCredentialsDto {
  identifier: string
  password: string
  remember?: boolean
}

/**
 * Payload para registro de nuevos aprendices
 */
export interface RegisterPayloadDto {
  nombre: string
  apellido: string
  cedula: string
  correo: string
  password: string
}

/**
 * Respuesta del endpoint /api/auth/login
 */
export interface LoginResponseDto {
  token: string
  user: AuthUserDto
  message?: string
}

/**
 * Respuesta genérica para operaciones de autenticación
 */
export interface AuthApiResponseDto {
  message?: string
  token?: string
  user?: AuthUserDto
  error?: string
}
