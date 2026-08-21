/**
 * Tipos de roles soportados en el Backend
 */
export type UserRoleBackend = 'ADMIN' | 'INSTRUCTOR' | 'APRENDIZ'

/**
 * Payload decodificado del JWT
 */
export interface JwtPayloadAuth {
  id: number
  role: UserRoleBackend
  correo?: string | null
  cedula?: string
}

/**
 * Modelo de datos de usuario devuelto por la autenticación
 */
export interface UserAuthDto {
  id: number
  nombre: string
  apellido: string
  name: string
  rol: UserRoleBackend
  role: string
  correo: string | null
  email: string | null
  cedula: string
  xp: number
}

/**
 * Cuerpo de la petición de Login
 */
export interface LoginRequestBody {
  identifier?: string
  password?: string
}

/**
 * Respuesta JSON exitosa de Login
 */
export interface LoginSuccessResponse {
  token: string
  user: UserAuthDto
}

/**
 * Cuerpo de la petición de Registro
 */
export interface RegisterRequestBody {
  nombre?: string
  apellido?: string
  cedula?: string
  correo?: string
  password?: string
}

/**
 * Respuesta genérica de error / mensaje
 */
export interface MessageResponse {
  message: string
}
